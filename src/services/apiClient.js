import axios from "axios"
import { refreshToken } from "./apiAuth"
import { authStorage } from "../utils/authStorage"

// Create a request cache to prevent duplicate requests
const requestCache = new Map()

const api = axios.create({
  baseURL: "https://api.motoka.ng/api",
});

// Add security headers to all requests
api.interceptors.request.use((config) => {
  // Use registrationToken for /add-car, otherwise use authToken
  const registrationToken = authStorage.getRegistrationToken()
  const authToken = authStorage.getToken()

  // For car-related endpoints, try registration token first
  if (
    config.url &&
    (config.url.includes("add-car") ||
      config.url.includes("car/reg") ||
      config.url.includes("car-types") ||
      config.url.includes("cars"))
  ) {
    if (registrationToken) {
      console.log(`Using registration token for ${config.url}`)
      config.headers.Authorization = `Bearer ${registrationToken}`
    } else if (authToken) {
      console.log(`Using auth token for ${config.url}`)
      config.headers.Authorization = `Bearer ${authToken}`
    }
  } else if (authToken) {
    // For all other endpoints, use auth token
    config.headers.Authorization = `Bearer ${authToken}`
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
    const registrationToken = authStorage.getRegistrationToken();
    const isRegistrationRequest = originalRequest.url?.includes("add-car") || originalRequest.url?.includes("car/reg");

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      // Only attempt token refresh if not using registration token
      if (!isRegistrationRequest || !registrationToken) {
        try {
          const newToken = await refreshToken()
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } catch (refreshError) {
          authStorage.removeToken()
          window.location.href = "/auth/login"
          return Promise.reject(refreshError)
        }
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
