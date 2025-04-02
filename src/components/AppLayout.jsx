import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";
import Logo from "../assets/images/Logo.png";
import Avarta from "../assets/images/avarta.png";

export default function AppLayout({ children }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Licenses", path: "/licenses" },
    { name: "Garage", path: "/garage" },
    { name: "Ladipo", path: "/ladipo" },
    { name: "Settings", path: "/settings" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  function handleHome(){
    navigate("/")
  }

  return (
    <div className="flex items-center justify-center bg-[#F4F5FC]">
      <div className="mt-4 w-full max-w-4xl">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 rounded-full bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div onClick={handleHome} className="flex items-center gap-2 cursor-pointer">
                <img src={Logo} alt="Motoka" className="h-8 w-8" />
                <span className="text-lg font-semibold text-[#05243F]">Motoka</span>
              </div>

              {/* Mobile menu button and notifications */}
              <div className="flex items-center gap-4 md:hidden">
                <div className="relative">
                  <FaBell className="h-5 w-5 text-[#05243F]/60 hover:text-[#05243F] cursor-pointer" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDB022] text-[10px] font-medium text-white">
                    3
                  </span>
                </div>
                <button
                  onClick={toggleMenu}
                  className="rounded-lg p-2 text-[#05243F] hover:bg-[#F4F5FC] z-50"
                >
                  {isMenuOpen ? (
                    <FaTimes className="h-6 w-6" />
                  ) : (
                    <FaBars className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "text-[#2389E3] after:absolute after:bottom-[-27px] after:left-0 after:h-1 after:w-full after:bg-[#2389E3] after:rounded-t-md"
                        : "text-[#05243F]/60 hover:text-[#05243F]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              {/* User Actions */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative">
                  <FaBell className="h-5 w-5 text-[#05243F]/60 hover:text-[#05243F] cursor-pointer" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FDB022] text-[10px] font-medium text-white">
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
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden z-[60] ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleMenu}
        />
        <div
          className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white transform transition-transform duration-300 ease-in-out md:hidden z-[70] ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#F4F5FC]">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="Motoka" className="h-8 w-8" />
                <span className="text-lg font-semibold text-[#05243F]">Motoka</span>
              </div>
              <button
                onClick={toggleMenu}
                className="rounded-lg p-2 text-[#05243F] hover:bg-[#F4F5FC]"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium transition-colors px-4 py-3 rounded-lg ${
                      location.pathname === link.path
                        ? "text-[#2389E3] bg-[#F4F5FC] font-semibold"
                        : "text-[#05243F]/60 hover:text-[#05243F] hover:bg-[#F4F5FC]"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Mobile User Actions */}
            <div className="border-t border-[#F4F5FC] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                    <img 
                      src={Avarta} 
                      alt="User" 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-[#05243F]">Anjola</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
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
