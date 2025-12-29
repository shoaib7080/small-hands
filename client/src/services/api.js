import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor: Automatically add the Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to invalid/expired token
    if (error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";

      // Optional: Show toast message
      // toast.error("Session expired. Please login again.");
    }
    return Promise.reject(error);
  }
);

export default api;
