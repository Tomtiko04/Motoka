"use client"

import { ChevronLeft } from "lucide-react"

export default function TwoFactorAuth({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Two Factor Authenticator</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Motoka requires you to protect your account with 2FA. How would you like to receive one-time password (OTP)
      </p>

      <div className="space-y-6">
        <div className="flex items-center">
          <input
            type="radio"
            id="mobile-app"
            name="2fa-method"
            className="h-4 w-4 text-sky-500 focus:ring-sky-400"
            defaultChecked
          />
          <div className="ml-3">
            <label htmlFor="mobile-app" className="font-medium text-gray-800">
              Mobile App Aunthenticator
            </label>
            <p className="text-sm text-gray-500">
              Use a mobile app like google authenticator to generate verification codes.
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <input type="radio" id="email" name="2fa-method" className="h-4 w-4 text-sky-500 focus:ring-sky-400" />
          <div className="ml-3">
            <label htmlFor="email" className="font-medium text-gray-800">
              Email
            </label>
            <p className="text-sm text-gray-500">Receive verification codes via email.</p>
          </div>
        </div>

        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
          Verify
        </button>
      </div>
    </div>
  )
}

