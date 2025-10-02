"use client"

import { ChevronLeft } from "lucide-react"

export default function BillingAddress({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Billing Address</h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Address 1</label>
          <input
            type="text"
            defaultValue="No 4 Aliko estate"
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Address 2 (optional)</label>
          <input
            type="text"
            placeholder=""
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">State</label>
            <div className="relative">

              <select className="w-full p-2 md:p-3 pr-10 border-none rounded-md bg-white text-sm md:text-base appearance-none">
                <option value="ogun">Ogun</option>
                <option value="lagos">Lagos</option>
                <option value="abuja">Abuja</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">City</label>
            <input
              type="text"
              defaultValue="Ijebu Ode"
              className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Country</label>
          <div className="relative">
            <select className="w-full p-2 md:p-3 pr-10 border-none rounded-md bg-white text-sm md:text-base appearance-none">
              <option value="nigeria">Nigeria</option>
              <option value="ghana">Ghana</option>
              <option value="kenya">Kenya</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

