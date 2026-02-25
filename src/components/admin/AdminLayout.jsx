import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import Logo from "../../assets/images/motoka logo.svg";
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
    const applySession = async (session) => {
      if (!session) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.dispatchEvent(new CustomEvent('adminAuthChange', { detail: { isAuthenticated: false } }));
        navigate('/admin/login');
        return;
      }

      // Always keep adminToken in sync with the current (possibly refreshed) session token
      localStorage.setItem('adminToken', session.access_token);

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin, is_suspended, first_name, last_name, user_id')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || !profile.is_admin || profile.is_suspended) {
        toast.error('Access denied: Admin privileges required');
        await supabase.auth.signOut();
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.dispatchEvent(new CustomEvent('adminAuthChange', { detail: { isAuthenticated: false } }));
        navigate('/admin/login');
        return;
      }

      const user = {
        id: session.user.id,
        email: session.user.email,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        user_id: profile.user_id,
      };

      setAdminUser(user);
      localStorage.setItem('adminUser', JSON.stringify(user));
    };

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await applySession(session);
      } catch (err) {
        console.error('Admin auth check failed:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
      }
    };

    checkAuth();

    // Keep adminToken updated whenever Supabase silently refreshes the token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        localStorage.setItem('adminToken', session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminToken');
      
      // Dispatch event to notify AdminRoutes
      window.dispatchEvent(new CustomEvent('adminAuthChange', { 
        detail: { isAuthenticated: false } 
      }));
      
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', current: location.pathname === '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders', current: location.pathname.startsWith('/admin/orders') },
    { name: 'Payment', href: '/admin/payments', current: location.pathname.startsWith('/admin/payments') },
    { name: 'Agent', href: '/admin/agents', current: location.pathname.startsWith('/admin/agents') },
    { name: 'Cars', href: '/admin/cars', current: location.pathname.startsWith('/admin/cars') },
    { name: "Users", href: "/admin/users", current: location.pathname.startsWith('/admin/users') },
  ];

  if (!adminUser) {
    // Loading state - show spinner instead of blank page
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8  rounded-lg flex items-center justify-center mr-3">
                  <img src={Logo} alt="Motoka" className="h-8 w-auto" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Motoka</span>
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
        <button className="bg-yellow-400 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-lg shadow-lg flex items-center space-x-2 text-sm font-medium transition-colors duration-200">
          <span>Ask Mo</span>
          <span>+</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLayout;
