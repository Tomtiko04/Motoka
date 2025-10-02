import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = authStorage.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
} 