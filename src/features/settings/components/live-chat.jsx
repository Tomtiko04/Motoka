"use client"

import { ChevronLeft } from "lucide-react"

export default function LiveChat({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Live Chat / Help Desk</h2>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600">Chat with a support agent in real-time.</p>

        <div className="flex">
          <input
            type="email"
            placeholder="Info@Example.com"
            className="flex-1 p-3 border border-gray-200 rounded-l-md"
          />
          <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-3 rounded-r-md transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M22 2L11 13"></path>
              <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
