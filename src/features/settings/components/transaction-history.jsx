"use client"

import { ChevronLeft } from "lucide-react"

export default function TransactionHistory({ onNavigate }) {
  const transactions = [
    { id: 1, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 2, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 3, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 4, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 5, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 6, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 7, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
    { id: 8, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  ]

  return (
    <div>
      <div className="flex items-center mb-4 md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base md:text-lg font-medium">Transaction History</h2>
      </div>

      <div className="space-y-3 md:space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between py-2 md:py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-sky-100 text-sky-600 rounded-md text-xs">
                📄
              </div>
              <div>
                <p className="font-medium text-xs md:text-sm">{transaction.reference}</p>
                <p className="text-xs text-gray-500">{transaction.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-sky-500 text-xs md:text-sm">{transaction.amount}</p>
              <p className="text-xs text-gray-500">{transaction.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

