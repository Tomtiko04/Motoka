"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export default function CustomizedNotification({ onNavigate }) {
  const [customEnabled, setCustomEnabled] = useState(true)

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("notifications")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Customized Notification</h2>
      </div>

      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="pr-4">
          <h3 className="font-medium text-sm md:text-base">Customized Notification</h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Get only the updates that matter to you</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={customEnabled}
            onChange={() => setCustomEnabled(!customEnabled)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
        </label>
      </div>

      <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 md:py-3 px-4 rounded-md transition-colors text-sm md:text-base">
        Confirm
      </button>
    </div>
  )
}
