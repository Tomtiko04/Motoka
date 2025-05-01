"use client"

import { ChevronLeft } from "lucide-react"

export default function TwoFactorAuth({ onNavigate }) {
  return (
    <div className="">

      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Two Factor Authenticator</h2>
        </div>

        <div className="flex justify-center items-center w-full h-full text-center my-6">

          <p className="text-sm text-[#05243F]/40  w-80">
            Motoka requires you to protect your account with 2FA. How would you like to receive one-time password (OTP)
          </p>
        </div>

        <div className="space-y-6 w-full max-w-md">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer">
            <div className="ml-3">
              <label htmlFor="mobile-app" className="font-medium text-sm md:text-base">
                Mobile App Authenticator
              </label>
              <p className="text-sm text-gray-500">
                Use a mobile app like Google Authenticator to generate verification codes.
              </p>
            </div>
            <input
              type="radio"
              id="mobile-app"
              name="2fa-method"
              className="h-4 w-4 text-sky-500 focus:ring-sky-400 cursor-pointer"
              defaultChecked
            />
          </div>

          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer">
            <div className="ml-3">
              <label htmlFor="email" className="font-medium text-sm md:text-base">
                Email
              </label>
              <p className="text-sm text-gray-500">Receive verification codes via email.</p>
            </div>
            <input type="radio" id="email" name="2fa-method" className="h-4 w-4 text-sky-500 focus:ring-sky-400 cursor-pointer" />
          </div>

          
        </div>
      </div>
      <div className="mt-5 pt-5 pb-3">

        <button
          type="submit"
          
          className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
        >
          Verify
        </button>
      </div>
    </div>
  )
}

