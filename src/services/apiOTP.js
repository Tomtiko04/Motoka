import { api } from "./apiClient";

/**
 * Send OTP to user's email for login
 * @param {string} email - User's email address
 * @returns {Promise<Object>} API response
 */
export async function sendLoginOTP(email) {
  const { data } = await api.post("/send-login-otp", { email });
  return data;
}

/**
 * Verify OTP code for login
 * @param {string} email - User's email address
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} API response with token
 */
export async function verifyLoginOTP(email, otp) {
  const { data } = await api.post("/verify-login-otp", { email, otp });
  return data;
}
