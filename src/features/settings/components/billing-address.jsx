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
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Address 1</label>
          <input
            type="text"
            defaultValue="No 4 Aliko estate"
            className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Address 2 (optional)</label>
          <input
            type="text"
            placeholder=""
            className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">State</label>
            <select className="w-full p-2 md:p-3 border border-gray-200 rounded-md bg-white text-sm md:text-base">
              <option value="ogun">Ogun</option>
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              defaultValue="Ijebu Ode"
              className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Country</label>
          <select className="w-full p-2 md:p-3 border border-gray-200 rounded-md bg-white text-sm md:text-base">
            <option value="nigeria">Nigeria</option>
            <option value="ghana">Ghana</option>
            <option value="kenya">Kenya</option>
          </select>
        </div>
      </div>
    </div>
  )
}

