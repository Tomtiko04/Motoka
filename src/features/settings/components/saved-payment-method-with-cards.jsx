import { useState } from "react";
import { ChevronLeft, CreditCard } from "lucide-react";
import { CardTypeBadge } from "./add-bank-card";
import { useGetPaymentMethods } from "../usePaymentMethods";

function CardItem({ method, selected, onSelect }) {
  const car = method.car;
  const carLabel = car
    ? `${car.vehicle_make || ""} ${car.vehicle_model || ""}`.trim()
    : "";
  const plate = car?.registration_no || "";
  const expiry =
    method.exp_month && method.exp_year
      ? `${String(method.exp_month).padStart(2, "0")}/${String(method.exp_year).slice(-2)}`
      : null;

  return (
    <div
      onClick={() => onSelect(method.id)}
      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all ${
        selected ? "border-[#2389E3] bg-[#EEF5FD]" : "border-[#E8EDF5] bg-white hover:border-[#2389E3]/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0F4FA]">
          <CreditCard className="h-5 w-5 text-[#2389E3]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <CardTypeBadge cardType={method.card_type} />
            {method.last4 && (
              <span className="text-sm font-semibold text-[#05243F]">
                •••• {method.last4}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#05243F]/50">
            {method.bank && <span>{method.bank}</span>}
            {carLabel && <span> · {carLabel}</span>}
            {plate && <span> · {plate}</span>}
            {expiry && <span> · Exp {expiry}</span>}
          </p>
        </div>
      </div>
      <span
        className={`h-4 w-4 rounded-full border-2 transition-all ${
          selected ? "border-[#2389E3] bg-[#2389E3]" : "border-gray-300"
        }`}
      />
    </div>
  );
}

export default function SavedPaymentMethodWithCards({ onNavigate }) {
  const { paymentMethods, isLoading } = useGetPaymentMethods();
  const [selectedId, setSelectedId] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Saved Payment Method</h2>
      </div>

      <div className="mb-8 space-y-3">
        {paymentMethods.map((method) => (
          <CardItem
            key={method.id}
            method={method}
            selected={selectedId === method.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

      <div className="mt-5 pt-5">
        <button
          type="button"
          disabled={!selectedId}
          className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all hover:bg-[#1a6dba] disabled:opacity-40 active:scale-95"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
