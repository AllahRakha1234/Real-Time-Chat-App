import axios from "axios";
import { useAuthStore } from "../store/auth.store"; // adjust path

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

// 🔹 Attach Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().user?.token; // ✅ get token from Zustand
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
