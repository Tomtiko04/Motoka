import axios from "axios"
import { refreshToken } from "./apiAuth"
import { authStorage } from "../utils/authStorage"

// Create a request cache to prevent duplicate requests
const requestCache = new Map()

const api = axios.create({
  baseURL: "https://backend.motoka.com.ng/api",
})

// Add security headers to all requests
api.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Add security headers
  config.headers["X-Content-Type-Options"] = "nosniff"
  config.headers["X-Frame-Options"] = "DENY"
  config.headers["X-XSS-Protection"] = "1; mode=block"

  return config
})

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't retried the request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        const newToken = await refreshToken()
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        authStorage.removeToken()
        window.location.href = "/auth/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Create a wrapper for the API to handle caching
const apiWithCache = {
  get: async (url, config = {}) => {
    const cacheKey = `get:${url}:${JSON.stringify(config)}`

    // Check if we have a cached response and it's not expired
    if (requestCache.has(cacheKey)) {
      const cachedData = requestCache.get(cacheKey)
      if (cachedData.expiry > Date.now()) {
        return cachedData.response
      }
      // Remove expired cache
      requestCache.delete(cacheKey)
    }

    // Make the actual request
    const response = await api.get(url, config)

    
    requestCache.set(cacheKey, {
      response,
      expiry: Date.now() + 30000, 
    })

    return response
  },

  // Pass through other methods without caching
  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
}

export { apiWithCache as api }
