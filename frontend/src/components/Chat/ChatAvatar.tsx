// ChatAvatar.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat } from "@/types/chat";
import type { User } from "@/types/auth";
import { getReceiverUser } from "@/utils/chat";

interface ChatAvatarProps {
    chat: Chat;
    loggedUser?: User | null;
    size?: string;
    isSelected?: boolean;
}

const ChatAvatar: React.FC<ChatAvatarProps> = ({
    chat,
    loggedUser,
    size = "h-10 w-10",
    isSelected,
}) => {
    const receiverUser =
        loggedUser && !chat.isGroupChat
            ? getReceiverUser(loggedUser, chat.users)
            : null;

    const displayName = chat.isGroupChat ? chat.chatName : receiverUser?.name;
    const displayPic = !chat.isGroupChat ? receiverUser?.pic : undefined;

    return (
        <Avatar className={size}>
            {/* ✅ Always render both */}
            <AvatarImage src={displayPic} alt={receiverUser?.name} />
            <AvatarFallback className={`${isSelected ? "text-primary" : "bg-primary/50"}`}>
                {displayName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
        </Avatar>
    );
};

export default ChatAvatar;
