import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminOrderDetails from '../pages/admin/AdminOrderDetails';
import AdminAgents from '../pages/admin/AdminAgents';
import CreateAgent from '../pages/admin/CreateAgent';
import AgentView from '../pages/admin/AgentView';
import AdminCars from '../pages/admin/AdminCars';
import AdminCarDetails from '../pages/admin/AdminCarDetails';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminUsers from '../pages/admin/AdminUsers.jsx';
import AdminUserDetails from '../pages/admin/AdminUserDetails.jsx';
import AdminDocuments from '../pages/admin/AdminDocuments.jsx';

const AdminRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for admin token or adminUser (Supabase flow)
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    setIsAuthenticated(!!token || !!adminUser);
    setIsLoading(false);
  }, []);

  // Listen for storage changes and custom auth events
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('adminToken');
      const adminUser = localStorage.getItem('adminUser');
      setIsAuthenticated(!!token || !!adminUser);
    };

    const handleAuthChange = (event) => {
      setIsAuthenticated(event.detail.isAuthenticated);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminAuthChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminAuthChange', handleAuthChange);
    };
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
            <svg className="w-7 h-7 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="login" 
        element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} 
      />
      <Route 
        path="/*" 
        element={isAuthenticated ? <AdminLayout /> : <Navigate to="/admin/login" replace />}
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:slug" element={<AdminOrderDetails />} />
                <Route path="agents" element={<AdminAgents />} />
                <Route path="agents/create" element={<CreateAgent />} />
                <Route path="agents/:uuid" element={<AgentView />} />
                <Route path="cars" element={<AdminCars />} />
                <Route path="cars/:slug" element={<AdminCarDetails />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:userId" element={<AdminUserDetails />} />
                <Route path="documents" element={<AdminDocuments />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
