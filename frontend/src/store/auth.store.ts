import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios";
import type { User, LoginCredentials } from "@/types/auth";

interface AuthState {
  user: User | null;
  searchResults: User[];
  totalCounts: number;
  hasNext: boolean;
  isLoading: boolean;
  error: string | null;

  resetEmail?: string | null;
  resetToken?: string | null;

  // Auth actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (credentials: FormData) => Promise<{ success: boolean; user?: User; error?: string }>;
  searchUser: (searchTerm: string, page: number, limit: number) => Promise<{
    success: boolean;
    user?: User[];
    totalCounts?: number,
    hasNext?: boolean,
    error?: string;
  }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearError: () => void;
  clearSearchResults: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      searchResults: [],
      totalCounts: 0,
      hasNext: false,
      isLoading: false,
      error: null,

      resetEmail: null,
      resetToken: null,

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await api.post("/api/user/login", { email, password });
          set({ user: data, isLoading: false });
          return { success: true, user: data };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || "Login failed";
          set({ error: errorMessage, isLoading: false, user: null });
          return { success: false, error: errorMessage };
        }
      },

      register: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/api/user", formData);
          set({ user: data, isLoading: false });
          return { success: true, user: data };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      searchUser: async (searchTerm: string, page: number, limit: number) => {
        set({ isLoading: true, error: null, searchResults: [] });

        try {
          const response = await api.get(`/api/user?page=${page}&limit=${limit}`, {
            params: { search: searchTerm },
          });

          const { data: users, totalCounts, hasNext } = response.data;

          set({
            searchResults: users,
            totalCounts,
            hasNext,
            isLoading: false,
          });

          return { success: true, users, totalCounts, hasNext };
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed fetching Users";

          set({
            error: errorMessage,
            isLoading: false,
            searchResults: [],
            totalCounts: 0,
            hasNext: false,
          });

          return { success: false, error: errorMessage };
        }
      },
      logout: () => {
        set({
          user: null,
          searchResults: [],
          totalCounts: 0,
          hasNext: false,
          isLoading: false,
          error: null,
          resetEmail: null,
          resetToken: null,
        });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await api.post("/api/user/sendOtp", { email });

          set({
            resetEmail: email, // store email
            isLoading: false,
          });

          return { success: true, message: data.message };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || err.message || "Failed to send OTP";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      verifyOtp: async (otp: string) => {
        set({ isLoading: true, error: null });

        try {
          const email = get().resetEmail;
          if (!email) throw new Error("No email set for verification");

          const { data } = await api.post("/api/user/verifyOtp", { email, otp });

          set({
            resetToken: data.resetToken,
            isLoading: false,
          });

          return { success: true, message: data.message };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "OTP verification failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      resetPassword: async (newPassword: string) => {
        const { resetToken } = get();

        if (!resetToken) {
          return { success: false, error: "Missing reset token" };
        }
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/api/user/resetPassword", {
            resetToken,
            newPassword,
          });
          // clear values after success
          set({
            resetEmail: null,
            resetToken: null,
            isLoading: false,
          });
          return { success: true, message: data.message };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Password reset failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      clearError: () => set({ error: null }),
      clearSearchResults: () => set({ searchResults: [], totalCounts: 0, hasNext: false }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        resetEmail: state.resetEmail,
        resetToken: state.resetToken,
      }),
    }
  )
);
