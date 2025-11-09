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

  login: (credentials: LoginCredentials) => Promise<{ success: boolean; user?: User; message?: string; error?: string }>;
  register: (credentials: FormData) => Promise<{ success: boolean; user?: User; message?: string; error?: string }>;
  searchUser: (searchTerm: string, page: number, limit: number) => Promise<{ success: boolean; user?: User[]; totalCounts?: number; hasNext?: boolean; message?: string; error?: string }>;
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
          const res = await api.post("/api/user/login", { email, password });
          const user = res?.data?.data ?? null;

          set({ user, isLoading: false });

          return {
            success: res?.data?.success ?? false,
            user,
            message: res?.data?.message ?? "Login successful",
          };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "Login failed";
          set({ error: errorMessage, isLoading: false, user: null });
          return { success: false, error: errorMessage };
        }
      },

      register: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/api/user", formData);
          const user = res?.data?.data ?? null;

          set({ user, isLoading: false });

          return {
            success: res?.data?.success ?? true,
            user,
            message: res?.data?.message ?? "Registration successful",
          };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      searchUser: async (searchTerm: string, page: number, limit: number) => {
        set({ isLoading: true, error: null, searchResults: [] });

        try {
          const res = await api.get(`/api/user?page=${page}&limit=${limit}`, { params: { search: searchTerm } });
          const users = res?.data?.data ?? [];
          const totalCounts = res?.data?.totalCounts ?? 0;
          const hasNext = res?.data?.hasNext ?? false;

          set({
            searchResults: users,
            totalCounts,
            hasNext,
            isLoading: false,
          });

          return {
            success: true,
            user: users,
            totalCounts,
            hasNext,
            message: res?.data?.message ?? "Users fetched successfully",
          };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "Failed fetching users";

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
          const res = await api.post("/api/user/sendOtp", { email });
          set({ resetEmail: email ?? null, isLoading: false });

          return { success: true, message: res?.data?.message ?? "OTP sent successfully" };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "Failed to send OTP";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      verifyOtp: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const email = get()?.resetEmail ?? null;
          if (!email) throw new Error("No email set for verification");

          const res = await api.post("/api/user/verifyOtp", { email, otp });
          set({ resetToken: res?.data?.resetToken ?? null, isLoading: false });

          return { success: true, message: res?.data?.message ?? "OTP verified successfully" };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "OTP verification failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      resetPassword: async (newPassword: string) => {
        set({ isLoading: true, error: null });
        const resetToken = get()?.resetToken ?? null;
        if (!resetToken) {
          set({ isLoading: false });
          return { success: false, error: "Missing reset token" };
        }

        try {
          const res = await api.post("/api/user/resetPassword", { resetToken, newPassword });
          set({ resetEmail: null, resetToken: null, isLoading: false });

          return { success: true, message: res?.data?.message ?? "Password reset successfully" };
        } catch (err: any) {
          const errorMessage = err?.response?.data?.message ?? err?.message ?? "Password reset failed";
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
        user: state?.user ?? null,
        resetEmail: state?.resetEmail ?? null,
        resetToken: state?.resetToken ?? null,
      }),
    }
  )
);