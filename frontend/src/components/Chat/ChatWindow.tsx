import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/store/message.store";
import { useChatStore } from "@/store/chat.store";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import { Loader } from "@/components/ui/loader";
import type { User } from "@/types/auth";
import { io } from "socket.io-client";
import type { Message } from "@/types/message";
import { useNotificationStore } from "@/store/notification.store";

const ChatWindow = ({ chatId, currentUser }: { chatId: string; currentUser: User | null }) => {
    const { messages, isLoading, error, getAllChatMessages, sendMessage, addMessage } = useMessageStore();
    const { selectedChat } = useChatStore();
    const [socketConnected, setSocketConnected] = useState(false);
    const socketRef = useRef<any>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const { notifications, addNotification, setNotifications } = useNotificationStore();
    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        const { message } = await sendMessage(content, chatId);
        socketRef.current.emit("new-message", message);
    };

    // Setup socket connection
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

    // Join chat room and load messages
    useEffect(() => {
        if (chatId && socketConnected) {
            getAllChatMessages(chatId);
            socketRef.current.emit("join-chat", chatId);
        }
    }, [chatId, socketConnected, getAllChatMessages]);

    // Handle receiving messages
    useEffect(() => {
        if (!socketRef.current) return;

        const handleMessageReceived = (newMessage: Message) => {
            if (newMessage.chat._id === selectedChat?._id) {
                // If message belongs to open chat → add to messages
                addMessage(newMessage);
            } else {
                // Otherwise → add to notifications (if not already there)
                const alreadyExists = notifications.some(
                    (n) => n._id === newMessage._id
                );
                if (!alreadyExists) {
                    addNotification(newMessage);
                }
            }
        };

        socketRef.current.on("message-received", handleMessageReceived);

        return () => {
            socketRef.current.off("message-received", handleMessageReceived);
        };
    }, [selectedChat?._id, notifications, addMessage, addNotification]);

    // When user opens a chat, move related notifications into messages
    useEffect(() => {
        if (!selectedChat?._id) return;

        const relatedNotifications = notifications.filter(
            (n) => n.chat._id === selectedChat._id
        );

        if (relatedNotifications.length > 0) {
            // Add them to the message list
            relatedNotifications.forEach((msg) => addMessage(msg));

            // Remove them from notification store
            const remaining = notifications.filter(
                (n) => n.chat._id !== selectedChat._id
            );
            setNotifications(remaining);
        }
    }, [selectedChat?._id]);

    // Typing indicators
    useEffect(() => {
        if (!socketRef.current) return;

        socketRef.current.on("typing", ({ chatId, user }: { chatId: string; user: string }) => {
            if (chatId === selectedChat?._id) {
                setIsTyping(true);
                setTypingUser(user);
            }
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
            <div className="flex flex-col flex-1 max-h-[68vh] bg-gray-50 mt-2 overflow-hidden">
                {/* Scrollable message list */}
                <div className="flex-1 overflow-y-auto max-h-[65vh]">
                    <MessageList messages={messages} currentUser={currentUser} />
                </div>

                {/* Typing indicator */}
                {isTyping && (
                    <div className="text-sm ml-3 text-gray-500 italic animate-pulse">
                        {typingUser} is typing...
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 border-t-2 border-primary rounded-xl pt-2">
                <MessageInput
                    onSend={handleSendMessage}
                    onTyping={() =>
                        socketRef.current.emit("typing", {
                            chatId,
                            user: currentUser?.name,
                        })
                    }
                    onStopTyping={() => socketRef.current.emit("stop-typing", chatId)}
                />
            </div>
        </div>
    );
};

export default ChatWindow;