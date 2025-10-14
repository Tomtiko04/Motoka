import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET || "your-secret-key";

export const authStorage = {
  setToken: (token) => {
    try {
      const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem("authToken", encryptedToken);
    } catch (error) {
      console.error("Error storing token:", error);
    }
  },

  getToken: () => {
    try {
      const encryptedToken = localStorage.getItem("authToken");
      if (!encryptedToken) return null;

      const decryptedToken = CryptoJS.AES.decrypt(
        encryptedToken,
        SECRET_KEY,
      ).toString(CryptoJS.enc.Utf8);
      return decryptedToken;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  },

  removeToken: () => {
    try {
      localStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  isAuthenticated: () => {
    const token = authStorage.getToken();
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true; // non-JWT tokens treated as present
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const expSec = payload?.exp;
      if (!expSec) return true;
      const isExpired = Date.now() >= expSec * 1000;
      if (isExpired) {
        authStorage.removeToken();
        return false;
      }
      return true;
    } catch (e) {
      // If parsing fails, fall back to token presence
      return true;
    }
  },

  isVerified: () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      // Check multiple possible verification fields
      return userInfo?.email_verified || 
             userInfo?.verified || 
             userInfo?.is_verified || 
             userInfo?.email_verified_at !== null ||
             false;
    } catch {
      return false;
    }
  },

  setRegistrationToken: (token) => {
    try {
      // Store registration token with encryption for security
      const encryptedToken = CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
      localStorage.setItem("registrationToken", encryptedToken);
      console.log('Registration token stored successfully');
    } catch (error) {
      console.error("Error storing registration token:", error);
    }
  },

  getRegistrationToken: () => {
    try {
      const encryptedToken = localStorage.getItem("registrationToken");
      if (!encryptedToken) return null;

      const decryptedToken = CryptoJS.AES.decrypt(
        encryptedToken,
        SECRET_KEY,
      ).toString(CryptoJS.enc.Utf8);
      return decryptedToken;
    } catch (error) {
      console.error("Error retrieving registration token:", error);
      return null;
    }
  },

  removeRegistrationToken: () => {
    try {
      localStorage.removeItem("registrationToken");
      console.log('Registration token removed');
    } catch (error) {
      console.error("Error removing registration token:", error);
    }
  },

  // Helper method to check if user can add car
  canAddCar: () => {
    try {
      const hasRegistrationToken = !!authStorage.getRegistrationToken()
      const hasAuthToken = !!authStorage.getToken()

      
      const canAdd = hasRegistrationToken || hasAuthToken

      console.log("canAddCar check:", {
        hasRegistrationToken,
        hasAuthToken,
        canAdd,
      })

      return canAdd
    } catch (error) {
      console.error("Error in canAddCar:", error)
      return false
    }
  },

  // Method to set user info after verification
  setUserInfo: (userInfo) => {
    try {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      console.log('User info stored:', userInfo);
    } catch (error) {
      console.error("Error storing user info:", error);
    }
  },

  getUserInfo: () => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error("Error retrieving user info:", error);
      return null;
    }
  },

  clearAll: () => {
    try {
      authStorage.removeToken();
      authStorage.removeRegistrationToken();
      localStorage.removeItem("userInfo");
      localStorage.removeItem("rememberedEmail");
      console.log('All auth data cleared');
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }
};