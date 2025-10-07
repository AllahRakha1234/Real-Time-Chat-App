import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios";
import type { Message } from "@/types/message";

interface ApiResponse {
  success: boolean;
  message?: Message;
  messages?: Message[];
  error?: string;
}

export interface MessageState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;

  getAllChatMessages: (chatId: string) => Promise<ApiResponse>;
  sendMessage: (content: string, chatId: string) => Promise<ApiResponse>;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      messages: [],
      isLoading: false,
      error: null,

      setMessages: (messages: Message[]) => set({ messages }),

      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      // optional async functions can go here
      getAllChatMessages: async (chatId: string) => {
        try {
          const { data } = await api.get(`/api/messages/${chatId}`);
          set({ messages: data.messages, isLoading: false, error: null });
          return { success: true, messages: data.messages };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to load messages";
          set({ error: errMsg, isLoading: false });
          return { success: false, error: errMsg };
        }
      },

      sendMessage: async (content: string, chatId: string) => {
        try {
          const { data } = await api.post(`/api/messages`, { content, chatId });
          get().addMessage(data.message);
          return { success: true, message: data.message };
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Failed to send message";
          set({ error: errMsg });
          return { success: false, error: errMsg };
        }
      },
    }),
    { name: "message-storage" }
  )
);
