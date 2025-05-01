"use client"

import { ChevronLeft } from "lucide-react"

export default function ReportIssue({ onNavigate }) {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Report an Issue</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Tell us about the problem</label>
            <textarea
              placeholder="Describe the issue..."
              rows={6}
              className="text-md text-[#05243F] block bg-white rounded-lg w-full px-4 py-3 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200 resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 pb-3">
        <button className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95">
          Submit
        </button>
      </div>
    </div>
  )
}
