import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { Cookie } from "lucide-react";
import { Icon } from "@iconify/react";

import { authStorage } from "../utils/authStorage";

import Avarta from "../assets/images/avarta.png";
import Logo from "../assets/images/Logo.png";

export default function AppLayout() {
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
    if (!authStorage.isAuthenticated()) {
      navigate("/auth/login", { state: { from: location }, replace: true });
    }
  }, [navigate, location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "";
  };

  const handleLogout = () => {
    Cookie.remove("authToken");
    localStorage.removeItem("userInfo");

    toast.success("Logged out successfully");

    setIsMenuOpen(false);

    navigate("/auth/login");
  };

  function handleHome() {
    navigate("/");
  }

  return (
    <div className="flex items-center justify-center bg-[#F4F5FC]">
      <div className="mt-4 w-full max-w-4xl">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 rounded-full bg-white shadow-sm">
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
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-[#A73957] hover:bg-[#F4F5FC]"
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
