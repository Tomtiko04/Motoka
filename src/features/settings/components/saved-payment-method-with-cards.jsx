"use client"
import { ChevronLeft } from "lucide-react"

export default function SavedPaymentMethodWithCards({ onNavigate }) {
  const savedCards = [
    { id: 1, bank: "UBA Bank", logo: "UBA", number: "10234576****3456", isDefault: true },
    { id: 2, bank: "Zenith Bank", logo: "Z", number: "10234576****3456", isDefault: false },
    { id: 3, bank: "UBA Bank", logo: "UBA", number: "10234576****3456", isDefault: false },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Saved Payment Method</h2>
      </div>

      <div className="space-y-4 mb-8">
        {savedCards.map((card) => (
          <div key={card.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-3">
              {card.bank === "UBA Bank" ? (
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-md font-bold">
                  UBA
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-md font-bold">
                  Z
                </div>
              )}
              <div>
                <p className="font-medium">{card.bank}</p>
                <p className="text-sm text-gray-500">{card.number}</p>
              </div>
            </div>
            <div
              className={
                card.isDefault ? "h-3 w-3 bg-sky-500 rounded-full" : "h-3 w-3 border border-gray-300 rounded-full"
              }
            ></div>
          </div>
        ))}
      </div>

      <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
        confirm
      </button>
    </div>
  )
}

