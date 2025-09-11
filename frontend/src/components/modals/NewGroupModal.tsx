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
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import useDebounce from "@/hooks/useDebounce";
import { Loader } from "@/components/ui/loader";
import SearchResultItem from "@/components/common/SearchUserItem";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    groupCreationSchema,
    type GroupCreationSchema,
} from "@/lib/validations/groupCreation";
import { X } from "lucide-react";

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose }) => {
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [addingUserId, setAddingUserId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const {
        searchUser,
        searchResults,
        isLoading,
        error,
        clearError,
        clearSearchResults,
    } = useAuthStore();
    const { createGroupChat } = useChatStore();

    const { control, handleSubmit, reset, setValue, formState: { errors } } =
        useForm<GroupCreationSchema>({
            resolver: zodResolver(groupCreationSchema),
            defaultValues: { groupName: "", users: [] },
        });

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // 🔎 Keep users in sync with RHF state
    useEffect(() => {
        setValue(
            "users",
            selectedUsers.map((u) => u._id)
        );
    }, [selectedUsers, setValue]);

    // 🔎 Search effect
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

    const handleAddUser = (user: any) => {
        if (selectedUsers.some((u) => u._id === user._id)) {
            toast.error("User already added!");
            return;
        }
        setSelectedUsers((prev) => [...prev, user]);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
    };

    const onSubmit = async (data: GroupCreationSchema) => {
        const result = await createGroupChat(data.groupName, data.users);
        if (result.success) {
            toast.success("Group created successfully 🎉");
            reset();
            setSelectedUsers([]);
            setSearchTerm("");
            onClose();
        } else {
            toast.error(result.error || "Failed to create group");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Group Name */}
                    <Controller
                        name="groupName"
                        control={control}
                        render={({ field, fieldState }) => (
                            <div>
                                <Input
                                    placeholder="Enter group name"
                                    type="text"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    name={field.name}
                                />
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    {/* Search Users (NOT part of schema) */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users"
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Selected Users */}
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <span
                                key={user._id}
                                className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1"
                            >
                                {user.name}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-5 w-5 text-red-500 hover:bg-red-100"
                                    onClick={() => handleRemoveUser(user._id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </span>
                        ))}
                    </div>
                    {errors.users && (
                        <p className="text-red-500 text-sm">{errors.users.message}</p>
                    )}

                    {/* Search Results */}
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {isLoading && <Loader />}
                        {error && <p className="text-red-500">{error}</p>}
                        {searchResults.map((user) => (
                            <SearchResultItem
                                key={user._id}
                                user={user}
                                isInChat={selectedUsers.some((u) => u._id === user._id)}
                                isAdding={addingUserId === user._id}
                                onAddUser={() => handleAddUser(user)}
                            />
                        ))}
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Create Group</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default GroupModal;
