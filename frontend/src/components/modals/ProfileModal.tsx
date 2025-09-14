import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Chat } from "@/types/chat";
import { useAuthStore } from "@/store/auth.store";
import { getReceiverUser } from "@/utils/chat";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileModalProps {
    chat: Chat | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ chat, isOpen, onClose }) => {
    const { user: loggedUser } = useAuthStore();

    if (!chat || !loggedUser) return null;

    const receiverUser = getReceiverUser(loggedUser, chat.users);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Profile Data</DialogTitle>
                </DialogHeader>

                <div className="mt-6 flex flex-col items-center space-y-3">
                    {/* Avatar */}
                    <Avatar className="w-30 h-30">
                        <AvatarImage src={receiverUser?.pic} alt={receiverUser?.name} />
                        <AvatarFallback>{receiverUser?.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <p className="text-lg font-semibold">{receiverUser?.name}</p>

                    {/* Email */}
                    <p className="text-sm text-gray-500">{receiverUser?.email}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;
