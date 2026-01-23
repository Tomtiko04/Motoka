import { api } from "./apiClient.js"

// Get user profile
export async function getProfile() {
  const { data } = await api.get("/settings/profile", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return data.data // Extract { profile: {...} } from response wrapper
}

// Update user profile
export async function updateProfile(profileData) {
  const { data } = await api.put("/settings/profile", profileData)
  return data.data // Extract { profile: {...} } from response wrapper
}

// Change password
export async function changePassword(passwordData) {
  const { data } = await api.put("/settings/change-password", passwordData)
  return data
}

// Delete account
export async function deleteAccount(password) {
  const { data } = await api.delete("/settings/delete-account", {
    data: { password },
  })
  return data
}
