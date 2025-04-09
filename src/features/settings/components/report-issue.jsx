"use client"

import { ChevronLeft } from "lucide-react"

export default function ReportIssue({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Report an Issue</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about the problem</label>
          <textarea
            placeholder="Describe the issue..."
            rows={6}
            className="w-full p-3 border border-gray-200 rounded-md resize-none"
          ></textarea>
        </div>

        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
          Submit
        </button>
      </div>
    </div>
  )
}
