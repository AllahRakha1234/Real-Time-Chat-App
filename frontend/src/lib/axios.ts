import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000"; // ✅ Vite env variable with fallback


export const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // If using cookies/sessions
});
