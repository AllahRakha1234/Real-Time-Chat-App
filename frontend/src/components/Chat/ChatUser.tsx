import React from "react";
import type { Chat } from "@/types/chat";
import { getReceiverUser } from "@/utils/chat";
import { useAuthStore } from "@/store/auth.store";
import { MessageSquareText } from "lucide-react";
import ChatAvatar from "@/components/Chat/ChatAvatar";

interface ChatUserProps {
    chats: Chat[];
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
}

const ChatUser: React.FC<ChatUserProps> = ({
    chats,
    selectedChat,
    onSelectChat,
}) => {
    const { user: loggedUser } = useAuthStore();

    if (!chats || chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-xl text-gray-500">No chats available</p>
                <MessageSquareText className="text-gray-400" size={80} />
            </div>
        );
    }

    return (
        <div className="space-y-2 p-3">
            {chats.map((chat) => {
                const isSelected = selectedChat?._id === chat._id;

                // Decide which name to show
                const receiverUser =
                    loggedUser && !chat.isGroupChat
                        ? getReceiverUser(loggedUser, chat.users)
                        : null;

                const displayName = chat.isGroupChat
                    ? chat.chatName
                    : receiverUser?.name;

                return (
                    <div
                        key={chat._id}
                        className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer ${isSelected
                            ? "text-secondary-foreground bg-primary"
                            : "bg-secondary/40 hover:bg-secondary/60"
                            }`}
                        onClick={() => onSelectChat(chat)}
                    >
                        {/* Reusable Avatar */}
                        <ChatAvatar isSelected={isSelected} chat={chat} loggedUser={loggedUser} />

                        <p className="text-md font-medium">{displayName}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatUser;
