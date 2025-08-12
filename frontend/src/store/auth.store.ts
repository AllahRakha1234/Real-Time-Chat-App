import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios"; // ⬅️ Axios instance

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  pic?: string;
  token?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  login: (
    credentials: LoginCredentials
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    credentials: FormData
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  clearError: () => void;
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

          const userData = response.data;

          // Transform the backend response to match our User interface
          const user: User = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin,
            pic: userData.pic,
            token: userData.token,
          };

          set({ user, isLoading: false, error: null });
          return { success: true, user };
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
          const response = await api.post("/api/user", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          const userData = response.data;

          const user: User = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin,
            pic: userData.pic,
            token: userData.token,
          };

          set({ user, isLoading: false, error: null });
          return { success: true, user };
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

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
