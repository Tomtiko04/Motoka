import { ChevronLeft, Plus, CreditCard } from "lucide-react";
import { CardTypeBadge } from "./add-bank-card";
import { useGetPaymentMethods } from "../usePaymentMethods";

function CardItem({ method }) {
  const car = method.car;
  const carLabel = car
    ? `${car.vehicle_make || ""} ${car.vehicle_model || ""}`.trim() || "Unknown car"
    : "Unknown car";
  const plate = car?.registration_no || "";
  const expiry =
    method.exp_month && method.exp_year
      ? `${String(method.exp_month).padStart(2, "0")}/${String(method.exp_year).slice(-2)}`
      : null;

  return (
    <div className="flex items-center justify-between rounded-xl border border-[#E8EDF5] bg-white p-4 shadow-sm">
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
            {method.bank && <span>{method.bank} · </span>}
            {carLabel}
            {plate && <span> · {plate}</span>}
            {expiry && <span> · Exp {expiry}</span>}
          </p>
        </div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          method.subscription_status === "active"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {method.subscription_status}
      </span>
    </div>
  );
}

export default function SavedPaymentMethod({ onNavigate }) {
  const { paymentMethods, isLoading } = useGetPaymentMethods();

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Saved Payment Method</h2>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="flex flex-col justify-between">
          <div>
            <p className="mb-4 text-center text-sm text-gray-500 md:text-base">
              Add and manage your payment methods. Save your card for easy auto-renewal payments.
            </p>
            <div className="mb-6 flex items-center justify-center rounded-lg border border-sky-200 bg-white p-4 md:p-6 md:mb-8">
              <p className="text-sm text-gray-400 md:text-base">No saved payment methods yet</p>
            </div>
            <div className="mb-6 flex items-center justify-center rounded-lg border border-sky-200 bg-white p-4 md:mb-8">
              <button
                onClick={() => onNavigate("add-card")}
                className="flex items-center gap-2 text-sky-500"
              >
                <Plus className="h-4 w-4 rounded-full bg-sky-500 text-white" />
                <span className="text-sm font-semibold text-[#05243F]/95">
                  Add a Bank Card/Account
                </span>
              </button>
            </div>
          </div>
          <div className="pt-5 md:mt-8">
            <button
              onClick={() => onNavigate("add-card")}
              className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all hover:bg-[#1a6dba] active:scale-95"
            >
              Add a Bank Card/Account
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 space-y-3">
            {paymentMethods.map((method) => (
              <CardItem key={method.id} method={method} />
            ))}
          </div>

          <button
            onClick={() => onNavigate("add-card")}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#2389E3]/40 bg-[#F8FAFD] py-3 text-sm font-medium text-[#2389E3] transition-all hover:bg-[#EEF5FD]"
          >
            <Plus className="h-4 w-4" />
            Add another card
          </button>
        </div>
      )}
    </div>
  );
}
