import { api } from "./apiClient.js"

// Get user profile
export async function getProfile() {
  // #region agent log
  console.log('[DEBUG-B] getProfile called');
  fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiProfile.js:getProfile-start',message:'getProfile called',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const { data } = await api.get("/settings/profile", {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  })
  // #region agent log
  console.log('[DEBUG-B] getProfile response:', {hasData: !!data, success: data?.success, hasProfile: !!data?.data?.profile, dataKeys: data ? Object.keys(data) : [], fullData: data});
  fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'apiProfile.js:getProfile-result',message:'getProfile response',data:{hasData:!!data,success:data?.success,hasProfile:!!data?.data?.profile,dataKeys:data?Object.keys(data):[]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return data // Return full response with success field
}

// Update user profile
export async function updateProfile(profileData) {
  const { data } = await api.put("/settings/profile", profileData)
  return data // Return full response with success field
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
