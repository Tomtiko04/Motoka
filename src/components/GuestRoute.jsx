import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

export default function GuestRoute({ children }) {
  const token = Cookies.get('authToken');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
} 