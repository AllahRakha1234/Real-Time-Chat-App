import { create } from "zustand";
import { api } from "../lib/axios";
import type { Message } from "@/types/message";
import { getErrorMessage } from "./chat.store"; // Import error parser

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
  clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [], error: null }),

  // Fetch messages
  getAllChatMessages: async (chatId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/api/messages/${chatId}`);
      set({ messages: data.messages, isLoading: false });
      return { success: true, messages: data.messages };
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      set({ error: errMsg, isLoading: false });
      return { success: false, error: errMsg };
    }
  },

  // Send message
  sendMessage: async (content, chatId) => {
    try {
      const { data } = await api.post(`/api/messages`, { content, chatId });
      get().addMessage(data.message);
      return { success: true, message: data.message };
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      set({ error: errMsg });
      return { success: false, error: errMsg };
    }
  },
}));