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
    // Clear any registration token after full login
    authStorage.removeRegistrationToken();

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

    const { data } = await api.post("/refresh", {
      token: currentToken,
    });
    const newToken = data?.authorization?.token;

    if (!newToken) throw new Error("Invalid refresh token response");

    authStorage.setToken(newToken);
    return newToken;
  } catch (error) {
    authStorage.removeToken();
    // throw new Error("Failed to refresh token");
  }
}

export async function logout() {
  try {
    const { data } = await api.post("/logout");

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

// Send OTP for passwordless login
export async function sendLoginOtp(email) {
  try {
    const { data } = await api.post("/send-login-otp", { email });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.email?.[0] ||
        error.response.data?.message ||
        "Failed to send login OTP";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to send login OTP");
    }
  }
}

// Verify OTP for passwordless login
export async function verifyLoginOtp({ email, otp }) {
  try {
    const { data } = await api.post("/verify-login-otp", { email, otp });

    const token = data?.authorization?.token;
    if (token) {
      authStorage.setToken(token);
      // Clear any registration token after full login via OTP
      authStorage.removeRegistrationToken();
    }

    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.otp?.[0] ||
        error.response.data?.email?.[0] ||
        error.response.data?.message ||
        "Failed to verify login OTP";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify login OTP");
    }
  }
}

// Forgotten password implementatiom
export async function ForgotPassword(email){
  const { data } = await api.post("/send-otp", { email });

  return data;
}

export async function verifyRestPass({email, otp}){
  const {data} = await api.post("/verify-otp", {email, otp});

  return data;
}

export async function ResetPassword({ email, password, password_confirmation, token }){
  try {
    const { data } = await api.post("/reset-password", { email, password, password_confirmation, token });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage =
        error.response.data?.otp?.[0] ||
        error.response.data?.email?.[0] ||
        error.response.data?.password?.[0] ||
        error.response.data?.message ||
        "Failed to reset password";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to reset password");
    }
  }
}