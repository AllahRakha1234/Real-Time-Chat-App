import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/store/message.store";
import { useChatStore } from "@/store/chat.store";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { Loader } from "@/components/ui/loader";
import type { User } from "@/types/auth";
import { io } from "socket.io-client";
import type { Message } from "@/types/message";

const ChatWindow = ({ chatId, currentUser }: { chatId: string; currentUser: User | null }) => {
    const { messages, isLoading, error, getAllChatMessages, sendMessage, addMessage } = useMessageStore();
    const { selectedChat } = useChatStore();
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        const { message } = await sendMessage(content, chatId);
        socketRef.current.emit("new-message", message);
    };

    useEffect(() => {
        socketRef.current = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000");

        socketRef.current.on("connect", () => {
            console.log("Connected to Socket.IO server");
        });

        if (currentUser) socketRef.current.emit("setup", currentUser);

        socketRef.current.on("connected", () => {
            console.log("Socket setup complete");
            setSocketConnected(true);
        });

        return () => {
            socketRef.current.disconnect();
            console.log("Disconnected from Socket.IO server");
        };
    }, [currentUser]);

    useEffect(() => {
        if (chatId && socketConnected) {
            getAllChatMessages(chatId);
            console.log("chatID:", chatId);
            socketRef.current.emit("join-chat", chatId);
        }
    }, [chatId, socketConnected, getAllChatMessages]);

    useEffect(() => {
        if (!socketRef.current) return;

        const handleMessageReceived = (newMessage: Message) => {
            if (newMessage.chat._id === selectedChat?._id) {
                addMessage(newMessage);
            } else {
                console.log("New message for another chat:", newMessage);
            }
        };

        socketRef.current.on("message-received", handleMessageReceived);

        // Cleanup to prevent multiple listeners
        return () => {
            socketRef.current.off("message-received", handleMessageReceived);
        };
    }, [selectedChat?._id, addMessage]);

    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("typing", ({ chatId, user }: { chatId: string, user: string }) => {
            if (chatId === selectedChat?._id) {
                setIsTyping(true)
                setTypingUser(user);
            };
        });

        socketRef.current.on("stop-typing", (chatId: string) => {
            if (chatId === selectedChat?._id) setIsTyping(false);
        });

        return () => {
            socketRef.current.off("typing");
            socketRef.current.off("stop-typing");
        };
    }, [selectedChat?._id]);



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
            <div className="flex-1 max-h-[68vh] overflow-hidden bg-gray-50 mt-2">
                <MessageList messages={messages} currentUser={currentUser} />

                <div className="h-6">
                    {isTyping && (
                        <div className="text-sm ml-5 text-gray-500 italic animate-pulse">
                            {typingUser} is typing...
                        </div>
                    )}
                </div>
            </div>


            <div className="flex-shrink-0 border-t-2 border-primary rounded-xl pt-2">
                <MessageInput
                    onSend={handleSendMessage}
                    onTyping={() => socketRef.current.emit("typing", { chatId, user: currentUser?.name })}
                    onStopTyping={() => socketRef.current.emit("stop-typing", chatId)}
                />
            </div>
        </div>
    );
};

export default ChatWindow;