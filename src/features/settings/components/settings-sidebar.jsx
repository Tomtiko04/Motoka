"use client"

import { ChevronDown, ChevronRight } from "lucide-react"

export default function SettingsSidebar({ activePage, expandedSection, onNavigate, onSectionToggle }) {
  const isActive = (page) => activePage === page

  return (
    <div className="pb-4">
      <div className="space-y-1">
        {/* Account Settings */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "account" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("account")}
        >
          <span className="font-medium">Account Settings</span>
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
                isActive("profile") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("profile")}
            >
              <span>Profile Information</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("password") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("password")}
            >
              <span>Change Password</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("2fa") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("2fa")}
            >
              <span>2FA</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Payment & Billing */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "payment" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("payment")}
        >
          <span className="font-medium">Payment & Billing</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "payment" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("payment") || isActive("payment-with-cards")
                  ? "text-sky-600"
                  : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("payment")}
            >
              <span>Saved Payment Method</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("transaction") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("transaction")}
            >
              <span>Transaction History</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("auto-renewal") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("auto-renewal")}
            >
              <span>Auto Renewal Settings</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("billing") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("billing")}
            >
              <span>Billing Address</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Notifications & Alerts */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "notifications" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("notifications")}
        >
          <span className="font-medium">Notifications & Alerts</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "notifications" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("push-notification") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("push-notification")}
            >
              <span>Push Notification</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("custom-notification") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("custom-notification")}
            >
              <span>Customized Notification</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* App Preference */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "preference" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("preference")}
        >
          <span className="font-medium">App Preference</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "preference" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("language-region") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("language-region")}
            >
              <span>Language & Region</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("dark-mode") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("dark-mode")}
            >
              <span>Dark Mode/ Light Mode</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("location-service") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("location-service")}
            >
              <span>Location Services</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Support & Help */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "support" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("support")}
        >
          <span className="font-medium">Support & Help</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "support" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("contact-support") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("contact-support")}
            >
              <span>Contact Support</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("report-issue") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("report-issue")}
            >
              <span>Report an Issue</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("live-chat") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("live-chat")}
            >
              <span>Live Chat / Help Desk</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Legal */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "legal" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("legal")}
        >
          <span className="font-medium">Legal</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "legal" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("terms-condition") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("terms-condition")}
            >
              <span>Terms & Condition</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("data-permission") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("data-permission")}
            >
              <span>Data & Permission</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("delete-account") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("delete-account")}
            >
              <span>Delete Account</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Privacy Policy */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "privacy" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("privacy")}
        >
          <span className="font-medium">Privacy Policy</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "privacy" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("info-collect") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("info-collect", "collect")}
            >
              <span>Information We Collect</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("info-sharing") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("info-sharing", "sharing")}
            >
              <span>Information Sharing</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("data-security") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("data-security", "security")}
            >
              <span>Data Security</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* FAQs */}
        <div
          className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
            expandedSection === "faqs" ? "bg-amber-50" : "hover:bg-gray-50"
          }`}
          onClick={() => onSectionToggle("faqs")}
        >
          <span className="font-medium">FAQs</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>

        {expandedSection === "faqs" && (
          <div className="bg-amber-50 pl-4">
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("account-app-usage") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("account-app-usage")}
            >
              <span>Account & App Usage</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("licensing-registration") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("licensing-registration")}
            >
              <span>Licensing & Registration</span>
              <ChevronRight className="h-5 w-5" />
            </div>
            <div
              className={`flex justify-between items-center px-4 py-2 cursor-pointer ${
                isActive("autocare-maintenance") ? "text-sky-600" : "text-gray-600 hover:text-sky-600"
              }`}
              onClick={() => onNavigate("autocare-maintenance")}
            >
              <span>Auto Care & Maintenance</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="px-4 py-3 cursor-pointer hover:bg-gray-50">
          <span className="font-medium">Log out</span>
        </div>
      </div>
    </div>
  )
}
