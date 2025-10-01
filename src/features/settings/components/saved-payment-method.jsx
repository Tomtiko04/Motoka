"use client"

import { useState } from "react"
import { ChevronLeft, Plus } from "lucide-react"

export default function SavedPaymentMethod({ onNavigate }) {
  // For demo purposes, we can toggle this to see different states
  const [savedCards, setSavedCards] = useState([])
  // Uncomment the below line to see the saved cards view
  // const [savedCards, setSavedCards] = useState([
  //   { id: 1, bank: 'UBA Bank', logo: 'UBA', number: '10234576****3456', isDefault: true },
  //   { id: 2, bank: 'Zenith Bank', logo: 'Z', number: '10234576****3456', isDefault: false },
  //   { id: 3, bank: 'UBA Bank', logo: 'UBA', number: '10234576****3456', isDefault: false }
  // ])

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Saved Payment Method</h2>
      </div>

      {savedCards.length === 0 ? (
        <div className="flex flex-col ijustify-between h-full">
          <div>

            <p className="text-gray-500 mb-4 text-center text-sm md:text-base">
              Add and manage your payment methods, conveniently save your cards or banking info for easy payments
            </p>

            <div className="border border-sky-200 rounded-lg p-4 md:p-6 mb-6 md:mb-8 flex items-center justify-center bg-white">
              <p className="text-gray-400 text-sm md:text-base">You have not saved any account</p>
            </div>

            <div className="flex items-center justify-center bg-white border border-sky-200 rounded-lg p-4 mb-6 md:mb-8">
              <button onClick={() => onNavigate("add-card")} className="flex items-center gap-2 text-sky-500">
                <Plus className="h-4 w-4 bg-sky-500 text-white font-bold" />
                <span className="text-sm font-semibold text-[#05243F]/95">Add a Bank Card/Account</span>
              </button>
            </div>
          </div>

          
          <div className="pt-5 md:mt-8">

            <button
              type="submit"
              onClick={() => onNavigate("add-card")}
              className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
            >
              Add a Bank Card/Account
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {card.bank === "UBA Bank" ? (
                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-md font-bold text-xs md:text-base">
                      UBA
                    </div>
                  ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md font-bold text-xs md:text-base">
                      Z
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm md:text-base">{card.bank}</p>
                    <p className="text-xs md:text-sm text-gray-500">{card.number}</p>
                  </div>
                </div>
                {card.isDefault && <div className="h-3 w-3 bg-sky-500 rounded-full"></div>}
              </div>
            ))}
          </div>
          <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 md:py-3 px-4 rounded-md transition-colors text-sm md:text-base">
            confirm
          </button>
        </div>
      )}
    </div>
  )
}

