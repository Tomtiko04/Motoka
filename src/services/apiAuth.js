import { api } from "./apiClient";
import { authStorage } from "../utils/authStorage";

export async function login({ email, password }) {
  try {
    const { data } = await api.post("/login2", { email, password });

    const token = data?.authorization?.token;
    if (!token) throw new Error("Invalid token response");

    // Store token securely
    authStorage.setToken(token);

    return data.user;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.email?.[0] ||
        error.response.data?.password?.[0] ||
        error.response.data?.message ||
        "Login failed";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Login failed");
    }
  }
}

export async function refreshToken() {
  try {
    const currentToken = authStorage.getToken();
    if (!currentToken) throw new Error("No token available");

    const { data } = await api.post("/auth/refresh-token", { token: currentToken });
    const newToken = data?.authorization?.token;
    
    if (!newToken) throw new Error("Invalid refresh token response");
    
    authStorage.setToken(newToken);
    return newToken;
  } catch (error) {
    authStorage.removeToken();
    throw new Error("Failed to refresh token");
  }
}

export async function logout() {
  try {
    await api.post("/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    authStorage.removeToken();
  }
}

export async function signupRequest({ name, email, password }) {
  try {
    const { data } = await api.post("/register", { name, email, password });

    const token = data?.authorization?.token;
    if (!token) throw new Error("Signup successful, but no token received.");

    // Store token securely

    Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });

    return  data.user
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.email?.[0] ||
        error.response.data?.password?.[0] ||
        error.response.data?.name?.[0] ||
        error.response.data?.message ||
        "Signup failed";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Signup failed");
    }
  }
}

export async function verifyAccount({ code, email }) {
  try {
    const { data } = await api.post("/verify/user/verify", { code, email });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.email?.[0] ||
        error.response.data?.message ||
        "Account Verification Failed";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Account Verification Failed");
    }
  }
}

export async function logout() {
  try {
    await api.post("/logout");
    Cookies.remove("authToken"); // Remove token from cookies
    localStorage.removeItem("userData"); // Remove user data
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error(error.message || "Logout failed");
  }
}

export function getCurrentUser() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}