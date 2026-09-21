import { api } from "./apiClient.js";
import { authStorage } from "../utils/authStorage";

// Function to handle 2FA verification during login
export async function verifyLoginTwoFactor({ userId, tempToken, code }) {
  const { data } = await api.post("/2fa/verify-login", {
    user_id: userId,
    temp_token: tempToken,
    code,
  });

  // Same session shape as /login: data.data.session.{access,refresh}_token
  const token = data?.data?.session?.access_token;
  const refreshTokenValue = data?.data?.session?.refresh_token;

  if (!token) throw new Error("Invalid token response");

  authStorage.setToken(token);
  if (refreshTokenValue) {
    localStorage.setItem("refresh_token", refreshTokenValue);
  }

  if (data?.data?.user) {
    const user = data.data.user;
    authStorage.setUserInfo({
      ...user,
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email,
    });
  }

  // Clear any registration token after full login via 2FA
  authStorage.removeRegistrationToken();

  return { ...data, authorization: { token }, user: data.data?.user };
}

// Enable 2FA via email
export async function enableTwoFactorEmail() {
  const { data } = await api.post("/2fa/enable-email");
  return data;
}

// Enable 2FA via mobile app
export async function enableTwoFactorApp() {
  const { data } = await api.post("/2fa/enable-google");
  return data;
}

// Verify 2FA code sent via email
export async function verifyTwoFactorEmail(code) {
  const { data } = await api.post("/2fa/verify-email", { code });
  return data;
}

// Verify 2FA code from mobile app (backend route is /2fa/verify-google)
export async function verifyTwoFactorApp(code) {
  const { data } = await api.post("/2fa/verify-google", { code });
  return data;
}

// Disable 2FA via email
// Disable 2FA for email
// export async function disableTwoFactorEmail() {
//     try {
//         const { data } = await api.post("/2fa/disable?type=email");
//         return data;
//     } catch (error) {
//         if (error.response) {
//         const errorMessage = error.response.data?.message || "Failed to disable 2FA via email";
//         throw new Error(errorMessage);
//         } else {
//         throw new Error(error.message || "Failed to disable 2FA via email");
//         }
//     }
// }
  
  // Disable 2FA for mobile app (Google Authenticator)
//   export async function disableTwoFactorApp() {
//     try {
//       const { data } = await api.post("/2fa/disable?type=google");
//       return data;
//     } catch (error) {
//       if (error.response) {
//         const errorMessage = error.response.data?.message || "Failed to disable 2FA via mobile app";
//         throw new Error(errorMessage);
//       } else {
//         throw new Error(error.message || "Failed to disable 2FA via mobile app");
//       }
//     }
//   }
  
  // Generic function to disable 2FA based on type
//   export async function disableTwoFactor(type) {
//     try {
//       if (!type || (type !== 'email' && type !== 'google')) {
//         throw new Error("Invalid 2FA type specified");
//       }
      
//       const { data } = await api.post(`/2fa/disable?type=${type}`);
//       return data;
//     } catch (error) {
//       if (error.response) {
//         const errorMessage = error.response.data?.message || `Failed to disable ${type} 2FA`;
//         throw new Error(errorMessage);
//       } else {
//         throw new Error(error.message || `Failed to disable ${type} 2FA`);
//       }
//     }
//   }

// Check the status of 2FA for a given type
// export async function checkTwoFactorStatus(type) {
//   try {
//     const { data } = await api.get(`/2fa/check-2fa?type=${type}`);
//     return data; // Assuming the response has a structure like { status: 0 or 1 }
//   } catch (error) {
//     if (error.response) {
//       const errorMessage = error.response.data?.message || "Failed to check 2FA status";
//       throw new Error(errorMessage);
//     } else {
//       throw new Error(error.message || "Failed to check 2FA status");
//     }
//   }
// }