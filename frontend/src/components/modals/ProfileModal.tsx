import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Chat } from "@/types/chat";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/store/auth.store";
import { getReceiverUser } from "@/utils/chat";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileModalProps {
    chat?: Chat | null;
    profile?: User | null;
    isOpen: boolean;
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ chat, profile, isOpen, onClose }) => {
    const { user: loggedUser } = useAuthStore();

    if (!isOpen) return null;

    // Determine which user to show
    let userToShow: User | null = null;

    if (profile) {
        userToShow = profile;
    } else if (chat && loggedUser && chat.users && chat.users.length > 0) {
        userToShow = getReceiverUser(loggedUser, chat.users) || loggedUser;
    } else {
        userToShow = loggedUser;
    }

    if (!userToShow) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Profile Data</DialogTitle>
                </DialogHeader>

                <div className="mt-6 flex flex-col items-center space-y-3">
                    <Avatar className="w-30 h-30">
                        <AvatarImage src={userToShow.pic || ""} alt={userToShow.name} />
                        <AvatarFallback>{userToShow.name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <p className="text-lg font-semibold">{userToShow.name}</p>
                    <p className="text-sm text-gray-500">{userToShow.email}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileModal;
