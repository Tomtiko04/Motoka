import Cookies from "js-cookie";
import { api } from "./apiClient";

export async function login({ email, password }) {
  try {
    const { data } = await api.post("/login2", { email, password });

    const token = data?.authorization?.token;
    if (!token) throw new Error("Invalid token response");

    Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });

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

export async function signupRequest({ name, email, password }) {
  try {
    const { data } = await api.post("/register", { name, email, password });

    const token = data?.authorization?.token;
    if (!token) throw new Error("Signup successful, but no token received.");

    // Store token securely

    Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });

    return  data.user
  } catch (error) {
    console.log(error.response.data);
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

// export async function logout() {
//   try {
//     await api.post("/logout");
//     Cookies.remove("authToken"); // Remove token from cookies
//   } catch (error) {
//     console.error("Logout failed:", error);
//   }
// }

// export async function getCurrentUser() {
//   try {
//     const { data } = await api.get("/user");
//     return data.user;
//   } catch {
//     return null;
//   }
// }