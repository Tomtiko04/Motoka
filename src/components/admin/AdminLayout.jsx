import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  TruckIcon,
  CreditCardIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }
    
    setAdminUser(JSON.parse(user));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Call backend logout API to revoke the token
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      navigate('/admin/login');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', current: location.pathname === '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders', current: location.pathname.startsWith('/admin/orders') },
    { name: 'Payment', href: '/admin/payments', current: location.pathname.startsWith('/admin/payments') },
    { name: 'Agent', href: '/admin/agents', current: location.pathname.startsWith('/admin/agents') },
    { name: 'Cars', href: '/admin/cars', current: location.pathname.startsWith('/admin/cars') },
  ];

  if (!adminUser) {
    return null; // Loading state
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Motoka</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`${
                    item.current
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-4'
                      : 'text-gray-600 hover:text-gray-900 pb-4'
                  } text-sm font-medium transition-colors duration-200`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 relative"
              >
                <BellIcon className="h-6 w-6" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </button>

              {/* Profile */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {adminUser.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-colors duration-200">
          <span className="text-lg">Ask Mo</span>
          <span className="text-lg">+</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
