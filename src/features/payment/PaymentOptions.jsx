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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Available Balance:
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.availableBalance}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Renewal Cost
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.renewalCost}
                  </span>
                </div>
                <div className="border border-[#F4F5FC]"></div>
                <div className="flex justify-between">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    New Balance
                  </span>
                  <span className="text-base font-semibold text-[#05243F]">
                    {walletDetails.newBalance}
                  </span>
                </div>
                <button className="mt-5 w-full rounded-full bg-[#2284DB] px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F] md:mt-10">
                  N35,000 Pay Now
                </button>
              </div>
            </div>
          )}

          {selectedPayment === "transfer" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Transfer Method
              </h2>
              <div className="space-y-3 rounded-[20px] border border-[#697B8C]/11 px-6 py-4">
                <div className="text-center">
                  <h3 className="text-sm font-normal text-[#05243F]/40">
                    Transfer
                  </h3>
                  <p className="mt-2 text-4xl font-semibold text-[#2284DB]">
                    N35,000
                  </p>
                  <p className="mt-3 text-[15px] text-[#05243F]/40">
                    Account No. Expires in
                    <span className="ml-1 font-semibold text-[#EBB850]">
                      30
                    </span>
                    mins
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                    <span className="text-[15px] font-light text-[#05243F]/60">
                      Account Number:
                    </span>
                    <span className="text-base font-semibold text-[#05243F]">
                      0987654322
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                    <span className="text-[15px] font-light text-[#05243F]/60">
                      Bank Name:
                    </span>
                    <span className="text-base font-semibold text-[#05243F]">
                      Paystack
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                    <span className="text-[15px] font-light text-[#05243F]/60">
                      Account Name:
                    </span>
                    <span className="text-base font-semibold text-[#05243F]">
                      Money Credit
                    </span>
                  </div>
                  <div className="flex justify-between pb-3">
                    <span className="text-[15px] font-light text-[#05243F]/60">
                      Amount:
                    </span>
                    <span className="text-base font-semibold text-[#05243F]">
                      N35,000
                    </span>
                  </div>
                </div>

                <div className="rounded-[10px] bg-[#F4F5FC] p-4 drop-shadow-xs">
                  <div className="flex gap-3">
                    <span className="text-base font-medium text-[#05243F]">
                      Note:
                    </span>
                    <p className="text-sm font-normal text-[#05243F]/60">
                      Kindly transfer the exact amount to the account details
                      above
                    </p>
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full rounded-full bg-[#2284DB] px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F]">
                I've Made Payment
              </button>
            </div>
          )}

          {selectedPayment === "card" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Card Method
              </h2>
              <div className="space-y-3 rounded-[20px] border border-[#697B8C]/11 px-6 py-2">
                <div className="text-center">
                  <span className="text-sm font-normal text-[#05243F]/40">
                    Amount
                  </span>
                  <p className="mt-1 text-4xl font-semibold text-[#2284DB]">
                    N35,000
                  </p>
                  <p className="mt-2 text-[15px] text-[#05243F]/40">
                    Kindly Input your Card Details
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <h3 className="text-sm font-medium text-[#05243F]">
                    Input Card Details
                  </h3>

                  {/* Card Number Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="0000-0000-0000-0000"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] py-3 pr-4 text-right text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    <img
                      src="/visa.svg"
                      alt="Visa"
                      className="absolute top-1/2 left-4 h-4 w-auto -translate-y-1/2"
                    />
                  </div>

                  {/* Month/Year and CVV */}
                  {/* TODO: Let add min and max value and error input invalidation */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Month"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="CVV"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />

                    {/* Auto Renew Checkbox */}
                    <div className="flex items-center justify-center gap-x-3 rounded-[10px] bg-[#EEF2FF]">
                      <input
                        type="checkbox"
                        id="autoRenew"
                        className="h-4 w-4 rounded-full border-[#E1E6F4] text-[#2389E3] focus:ring-[#2389E3]"
                      />
                      <label
                        htmlFor="autoRenew"
                        className="text-sm text-[#05243F]/40"
                      >
                        Auto Renew
                      </label>
                    </div>
                    {/* <div className="flex items-center justify-center gap-x-3 bg-[#EEF2FF]">
                      <input
                        type="checkbox"
                        id="autoRenew"
                        className="h-5 w-5 appearance-none rounded-full border border-[#E1E6F4] text-[#2389E3] checked:border-[#2389E3] checked:bg-[#2389E3] focus:ring-2 focus:ring-[#2389E3]"
                      />
                      <label
                        htmlFor="autoRenew"
                        className="text-sm text-[#05243F]/40"
                      >
                        Auto Renew
                      </label>
                    </div> */}
                  </div>

                  {/* Note */}
                  <div className="mt-5 rounded-[10px] bg-[#F8F8F8] p-4 drop-shadow-xs">
                    <div className="flex gap-5">
                      <span className="text-base font-medium text-[#05243F]">
                        Note:
                      </span>
                      <p className="text-sm text-[#05243F]/60">
                        Activate Auto renewal to enjoy{" "}
                        <span className="font-semibold text-[#F26060]">
                          10%
                        </span>{" "}
                        Discount on your next renewal
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-5 w-full rounded-full bg-[#2284DB] px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F]">
                Make Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
