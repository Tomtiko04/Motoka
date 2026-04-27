import { useState } from "react";
import { ChevronLeft, CreditCard, Building2, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetPendingTokenizationSubscriptions,
  useGetPaymentMethods,
  useGetBanks,
  useInitiateTokenization,
} from "../usePaymentMethods";

function CardTypeBadge({ cardType }) {
  if (!cardType) return null;
  const type = cardType.toLowerCase();
  if (type.includes("visa"))
    return (
      <span className="inline-flex items-center rounded-md bg-[#1A1F71] px-2 py-0.5 text-xs font-bold italic text-white">
        VISA
      </span>
    );
  if (type.includes("master"))
    return (
      <span className="inline-flex items-center rounded-md bg-[#EB001B] px-2 py-0.5 text-xs font-bold text-white">
        MC
      </span>
    );
  if (type.includes("verve"))
    return (
      <span className="inline-flex items-center rounded-md bg-[#00755E] px-2 py-0.5 text-xs font-bold text-white">
        Verve
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-md bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700">
      {cardType}
    </span>
  );
}

function CardTab({ onNavigate }) {
  const { subscriptions, isLoading } = useGetPendingTokenizationSubscriptions();
  const { paymentMethods, isLoading: isLoadingCards } = useGetPaymentMethods();
  const { initiateTokenization, isLoading: isTokenizing } = useInitiateTokenization();
  const [selectedId, setSelectedId] = useState(null);

  const handleAddCard = () => {
    if (!selectedId) {
      toast.error("Please select a car to add a card for");
      return;
    }
    initiateTokenization(selectedId);
  };

  if (isLoading || isLoadingCards) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    const hasAutoRenewal = paymentMethods.length > 0;
    return (
      <div className="space-y-4">
        {hasAutoRenewal ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
            <CreditCard className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-green-800">All set!</p>
            <p className="mt-1 text-xs text-green-700">
              All your active subscriptions already have a card on file for auto-renewal.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#EBB950]/40 bg-[#FFF4DD]/60 p-4 text-center">
            <CreditCard className="mx-auto mb-2 h-8 w-8 text-[#EBB950]" />
            <p className="text-sm font-medium text-[#05243F]">No auto-renewal set up yet</p>
            <p className="mt-1 text-xs text-[#05243F]/60">
              Enable auto-renewal for a car first. Once your first payment goes through, your card will be saved here automatically.
            </p>
          </div>
        )}
        <button
          onClick={() => onNavigate("payment")}
          className="w-full rounded-3xl bg-[#2389E3] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1a6dba] active:scale-95"
        >
          Back to Saved Methods
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#05243F]/60">
        Select a car to save a card for auto-renewal. You'll be charged ₦50 via Paystack (refunded immediately) to securely verify your card.
      </p>

      <div className="space-y-2">
        {subscriptions.map((sub) => {
          const car = sub.cars;
          const label = car
            ? `${car.vehicle_make || ""} ${car.vehicle_model || ""} ${car.vehicle_year ? `(${car.vehicle_year})` : ""} · ${car.registration_no || "No plate"}`
            : `Subscription #${sub.id}`;
          const isSelected = selectedId === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedId(sub.id)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm transition-all ${
                isSelected
                  ? "border-[#2389E3] bg-[#EEF5FD] text-[#2389E3]"
                  : "border-[#E8EDF5] bg-white text-[#05243F] hover:border-[#2389E3]/40 hover:bg-[#F8FAFD]"
              }`}
            >
              <span className="font-medium">{label.trim()}</span>
              <span
                className={`h-4 w-4 rounded-full border-2 ${
                  isSelected ? "border-[#2389E3] bg-[#2389E3]" : "border-gray-300"
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddCard}
        disabled={!selectedId || isTokenizing}
        className="w-full rounded-3xl bg-[#2389E3] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1a6dba] disabled:opacity-40 active:scale-95"
      >
        {isTokenizing ? "Redirecting to Paystack…" : "Add Card via Paystack"}
      </button>
    </div>
  );
}

function BankAccountTab() {
  const { banks, isLoading } = useGetBanks();
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const handleSave = () => {
    if (!selectedBank || accountNumber.length < 10) {
      toast.error("Please select a bank and enter a valid 10-digit account number");
      return;
    }
    toast("Bank account direct debit is coming soon! For now, you can pay via bank transfer during checkout.", {
      icon: "🏦",
      duration: 4000,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#05243F]">Bank</label>
        <div className="relative">
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg bg-white px-4 py-3 pr-10 text-sm text-[#05243F] shadow-sm ring-1 ring-[#E8EDF5] transition-all hover:ring-[#2389E3]/40 focus:outline-none focus:ring-[#2389E3] disabled:opacity-50"
          >
            <option value="">{isLoading ? "Loading banks…" : "Select bank"}</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#05243F]">Account Number</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={10}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter 10-digit account number"
          className="block w-full rounded-lg bg-white px-4 py-3 text-sm text-[#05243F] shadow-sm ring-1 ring-[#E8EDF5] transition-all placeholder:text-[#05243F]/40 hover:ring-[#2389E3]/40 focus:outline-none focus:ring-[#2389E3]"
        />
      </div>

      <div className="rounded-lg border border-[#EBB950]/40 bg-[#FFF4DD]/60 px-4 py-3 text-xs text-[#8B6914]">
        Bank account direct debit is coming soon. You can still pay via bank transfer during checkout.
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full rounded-3xl bg-[#2389E3] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1a6dba] active:scale-95"
      >
        Save Account
      </button>
    </div>
  );
}

export default function AddBankCard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("card");

  return (
    <div>
      <div className="mb-4 flex items-center md:mb-6">
        <button onClick={() => onNavigate("payment")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-base font-medium md:text-lg">Add a Bank Card/Account</h2>
      </div>

      <div className="mb-5 flex">
        <button
          onClick={() => setActiveTab("card")}
          className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm transition-all ${
            activeTab === "card"
              ? "rounded-l-full bg-[#2389E3] text-white"
              : "rounded-l-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Bank Card
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`flex flex-1 items-center justify-center gap-2 py-2 text-sm transition-all ${
            activeTab === "account"
              ? "rounded-r-full bg-[#2389E3] text-white"
              : "rounded-r-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Building2 className="h-4 w-4" />
          Bank Account
        </button>
      </div>

      {activeTab === "card" ? (
        <CardTab onNavigate={onNavigate} />
      ) : (
        <BankAccountTab />
      )}
    </div>
  );
}

export { CardTypeBadge };
