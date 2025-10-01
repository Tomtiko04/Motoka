"use client"

import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { Icon } from "@iconify/react";
import { logout } from "../services/apiAuth";

import { authStorage } from "../utils/authStorage";

import Avarta from "../assets/images/avarta.png";
import Logo from "../assets/images/Logo.png";

export default function AppLayout({ onNavigate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Licenses", path: "/licenses" },
    { name: "Garage", path: "/garage" },
    { name: "Ladipo", path: "/ladipo" },
    { name: "Traffic Rules", path: "/traffic-rules" },
    { name: "Settings", path: "/settings" },
  ];

  useEffect(() => {
    // Add a small delay to ensure token storage is complete
    const checkAuth = () => {
      if (!authStorage.isAuthenticated()) {
        toast.error("Please log in to access this page");
        navigate("/auth/login", { state: { from: location }, replace: true });
      }
    };
    
    // Check immediately and also after a short delay
    checkAuth();
    const timeoutId = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate, location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "";
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logout();
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message, {
        duration: 5000,
        id: 'logout-error'
      });
    } finally {
      setIsLoggingOut(false);
      setIsModalOpen(false);
    }
  };

  function handleHome() {
    navigate("/");
  }

  return (
    <div className="flex items-center justify-center bg-[#F4F5FC]">
      <div className="mt-4 w-full max-w-4xl">
        {/* Header Navigation */}
        <header className="sticky top-0 z-10 rounded-full bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div
                onClick={handleHome}
                className="flex cursor-pointer items-center gap-2"
              >
                <img src={Logo} alt="Motoka" className="h-8 w-8" />
                <span className="text-lg font-semibold text-[#05243F]">
                  Motoka
                </span>
              </div>

              {/* Mobile menu button and notifications */}
              <div className="flex items-center gap-4 md:hidden">
                <div className="relative">
                  <Icon
                    icon="ri:notification-4-fill"
                    fontSize={20}
                    className="cursor-pointer text-[#05243F]/60 hover:text-[#05243F]"
                  />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDB022] text-[10px] font-medium text-white">
                    3
                  </span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="z-50 rounded-lg p-2 text-[#05243F] hover:bg-[#F4F5FC]"
                >
                  {isMenuOpen ? (
                    <FaTimes className="h-6 w-6" />
                  ) : (
                    <FaBars className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden space-x-6 md:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "text-[#2389E3] after:absolute after:bottom-[-27px] after:left-0 after:h-1 after:w-full after:rounded-t-md after:bg-[#2389E3]"
                        : "text-[#05243F]/60 hover:text-[#05243F]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* User Actions */}
              <div className="hidden items-center gap-4 md:flex">
                <div className="relative">
                  <Icon
                    icon="ri:notification-4-fill"
                    fontSize={20}
                    className="cursor-pointer text-[#05243F]/60 hover:text-[#05243F]"
                  />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDB022] text-[10px] font-medium text-white">
                    3
                  </span>
                </div>
                {/* When you click it will show a drop down */}
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                  <img
                    src={Avarta}
                    alt="User"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Overlay */}
        <div
          className={`bg-opacity-50 fixed inset-0 z-[60] bg-black transition-opacity duration-300 md:hidden ${
            isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={toggleMenu}
        />
        <div
          className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm transform bg-white transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#F4F5FC] p-4">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Motoka" className="h-8 w-8" />
                <span className="text-lg font-semibold text-[#05243F]">
                  Motoka
                </span>
              </div>
              <button
                onClick={toggleMenu}
                className="rounded-lg p-2 text-[#05243F] hover:bg-[#F4F5FC]"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-[#F4F5FC] font-semibold text-[#2389E3]"
                        : "text-[#05243F]/60 hover:bg-[#F4F5FC] hover:text-[#05243F]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {/* Logout Button */}
                <button
                  className="mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-[#A73957] hover:bg-[#F4F5FC]"
                  onClick={() => {
                    setIsModalOpen(true);
                    setIsMenuOpen(false);
                    document.body.style.overflow = "";
                  }}
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>

           
            {/* Mobile User Actions */}
            <div className="border-t border-[#F4F5FC] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                    <img
                      src={Avarta}
                      lazyloading="lazy"
                      alt="User"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#05243F]">
                    Anjola
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

         {/* Logout Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg transform transition-all">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <LogOut className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
                  Confirm Logout
                </h2>
                
                <p className="text-gray-600 text-center mb-6 text-sm">
                  Are you sure you want to log out? You will need to log in again to access your account.
                </p>

                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5" />
                        <span>Yes, Logout</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isLoggingOut}
                    className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Main Content */}
        <main className="mx-auto max-w-7xl py-6">
          <Outlet />
        </main>

        {/* Ask Mo Button */}
        {/* <div className="fixed right-8 bottom-8 z-50">
          <button className="flex items-center gap-2 rounded-full bg-[#EBB950] px-6 py-3 text-white shadow-lg transition-transform hover:scale-105">
            <span className="font-semibold">Ask Mo</span>
            <span role="img" aria-label="sparkles">✨</span>
          </button>
        </div> */}
      </div>
    </div>
  );
}
