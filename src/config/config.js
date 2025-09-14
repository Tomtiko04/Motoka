// Environment-based configuration
const config = {
  // Default to localhost for development
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://backend-motoka.test/api',
  environment: import.meta.env.VITE_ENV || 'development',
  
  // Helper function to get the current API base URL
  getApiBaseUrl: () => {
    return import.meta.env.VITE_API_BASE_URL || 'http://backend-motoka.test/api'
  },
  
  // Helper function to check if we're in development mode
  isDevelopment: () => {
    return import.meta.env.DEV || import.meta.env.VITE_ENV === 'development'
  },
  
  // Helper function to check if we're in production mode
  isProduction: () => {
    return import.meta.env.PROD || import.meta.env.VITE_ENV === 'production'
  }
}

export default config
