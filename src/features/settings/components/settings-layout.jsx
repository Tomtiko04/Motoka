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

  const getTitleParts = () => {
    switch (activePage) {
      case "main":
        return { section: "Settings", page: "" };
      case "profile":
        return { section: "Settings", page: "Profile Information" };
      case "password":
        return { section: "Settings", page: "Change Password" };
      case "2fa":
        return { section: "Settings", page: "2FA" };
      case "payment":
      case "payment-with-cards":
        return { section: "Settings", page: "Saved Payment Method" };
      case "add-card":
        return { section: "Settings", page: "Add a Bank Card/Account" };
      case "transaction":
        return { section: "Settings", page: "Transaction History" };
      case "auto-renewal":
        return { section: "Settings", page: "Auto Renewal" };
      case "billing":
        return { section: "Settings", page: "Billing Address" };
      case "push-notification":
        return { section: "Settings", page: "Push Notification" };
      case "custom-notification":
        return { section: "Settings", page: "Customized Notification" };
      default:
        return { section: "Settings", page: "" };
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <>
      <div className="container mx-auto px-4 py-5 md:py-8  h-full flex-1 flex flex-col">
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
            <h1 className="text-center text-xl font-medium md:text-2xl">
              {(() => {
                const { section, page } = getTitleParts();
                if (!page) {
                
                  return (
                    <span className="text-[#05243F]">{section}</span>
                  );
                }
                
                return (
                  <>
                    <span className="text-[#697B8C4A] ">{section}/</span>
                    <span className="text-[#05243F] ">{page}</span>
                  </>
                );
              })()}
            </h1>
          </div>
        </header>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm flex-1 flex flex-col min-h-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 flex-1">
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
                  <div className="border-b p-3">
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
            <div className="hidden border-r border-gray-100 md:flex lg:col-span-2 flex-1 md:flex-col min-h-0">
              <div className="p-4">
                <SearchBar />
              </div>
              <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#EAB750] hover:scrollbar-thumb-[#EAB750]  overflow-y-auto px-6 sm:px-4 h-full">{/* max-h-[calc(100vh-380px)] removed this and added flex-1 */}
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

