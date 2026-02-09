import { api } from "./apiClient";
import { authStorage } from "../utils/authStorage";

export async function login({ email, password }) {
  const { data } = await api.post("/login", { email, password });

  // Check if 2FA is required (Node.js backend format)
  if (data.data?.requires_2fa) {
    return { status: "2fa_required", ...data.data };
  }

  // Normal login flow - Node.js backend returns session.access_token
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;

  if (!token) throw new Error("Invalid token response");

  // Store tokens securely
  authStorage.setToken(token);
  if (refreshTokenValue) {
    localStorage.setItem('refresh_token', refreshTokenValue);
  }

  // Store user info with constructed name
  if (data?.data?.user) {
    const user = data.data.user;
    const userWithName = {
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    };
    authStorage.setUserInfo(userWithName);
  }

  // Clear any registration token after full login
  authStorage.removeRegistrationToken();

  return { ...data, authorization: { token }, user: data.data?.user };
}

export async function refreshToken() {
  try {
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (!refreshTokenValue) throw new Error("No refresh token available");

    const { data } = await api.post("/refresh", {
      refresh_token: refreshTokenValue,
    });

    // Node.js backend returns session.access_token
    const newToken = data?.data?.session?.access_token;
    const newRefreshToken = data?.data?.session?.refresh_token;

    if (!newToken) throw new Error("Invalid refresh token response");

    authStorage.setToken(newToken);
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
    }
    return newToken;
  } catch {
    authStorage.removeToken();
    localStorage.removeItem('refresh_token');
  }
}

export async function logout() {
  try {
    const { data } = await api.post("/logout");

    authStorage.removeToken();
    localStorage.removeItem("userInfo");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("refresh_token");
    return data;
  } catch (error) {
    authStorage.removeToken();
    localStorage.removeItem("userInfo");
    localStorage.removeItem("rememberedEmail");
    localStorage.removeItem("refresh_token");
    throw new Error(error.response?.data?.message || "Logout failed");
  }
}

export async function signupRequest({
  name,
  email,
  password,
  password_confirmation,
  nin: _nin, // Reserved for future KYC
  phone_number,
}) {
  // Split name into first_name and last_name for Node.js backend
  const nameParts = (name || '').trim().split(' ');
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || nameParts[0] || '';

  const { data } = await api.post("/register", {
    first_name,
    last_name,
    email,
    password,
    password_confirmation,
    phone: phone_number,
  });

  // Store registration token - Node.js returns session.access_token
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;

  if (token) {
    authStorage.setRegistrationToken(token);
  }
  if (refreshTokenValue) {
    localStorage.setItem('refresh_token', refreshTokenValue);
  }

  return { ...data, authorization: { token }, user: data?.data?.user };
}

export async function verifyAccount({ code, email }) {
  // Node.js backend uses /verify-email with otp field
  const { data } = await api.post("/verify-email", { otp: code, email });

  if (data?.data?.user) {
    const user = data.data.user;
    // Construct name from first_name + last_name for localStorage
    const userWithName = {
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    };
    authStorage.setUserInfo(userWithName);
  }

  // Store the auth token if provided after verification
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;

  if (token) {
    authStorage.setToken(token);

    // Also ensure we have a registration token for the add-car flow
    if (!authStorage.getRegistrationToken()) {
      authStorage.setRegistrationToken(token);
    }
  }
  if (refreshTokenValue) {
    localStorage.setItem('refresh_token', refreshTokenValue);
  }

  return { ...data, authorization: { token }, user: data?.data?.user };
}

export async function resendVerificationCode(email) {
  const { data } = await api.post("/verify/email-resend", { email });
  return data;
}

// Send OTP for passwordless login
export async function sendLoginOtp(email) {
  const { data } = await api.post("/send-login-otp", { email });
  return data;
}

// Verify OTP for passwordless login
export async function verifyLoginOtp({ email, otp }) {
  const { data } = await api.post("/verify-login-otp", { email, otp });

  // Node.js backend returns session.access_token
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;

  if (token) {
    authStorage.setToken(token);
    // Clear any registration token after full login via OTP
    authStorage.removeRegistrationToken();
  }
  if (refreshTokenValue) {
    localStorage.setItem('refresh_token', refreshTokenValue);
  }

  // Store user info with constructed name
  if (data?.data?.user) {
    const user = data.data.user;
    const userWithName = {
      ...user,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
    };
    authStorage.setUserInfo(userWithName);
  }

  return { ...data, authorization: { token }, user: data?.data?.user };
}

// Forgotten password implementation
export async function ForgotPassword(email) {
  const { data } = await api.post("/send-otp", { email });
  return data;
}

export async function verifyRestPass({ email, otp }) {
  const { data } = await api.post("/verify-otp", { email, otp });
  // Node.js backend returns reset_token in data.data
  return { ...data, reset_token: data?.data?.reset_token };
}

export async function ResetPassword({ email, password, password_confirmation, token }) {
  const { data } = await api.post("/reset-password", { email, password, password_confirmation, token });
  return data;
}
