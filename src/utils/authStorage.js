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
    return !!authStorage.getToken();
  },
};