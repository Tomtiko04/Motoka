import React, { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import AppLayout from "../../components/AppLayout";
import { useNavigate } from "react-router-dom";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("wallet");

  const paymentMethods = [
    { id: "wallet", label: "Wallet Balance: N30,876" },
    { id: "transfer", label: "Pay Via Transfer" },
    { id: "card", label: "Pay Via Card" },
  ];

  const walletDetails = {
    availableBalance: "N300,876",
    renewalCost: "N30,876",
    newBalance: "N270,000",
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="relative mb-6 flex h-12 items-center sm:h-12">
          <button
            onClick={() => navigate(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF] sm:h-8 sm:w-8"
          >
            <IoIosArrowBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-medium text-[#05243F] sm:text-2xl">
            Payment Options
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Left Panel - Payment Methods */}
          <div>
            <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
              Choose Payment Method
            </h2>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full rounded-lg bg-[#F4F5FC] p-4 text-left transition-all ${
                    selectedPayment === method.id
                      ? "shadow-sm ring-1 ring-[#2389E3]"
                      : "hover:bg-[#FDF6E8] hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${selectedPayment === method.id ? "font-semibold text-[#05243F]/95" : "font-normal text-[#05243F]/40"}`}
                    >
                      {method.label}
                    </span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2389E3]">
                      {selectedPayment === method.id && (
                        <div className="h-2 w-2 rounded-full bg-[#2389E3]"></div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Payment Details */}
          {selectedPayment === "wallet" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Wallet Method
              </h2>
              <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-sm text-[#05243F]/60">
                    Available Balance:
                  </span>
                  <span className="font-medium text-[#05243F]">
                    {walletDetails.availableBalance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#05243F]/60">
                    Renewal Cost:
                  </span>
                  <span className="font-medium text-[#05243F]">
                    {walletDetails.renewalCost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#05243F]/60">
                    New Balance:
                  </span>
                  <span className="font-medium text-[#05243F]">
                    {walletDetails.newBalance}
                  </span>
                </div>
                <button className="mt-4 w-full rounded-lg bg-[#2389E3] px-6 py-3 text-center text-sm font-medium text-white transition-all hover:bg-[#2389E3]/90">
                  N35,000 Pay Now
                </button>
              </div>
            </div>
          )}

          {selectedPayment === "transfer" && (
            <div>
              <h2 className="mb-4 text-sm font-medium text-[#05243F]/70">
                Transfer Method
              </h2>
              <div className="space-y-6 rounded-lg bg-[#05243F] p-6 text-white shadow-sm">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-[#2389E3]">
                    Transfer
                  </h3>
                  <p className="mt-2 text-4xl font-semibold">N35,000</p>
                  <p className="mt-1 text-sm text-[#8B9EB7]">
                    Account No. Expires in{" "}
                    <span className="text-[#FDB022]">30</span> mins
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-[#8B9EB7]">
                      Account Number:
                    </span>
                    <span className="text-sm font-medium">0987654322</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-[#8B9EB7]">Bank Name:</span>
                    <span className="text-sm font-medium">Paystack</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-[#8B9EB7]">
                      Account Name:
                    </span>
                    <span className="text-sm font-medium">Money Credit</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-[#8B9EB7]">Amount:</span>
                    <span className="text-sm font-medium">N35,000</span>
                  </div>
                </div>

                <div className="rounded-lg bg-white/10 p-4">
                  <div className="flex gap-3">
                    <span className="font-medium text-[#FDB022]">Note:</span>
                    <p className="text-sm">
                      Kindly transfer the exact amount to the account details
                      above
                    </p>
                  </div>
                </div>

                <button className="w-full rounded-lg bg-[#2389E3] px-6 py-3 text-center text-sm font-medium text-white transition-all hover:bg-[#2389E3]/90">
                  I've Made Payment
                </button>
              </div>
            </div>
          )}

          {selectedPayment === "card" && (
            <div>
              <h2 className="mb-4 text-sm font-medium text-[#05243F]/70">
                Card Method
              </h2>
              <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
                <div className="text-center">
                  <span className="text-sm text-[#05243F]/60">Amount</span>
                  <p className="mt-1 text-4xl font-semibold text-[#2389E3]">
                    N35,000
                  </p>
                  <p className="mt-1 text-sm text-[#05243F]/60">
                    Kindly Input your Card Details
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-[#05243F]">
                    Input Card Details
                  </h3>

                  {/* Card Number Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000-0000-0000-0000"
                      className="w-full rounded-lg border border-[#E1E6F4] bg-white px-12 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    <img
                      src="/visa.svg"
                      alt="Visa"
                      className="absolute top-1/2 left-4 h-4 w-auto -translate-y-1/2"
                    />
                  </div>

                  {/* Month/Year and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Month"
                        className="rounded-lg border border-[#E1E6F4] bg-white px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Year"
                        className="rounded-lg border border-[#E1E6F4] bg-white px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="CVV"
                      className="rounded-lg border border-[#E1E6F4] bg-white px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                  </div>

                  {/* Auto Renew Checkbox */}
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="checkbox"
                      id="autoRenew"
                      className="h-4 w-4 rounded border-[#E1E6F4] text-[#2389E3] focus:ring-[#2389E3]"
                    />
                    <label
                      htmlFor="autoRenew"
                      className="text-sm text-[#05243F]"
                    >
                      Auto Renew
                    </label>
                  </div>

                  {/* Note */}
                  <div className="flex items-start gap-2 rounded-lg bg-[#F3F6FF] p-4">
                    <span className="font-medium text-[#05243F]">Note:</span>
                    <p className="text-sm text-[#05243F]/60">
                      Activate Auto renewal to enjoy{" "}
                      <span className="text-[#FF3B30]">10%</span> Discount on
                      your next renewal
                    </p>
                  </div>
                </div>

                <button className="w-full rounded-lg bg-[#2389E3] px-6 py-3 text-center text-sm font-medium text-white transition-all hover:bg-[#2389E3]/90">
                  I've Made Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
