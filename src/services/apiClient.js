import axios from "axios"
import { refreshToken } from "./apiAuth"
import { authStorage } from "../utils/authStorage"
import config from "../config/config"

let isRedirectingToLogin = false

// Create a request cache to prevent duplicate requests
const requestCache = new Map()

const api = axios.create({
  baseURL: config.getApiBaseUrl(),
});

// Add security headers to all requests
api.interceptors.request.use((config) => {
  // Use registrationToken only for specific registration-related endpoints
  const registrationToken = authStorage.getRegistrationToken()
  const authToken = authStorage.getToken()

  // Prefer auth token whenever it's available
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  } else if (
    config.url &&
    (
      config.url.includes("add-car") ||
      config.url.includes("car/reg") ||
      config.url.includes("car-types")
    )
  ) {
    // Fall back to registration token only if no auth token exists
    if (registrationToken) {
      console.log(`Using registration token for ${config.url}`)
      config.headers.Authorization = `Bearer ${registrationToken}`
    }
  }

  return config
})

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const registrationToken = authStorage.getRegistrationToken();
    const isRegistrationRequest = originalRequest.url?.includes("add-car") || originalRequest.url?.includes("car/reg");

    if (error.response?.status === 401) {
      // Prevent infinite retry loops and duplicate redirects
      if (!originalRequest._retry) {
        originalRequest._retry = true

        // Only attempt token refresh if not using registration token
        if (!isRegistrationRequest || !registrationToken) {
          try {
            const newToken = await refreshToken()
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          } catch (refreshError) {
            // Clear tokens and redirect to login just once
            authStorage.clearAll?.() || authStorage.removeToken()
            if (!isRedirectingToLogin) {
              isRedirectingToLogin = true
              window.location.replace("/auth/login")
            }
            return Promise.reject(refreshError)
          }
        }
      }

      // For registration flows or after retry, ensure we don't spam toasts/redirects
      if (!isRedirectingToLogin && !isRegistrationRequest) {
        authStorage.clearAll?.() || authStorage.removeToken()
        isRedirectingToLogin = true
        window.location.replace("/auth/login")
      }
    }

    return Promise.reject(error)
  },
)

// Create a wrapper for the API to handle caching
const apiWithCache = {
  get: async (url, config = {}) => {
    const cacheKey = `get:${url}:${JSON.stringify(config)}`

  
    if (requestCache.has(cacheKey)) {
      const cachedData = requestCache.get(cacheKey)
      if (cachedData.expiry > Date.now()) {
        return cachedData.response
      }
      
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


  post: (url, data, config) => api.post(url, data, config),
  put: (url, data, config) => api.put(url, data, config),
  delete: (url, config) => api.delete(url, config),
}

export { apiWithCache as api }
