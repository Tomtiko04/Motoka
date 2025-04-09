"use client"

import { ChevronLeft } from "lucide-react"

export default function PrivacyPolicy({ onNavigate, activeTab }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">
          Privacy Policy
          {activeTab === "collect" && " / Information We Collect"}
          {activeTab === "sharing" && " / Information Sharing"}
          {activeTab === "security" && " / Data Security"}
        </h2>
      </div>

      {activeTab === "collect" && (
        <div className="space-y-6 bg-white p-6 rounded-lg">
          <div>
            <h3 className="font-medium mb-2">Personal Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Name, address, email address, phone number.</li>
              <li>Driver's license information, vehicle registration details.</li>
              <li>Vehicle identification number (VIN).</li>
              <li>Photographs of your vehicle or documents.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Usage Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Information about how you use the App, including features used, time spent, and interactions.</li>
              <li>Device information, such as device type, operating system, and unique device identifiers.</li>
              <li>Location data (if you enable location services).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Auto-Care Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Vehicle service history.</li>
              <li>Information about vehicle issues you report.</li>
              <li>Maintenance records</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "sharing" && (
        <div className="space-y-6 bg-white p-6 rounded-lg">
          <div>
            <h3 className="font-medium mb-2">Service Providers</h3>
            <p className="text-sm text-gray-600">
              Third-party vendors who assist us with payment processing, data storage, and other services.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Auto-Care Partners</h3>
            <p className="text-sm text-gray-600">
              Authorized auto-care providers to facilitate appointments and services.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Government Agencies</h3>
            <p className="text-sm text-gray-600">As required by law or to comply with legal obligations.</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">With Your Consent</h3>
            <p className="text-sm text-gray-600">When you give us permission to share your information.</p>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6 bg-white p-6 rounded-lg border-2 border-sky-200">
          <div>
            <h3 className="font-medium mb-2">Data Storage and Retention</h3>
            <p className="text-sm text-gray-600">
              We retain data only as long as necessary to provide our services and comply with legal requirements.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Third-Party Services & Data Sharing</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>We never sell your data.</li>
              <li>Third-party service providers (e.g., payment processors) adhere to strict security standards.</li>
              <li>Data shared with law enforcement follows legal procedures only.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Your Security Responsibilities</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Using strong passwords and enabling 2FA.</li>
              <li>Keeping your app updated to the latest version.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
