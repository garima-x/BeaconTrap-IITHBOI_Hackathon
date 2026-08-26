import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://beacontrap-backend.onrender.com";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Inject Request ID
  const uuid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  config.headers["X-Request-ID"] = uuid;
  // Inject JWT if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
