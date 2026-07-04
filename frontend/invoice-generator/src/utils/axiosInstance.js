import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ================== REQUEST INTERCEPTOR ==================
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================== RESPONSE INTERCEPTOR ==================
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register");

    if (error.response) {
      if (error.response.status === 401 && !isAuthEndpoint) {
        console.error("Unauthorized! Token missing or expired. Redirecting to login...");
        localStorage.removeItem("token");
        if (window.location.pathname.toLowerCase() !== "/login") {
          window.location.href = "/Login";
        }
      }
      if (error.response.status === 403) {
        console.error("Forbidden. You don't have access.");
      }
      if (error.response.status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    } else if (!error.response) {
      console.error("Network error. Is the backend running on port 8000?");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;