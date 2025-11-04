// lib/axios/api.ts
import axios from "axios";

// Helper function to get cookie value in browser
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// axios instance for acessing /api routes
const httpServer = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL + "/api" || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor to add authentication token from cookies
httpServer.interceptors.request.use(
  (config) => {
    // Read token from cookie in the browser
    const token = getCookie('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default httpServer;
