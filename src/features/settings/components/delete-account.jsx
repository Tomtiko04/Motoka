"use client"

import { ChevronLeft } from "lucide-react"

export default function DeleteAccount({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Delete Account</h2>
      </div>

      <div className="text-center space-y-6">
        <h3 className="text-lg font-medium text-gray-700">Are You Sure You Want To Delete Your Account?</h3>

        <div className="flex justify-center gap-4">
          <button className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-8 rounded-md transition-colors">Yes</button>
          <button className="bg-white border border-gray-300 text-gray-700 py-2 px-8 rounded-md transition-colors">
            No
          </button>
        </div>
      </div>
    </div>
  )
}
