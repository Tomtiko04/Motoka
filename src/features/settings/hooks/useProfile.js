"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "react-hot-toast"
import { getProfile, updateProfile, changePassword, deleteAccount } from "../../../services/apiProfile"

export function useProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [profileData, setProfileData] = useState(null)

  
  const requestInProgress = useRef(false)
  
  const profileFetched = useRef(false)

  const fetchProfile = useCallback(
    async (force = false) => {
     
      if (profileFetched.current && !force && profileData) {
        return profileData
      }

     
      if (requestInProgress.current) {
        return profileData
      }

      setLoading(true)
      setError(null)
      requestInProgress.current = true

      try {
        // #region agent log
        console.log('[DEBUG-B] fetchProfile try block entered');
        fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProfile.js:fetchProfile-try',message:'fetchProfile try block entered',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const response = await getProfile()
        // #region agent log
        console.log('[DEBUG-B] getProfile returned:', {responseType: typeof response, hasSuccess: response?.success, hasData: !!response?.data, profileExists: !!response?.data?.profile, responseKeys: response ? Object.keys(response) : [], fullResponse: response});
        fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProfile.js:fetchProfile-response',message:'getProfile returned',data:{responseType:typeof response,hasSuccess:response?.success,hasData:!!response?.data,profileExists:!!response?.data?.profile,responseKeys:response?Object.keys(response):[]},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        if (response.success) {
          setProfileData(response.data.profile)
          profileFetched.current = true
          return response.data.profile
        } else {
          // #region agent log
          console.log('[DEBUG-B] response.success is falsy:', {response});
          fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProfile.js:fetchProfile-noSuccess',message:'response.success is falsy',data:{response},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          setError("Failed to load profile data")
          return null
        }
      } catch (err) {
        // #region agent log
        console.log('[DEBUG-B,C] fetchProfile caught error:', {errMsg: err.message, errName: err.name, errResponse: err.response?.data, fullError: err});
        fetch('http://127.0.0.1:7242/ingest/1e16ac8b-8456-4f99-b1a0-b5941e2116f7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useProfile.js:fetchProfile-catch',message:'fetchProfile caught error',data:{errMsg:err.message,errName:err.name,errResponse:err.response?.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C'})}).catch(()=>{});
        // #endregion
        const message = err.response?.data?.message || err.message || "An error occurred while fetching profile data";
        setError(message)
        return null;
      } finally {
        setLoading(false)
        requestInProgress.current = false
      }
    },
    [profileData],
  )

  const updateUserProfile = useCallback(async (data) => {
    if (requestInProgress.current) {
      return null
    }

    setLoading(true)
    setError(null)
    requestInProgress.current = true

    try {
      const loadingToast = toast.loading("Updating profile...", { duration: 3000 })
      const response = await updateProfile(data)
      toast.dismiss(loadingToast)

      if (response.success) {
       
        setProfileData(response.data.profile || data)
        
        profileFetched.current = false
        toast.success(response.message || "Profile updated successfully", { duration: 3000 })
        return response
      } else {
        toast.error(response.message || "Failed to update profile", { duration: 3000 })
        setError("Failed to update profile")
        return null
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred while updating profile";
      toast.error(message, { duration: 3000 })
      setError(message)
      return null
    } finally {
      setLoading(false)
      requestInProgress.current = false
    }
  }, [])

  const changeUserPassword = useCallback(async (data) => {
    if (requestInProgress.current) {
      return null
    }

    setLoading(true)
    setError(null)
    requestInProgress.current = true

    try {
      const loadingToast = toast.loading("Changing password...", { duration: 3000 })
      const response = await changePassword(data)
      toast.dismiss(loadingToast)

      if (response.success) {
        toast.success(response.message || "Password changed successfully", { duration: 3000 })
        return response
      } else {
        toast.error(response.message || "Failed to change password", { duration: 3000 })
        setError("Failed to change password")
        return null
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred while changing password";
      toast.error(message, { duration: 3000 })
      setError(message)
      return null
    } finally {
      setLoading(false)
      requestInProgress.current = false
    }
  }, [])

  const deleteUserAccount = useCallback(async (password) => {
    if (requestInProgress.current) {
      return null
    }

    setLoading(true)
    setError(null)
    requestInProgress.current = true

    try {
      const loadingToast = toast.loading("Deleting account...", { duration: 3000 })
      const response = await deleteAccount(password)
      toast.dismiss(loadingToast)

      if (response.success) {
        toast.success(response.message || "Account deleted successfully", { duration: 3000 })
        return response
      } else {
        toast.error(response.message || "Failed to delete account")
        setError("Failed to delete account")
        return null
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || "An error occurred while deleting account";
      toast.error(message, { duration: 3000 })
      setError(message)
      return null
    } finally {
      setLoading(false)
      requestInProgress.current = false
    }
  }, [])

  // Reset the fetched state when needed
  const resetProfileState = useCallback(() => {
    profileFetched.current = false
  }, [])

  return {
    loading,
    error,
    profileData,
    fetchProfile,
    updateUserProfile,
    changeUserPassword,
    deleteUserAccount,
    resetProfileState,
  }
}
