import React from "react";

export default function OrderList({ 
  items, 
  onPaymentSuccess, 
  onPaymentError,
  buttonText = "Pay Now",
  currency = "₦"
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const handlePayment = async () => {
    try {
      // Here you can integrate your payment gateway
      // For example: const result = await processPayment(total);
      onPaymentSuccess?.(total, items);
    } catch (error) {
      onPaymentError?.(error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded-lg bg-[#F9FAFC]"
          >
            <span className="text-sm text-[#05243F]/70">{item.name}</span>
            <span className="text-sm font-medium text-[#05243F]">
              {currency}{item.amount.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#FDF6E8]">
          <span className="text-sm text-[#05243F]/70">Total</span>
          <span className="text-sm font-medium text-[#05243F]">
            {currency}{total.toLocaleString()}
          </span>
        </div>
      </div>
      <button 
        onClick={handlePayment}
        className="mt-6 w-full rounded-lg bg-[#2389E3] py-3 text-center text-sm font-medium text-white hover:bg-[#1b6eb3] transition-colors"
      >
        {currency}{total.toLocaleString()} {buttonText}
      </button>
    </div>
  );
}
