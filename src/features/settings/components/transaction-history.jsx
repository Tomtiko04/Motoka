"use client"

import { ChevronLeft } from "lucide-react"
import { useState } from "react";

export default function TransactionHistory({ onNavigate }) {
  // const transactions = [
  //   { id: 1, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 2, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 3, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 4, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 5, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 6, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 7, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  //   { id: 8, reference: "ABC-1234", description: "License Renewal", date: "2025/01/15", amount: "₦150,000" },
  // ]
  const [transactions, useSetTransaction] = useState([])

  return (
    <div>
      <div className="mb-4 flex items-center md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base font-medium md:text-lg">
          Transaction History
        </h2>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 md:space-y-4">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between border-b border-gray-100 py-2 md:py-3"
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-xs text-sky-600 md:h-8 md:w-8">
                  📄
                </div>
                <div>
                  <p className="text-xs font-medium md:text-sm">
                    {transaction.reference}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.description}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-sky-500 md:text-sm">
                  {transaction.amount}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center my-5">
            <p className="text-base font-medium text-gray-500">No current transaction history</p>
          </div>
        )}
      </div>
    </div>
  );
}

