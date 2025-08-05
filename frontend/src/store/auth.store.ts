import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios"; // ⬅️ Axios instance

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post("/api/user/login", {
            email,
            password,
          });

          const user: User = response.data.user;

          set({ user, isLoading: false, error: null });
        } catch (err: any) {
          set({
            error: err.response?.data?.message || "Login failed",
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
