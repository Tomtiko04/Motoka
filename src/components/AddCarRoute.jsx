import React from 'react';
import { Navigate, useLocation } from "react-router-dom"
import { authStorage } from "../utils/authStorage"

export default function AddCarRoute({ children }) {
  const location = useLocation()
  const isAuthenticated = authStorage.isAuthenticated()
  const hasRegistrationToken = !!authStorage.getRegistrationToken()

  console.log("AddCarRoute check:", {
    isAuthenticated,
    hasRegistrationToken,
    canAddCar: authStorage.canAddCar(),
  })

  // Allow access if user has either an auth token OR a registration token
  if (!isAuthenticated && !hasRegistrationToken) {
    console.log("No valid tokens found, redirecting to login")
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return children
}
