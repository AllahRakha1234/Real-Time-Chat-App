import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Chat } from "@/types/chat";
import { useAuthStore } from "@/store/auth.store";
import { getReceiverUserName } from "@/utils/chat";

interface ProfileModalProps {
    chat: Chat | null;   // nullable because modal might open without a chat
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ chat, isOpen, onClose }) => {
    const { user: loggedUser } = useAuthStore();

    if (!chat) return null;

    const title = chat.isGroupChat
        ? chat.chatName
        : getReceiverUserName(loggedUser!, chat.users);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    {chat.isGroupChat ? (
                        <ul className="space-y-2">
                            {chat.users.map((u) => (
                                <li key={u._id}>{u.name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>Chat with {title}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;
