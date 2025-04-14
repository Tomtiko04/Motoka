"use client"

import { ChevronLeft } from "lucide-react"

export default function LocationService({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Location Services</h2>
      </div>

      <div className="px-4 py-5 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm md:text-base">Enable GPS</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
          </label>
        </div>
      </div>
    </div>
  )
}
