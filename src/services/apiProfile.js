import { api } from "./apiClient.js"

// Get user profile
export async function getProfile() {
  const { data } = await api.get("/settings/profile", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  return data // Return full response with success field
}

// Update user profile
export async function updateProfile(profileData) {
  const { data } = await api.put("/settings/profile", profileData)
  return data // Return full response with success field
}

/**
 * Upload a profile display picture.
 *
 * Goes to the same PUT /settings/profile as the rest of the profile, but as
 * multipart — axios sets the boundary itself, so the Content-Type is
 * deliberately not set here. The field is named profile_image to match what
 * the agent endpoints already accept.
 *
 * Returns the full response so the caller can check the server actually came
 * back with an image, rather than assuming the upload landed.
 */
export async function uploadProfileImage(file) {
  const form = new FormData()
  form.append("profile_image", file)
  const { data } = await api.put("/settings/profile", form)
  return data
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
