"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export default function AddBankCard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("card") // 'card' or 'account'

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Add a Bank Card/Account</h2>
      </div>

      <div className="flex mb-4 md:mb-6">
        <button
          className={`flex-1 py-2 text-sm md:text-base ${
            activeTab === "card"
              ? "bg-sky-500 text-white rounded-l-full"
              : "bg-white text-gray-700 border border-gray-200 rounded-l-full"
          }`}
          onClick={() => setActiveTab("card")}
        >
          Bank Card
        </button>
        <button
          className={`flex-1 py-2 text-sm md:text-base ${
            activeTab === "account"
              ? "bg-sky-500 text-white rounded-r-full"
              : "bg-white text-gray-700 border border-gray-200 rounded-r-full"
          }`}
          onClick={() => setActiveTab("account")}
        >
          Bank Account
        </button>
      </div>

      {activeTab === "card" ? (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              placeholder="Enter 16-19 digital card number"
              className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Expiry date</label>
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                placeholder="Enter Card cvv"
                className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Pin</label>
            <input
              type="password"
              placeholder="Enter Card Pin"
              className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Bank</label>
            <select className="w-full p-2 md:p-3 border border-gray-200 rounded-md bg-white text-sm md:text-base">
              <option value="">select bank</option>
              <option value="uba">UBA Bank</option>
              <option value="zenith">Zenith Bank</option>
              <option value="gtb">GTBank</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Bank Account</label>
            <input
              type="text"
              placeholder="Enter 10-digit account number"
              className="w-full p-2 md:p-3 border border-gray-200 rounded-md text-sm md:text-base"
            />
          </div>
        </div>
      )}

      <div className="mt-6 md:mt-8">
        <button
          onClick={() => {
            // In a real app, we would save the card/account data here
            // For demo purposes, just navigate back to payment page
            onNavigate("payment-with-cards")
          }}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 md:py-3 px-4 rounded-md transition-colors text-sm md:text-base"
        >
          confirm
        </button>
      </div>
    </div>
  )
}

