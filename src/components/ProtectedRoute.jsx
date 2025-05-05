import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = Cookies.get('authToken');

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
} 