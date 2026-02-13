import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { IoIosArrowBack } from "react-icons/io";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
} from "./config/paymentTypes";
import { usePaymentVerification } from "./hooks/usePayment";
import { initializePaystackPayment } from "../../services/apiPaystack";

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

  // For Monicredit
  const customer = paymentSession?.monicredit?.data?.customer;
  const totalAmount = paymentSession?.monicredit?.data?.total_amount || null;

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
        // Default method selection: prefer provided method, else auto-select Paystack if available, else Monicredit
        const defaultMethod = sessionData.method 
          || (sessionData?.paystack?.authorization_url ? PAYMENT_METHODS.PAYSTACK : PAYMENT_METHODS.MONICREDIT);
        setSelectedMethod(defaultMethod);
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
  };

  // Note: Monicredit doesn't require a separate payment initiation step
  // Users just see bank details and verify after making the transfer

  // Helper function to get receipt URL based on payment type
  const getReceiptUrl = useCallback((paymentType, verificationResponse = null) => {
    // Get payment type from session or URL params
    const type = paymentType || 
                 paymentSession?.type || 
                 new URLSearchParams(location.search).get("type");
    
    let identifier = null;
    
    // Extract identifier based on payment type
    if (type === PAYMENT_TYPES.DRIVERS_LICENSE || type === 'drivers_license') {
      // For driver's license, use slug
      identifier = paymentSession?.slug || 
                  paymentSession?.data?.slug ||
                  verificationResponse?.slug ||
                  verificationResponse?.data?.slug;
    } else {
      // For vehicle paper or license renewal, use car_slug/car_id
      identifier = verificationResponse?.car_id || 
                  verificationResponse?.data?.car_id ||
                  paymentSession?.car_slug || 
                  paymentSession?.car_id ||
                  paymentSession?.data?.car_slug;
    }
    
    if (identifier && type) {
      return `/payment/receipt/${type}/${identifier}`;
    }
    
    return null;
  }, [paymentSession, location.search]);

  // Handle Paystack payment
  const handlePaystackPayment = async () => {
    try {
      let paystackUrl = paymentSession?.paystack?.authorization_url;
      let reference = paymentSession?.paystack?.reference;

      // If no authorization URL OR reference missing, initialize Paystack now to ensure reference is present
      if (!paystackUrl || !reference) {
        const schedules = paymentSession?.selectedSchedules || [];
        const payment_schedule_id = Array.isArray(schedules) && schedules.length > 0
          ? schedules.map(s => s.id)
          : paymentSession?.payment_schedule_id;
        const delivery = paymentSession?.deliveryDetails || {};

        const payload = {
          car_slug: paymentSession?.car_slug || paymentSession?.car_id,
          payment_schedule_id,
          meta_data: {
            delivery_address: delivery?.address,
            delivery_contact: delivery?.contact,
            state_id: delivery?.state_id,
            lga_id: delivery?.lga_id,
          }
        };

        const initRes = await initializePaystackPayment(payload);
        const data = initRes?.data || initRes;
        paystackUrl = data?.data?.authorization_url || data?.authorization_url;
        reference = data?.data?.reference || data?.reference || data?.transaction_id;

        if (!paystackUrl) {
          toast.error('Payment URL not found');
          return;
        }

        // Update session with paystack details so UI reflects the reference
        setPaymentSession(prev => {
          const updated = {
            ...prev,
            paystack: {
              ...(prev?.paystack || {}),
              authorization_url: paystackUrl,
              reference,
            }
          };
          // Persist updated session to sessionStorage so refresh keeps the reference
          try {
            sessionStorage.setItem("paymentData", JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }

      // Store reference for later verification
      if (reference) {
        storePaymentReference(
          reference,
          PAYMENT_METHODS.PAYSTACK,
        );
      }

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

    setIsProcessing(true);
    try {
      const result = await verifyPaystack.mutateAsync(reference);
      
      // Handle different response structures
      const responseData = result?.data || result;
      const status = responseData?.status || responseData?.data?.status;
      const isSuccess = status === 'success' || status === true || 
                       result?.data?.status === 'success' || 
                       responseData?.status === 'success';

      if (isSuccess) {
        // Get receipt URL based on payment type
        const receiptUrl = getReceiptUrl(null, responseData || result);
        
        // Redirect to dashboard with success message
        toast.success('Payment successful! Your renewal is being processed.');
        navigate('/dashboard', {
          state: {
            paymentSuccess: true,
            reference,
            amount: paymentSession.amount
          }
        });
      } else {
        toast.error('Payment verification failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error.message || 'Failed to verify payment');
      setIsProcessing(false);
    }
  };

  // Handle Monicredit verification
  const handleVerifyMonicredit = async () => {
    const orderId = paymentSession?.monicredit?.data?.orderid || paymentSession?.monicredit?.data?.order_id;
    console.log("orderId", orderId);
    if (!orderId) {
      toast.error("No payment orderId found");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await verifyMonicredit.mutateAsync(orderId);
      console.log(result);
      if (result.data.status === "APPROVED") {
        // Redirect to dashboard with success message
        toast.success('Payment successful! Your renewal is being processed.');
        navigate('/dashboard', {
          state: {
            paymentSuccess: true,
            orderId,
            amount: paymentSession.amount,
            paymentMethod: "monicredit"
          }
        });
      } else {
        toast.error("Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setIsProcessing(false);
    }
  };

  // Handle Paystack verification
  const handleVerifyPaystack = async () => {
    const reference = paymentSession?.paystack?.reference;
    if (!reference) {
      toast.error("No payment reference found");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await verifyPaystack.mutateAsync(reference);
      
      // Handle different response structures
      const responseData = result?.data || result;
      const status = responseData?.status || responseData?.data?.status;
      const isSuccess = status === 'success' || status === true || 
                       result?.data?.status === 'success' || 
                       responseData?.status === 'success';

      if (isSuccess) {
        // Redirect to dashboard with success message
        toast.success('Payment successful! Your renewal is being processed.');
        navigate('/dashboard', {
          state: {
            paymentSuccess: true,
            reference,
            amount: paymentSession.amount,
            paymentMethod: "paystack"
          }
        });
      } else {
        toast.error("Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setIsProcessing(false);
    }
  };

  // Listen for messages from PaystackCallback window
  useEffect(() => {
    const handleMessage = async (event) => {
      // Security: Check origin if needed
      if (event.data.type === 'PAYMENT_SUCCESS') {
        const { reference, paymentData } = event.data;
        if (reference) {
          setIsProcessing(true);
          try {
            // Payment already verified in callback, get receipt URL
            // Redirect to dashboard with success message
            toast.success('Payment successful! Your renewal is being processed.');
            navigate('/dashboard', {
              state: {
                paymentSuccess: true,
                reference,
                amount: paymentSession?.amount,
                paymentMethod: 'paystack'
              }
            });
          } catch (error) {
            console.error('Error processing payment success:', error);
            toast.error('Failed to process payment. Please verify manually.');
            setIsProcessing(false);
          }
        }
      } else if (event.data.type === 'PAYMENT_ERROR') {
        toast.error('Payment was not completed successfully');
        setIsProcessing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, paymentSession, verifyPaystack, getReceiptUrl]);

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

                </div>

                <>
                  <button
                    onClick={handlePaystackPayment}
                    disabled={!paymentSession?.selectedSchedules?.length && !paymentSession?.payment_schedule_id || isProcessing}
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      "Pay with Paystack"
                    )}
                  </button>

                  <div className="text-center text-xs text-gray-500">
                    You will be redirected to Paystack's secure payment page
                  </div>

                  {/* Manual Verification Section */}
                  {paymentSession?.paystack?.reference && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-4 flex items-center space-x-3">
                        <div className="text-yellow-600">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Payment Reference</h4>
                          <p className="text-sm font-mono text-gray-600">{paymentSession?.paystack?.reference}</p>
                        </div>
                      </div>
                      
                      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4">
                        <p className="text-xs text-blue-800">
                          If you've completed the payment, click below to verify and confirm your order.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleVerifyPaystack}
                        disabled={verifyPaystack.isPending || isProcessing}
                        className="w-full rounded-lg bg-green-600 py-3 px-4 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center"
                      >
                        {verifyPaystack.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                            Verifying Payment...
                          </>
                        ) : (
                          "Verify Payment"
                        )}
                      </button>
                      
                      {verifyPaystack.data && (
                        <div className={`mt-3 text-center text-sm font-semibold ${
                          verifyPaystack.data?.status === 'success' || 
                          verifyPaystack.data?.data?.status === 'success' ||
                          verifyPaystack.data?.status === true
                            ? "text-green-600" 
                            : "text-red-600"
                        }`}>
                          {typeof verifyPaystack.data === "object" && verifyPaystack.data !== null
                            ? verifyPaystack.data?.message ||
                              verifyPaystack.data?.data?.message ||
                              "Verification completed"
                            : String(verifyPaystack.data)}
                        </div>
                      )}
                      {verifyPaystack.isError && (
                        <div className="mt-3 text-center text-sm font-semibold text-red-600">
                          {typeof verifyPaystack.error === "string"
                            ? verifyPaystack.error
                            : verifyPaystack.error?.message || 
                              verifyPaystack.error?.response?.data?.message ||
                              "Verification failed"}
                        </div>
                      )}
                    </div>
                  )}
                </>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
