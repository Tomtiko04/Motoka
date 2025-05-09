import { api } from "./apiClient.js"

// Get user profile
export async function getProfile() {
  try {
    const { data } = await api.get("/settings/profile")
    return data
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to fetch profile"
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || "Failed to fetch profile")
    }
  }
}

// Update user profile
export async function updateProfile(profileData) {
  try {
    const { data } = await api.put("/settings/profile", profileData)
    // Clear any cached profile data since we've updated it
    return data
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to update profile"
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || "Failed to update profile")
    }
  }
}

// Change password
export async function changePassword(passwordData) {
  try {
    const { data } = await api.put("/settings/change-password", passwordData)
    return data
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to change password"
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || "Failed to change password")
    }
  }
}

// Delete account
export async function deleteAccount(password) {
  try {
    const { data } = await api.delete("/settings/delete-account", {
      data: { password },
    })
    return data
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || "Failed to delete account"
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || "Failed to delete account")
    }
  }
}
