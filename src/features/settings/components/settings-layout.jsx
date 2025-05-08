"use client"

import React from "react";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Cog, Sparkles, Menu } from "lucide-react"
import SearchBar from "./search-bar"
import SettingsSidebar from "./settings-sidebar"

export default function SettingsLayout({ children, activePage, expandedSection, onNavigate, onSectionToggle }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate();

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const getTitle = () => {
    switch (activePage) {
      case "main":
        return "Settings"
      case "profile":
        return "Settings/Profile Information"
      case "password":
        return "Settings/Change Password"
      case "2fa":
        return "Settings/2FA"
      case "payment":
      case "payment-with-cards":
        return "Settings/Saved Payment Method"
      case "add-card":
        return "Settings/Add a Bank Card/Account"
      case "transaction":
        return "Settings/Transaction History"
      case "auto-renewal":
        return "Settings/Auto Renewal"
      case "billing":
        return "Settings/Billing Address"
      case "push-notification":
        return "Settings/Push Notification"
      case "custom-notification":
        return "Settings/Customized Notification"
      default:
        return "Settings"
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <div className="container mx-auto px-4 py-5 md:py-8">
        <header className="relative mb-6 flex items-center justify-center">
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="absolute left-0 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 md:hidden"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
          )}
          {!isMobile && (
            <button
              onClick={() => onNavigate("main")}
              className="absolute left-0 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <div className="flex items-center text-xl font-medium">
            <Cog className="mr-2 h-5 w-5 text-sky-500" />
            <h1 className="text-center text-xl font-medium text-[#05243F] md:text-2xl">
              {getTitle()}
            </h1>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-5">
            {/* Mobile sidebar overlay */}
            {isMobile && isMobileMenuOpen && (
              <div
                className="bg-opacity-50 fixed inset-0 z-40 bg-black"
                onClick={toggleMobileMenu}
              >
                <div
                  className="absolute top-0 left-0 z-50 h-full w-3/4 overflow-y-auto bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="border-b p-4">
                    <SearchBar />
                  </div>
                  <SettingsSidebar
                    activePage={activePage}
                    expandedSection={expandedSection}
                    onNavigate={(page) => {
                      onNavigate(page);
                      setIsMobileMenuOpen(false);
                    }}
                    onSectionToggle={onSectionToggle}
                  />
                </div>
              </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden border-r border-gray-100 md:block lg:col-span-2">
              <div className="p-4">
                <SearchBar />
              </div>
              <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#EAB750] hover:scrollbar-thumb-[#EAB750] max-h-[calc(100vh-380px)] overflow-y-auto px-6 sm:px-4">
                <SettingsSidebar
                  activePage={activePage}
                  expandedSection={expandedSection}
                  onNavigate={onNavigate}
                  onSectionToggle={onSectionToggle}
                />
              </div>
            </div>

            {/* Main content */}
            <div className="bg-[#F8F8FA] p-4 md:p-6 lg:col-span-3">
              {children}
            </div>
          </div>
        </div>

        {/* <div className="fixed bottom-6 right-6">
            <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors">
              <span>Ask Mo</span>
              <Sparkles className="h-5 w-5" />
            </button>
          </div> */}
      </div>
    </>
  );
}

