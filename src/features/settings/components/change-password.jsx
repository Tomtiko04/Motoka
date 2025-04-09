"use client"

import { ChevronLeft } from "lucide-react"

export default function ChangePassword({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Change Password</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
          <input type="password" value="**********" className="w-full p-3 border border-gray-200 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input type="password" value="**********" className="w-full p-3 border border-gray-200 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input type="password" value="**********" className="w-full p-3 border border-gray-200 rounded-md" />
        </div>

        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
          Change Password
        </button>
      </div>
    </div>
  )
}

