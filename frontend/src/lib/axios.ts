import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL; // ✅ Vite env variable

export const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true, // If using cookies/sessions
});
