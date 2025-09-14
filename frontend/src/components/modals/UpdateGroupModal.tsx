import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import useDebounce from "@/hooks/useDebounce";
import { Loader } from "@/components/ui/loader";
import SearchResultItem from "@/components/common/SearchUserItem";
import { toast } from "react-hot-toast";

import type { Chat } from "@/types/chat";
import type { User } from "@/types/auth";

interface UpdateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    chat: Chat | null;
}

interface GroupUpdateSchema {
    groupName: string;
}

const UpdateGroupModal: React.FC<UpdateGroupModalProps> = ({
    isOpen,
    onClose,
    chat,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const {
        user: loggedUser,
        searchUser,
        searchResults,
        isLoading,
        error,
        clearError,
        clearSearchResults,
    } = useAuthStore();

    const {
        renameGroup,
        addUserToGroup,
        removeUserFromGroup,
        leaveGroup,
        setChats,
        chats,
        setSelectedChat,
    } = useChatStore();

    const { control, handleSubmit, reset } = useForm<GroupUpdateSchema>({
        defaultValues: { groupName: chat?.chatName || "" },
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const isAdmin = chat?.groupAdmin?._id === loggedUser?._id;

    // 🔍 Search users
    useEffect(() => {
        if (debouncedSearchTerm?.trim()) {
            clearError();
            clearSearchResults();
            searchUser(debouncedSearchTerm.trim(), 1, 5);
        } else {
            clearError();
            clearSearchResults();
        }
    }, [debouncedSearchTerm]);

    // ♻️ Reset when modal closes or chat changes
    useEffect(() => {
        if (!isOpen) {
            reset({ groupName: chat?.chatName || "" });
            setSearchTerm("");
            clearError();
            clearSearchResults();
        } else {
            reset({ groupName: chat?.chatName || "" });
        }
    }, [isOpen, chat]);

    // ✅ Update group name
    const handleUpdateGroupName = async (data: GroupUpdateSchema) => {
        if (!chat) return;
        setIsRenaming(true);
        const result = await renameGroup(chat._id, data.groupName);
        setIsRenaming(false);

        if (result.success && result.chat) {
            updateChats(result.chat);
            toast.success("Group name updated ✅");
        } else {
            toast.error(result.error || "Failed to update group name");
        }
    };

    // ✅ Add user
    const handleAddUser = async (user: User) => {
        if (!chat) return;
        if (!isAdmin) return toast.error("Only admin can add users");

        setLoadingUserId(user._id);
        const result = await addUserToGroup(chat._id, user._id);
        setLoadingUserId(null);

        if (result.success && result.chat) {
            updateChats(result.chat);
            toast.success(`${user.name} added 🎉`);
        } else {
            toast.error(result.error || "Failed to add user");
        }
    };

    // ✅ Remove user
    const handleRemoveUser = async (userId: string) => {
        if (!chat) return;
        if (!isAdmin) return toast.error("Only admin can remove users");
        if (chat.users.length <= 3) {
            return toast.error("Group must have at least 3 members 👥");
        }

        setLoadingUserId(userId);
        const result = await removeUserFromGroup(chat._id, userId);
        setLoadingUserId(null);

        if (result.success && result.chat) {
            updateChats(result.chat);
            toast.success("User removed 🚀");
        } else {
            toast.error(result.error || "Failed to remove user");
        }
    };

    // ✅ Leave group
    const handleLeaveGroup = async () => {
        if (!chat || !loggedUser) return;
        setIsLeaving(true);
        const result = await leaveGroup(chat._id, loggedUser._id);
        setIsLeaving(false);

        if (result.success) {
            toast.success("You left the group 👋");
            onClose();
        } else {
            toast.error(result.error || "Failed to leave group");
        }
    };

    // ✅ Utility: update both chats + selectedChat
    const updateChats = (updated: Chat) => {
        setChats(chats.map((c) => (c._id === updated._id ? updated : c)));
        setSelectedChat(updated);
    };

    if (!chat) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update Group: {chat.chatName}</DialogTitle>
                </DialogHeader>

                {/* Group Name Update */}
                <form
                    onSubmit={handleSubmit(handleUpdateGroupName)}
                    className="flex items-center gap-2 mb-4"
                >
                    <Controller
                        name="groupName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                placeholder="Enter group name"
                                type="text"
                                value={field.value || ""}
                                onChange={field.onChange}
                                name={field.name}
                            />
                        )}
                    />
                    <Button type="submit" disabled={isRenaming}>
                        {isRenaming ? <Loader size={60} /> : "Update"}
                    </Button>
                </form>

                {/* Current Users */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {chat.users.map((user) => (
                        <span
                            key={user._id}
                            className="px-3 py-1 bg-primary/20 text-primary-foreground rounded-md text-sm flex items-center gap-x-1"
                        >
                            {user.name}
                            {isAdmin && user._id !== chat.groupAdmin?._id && (
                                <Button
                                    variant="simple"
                                    size="sm"
                                    disabled={loadingUserId === user._id}
                                    className="h-4 w-4 cursor-pointer text-red-500 transition-transform duration-200 ease-in-out hover:scale-110"
                                    onClick={() => handleRemoveUser(user._id)}
                                >
                                    {loadingUserId === user._id ? (
                                        <Loader size={50} />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </span>
                    ))}
                </div>

                {/* Search Users */}
                <div className="relative mb-4">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users"
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Search Results */}
                <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar mb-4">
                    {isLoading && <Loader />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && searchTerm && searchResults.length === 0 && (
                        <p className="text-gray-500 text-sm">No users found ❌</p>
                    )}
                    {searchResults.map((user) => (
                        <SearchResultItem
                            key={user._id}
                            user={user}
                            isInChat={chat.users.some((u) => u._id === user._id)}
                            isAdding={loadingUserId === user._id}
                            onAddUser={() => handleAddUser(user)}
                        />
                    ))}
                </div>

                {/* Footer */}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLeaveGroup}
                        disabled={isLeaving}
                    >
                        {isLeaving ? <Loader size={60} /> : "Leave Group"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateGroupModal;  