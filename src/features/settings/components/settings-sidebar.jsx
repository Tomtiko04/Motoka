"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { logout } from "../../../services/apiAuth";
import { toast } from "react-hot-toast";

const SETTINGS_SECTIONS = [
  {
    id: "account",
    label: "Account Settings",
    items: [
      { page: "profile", label: "Profile Information" },
      { page: "password", label: "Change Password" },
      { page: "2fa", label: "2FA" },
    ],
  },
  {
    id: "payment",
    label: "Payment & Billing",
    items: [
      { page: "payment", label: "Saved Payment Method" },
      { page: "ladipo-orders", label: "My Orders" },
      { page: "transaction", label: "Transaction History" },
      { page: "auto-renewal", label: "Auto Renewal Settings" },
      { page: "billing", label: "Billing Address" },
    ],
  },
  {
    id: "notifications",
    label: "Notifications & Alerts",
    items: [
      { page: "push-notification", label: "Push Notification" },
      { page: "custom-notification", label: "Customized Notification" },
    ],
  },
  {
    id: "support",
    label: "Support & Help",
    items: [
      { page: "contact-support", label: "Contact Support" },
      { page: "report-issue", label: "Report an Issue" },
      { page: "live-chat", label: "Live Chat / Help Desk" },
    ],
  },
  {
    id: "legal-privacy",
    label: "Legal & Privacy",
    items: [
      { page: "terms-condition", label: "Terms & Condition" },
      { page: "data-permission", label: "Data & Permission" },
      { page: "delete-account", label: "Delete Account" },
      { page: "info-collect", label: "Information We Collect", tab: "collect" },
      { page: "info-sharing", label: "Information Sharing", tab: "sharing" },
      { page: "data-security", label: "Data Security", tab: "security" },
    ],
  },
  {
    id: "faqs",
    label: "FAQs",
    items: [
      { page: "account-app-usage", label: "Account & App Usage" },
      { page: "licensing-registration", label: "Licensing & Registration" },
      { page: "autocare-maintenance", label: "Auto Care & Maintenance" },
    ],
  },
];

export default function SettingsSidebar({
  activePage,
  expandedSection,
  onNavigate,
  onSectionToggle,
  searchQuery = "",
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  const filteredSections = useMemo(() => {
    if (!isSearching) return SETTINGS_SECTIONS;

    return SETTINGS_SECTIONS.map((section) => {
      const sectionMatches = section.label.toLowerCase().includes(query);
      const matchedItems = section.items.filter((item) =>
        item.label.toLowerCase().includes(query),
      );

      if (sectionMatches) {
        return { ...section, items: section.items };
      }
      if (matchedItems.length > 0) {
        return { ...section, items: matchedItems };
      }
      return null;
    }).filter(Boolean);
  }, [isSearching, query]);

  const isActive = (page) => {
    if (page === "payment") {
      return activePage === "payment" || activePage === "payment-with-cards";
    }
    return activePage === page;
  };

  const isSectionOpen = (sectionId) =>
    isSearching || expandedSection === sectionId;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      onNavigate("login");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message, {
        duration: 5000,
        id: "logout-error",
      });
    } finally {
      setIsLoggingOut(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="pb-4">
      <div className="space-y-1">
        {filteredSections.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-[#697C8C]">
            No settings match “{searchQuery.trim()}”
          </p>
        )}

        {filteredSections.map((section) => (
          <div key={section.id}>
            <div
              className={`my-2 flex cursor-pointer items-center justify-between rounded-[12px] bg-[#F4F5FC] px-4 py-3 shadow-xs ${
                isSectionOpen(section.id) ? "bg-amber-50" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                if (!isSearching) onSectionToggle(section.id);
              }}
            >
              <span className="text-sm font-semibold text-[#05243F]/95">
                {section.label}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  isSectionOpen(section.id) ? "rotate-180" : ""
                }`}
              />
            </div>

            {isSectionOpen(section.id) && (
              <div className="bg-amber-50 pl-4">
                {section.items.map((item) => (
                  <div
                    key={item.page}
                    className={`flex cursor-pointer items-center justify-between px-4 py-2 ${
                      isActive(item.page)
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-sky-600"
                    }`}
                    onClick={() =>
                      item.tab
                        ? onNavigate(item.page, item.tab)
                        : onNavigate(item.page)
                    }
                  >
                    <span
                      className={`text-sm font-semibold ${
                        isActive(item.page)
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-sky-600"
                      }`}
                    >
                      {item.label}
                    </span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {!isSearching && (
          <div
            className="flex cursor-pointer items-center justify-between rounded-[12px] bg-[#F4F5FC] px-4 py-3 shadow-xs transition-colors duration-200 hover:bg-red-50"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="flex items-center space-x-2">
              <LogOut className="h-5 w-5 text-red-500" />
              <span className="text-sm font-semibold text-red-500">
                {isLoggingOut ? "Logging out..." : "Log out"}
              </span>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-md transform rounded-xl bg-white p-6 shadow-lg transition-all">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <LogOut className="h-6 w-6 text-red-500" />
              </div>
            </div>

            <h2 className="mb-2 text-center text-xl font-semibold text-gray-800">
              Confirm Logout
            </h2>

            <p className="mb-6 text-center text-sm text-gray-600">
              Are you sure you want to log out? You will need to log in again to
              access your account.
            </p>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-red-500 px-4 py-2.5 text-white transition-colors duration-200 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="text-sm font-semibold">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm font-semibold">Yes, Logout</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoggingOut}
                className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
