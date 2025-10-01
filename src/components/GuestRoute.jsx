import React from 'react';
import { Navigate } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';

export default function GuestRoute({ children }) {
  const isAuthenticated = authStorage.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
} 