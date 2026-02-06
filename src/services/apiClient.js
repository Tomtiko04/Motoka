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
  // #region agent log
  console.log('[DEBUG-A,E] API Request:', {url: config.url, method: config.method, baseURL: config.baseURL});
  fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.js:request-interceptor',message:'API Request outgoing',data:{url:config.url,method:config.method,baseURL:config.baseURL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,E'})}).catch(()=>{});
  // #endregion
  // Use registrationToken only for specific registration-related endpoints
  const registrationToken = authStorage.getRegistrationToken()
  const authToken = authStorage.getToken()
  // #region agent log
  console.log('[DEBUG-A] Token status:', {hasAuthToken: !!authToken, hasRegToken: !!registrationToken, tokenPreview: authToken ? authToken.substring(0,20)+'...' : 'none'});
  fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.js:token-check',message:'Token status',data:{hasAuthToken:!!authToken,hasRegToken:!!registrationToken,tokenPreview:authToken?authToken.substring(0,20)+'...':'none'},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

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
  (response) => {
    // #region agent log
    console.log('[DEBUG-B] API Response success:', {url: response.config?.url, status: response.status, data: response.data});
    fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.js:response-success',message:'API Response success',data:{url:response.config?.url,status:response.status,hasData:!!response.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return response;
  },
  async (error) => {
    // #region agent log
    console.log('[DEBUG-A,B,C] API Response ERROR:', {url: error.config?.url, status: error.response?.status, errorMsg: error.message, responseData: error.response?.data});
    fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiClient.js:response-error',message:'API Response error',data:{url:error.config?.url,status:error.response?.status,errorMsg:error.message,responseData:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion
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
