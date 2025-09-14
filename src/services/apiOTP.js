import { api } from "./apiClient";

/**
 * Send OTP to user's email for login
 * @param {string} email - User's email address
 * @returns {Promise<Object>} API response
 */
export async function sendLoginOTP(email) {
  try {
    const { data } = await api.post("/send-login-otp", { email });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.email?.[0] ||
        error.response.data?.message ||
        "Failed to send OTP";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to send OTP");
    }
  }
}

/**
 * Verify OTP code for login
 * @param {string} email - User's email address
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} API response with token
 */
export async function verifyLoginOTP(email, otp) {
  try {
    const { data } = await api.post("/verify-login-otp", { email, otp });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.otp?.[0] ||
        error.response.data?.message ||
        "Invalid OTP code";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify OTP");
    }
  }
}
