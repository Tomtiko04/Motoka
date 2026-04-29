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
  ArrowRightOnRectangleIcon,
  UsersIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { name: 'Dashboard',       href: '/admin/dashboard',                    icon: HomeIcon,                  exact: true },
  { name: 'Orders',          href: '/admin/orders',                       icon: ClipboardDocumentListIcon, exact: false },
  { name: 'Payments',        href: '/admin/payments',                     icon: CreditCardIcon,            exact: false },
  { name: 'Agents',          href: '/admin/agents',                       icon: UserGroupIcon,             exact: false },
  { name: 'Cars',            href: '/admin/cars',                         icon: TruckIcon,                 exact: false },
  { name: 'Users',           href: '/admin/users',                        icon: UsersIcon,                 exact: false },
  { name: 'Documents',       href: '/admin/documents',                    icon: DocumentTextIcon,          exact: false },
  { name: 'Driver Licences', href: '/admin/driver-license-applications',  icon: IdentificationIcon,        exact: false },
  { name: 'Ladipo',          href: '/admin/ladipo',                       icon: ShoppingBagIcon,           exact: false },
];

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
        active
          ? 'bg-[#EBB950]/15 text-[#EBB950]'
          : 'text-white/55 hover:text-white hover:bg-white/6'
      }`}
    >
      <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-[#EBB950]' : 'text-white/40 group-hover:text-white/70'}`} style={{ width: 18, height: 18 }} />
      <span className="flex-1 truncate">{item.name}</span>
      {active && <ChevronRightIcon style={{ width: 12, height: 12 }} className="text-[#EBB950]/60 shrink-0" />}
    </button>
  );
}

const AdminLayout = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      window.dispatchEvent(new CustomEvent('adminAuthChange', { detail: { isAuthenticated: false } }));
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.href
      : location.pathname.startsWith(item.href);

  const handleNav = (href) => {
    navigate(href);
    setSidebarOpen(false);
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#05243F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src={Logo} alt="Motoka" className="h-8 w-auto opacity-80" />
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-[#EBB950]" />
        </div>
      </div>
    );
  }

  const initials = adminUser.name
    ? adminUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'A';

  const Sidebar = () => (
    <aside className="flex h-full w-64 flex-col bg-[#05243F]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/8">
        <img src={Logo} alt="Motoka" className="h-7 w-auto" />
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Motoka</p>
          <span className="inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide bg-[#EBB950]/15 text-[#EBB950] leading-none">
            ADMIN
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            active={isActive(item)}
            onClick={() => handleNav(item.href)}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-white/8 px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EBB950]/20 text-[#EBB950] text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{adminUser.name || 'Admin'}</p>
            <p className="text-[11px] text-white/40 truncate">{adminUser.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <ArrowRightOnRectangleIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar — slides in */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex md:hidden">
            <Sidebar />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-[-40px] flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <XMarkIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </>
      )}

      {/* Content area */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon style={{ width: 20, height: 20 }} />
          </button>
          <img src={Logo} alt="Motoka" className="h-6 w-auto" />
          <span className="text-sm font-semibold text-gray-800">Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
