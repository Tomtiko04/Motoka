"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Cog } from "lucide-react";
import SearchBar from "./search-bar";
import SettingsSidebar from "./settings-sidebar";

export default function SettingsLayout({
  children,
  activePage,
  expandedSection,
  onNavigate,
  onSectionToggle,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const getTitleParts = () => {
    switch (activePage) {
      case "main":
        return { section: "Settings", page: "" };
      case "profile":
        return { section: "Settings", page: "Profile Information" };
      case "edit-profile":
        return { section: "Settings", page: "Edit Profile" };
      case "password":
        return { section: "Settings", page: "Change Password" };
      case "2fa":
        return { section: "Settings", page: "2FA Authenticator" };
      case "payment":
      case "payment-with-cards":
        return { section: "Settings", page: "Saved Payment Method" };
      case "add-card":
        return { section: "Settings", page: "Add Bank Card / Account" };
      case "transaction":
        return { section: "Settings", page: "Transaction History" };
      case "auto-renewal":
        return { section: "Settings", page: "Auto Renewal Settings" };
      case "billing":
        return { section: "Settings", page: "Billing Address" };
      case "ladipo-orders":
        return { section: "Settings", page: "My Orders" };
      case "push-notification":
        return { section: "Settings", page: "Push Notification" };
      case "custom-notification":
        return { section: "Settings", page: "Customized Notification" };
      case "language-region":
        return { section: "Settings", page: "Language & Region" };
      case "dark-mode":
        return { section: "Settings", page: "Dark Mode / Light Mode" };
      case "location-service":
        return { section: "Settings", page: "Location Services" };
      case "contact-support":
        return { section: "Settings", page: "Contact Support" };
      case "report-issue":
        return { section: "Settings", page: "Report an Issue" };
      case "live-chat":
        return { section: "Settings", page: "Live Chat / Help Desk" };
      case "terms-condition":
        return { section: "Settings", page: "Terms & Conditions" };
      case "data-permission":
        return { section: "Settings", page: "Data & Permissions" };
      case "delete-account":
        return { section: "Settings", page: "Delete Account" };
      case "info-collect":
      case "info-sharing":
      case "data-security":
        return { section: "Settings", page: "Privacy Policy" };
      case "account-app-usage":
        return { section: "Settings", page: "Account & App Usage" };
      case "licensing-registration":
        return { section: "Settings", page: "Licensing & Registration" };
      case "autocare-maintenance":
        return { section: "Settings", page: "Auto Care & Maintenance" };
      default:
        return { section: "Settings", page: "" };
    }
  };

  const handleBack = () => {
    if (activePage === "edit-profile") {
      onNavigate("profile");
    } else if (activePage === "add-card") {
      onNavigate("payment");
    } else if (activePage !== "main") {
      onNavigate("main");
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div className="container mx-auto flex h-full flex-1 flex-col px-4 py-5 md:py-8">
        <header className="relative mb-6 flex items-center justify-center">
          <button
            onClick={handleBack}
            className="absolute left-0 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 cursor-pointer"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex items-center text-xl font-medium">
            <Cog className="mr-2 h-5 w-5 text-sky-500" />
            <h1 className="text-center text-xl font-medium md:text-2xl">
              {(() => {
                const { section, page } = getTitleParts();
                if (!page) {
                  return <span className="text-[#05243F]">{section}</span>;
                }

                return (
                  <>
                    <span className="text-[#697B8C4A] hidden sm:inline">{section}/</span>
                    <span className="text-[#05243F]">{page}</span>
                  </>
                );
              })()}
            </h1>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="grid h-full md:grid-cols-2 lg:grid-cols-5 flex-1">
            {/* Sidebar column (Primary navigation on mobile when activePage === "main", fixed sidebar on desktop) */}
            <div
              className={`${
                activePage === "main" ? "flex flex-col w-full" : "hidden md:flex md:flex-col"
              } border-r border-gray-100 lg:col-span-2 min-h-0`}
            >
              <div className="p-4">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-330px)] overflow-y-auto customscroll px-4 sm:px-6">
                <SettingsSidebar
                  activePage={activePage}
                  expandedSection={expandedSection}
                  onNavigate={onNavigate}
                  onSectionToggle={onSectionToggle}
                  searchQuery={searchQuery}
                />
              </div>
            </div>

            {/* Main content column (Active sub-page on mobile when activePage !== "main", right panel on desktop) */}
            <div
              className={`${
                activePage !== "main" ? "block w-full" : "hidden md:block"
              } bg-[#F8F8FA] p-4 md:p-6 lg:col-span-3`}
            >
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
