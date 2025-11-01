import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { IoIosArrowBack } from "react-icons/io";
import {
  PAYMENT_METHODS,
} from "./config/paymentTypes";
import { usePaymentVerification } from "./hooks/usePayment";

const paymentMethods = [
  { id: PAYMENT_METHODS.PAYSTACK, label: "Pay Via Paystack", icon: "💳" },
  { id: PAYMENT_METHODS.MONICREDIT, label: "Pay Via Monicredit" },
];

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentSession, setPaymentSession] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(
    PAYMENT_METHODS.MONICREDIT,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // For Monicredit
  const customer = paymentSession?.monicredit?.data?.customer;
  const totalAmount = paymentSession?.monicredit?.data?.total_amount || null;

  // For Paystack
  const paystackUrl = paymentSession?.paystack?.authorization_url;
  const paystackRef = paymentSession?.paystack?.reference;

  const { verifyMonicredit, verifyPaystack } = usePaymentVerification();

  useEffect(() => {
    console.log("Payment session updated:", paymentSession);
  }, [paymentSession]);

  useEffect(() => {
    const initializePaymentSession = () => {
      try {
        const params = new URLSearchParams(location.search);
        const paymentType = params.get("type");

        // Get session from location state or session storage
        const sessionData =
          location.state?.paymentData ||
          JSON.parse(sessionStorage.getItem("paymentData") || "null");

        if (!sessionData || !paymentType) {
          throw new Error("Invalid or expired payment session");
        }

        setPaymentSession(sessionData);
        setSelectedMethod(sessionData.method || null);
      } catch (err) {
        console.error("Payment initialization error:", err);
        toast.error("Failed to initialize payment. Please try again.");
        navigate(-1);
      }
    };

    initializePaymentSession();
  }, [location, navigate]);

  // Handle payment method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
  };

  // Process the selected payment method
  const handlePayment = async () => {
    if (!selectedMethod || !paymentSession) {
      setError("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMethod === PAYMENT_METHODS.PAYSTACK) {
        await handlePaystackPayment();
      } else if (selectedMethod === PAYMENT_METHODS.MONICREDIT) {
        await handleMonicreditPayment();
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  // Handle Paystack payment
  const handlePaystackPayment = async () => {
    try {
      const paystackUrl = paymentSession?.paystack?.authorization_url;

      if (!paystackUrl) {
        toast.error('Payment URL not found');
        return;
      }

      storePaymentReference(
        paymentSession.paystack.reference,
        PAYMENT_METHODS.PAYSTACK,
      );

      // Open Paystack in a new tab
      const newWindow = window.open(paystackUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        toast.error('Please allow popups for this site to proceed with payment');
        return;
      } else {
        toast.success("Redirecting to Paystack...");
      }

      const checkPopup = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkPopup);
          // When the popup is closed, check payment status
          checkPaystackStatus();
        }
      }, 1000);
    } catch (err) {
      console.error("Paystack payment error:", err);
      throw new Error(err.message || "Failed to process Paystack payment");
    }
  };

  // Store payment reference for verification
  const storePaymentReference = (reference, gateway) => {
    if (!reference || !gateway) return;

    const paymentInfo = {
      reference,
      gateway,
      type: paymentSession.type,
      timestamp: Date.now(),
      data: paymentSession.data,
    };

    // Store in localStorage for auto-verification
    const recentPayments = JSON.parse(
      localStorage.getItem("recentPayments") || "[]",
    );
    recentPayments.unshift(paymentInfo);
    localStorage.setItem(
      "recentPayments",
      JSON.stringify(recentPayments.slice(0, 5)),
    );
  };

  const checkPaystackStatus = async () => {
    const reference = paymentSession?.paystack?.reference;
    if (!reference) return;

    try {
      const result = await verifyPaystack.mutateAsync(reference);

      if (result?.status === 'success' || result?.data?.status === 'success') {
        navigate('/payment/success', {
          state: {
            amount: paymentSession.amount,
            reference,
            paymentMethod: 'paystack'
          }
        });
      } else {
        toast.error('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Failed to verify payment');
    }
  };

  // Handle Monicredit verification
  const handleVerifyMonicredit = async () => {
    const orderId = paymentSession?.monicredit?.data?.orderid;
    console.log("orderId", orderId);
    if (!orderId) {
      toast.error("No payment orderId found");
      return;
    }

    try {
      const result = await verifyMonicredit.mutateAsync(orderId);
      console.log(result);
      if (result.data.status === "APPROVED") {
        navigate("/payment/success", {
          state: {
            amount: paymentSession.amount,
            orderId,
            paymentMethod: "monicredit",
          },
        });
      } else {
        toast.error("Payment verification failed");
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  // Handle Paystack verification
  const handleVerifyPaystack = async () => {
    const reference = paymentSession?.paystack?.reference;
    if (!reference) {
      toast.error("No payment reference found");
      return;
    }

    try {
      await verifyPaystack.mutateAsync(reference);
      navigate("/payment/success", {
        state: {
          amount: paymentSession.amount,
          reference,
          paymentMethod: "paystack",
        },
      });
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  function handleVerifyBankTransfer() {
    console.log("Done");
  }

  // Check for payment verification on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference = params.get("reference");
    const gateway = params.get("gateway");

    if (reference && gateway) {
      verifyPayment(reference, gateway);
    }
  }, [location.search]);

  if (!paymentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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

      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto_1fr]">
          {/* LEFT SECTION */}
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodSelect(method.id)}
                className={`w-full rounded-[10px] bg-[#F4F5FC] p-4 text-left transition-all ${selectedMethod === method.id
                  ? "shadow-sm ring-1 ring-[#2389E3]"
                  : "hover:bg-[#FDF6E8] hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${selectedMethod === method.id
                      ? "font-semibold text-[#05243F]/95"
                      : "font-normal text-[#05243F]/40"
                      }`}
                  >
                    {method.label}
                  </span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#2389E3]">
                    {selectedMethod === method.id && (
                      <div className="h-2 w-2 rounded-full bg-[#2389E3]"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="hidden h-full w-px bg-[#F4F5FC] md:block"></div>

          {/* RIGHT SECTION */}
          {/* Right Panel - Payment Details */}
          {selectedMethod === "wallet" && (
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
                <button className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F] md:mt-10">
                  N35,000 Pay Now
                </button>
              </div>
            </div>
          )}

          {selectedMethod === PAYMENT_METHODS.MONICREDIT && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Bank Transfer Details
              </h2>
              {paymentSession?.monicredit?.data?.customer ? (
                <div className="space-y-3 rounded-[20px] border border-[#697B8C]/11 px-6 py-4">
                  <div className="text-center">
                    <h3 className="text-sm font-normal text-[#05243F]/40">
                      Transfer
                    </h3>
                    <p className="mt-2 text-4xl font-semibold text-[#2284DB]">
                      ₦{Number(totalAmount || 0).toLocaleString()}
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
                        {customer.account_number}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Bank Name:
                      </span>
                      <span className="text-base font-semibold text-[#05243F]">
                        {customer.bank_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Account Name:
                      </span>
                      <span className="text-right text-base font-semibold text-[#05243F]">
                        {customer.account_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Amount:
                      </span>
                      <span className="text-base font-semibold text-[#05243F]">
                        ₦{Number(totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-[10px] bg-[#F4F5FC] p-4 drop-shadow-xs">
                    <div className="flex gap-3">
                      <span className="text-base font-medium text-[#05243F]">
                        Note:
                      </span>
                      <p className="text-sm font-normal text-[#05243F]/60">
                        Kindly transfer the exact amount to the account details
                        above. After payment, click the button below to confirm.
                      </p>
                    </div>
                  </div>
                  <button
                    className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F] disabled:opacity-50"
                    onClick={handleVerifyMonicredit}
                    disabled={verifyMonicredit.isPending}
                  >
                    {verifyMonicredit.isPending
                      ? "Verifying..."
                      : "I've Made Payment"}
                  </button>
                  {verifyMonicredit.data && (
                    <div
                      className={`mt-4 text-center text-sm font-semibold ${(verifyMonicredit.data?.status ?? verifyMonicredit.data.status) ? "text-green-600" : "text-red-600"}`}
                    >
                      {typeof verifyMonicredit.data === "object" &&
                        verifyMonicredit.data !== null
                        ? verifyMonicredit.data?.message ||
                        verifyMonicredit.data.message ||
                        "Verification completed"
                        : String(verifyMonicredit.data)}
                    </div>
                  )}
                  {verifyMonicredit.isError && (
                    <div className="mt-4 text-center text-sm font-semibold text-red-600">
                      {typeof verifyMonicredit.error === "string"
                        ? verifyMonicredit.error
                        : String(verifyMonicredit.error)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm font-normal text-red-500">
                  No payment records found. It looks like you haven’t initiated
                  any payments yet.
                </div>
              )}
            </div>
          )}

          {selectedMethod === "card" && (
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
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="0000-0000-0000-0000"
                      className="w-full rounded-[10px] border border-[#E1E6F4] bg-[#F8F8F8] py-3 pr-4 pl-12 text-right text-base text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none"
                    />
                    {cardLogo && (
                      <div className="absolute top-1/2 left-4 flex -translate-y-1/2 items-center justify-center">
                        <img
                          src={cardLogo}
                          alt={cardType || "card"}
                          className="h-6 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  {/* Month/Year and CVV */}
                  {/* TODO: Let add min and max value and error input invalidation */}
                  {/* <div className="grid grid-cols-2 gap-2"> */}
                  {/* ...omitted for brevity... */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Month"
                      value={month}
                      min={1}
                      max={12}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, month: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 2) {
                          e.target.value = e.target.value.slice(0, 2);
                        }
                      }}
                      onChange={(e) => setMonth(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.month && !isMonthValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    <input
                      type="number"
                      placeholder="Year"
                      value={year}
                      min={currentYear}
                      max={currentYear + 15}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, year: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 4) {
                          e.target.value = e.target.value.slice(0, 4);
                        }
                      }}
                      onChange={(e) => setYear(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.year && !isYearValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    <input
                      type="number"
                      placeholder="CVV"
                      value={cvv}
                      onBlur={() =>
                        setTouched((prev) => ({ ...prev, cvv: true }))
                      }
                      onInput={(e) => {
                        if (e.target.value.length > 4) {
                          e.target.value = e.target.value.slice(0, 4);
                        }
                      }}
                      onChange={(e) => setCvv(e.target.value)}
                      className={`w-full rounded-[10px] border ${touched.cvv && !isCvvValid
                        ? "border-red-500"
                        : "border-[#E1E6F4]"
                        } bg-[#F8F8F8] px-4 py-3 text-sm text-[#05243F] placeholder-[#05243F]/40 focus:border-[#2389E3] focus:ring-1 focus:ring-[#2389E3] focus:outline-none`}
                    />

                    {/* Auto Renew */}
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
              <button className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F]">
                Make Payment
              </button>
            </div>
          )}

          {selectedMethod === PAYMENT_METHODS.PAYSTACK && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Paystack Payment
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💳</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Secure Payment
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pay securely with your card, bank transfer, or mobile
                        money
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-1">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">
                    Payment Summary
                  </h4>
                  <div className="space-y-1 text-xs text-[#697C8C]">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">
                        ₦{Number(paymentSession?.amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reference:</span>
                      <span className="font-mono text-xs">
                        {paymentSession?.paystack?.reference ||
                          "Not initialized"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Method:</span>
                      <span>Paystack</span>
                    </div>
                    {paymentSession?.items?.length > 1 && (
                      <div className="flex justify-between">
                        <span>Documents:</span>
                        <span className="font-semibold text-blue-600">
                          {paymentSession.items.length} items
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verification Button - Always show when reference exists */}
                  {/* {paystackReference && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center">
                            <div className="text-yellow-600 mr-3">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-yellow-800">Payment Initiated</h4>
                              <p className="text-sm text-yellow-600">Reference: {paystackReference}</p>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleVerifyPaystack}
                          disabled={verifying}
                          className="w-full rounded-lg bg-green-600 py-3 px-4 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {verifying ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Verifying Payment...
                            </>
                          ) : (
                            "Yes, I've made payment"
                          )}
                        </button>
                        
                        <div className="text-xs text-gray-500 text-center mt-2">
                          Click to verify your payment and create orders, or wait 1 minute for auto-verification
                        </div>
                        
                        {verifyResult && (
                          <div className={`mt-2 text-sm font-semibold ${verifyResult.data?.status ?? verifyResult.status ? "text-green-600" : "text-red-600"}`}>
                            {typeof verifyResult === 'object' && verifyResult !== null 
                              ? (verifyResult.data?.message || verifyResult.message || 'Verification completed')
                              : String(verifyResult)
                            }
                          </div>
                        )}
                        {verifyError && (
                          <div className="mt-2 text-sm text-red-600 font-semibold">
                            {typeof verifyError === 'string' ? verifyError : String(verifyError)}
                          </div>
                        )}
                      </div>
                    )} */}
                </div>

                {paymentSession?.paystack?.authorization_url ? (
                  <>
                    <button
                      onClick={handlePaystackPayment}
                      disabled={!paymentSession?.paystack?.authorization_url}
                      className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {verifyPaystack.isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Initializing Payment...
                        </>
                      ) : (
                        "Pay with Paystack"
                      )}
                    </button>

                    <div className="text-center text-xs text-gray-500">
                      You will be redirected to Paystack's secure payment page
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="text-gray-500">
                      <svg
                        className="mx-auto mb-4 h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-base font-medium text-gray-900">
                        Payment Processing
                      </p>
                      <p className="mt-2 text-sm text-[#697C8C]">
                        Please wait while we process your payment...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
