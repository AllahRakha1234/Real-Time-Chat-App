import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios"; // Axios instance
import type { User, LoginCredentials } from "@/types/auth"

interface AuthState {
  user: User | null;
  searchResults: User[];
  totalCounts: number,
  hasNext: boolean,
  isLoading: boolean;
  error: string | null;

  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    credentials: FormData
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  searchUser: (searchTerm: string, page: number, limit: number) => Promise<{
    success: boolean;
    user?: User[];
    totalCounts?: number,
    hasNext?: boolean,
    error?: string;
  }>;
  logout: () => void;
  clearError: () => void;
  clearSearchResults: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      searchResults: [],
      totalCounts: 0,
      hasNext: false,
      isLoading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await api.post("/api/user/login", {
            email,
            password,
          });

          set({ user: data, isLoading: false, error: null });
          return { success: true, user: data };
        } catch (err: any) {
          console.error("Login error:", err);
          const errorMessage =
            err.response?.data?.message || err.message || "Login failed";
          set({
            error: errorMessage,
            isLoading: false,
            user: null, // Clear user on error
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (formData: FormData) => {
        set({ isLoading: true, error: null });

        try {
          const { data } = await api.post("/api/user", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          set({ user: data, isLoading: false, error: null });
          return { success: true, data };
        } catch (err: any) {
          const errorMessage =
            err.response?.data?.message || err.message || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({ user: null, error: null });
      },

      searchUser: async (searchTerm: string, page: number, limit: number) => {
        set({ isLoading: true, error: null, searchResults: [] }); // Clear previous results
        try {
          const response = await api.get(`/api/user?page=${page}&limit=${limit}`, {
            params: { search: searchTerm },
          });

          // Extract data from the response structure
          const { data: users, totalCounts, hasNext } = response.data;

          set({
            searchResults: users,
            totalCounts,
            hasNext,
            isLoading: false
          });

          return { success: true, users: users, totalCounts, hasNext };
        } catch (error: any) {
          console.error("Error while fetching Users:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
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
      clearError: () => {
        set({ error: null });
      },
      clearSearchResults: () => {
        set({ searchResults: [], totalCounts: 0, hasNext: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
