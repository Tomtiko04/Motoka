import React from "react";
import Header from "./Header";
import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { logout } from "../services/apiAuth";

import Logo2 from "../assets/images/Logo.svg";
import { useNotifications } from "../features/notifications/useNotification";
import RecentNotificationModal from "./RecentNotification.jsx";
import Footer from "../Landing/components/Footer.jsx";
const navLinks = [
  { name: "Landing", path: "/" },
  { name: "Blogs", path: "/blogs" },
  { name: "Login/Signup", path: "auth/login" },
];



export default function BlogLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();



  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? "hidden" : "";
  };


  function handleHome() {
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="fixed w-full top-0 z-10 h-16 bg-white shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center px-4 py-0 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-between">

            <div
              onClick={handleHome}
              className="flex cursor-pointer items-center"
            >
              <img
                src={Logo2}
                alt="Motoka"
                className="h-8 w-8 object-contain block"
              />
            </div>

            {/* Mobile menu button and notifications */}
            <div className="flex items-center gap-4 md:hidden">
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
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="hidden items-center gap-4 md:flex">
              <Link>
                <button className="bg-[#2287E0] rounded-full px-6 py-3 text-white font-medium text-sm">Get Started</button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <div
        className={`bg-opacity-50 fixed inset-0 z-[60] bg-black transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={toggleMenu}
      />
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-full max-w-sm transform bg-white transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#F4F5FC] p-4">
            <div>
              <img
                src={Logo2}
                alt="Motoka"
                className="block h-8 w-8 object-contain "
              />
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
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              {/* Logout Button */}
              <button
                className="mt-2 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-[#A73957] hover:bg-[#F4F5FC]"
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMenuOpen(false);
                  document.body.style.overflow = "";
                }}
              >
                <div className=" items-center gap-4 w-full">
              <Link>
                <button className="bg-[#2287E0] rounded-full px-6 py-2 text-white font-medium text-sm w-full">Get Started</button>
              </Link>
            </div>
              </button>
            </nav>
          </div>

          {/* Mobile User Actions */}

        </div>
      </div>
      <div className="flex flex-grow flex-col w-full px-0 mt-6 sm:mt-16 sm:items-center sm:justify-center sm:px-6">
        <Outlet />
      </div>
      <Footer/>
    </div>
  );
}
