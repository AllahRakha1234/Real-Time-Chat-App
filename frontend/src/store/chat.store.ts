import { create } from "zustand";
import { api } from "../lib/axios";
import type { Chat } from "@/types/chat";

interface ApiResponse {
    success: boolean;
    chat?: Chat;
    chats?: Chat[];
    error?: string;
}

export interface ChatState {
    chats: Chat[];
    selectedChat: Chat | null;
    isLoading: boolean;
    error: string | null;

    createOrAccessChat: (userId: string) => Promise<ApiResponse>;
    fetchChats: () => Promise<ApiResponse>;
    createGroupChat: (groupName: string, usersIds: string[]) => Promise<ApiResponse>;
    renameGroup: (chatId: string, chatName: string) => Promise<ApiResponse>;
    addUserToGroup: (chatId: string, userId: string) => Promise<ApiResponse>;
    removeUserFromGroup: (chatId: string, userId: string) => Promise<ApiResponse>;
    leaveGroup: (chatId: string, userId: string) => Promise<ApiResponse>;

    setChats: (chats: Chat[]) => void;
    setSelectedChat: (chat: Chat | null) => void;
    getChatUserIds: (currentUserId: string) => string[];
}

export const getErrorMessage = (err: any): string =>
    err.response?.data?.message || err.message || "Something went wrong";

export const useChatStore = create<ChatState>(
    (set, get) => ({
        chats: [],
        selectedChat: null,
        isLoading: false,
        error: null,

        setChats: (chats) => set({ chats }),
        setSelectedChat: (chat) => set({ selectedChat: chat }),

        // Create or access one-to-one chat
        createOrAccessChat: async (userId) => {
            set({ isLoading: true, error: null });
            try {
                const response = await api.post("/api/chat", { userId });
                const data = response?.data

                set((state) => ({
                    chats: state.chats.some((c) => c._id === data._id)
                        ? state.chats
                        : [data, ...state.chats],
                    selectedChat: data,
                    isLoading: false,
                }));
                return { success: true, chat: data };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage, isLoading: false });
                return { success: false, error: errorMessage };
            }
        },

        // Fetch all chats
        fetchChats: async () => {
            set({ isLoading: true, error: null });
            try {
                const { data } = await api.get("/api/chat");
                const chatArray = Array.isArray(data) ? data : [];
                set({ chats: chatArray, isLoading: false });
                return { success: true, chats: chatArray };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage, isLoading: false, chats: [] });
                return { success: false, error: errorMessage };
            }
        },

        // Create group
        createGroupChat: async (groupName, usersIds) => {
            set({ isLoading: true, error: null });
            try {
                const { data } = await api.post("/api/chat/group", {
                    name: groupName,
                    users: usersIds,
                });
                set((state) => ({
                    chats: [data, ...state.chats],
                    selectedChat: data,
                    isLoading: false,
                }));
                return { success: true, chat: data };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage, isLoading: false });
                return { success: false, error: errorMessage };
            }
        },

        // Rename group
        renameGroup: async (chatId, chatName) => {
            try {
                const { data } = await api.post("/api/chat/group-rename", {
                    chatId,
                    chatName,
                });
                set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat._id === chatId ? { ...chat, ...data } : chat
                    ),
                    selectedChat:
                        state.selectedChat && state.selectedChat._id === chatId
                            ? { ...state.selectedChat, ...data }
                            : state.selectedChat,
                }));
                return { success: true, chat: data };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage });
                return { success: false, error: errorMessage };
            }
        },

        // Add user
        addUserToGroup: async (chatId, userId) => {
            try {
                const { data } = await api.post("/api/chat/group-add", {
                    chatId,
                    userId,
                });
                set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat._id === chatId ? data : chat
                    ),
                    selectedChat:
                        state.selectedChat && state.selectedChat._id === chatId
                            ? data
                            : state.selectedChat,
                }));
                return { success: true, chat: data };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage });
                return { success: false, error: errorMessage };
            }
        },

        // Remove user
        removeUserFromGroup: async (chatId, userId) => {
            try {
                const { data } = await api.post("/api/chat/group-remove", {
                    chatId,
                    userId,
                });
                set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat._id === chatId ? data : chat
                    ),
                    selectedChat:
                        state.selectedChat && state.selectedChat._id === chatId
                            ? data
                            : state.selectedChat,
                }));
                return { success: true, chat: data };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage });
                return { success: false, error: errorMessage };
            }
        },

        // Leave group
        leaveGroup: async (chatId, userId) => {
            try {
                await api.post("/api/chat/group-remove", { chatId, userId });
                set((state) => ({
                    chats: state.chats.filter((chat) => chat._id !== chatId),
                    selectedChat:
                        state.selectedChat && state.selectedChat._id === chatId
                            ? null
                            : state.selectedChat,
                }));
                return { success: true };
            } catch (err: any) {
                const errorMessage = getErrorMessage(err);
                set({ error: errorMessage });
                return { success: false, error: errorMessage };
            }
        },

        // Helper
        getChatUserIds: (currentUserId) => {
            const chats = get().chats || [];
            return chats.flatMap((chat) =>
                (chat.users || [])
                    .filter((u) => u._id !== currentUserId)
                    .map((u) => u._id)
            );
        },
    })
);