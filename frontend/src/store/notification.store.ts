import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/axios";
import type { Message } from "@/types/message";

interface ApiResponse {
  success: boolean;
  notification?: Message;
  notifications?: Message[];
  error?: string;
}

export interface NotificationState {
  notifications: Message[];
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<ApiResponse>;
  createNotification: (data: Partial<Message>) => Promise<ApiResponse>;
  markAsRead: (notificationId: string) => Promise<ApiResponse>;
  deleteNotification: (notificationId: string) => Promise<ApiResponse>;
  clearAllNotifications: () => void;

  setNotifications: (notifications: Message[]) => void;
  addNotification: (notification: Message) => void;
  removeNotification: (notificationId: string) => void;
}

export const getErrorMessage = (err: any): string =>
  err.response?.data?.message || err.message || "Something went wrong";

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,
      error: null,

      // === Local State Mutators ===
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      removeNotification: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (n) => n._id !== notificationId
          ),
        })),

      // === Fetch Notifications ===
      fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get("/api/notifications");
          const notifications = Array.isArray(data) ? data : [];
          set({ notifications, isLoading: false });
          return { success: true, notifications };
        } catch (err: any) {
          const errorMessage = getErrorMessage(err);
          set({ error: errorMessage, isLoading: false, notifications: [] });
          return { success: false, error: errorMessage };
        }
      },

      // === Create Notification (i.e. new message) ===
      createNotification: async (notificationData) => {
        try {
          const { data } = await api.post("/api/notifications", notificationData);
          set((state) => ({
            notifications: [data, ...state.notifications],
          }));
          return { success: true, notification: data };
        } catch (err: any) {
          const errorMessage = getErrorMessage(err);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // === Mark Notification as Read ===
      markAsRead: async (notificationId) => {
        try {
          const { data } = await api.patch(
            `/api/notifications/${notificationId}/read`
          );
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
          }));
          return { success: true, notification: data };
        } catch (err: any) {
          const errorMessage = getErrorMessage(err);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // === Delete Notification ===
      deleteNotification: async (notificationId) => {
        try {
          await api.delete(`/api/notifications/${notificationId}`);
          set((state) => ({
            notifications: state.notifications.filter(
              (n) => n._id !== notificationId
            ),
          }));
          return { success: true };
        } catch (err: any) {
          const errorMessage = getErrorMessage(err);
          set({ error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // === Clear All Notifications (local only) ===
      clearAllNotifications: () => set({ notifications: [] }),
    }),
    { name: "notification-storage" }
  )
);
