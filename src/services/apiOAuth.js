import { api } from "./apiClient";
import { authStorage } from "../utils/authStorage";

/**
 * Initiate Google OAuth login
 * Returns the OAuth URL to redirect the user to
 */
export async function initiateGoogleLogin() {
  const { data } = await api.post("/auth/google");
  return data;
}

/**
 * Handle OAuth callback after user returns from Google
 * @param {string} code - Authorization code from Google
 */
export async function handleOAuthCallback(code) {
  const { data } = await api.get(`/auth/callback?code=${encodeURIComponent(code)}`);
  
  // Store tokens and user info
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;
  
  if (token) {
    authStorage.setToken(token);
  }
  if (refreshTokenValue) {
    localStorage.setItem('refresh_token', refreshTokenValue);
  }
  
  // Store user info with constructed name
  if (data?.data?.user) {
    const user = data.data.user;
    const userWithName = {
      ...user,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    };
    authStorage.setUserInfo(userWithName);
  }
  
  return data;
}
