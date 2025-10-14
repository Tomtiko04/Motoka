import React from "react";

export default function OrderList({
  items = [],
  orderDetails = {},
  buttonText = "Proceed to Payment",
  currency = "₦",
  onProceed,
  isLoading = false,
  children
}) {
  const total = items?.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="mx-auto w-full max-w-md">
      {orderDetails?.description && (
        <div className="mb-6 rounded-[12px] bg-[#FDF6E8] p-4">
          <h3 className="mb-2 text-sm font-medium text-[#05243F]">
            Package Details
          </h3>
          <p className="text-sm text-[#05243F]/60">
            {orderDetails.description}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {items?.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between rounded-[12px] bg-[#F4F5FC] p-3 shadow-xs"
          >
            <span className="text-sm font-normal text-[#05243F]/60">
              {item.name}
            </span>
            {item.amount && (
              <span className="text-sm font-semibold text-[#05243F]/95">
                {currency}
                {item.amount?.toLocaleString()}
              </span>
            )}
          </div>
        ))}

        {total > 0 && (
          <div className="flex items-center justify-between rounded-[12px] bg-[#FFF4DD] p-3 shadow-xs">
            <span className="text-sm font-normal text-[#05243F]/60">Total</span>
            <span className="text-sm font-semibold text-[#05243F]">
              {currency}
              {total.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {children}

      <button
        onClick={() => onProceed?.({ total, items, orderDetails })}
        disabled={isLoading}
        className="mt-6 w-full rounded-full bg-[#2284DB] py-4 text-center text-base font-semibold text-white transition-all hover:bg-[#1B6CB3] disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          // WARNING: Uncomment the line below if you want to show the total amount on the button (OYINKANSOLA)
          // `${currency}${total.toLocaleString()} ${buttonText}`
          <span>{buttonText}</span>
        )}
      </button>
    </div>
  );
}