"use client"

import { useState } from "react";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react"
import { logout } from "../../../services/apiAuth";
import { toast } from "react-hot-toast";

export default function SettingsSidebar({ activePage, expandedSection, onNavigate, onSectionToggle }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (page) => activePage === page

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await logout();
      
      onNavigate("login");
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

  return (
    <div className="pb-4">
      <div className="space-y-1">
        {/* Account Settings */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "account" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("account")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Account Settings</span>
          {expandedSection === "account" ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>

        {expandedSection === "account" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("profile") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("profile")}
            >
              <span className={`text-sm font-semibold ${isActive("profile") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Profile Information</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("password") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("password")}
            >
              <span className={`text-sm font-semibold ${isActive("password") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Change Password</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("2fa") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("2fa")}
            >
              <span className={`text-sm font-semibold ${isActive("2fa") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>2FA</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Payment & Billing */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "payment" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("payment")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Payment & Billing</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "payment" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("payment") || isActive("payment-with-cards")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("payment")}
            >
              <span className={`text-sm font-semibold ${isActive("payment") || isActive("payment-with-cards") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Saved Payment Method</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("transaction") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("transaction")}
            >
              <span className={`text-sm font-semibold ${isActive("transaction") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Transaction History</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("auto-renewal") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("auto-renewal")}
            >
              <span className={`text-sm font-semibold ${isActive("auto-renewal") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Auto Renewal Settings</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("billing") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("billing")}
            >
              <span className={`text-sm font-semibold ${isActive("billing") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Billing Address</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Notifications & Alerts */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "notifications" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("notifications")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Notifications & Alerts</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "notifications" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("push-notification") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("push-notification")}
            >
              <span className={`text-sm font-semibold ${isActive("push-notification") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Push Notification</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("custom-notification") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("custom-notification")}
            >
              <span className={`text-sm font-semibold ${isActive("custom-notification") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Customized Notification</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* App Preference */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "preference" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("preference")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">App Preference</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "preference" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("language-region") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("language-region")}
            >
              <span className={`text-sm font-semibold ${isActive("language-region") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Language & Region</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("dark-mode") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("dark-mode")}
            >
              <span className={`text-sm font-semibold ${isActive("dark-mode") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Dark Mode/ Light Mode</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("location-service") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("location-service")}
            >
              <span className={`text-sm font-semibold ${isActive("location-service") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Location Services</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Support & Help */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "support" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("support")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Support & Help</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "support" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("contact-support") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("contact-support")}
            >
              <span className={`text-sm font-semibold ${isActive("contact-support") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Contact Support</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("report-issue") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("report-issue")}
            >
              <span className={`text-sm font-semibold ${isActive("report-issue") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Report an Issue</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("live-chat") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("live-chat")}
            >
              <span className={`text-sm font-semibold ${isActive("live-chat") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Live Chat / Help Desk</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Legal */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "legal" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("legal")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Legal</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "legal" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("terms-condition") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("terms-condition")}
            >
              <span className={`text-sm font-semibold ${isActive("terms-condition") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Terms & Condition</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("data-permission") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("data-permission")}
            >
              <span className={`text-sm font-semibold ${isActive("data-permission") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Data & Permission</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("delete-account") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("delete-account")}
            >
              <span className={`text-sm font-semibold ${isActive("delete-account") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Delete Account</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "privacy" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("privacy")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">Privacy Policy</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "privacy" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("info-collect") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("info-collect", "collect")}
            >
              <span className={`text-sm font-semibold ${isActive("info-collect") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Information We Collect</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("info-sharing") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("info-sharing", "sharing")}
            >
              <span className={`text-sm font-semibold ${isActive("info-sharing") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Information Sharing</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("data-security") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("data-security", "security")}
            >
              <span className={`text-sm font-semibold ${isActive("data-security") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Data Security</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* FAQs */}
        <div
          className={`flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2 ${
            expandedSection === "faqs" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("faqs")}
        >
          <span className="text-sm font-semibold text-[#05243F]/95">FAQs</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "faqs" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("account-app-usage") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("account-app-usage")}
            >
              <span className={`text-sm font-semibold ${isActive("account-app-usage") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Account & App Usage</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("licensing-registration") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("licensing-registration")}
            >
              <span className={`text-sm font-semibold ${isActive("licensing-registration") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Licensing & Registration</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("autocare-maintenance") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("autocare-maintenance")}
            >
              <span className={`text-sm font-semibold ${isActive("autocare-maintenance") ? "text-blue-600" : "text-gray-600 hover:text-sky-600"}`}>Auto Care & Maintenance</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div
          className="flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer hover:bg-red-50 transition-colors duration-200"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center space-x-2">
            <LogOut className="h-5 w-5 text-red-500" />
            <span className="text-sm font-semibold text-red-500">
              {isLoggingOut ? "Logging out..." : "Log out"}
            </span>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75 bg-opacity-50 z-50">
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
                    <span role="button" className="text-sm font-semibold">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    <span role="button" className="text-sm font-semibold">Yes, Logout</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isLoggingOut}
                className="text-sm w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
