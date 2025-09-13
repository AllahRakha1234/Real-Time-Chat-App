import { Eye } from "lucide-react";
import type { Chat } from "@/types/chat";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "../ui/button";
import ChatAvatar from "./ChatAvatar";

interface ChatTopbarProps {
    chat: Chat;
    onOpenProfile: () => void;
}

const ChatTopbar: React.FC<ChatTopbarProps> = ({ chat, onOpenProfile }) => {
    const { user: loggedUser } = useAuthStore();

    const chatTitle = chat.isGroupChat
        ? chat.chatName
        : chat.users.find((u) => u._id !== loggedUser?._id)?.name ?? "Unknown";

    return (
        <div className="flex items-center justify-between px-6 py-2 border-b-2 border-primary rounded-xl">
            <div className="flex items-center gap-3">
                {/* ✅ Reusable avatar */}
                <ChatAvatar chat={chat} loggedUser={loggedUser!} size="h-10 w-10" />
                <h2 className="text-lg font-medium">{chatTitle}</h2>
            </div>
            <Button
                variant="simple"
                onClick={onOpenProfile}
                className="rounded-full transition hover:text-primary"
            >
                <Eye size={20} />
            </Button>
        </div>
    );
};

export default ChatTopbar;
