import React from "react";

export default function OrderList({ 
  items, 
  onPaymentSuccess, 
  onPaymentError,
  buttonText = "Pay Now",
  currency = "₦"
}) {
  const total = items?.reduce((sum, item) => sum + item.amount, 0);

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
    <div className="mx-auto w-full max-w-md">
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-[12px] bg-[#F4F5FC] p-3 shadow-xs"
          >
            <span className="text-sm font-normal text-[#05243F]/60">
              {item.name}
            </span>
            <span className="text-sm font-semibold text-[#05243F]/95">
              {currency}
              {item.amount.toLocaleString()}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-[12px] bg-[#FFF4DD] p-3 shadow-xs">
          <span className="text-sm font-normal text-[#05243F]/60">Total</span>
          <span className="text-sm font-semibold text-[#05243F]">
            {currency}
            {total.toLocaleString()}
          </span>
        </div>
      </div>
      <button
        onClick={handlePayment}
        className="mt-6 w-full rounded-full bg-[#2284DB] py-4 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F]"
      >
        {currency}
        {total.toLocaleString()} {buttonText}
      </button>
    </div>
  );
}
