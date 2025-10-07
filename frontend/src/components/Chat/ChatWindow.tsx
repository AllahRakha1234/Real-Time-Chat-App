import { useEffect } from "react";
import { useMessageStore } from "@/store/message.store";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { Loader } from "@/components/ui/loader";
import type { User } from "@/types/auth";

const ChatWindow = ({ chatId, currentUser }: {chatId: string, currentUser: User | null}) => {
    const {
        messages,
        isLoading,
        error,
        getAllChatMessages,
        sendMessage,
    } = useMessageStore();

    // Fetch messages when a new chat is opened
    useEffect(() => {
        if (chatId) getAllChatMessages(chatId);
    }, [chatId, getAllChatMessages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        await sendMessage(content, chatId);
    };

    if (isLoading)
        return (
            <div className="flex h-full items-center justify-center">
                <Loader size={50} />
            </div>
        );

    if (error)
        return (
            <div className="flex h-full items-center justify-center text-red-500">
                {error}
            </div>
        );

    return (
        <div className="relative flex flex-col h-full w-full">
            {/* Message List */}
            <div className="flex-1 max-h-[68vh] overflow-y-auto bg-gray-50 mt-2">
                <MessageList messages={messages} currentUser={currentUser} />
            </div>

            {/* Input Field */}
            <div className="flex-shrink-0 border-t-2 border-primary rounded-xl pt-2">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;
