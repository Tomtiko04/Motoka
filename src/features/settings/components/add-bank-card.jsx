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
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Card Number</label>
            <input
              type="text"
              placeholder="Enter 16-19 digital card number"
              className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#05243F]">Expiry date</label>
              <input
                type="text"
                placeholder="MM / YY"
                className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#05243F]">CVV</label>
              <input
                type="text"
                placeholder="Enter Card cvv"
                className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Pin</label>
            <input
              type="password"
              placeholder="Enter Card Pin"
              className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Bank</label>
            <div className="relative">
            

              <select className="w-full p-2 md:p-3 pr-10 border-none rounded-md bg-white text-sm md:text-base appearance-none">
                <option value="">select bank</option>
                <option value="uba">UBA Bank</option>
                <option value="zenith">Zenith Bank</option>
                <option value="gtb">GTBank</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Bank Account</label>
            <input
              type="text"
              placeholder="Enter 10-digit account number"
              className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      )}

      
      <div className="mt-6 md:mt-8 sticky bottom-0  flex justify-center rounded-b-[20px]  p-6 pt-4 sm:p-8 sm:pt-4">

          <button
            type="submit"
            onClick={() => {
              // In a real app, we would save the card/account data here
              // For demo purposes, just navigate back to payment page
              onNavigate("payment-with-cards")
            }}
            className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
          >
            confirm
          </button>
        </div>
    </div>
  )
}

