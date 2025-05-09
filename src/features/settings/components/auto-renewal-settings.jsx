"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export default function AutoRenewalSettings({ onNavigate }) {
  const [autoRenewal, setAutoRenewal] = useState(true)

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Auto Renewal Settings</h2>
      </div>

      <div className="space-y-6 w-full max-w-md">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer">

          <div className="flex items-center justify-between mb-4">
            <div className="pr-4">
              <h3 className="font-medium text-sm md:text-base">Enable Auto Renewal</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Automatically pay for your car's licensing, receive reminders and maintenance on the due date.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={autoRenewal}
                onChange={() => setAutoRenewal(!autoRenewal)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

    </div>
  )
}

