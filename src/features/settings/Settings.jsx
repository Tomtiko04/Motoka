"use client"

import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import SettingsLayout from "./components/settings-layout"
import MainSettings from "./components/main-settings"
import ProfileInformation from "./components/profile-information"
import EditProfile from "./components/edit-profile"
import ChangePassword from "./components/change-password"
import TwoFactorAuth from "./components/two-factor-auth"
import SavedPaymentMethod from "./components/saved-payment-method"
import SavedPaymentMethodWithCards from "./components/saved-payment-method-with-cards"
import AddBankCard from "./components/add-bank-card"
import TransactionHistory from "./components/transaction-history"
import AutoRenewalSettings from "./components/auto-renewal-settings"
import BillingAddress from "./components/billing-address"
import PushNotification from "./components/push-notification"
import CustomizedNotification from "./components/customized-notification"
import LanguageRegion from "./components/language-region"
import DarkMode from "./components/dark-mode"
import LocationService from "./components/location-service"
import ContactSupport from "./components/contact-support"
import ReportIssue from "./components/report-issue"
import LiveChat from "./components/live-chat"
import TermsCondition from "./components/terms-condition"
import DataPermission from "./components/data-permission"
import DeleteAccount from "./components/delete-account"
import PrivacyPolicy from "./components/privacy-policy"
import AccountAppUsage from "./components/account-app-usage"
import LicensingRegistration from "./components/licensing-registration"
import AutocareMaintenance from "./components/autocare-maintenance"
// import FAQs from "./components/faqs"

export default function SettingsPage() {
  const [activePage, setActivePage] = useState("main")
  const [expandedSection, setExpandedSection] = useState("account")
  const [activeTab, setActiveTab] = useState("collect")
  const navigate = useNavigate();

  const handleNavigate = (page, tab) => {
    if (page === "login") {
      navigate("/auth/login");
      return;
    }
    setActivePage(page)

   
    if (
      page === "payment" ||
      page === "payment-with-cards" ||
      page === "add-card" ||
      page === "transaction" ||
      page === "auto-renewal" ||
      page === "billing"
    ) {
      setExpandedSection("payment")
    } else if (page === "push-notification" || page === "custom-notification") {
      setExpandedSection("notifications")
    } else if (page === "profile" || page === "password" || page === "2fa") {
      setExpandedSection("account")
    } else if (page === "language-region" || page === "dark-mode" || page === "location-service") {
      setExpandedSection("preference")
    } else if (page === "contact-support" || page === "report-issue" || page === "live-chat") {
      setExpandedSection("support")
    } else if (page === "terms-condition" || page === "data-permission" || page === "delete-account") {
      setExpandedSection("legal")
    } else if (page === "info-collect" || page === "info-sharing" || page === "data-security") {
      setExpandedSection("privacy")
      setActiveTab(tab) // Update activeTab based on the tab
    } else if (page === "faqs" || page === "licensing" || page === "autocare") {
      setExpandedSection("faqs")
    } else if (page === "account-app-usage" || page === "licensing-registration" || page === "autocare-maintenance") {
      setExpandedSection("faqs")
    }
  }

  const handleSectionToggle = (section) => {
    setExpandedSection(expandedSection === section ? "" : section)
  }

  return (
    <div className="max-h-screen from-sky-50 to-sky-100 flex-1 flex flex-col">
      <SettingsLayout
        activePage={activePage}
        expandedSection={expandedSection}
        onNavigate={handleNavigate}
        onSectionToggle={handleSectionToggle}
      >
        {activePage === "main" && <MainSettings onNavigate={handleNavigate} />}

        {/* Account Settings */}
        {activePage === "profile" && <ProfileInformation onNavigate={handleNavigate} key="profile-view" />}
        {activePage === "edit-profile" && <EditProfile onNavigate={handleNavigate} key="edit-profile-view" />}
        {activePage === "password" && <ChangePassword onNavigate={handleNavigate} key="change-password-view" />}
        {activePage === "2fa" && <TwoFactorAuth onNavigate={handleNavigate} />}

        {/* Payment & Billing */}
        {activePage === "payment" && <SavedPaymentMethod onNavigate={handleNavigate} />}
        {activePage === "payment-with-cards" && <SavedPaymentMethodWithCards onNavigate={handleNavigate} />}
        {activePage === "add-card" && <AddBankCard onNavigate={handleNavigate} />}
        {activePage === "transaction" && <TransactionHistory onNavigate={handleNavigate} />}
        {activePage === "auto-renewal" && <AutoRenewalSettings onNavigate={handleNavigate} />}
        {activePage === "billing" && <BillingAddress onNavigate={handleNavigate} />}

        {/* Notifications & Alerts */}
        {activePage === "push-notification" && <PushNotification onNavigate={handleNavigate} />}
        {activePage === "custom-notification" && <CustomizedNotification onNavigate={handleNavigate} />}

        {/* App Preference */}
        {activePage === "language-region" && <LanguageRegion onNavigate={handleNavigate} />}
        {activePage === "dark-mode" && <DarkMode onNavigate={handleNavigate} />}
        {activePage === "location-service" && <LocationService onNavigate={handleNavigate} />}
         {/* Support & Help */}
         {activePage === "contact-support" && <ContactSupport onNavigate={handleNavigate} />}
        {activePage === "report-issue" && <ReportIssue onNavigate={handleNavigate} />}
        {activePage === "live-chat" && <LiveChat onNavigate={handleNavigate} />}

        {/* FAQs */}
        {/* {(activePage === "faqs" ||
          activePage === "account-usage" ||
          activePage === "licensing" ||
          activePage === "autocare") && <FAQs onNavigate={handleNavigate} />} */}
        {activePage === "account-app-usage" && <AccountAppUsage onNavigate={handleNavigate} />}
        {activePage === "licensing-registration" && <LicensingRegistration onNavigate={handleNavigate} />}
        {activePage === "autocare-maintenance" && <AutocareMaintenance onNavigate={handleNavigate} />}
        {/* Legal */}
        {activePage === "terms-condition" && <TermsCondition onNavigate={handleNavigate} />}
        {activePage === "data-permission" && <DataPermission onNavigate={handleNavigate} />}
        {activePage === "delete-account" && <DeleteAccount onNavigate={handleNavigate} />}

        {/* Privacy Policy */}
        {(activePage === "info-collect" || activePage === "info-sharing" || activePage === "data-security") && (
          <PrivacyPolicy onNavigate={handleNavigate} activeTab={activeTab} />
        )}
      </SettingsLayout>
    </div>
  )
}

