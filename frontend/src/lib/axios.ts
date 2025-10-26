import axios from "axios";
import { useAuthStore } from "../store/auth.store"; // adjust path
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

// 🔹 Attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token; // Get token from Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors like rate limiting globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 429) {
      toast.error(message || "Too many requests. Please slow down.");
      return Promise.reject(error);
    }

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);