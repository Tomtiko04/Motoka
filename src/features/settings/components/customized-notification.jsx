"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export default function CustomizedNotification({ onNavigate }) {
  const [customEnabled, setCustomEnabled] = useState(true)

  return (
    <div className="flex flex-col justify-between h-full">

      <div>
        <div className="flex items-center mb-4 md:mb-6">
          <button onClick={() => onNavigate("notifications")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-base md:text-lg font-medium">Customized Notification</h2>
        </div>

        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md cursor-pointer">
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

        
      </div>
      <div className="pb-5 md:mt-8">
        <button className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95">
          Confirm
        </button>
      </div>
    </div>
  )
}
