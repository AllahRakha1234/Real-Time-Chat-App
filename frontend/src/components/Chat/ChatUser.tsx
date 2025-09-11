import React, { useState } from "react";
import type { Chat } from "@/types/chat";
import { getReceiverUserName } from "@/utils/chat";
import { useAuthStore } from "@/store/auth.store";
import { MessageSquareText } from "lucide-react";
import { Loader } from "@/components/ui/loader"

interface ChatUserProps {
    chats: Chat[];
    isLoading: boolean;
    error?: string | null;
}

const ChatUser: React.FC<ChatUserProps> = ({ chats, isLoading, error }) => {
    const { user: loggedUser } = useAuthStore();
    const [selectedChat, setSelectedChat] = useState("")

    const handleChatClick = (chatId: string) => {
        setSelectedChat(chatId)
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader size={100} />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-2">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    // Empty state
    if (!chats || chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <MessageSquareText className="text-gray-400" size={80} />
                <p className="text-lg text-gray-400">No chats available</p>
            </div>
        );
    }
    // Chats list
    return (
        <div className="space-y-2">
            {chats.map((chat) => (
                <div
                    key={chat._id}
                    className={`p-3 rounded-md cursor-pointer ${selectedChat == chat._id ? "text-secondary-foreground bg-primary" : "bg-secondary/40 hover:bg-secondary/60"}`}
                    onClick={() => handleChatClick(chat._id)}
                >
                    <p className="text-md font-semibold">
                        {loggedUser ? getReceiverUserName(loggedUser, chat.users) : ""}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default ChatUser;
