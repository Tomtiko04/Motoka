"use client"

import React from "react";
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Cog, Sparkles, Menu } from "lucide-react"
import SearchBar from "./search-bar"
import SettingsSidebar from "./settings-sidebar"
import { IoIosArrowBack } from "react-icons/io";
import AppLayout from "../../../components/AppLayout";

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
      <AppLayout>
        <div className=" px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-center mb-6 mt-3 relative">
            {isMobile && (
              <button
                onClick={toggleMobileMenu}
                className="absolute left-0 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors md:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            )}
            {!isMobile && (
             <button
                onClick={() => onNavigate("main")}
                className="absolute top-1/4 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
              >
                <IoIosArrowBack className="h-5 w-5 text-gray-600" />
              </button>
            )}

              
              <div>

                <h1 className="text-center flex items-center justify-center text-xl md:text-2xl font-medium text-[#05243F]">
                  <Cog className="h-5 w-5 text-sky-500 mr-2" />{getTitle()}
                  
                </h1>
                <p className="mt-2 text-center text-sm font-normal text-[#05243F]/40">
                  This is Sub Title
                </p>
              </div>
            
          </header>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 lg:grid-cols-5">
              {/* Mobile sidebar overlay */}
              {isMobile && isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleMobileMenu}>
                  <div
                    className="absolute top-0 left-0 w-3/4 h-full bg-white z-50 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b">
                      <SearchBar />
                    </div>
                    <SettingsSidebar
                      activePage={activePage}
                      expandedSection={expandedSection}
                      onNavigate={(page) => {
                        onNavigate(page)
                        setIsMobileMenuOpen(false)
                      }}
                      onSectionToggle={onSectionToggle}
                    />
                  </div>
                </div>
              )}

              {/* Desktop sidebar */}
              <div className="hidden md:block lg:col-span-2 border-r border-gray-100  ">
                <div className="p-4">
                  <SearchBar />
                </div>
                <div className=" scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#EAB750] hover:scrollbar-thumb-[#EAB750] max-h-[calc(100vh-380px)] overflow-y-auto px-6 sm:px-4">
                  <SettingsSidebar
                    activePage={activePage}
                    expandedSection={expandedSection}
                    onNavigate={onNavigate}
                    onSectionToggle={onSectionToggle}
                  />
                </div>
              </div>

              {/* Main content */}
              <div className="lg:col-span-3 p-4 md:p-6 bg-[#F8F8FA]">{children}</div>
            </div>
          </div>

          {/* <div className="fixed bottom-6 right-6">
            <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors">
              <span>Ask Mo</span>
              <Sparkles className="h-5 w-5" />
            </button>
          </div> */}
        </div>
      </AppLayout>
    </>
  )
}

