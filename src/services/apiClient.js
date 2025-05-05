import axios from "axios";
import { refreshToken } from "./apiAuth";
import { authStorage } from "../utils/authStorage";

const api = axios.create({
  baseURL: "https://backend.motoka.com.ng/api",
});

// Add security headers to all requests
api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add security headers
  config.headers['X-Content-Type-Options'] = 'nosniff';
  config.headers['X-Frame-Options'] = 'DENY';
  config.headers['X-XSS-Protection'] = '1; mode=block';
  
  return config;
});

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried the request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const newToken = await refreshToken();
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        authStorage.removeToken();
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export { api };
