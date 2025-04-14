"use client"

import { ChevronLeft } from "lucide-react"

export default function ChangePassword({ onNavigate }) {
  return (
    <div className="flex flex-col justify-between h-full">
      <div>

        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Change Password</h2>
        </div>
        <div className="space-y-6 relative">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Old Password</label>
            <input type="password" value="**********" className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">New Password</label>
            <input type="password" value="**********" className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Confirm Password</label>
            <input type="password" value="**********" className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200" />
          </div>

        
          
        </div>
      </div>
     

      <div className="pb-5 md:mt-8">

        <button
          type="submit"
          
          className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
        >
          Chang Password
        </button>
      </div>
    
    </div>
  )
}

