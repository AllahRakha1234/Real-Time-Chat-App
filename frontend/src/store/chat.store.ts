import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios";
import type { Chat } from "@/types/chat";

export interface ChatState {
    chats: Chat[];
    selectedChat: Chat | null;
    isLoading: boolean;
    error: string | null;

    setChats: (chats: Chat[]) => void;
    createOrAccessChat: (
        userId: string
    ) => Promise<{ success: boolean; chat?: Chat; error?: string }>;
    fetchChats: () => Promise<{ success: boolean; chats?: Chat[]; error?: string }>
    getChatUserIds: (currentUserId: string) => string[];
    updateChat: (chatId: string, updatedChat: Partial<Chat>) => void;
    removeChat: (chatId: string) => void;
    setSelectedChat: (chat: Chat | null) => void;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            chats: [],
            selectedChat: null,
            isLoading: false,
            error: null,

            setChats: (chats) => set({ chats }),

            createOrAccessChat: async (userId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post("/api/chat", { userId });
                    set((state) => ({
                        chats: [...state.chats, data],
                        isLoading: false,
                    }));
                    return { success: true, chat: data };
                } catch (err: any) {
                    console.error("Chat error:", err);
                    const errorMessage =
                        err.response?.data?.message || err.message || "Chat creation failed";
                    set({
                        error: errorMessage,
                        isLoading: false,
                        selectedChat: null, // ✅ correct key
                    });
                    return { success: false, error: errorMessage };
                }
            },
            fetchChats: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get("/api/chat");
                    set({
                        chats: data,
                        isLoading: false,
                    });
                    return { success: true, chats: data };
                } catch (err: any) {
                    console.error("Chat error:", err);
                    const errorMessage =
                        err.response?.data?.message || err.message || "Chat fetching failed";
                    set({
                        error: errorMessage,
                        isLoading: false,
                        chats: [], // fallback to empty array
                    });

                    return { success: false, error: errorMessage };
                }
            },
            getChatUserIds: (currentUserId) => {
                const chats = get().chats;
                return chats.flatMap((chat) =>
                    chat.users
                        .filter((u) => u._id !== currentUserId) // exclude yourself
                        .map((u) => u._id)
                );
            },
            updateChat: (chatId, updatedChat) =>
                set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat._id === chatId ? { ...chat, ...updatedChat } : chat
                    ),
                })),

            removeChat: (chatId) =>
                set((state) => ({
                    chats: state.chats.filter((chat) => chat._id !== chatId),
                })),

            setSelectedChat: (chat) => set({ selectedChat: chat }),
        }),
        { name: "chat-storage" }
    )
);
