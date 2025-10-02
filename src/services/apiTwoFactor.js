import { api } from "./apiClient.js";
import { authStorage } from "../utils/authStorage";

// Function to handle 2FA verification during login
export async function verifyLoginTwoFactor(twoFactorToken, code) {
  try {
    const { data } = await api.post("/2fa/verify-login", {
      "2fa_token": twoFactorToken,
      code
    });
    
   
    if (data?.authorization?.token) {
      authStorage.setToken(data.authorization.token);
      // Clear any registration token after full login via 2FA
      authStorage.removeRegistrationToken();
    }
    
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to verify 2FA code";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify 2FA code");
    }
  }
}

// Enable 2FA via email
export async function enableTwoFactorEmail() {
  try {
    const { data } = await api.post("/2fa/enable-email");
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to enable 2FA via email";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to enable 2FA via email");
    }
  }
}

// Enable 2FA via mobile app
export async function enableTwoFactorApp() {
  try {
    const { data } = await api.post("/2fa/enable-google");
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to enable 2FA via mobile app";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to enable 2FA via mobile app");
    }
  }
}

// Verify 2FA code sent via email
export async function verifyTwoFactorEmail(code) {
  try {
  
    const { data } = await api.post("/2fa/verify-email", { code });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to verify code";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify code");
    }
  }
}

// Verify 2FA code from mobile app
export async function verifyTwoFactorApp(code) {
  try {

    const { data } = await api.post("/2fa/verify-app", { code });
    return data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to verify code";
      throw new Error(errorMessage);
    } else {
      throw new Error(error.message || "Failed to verify code");
    }
  }
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