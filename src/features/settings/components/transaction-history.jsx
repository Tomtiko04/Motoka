"use client"

import { ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react";
import { getPaymentHistory } from "../../../services/apiPayment";
import { ClipLoader } from "react-spinners";

export default function TransactionHistory({ onNavigate }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        const response = await getPaymentHistory();
        // Backend: { success, data: { transactions: [], pagination: {} } }
        setTransactions(response?.data?.transactions || response?.transactions || []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).split('/').join('/');
  };

  const formatAmount = (kobo) => {
    const naira = Number(kobo) / 100;
    return `₦${naira.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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
        {loading ? (
          <div className="flex items-center justify-center my-10">
            <ClipLoader color="#2284DB" size={40} />
          </div>
        ) : transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-xs text-sky-600">
                    📄
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.order?.order_number || transaction.reference}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.created_at)}
                    </p>
                    {transaction.items && transaction.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Items:</p>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {transaction.items.map((item, index) => (
                            <li key={index}>
                              • {item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-sky-600">
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center my-10">
            <p className="text-base font-medium text-gray-500">No transaction history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

