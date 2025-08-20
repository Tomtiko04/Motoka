import { api } from "./apiClient";
import { authStorage } from "../utils/authStorage";

export async function login({ email, password }) {
  try {
    const { data } = await api.post("/login2", { email, password });

    // Check if 2FA is required
    if (data.status === "2fa_required") {
      return data;
    }

    // Normal login flow
    const token = data?.authorization?.token;
    if (!token) throw new Error("Invalid token response");

    // Stores token securely
    authStorage.setToken(token);

    return data;
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

    const { data } = await api.post("/auth/refresh-token", {
      token: currentToken,
    });
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
    const { data } = await api.post("/logout2");

    authStorage.removeToken();
    localStorage.removeItem("userInfo");
    localStorage.removeItem("rememberedEmail");
    return data;
  } catch (error) {
    authStorage.removeToken();
    localStorage.removeItem("userInfo");
    localStorage.removeItem("rememberedEmail");
    throw new Error(error.response?.data?.message || "Logout failed");
  }
}

export async function signupRequest({
  name,
  email,
  password,
  password_confirmation,
  nin,
  phone_number,
}) {
  try {
    const { data } = await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
      nin,
      phone_number,
    });

    // Store registration token if present
    if (data.authorization?.token) {
      authStorage.setRegistrationToken(data.authorization.token);
    }

    return data;
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
    const { data } = await api.post("/verify/user", { code, email });

    if (data.user) {
      authStorage.setUserInfo(data.user);
    }

    // Store the auth token if provided after verification
    if (data.authorization?.token) {
      authStorage.setToken(data.authorization.token);

      // Also ensure we have a registration token for the add-car flow
      // This is crucial - we need to make sure the registration token exists
      if (!authStorage.getRegistrationToken()) {
        authStorage.setRegistrationToken(data.authorization.token);
      }
    }

    // console.log("Account verified successfully:", {
    //   hasAuthToken: !!authStorage.getToken(),
    //   hasRegistrationToken: !!authStorage.getRegistrationToken(),
    //   user: !!data.user,
    // })

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

export async function resendVerificationCode(email) {
  try {
    const { data } = await api.post("/verify/email-resend", { email });
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to resend verification code",
    );
  }
}