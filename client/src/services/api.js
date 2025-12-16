import axios from "axios";

// Create an Axios instance
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor: Automatically add the Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
