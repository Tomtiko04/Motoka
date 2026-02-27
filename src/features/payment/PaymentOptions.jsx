import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { IoIosArrowBack } from "react-icons/io";
import {
  PAYMENT_METHODS,
  PAYMENT_TYPES,
} from "./config/paymentTypes";
import { usePaymentVerification } from "./hooks/usePayment";
import { initializePaystackPayment } from "../../services/apiPaystack";
import { initiateMonicreditPayment } from "../../services/apiMonicredit";
import { abandonPayment } from "../../services/apiPayment";

const paymentMethods = [
  { id: PAYMENT_METHODS.PAYSTACK, label: "Pay Via Paystack", icon: "💳" },
  { id: PAYMENT_METHODS.MONICREDIT, label: "Pay Via Monicredit" },
];

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [paymentSession, setPaymentSession] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(
    PAYMENT_METHODS.MONICREDIT,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPaymentMethodConfirmed, setIsPaymentMethodConfirmed] = useState(false);
  const [monicreditFallbackError, setMonicreditFallbackError] = useState(null);

  // For Monicredit
  const customer = paymentSession?.monicredit?.data?.customer;
  // Get total_amount in naira (backend now sends both total_amount and amount in naira for Monicredit)
  // Prefer total_amount, fallback to amount (both should be in naira from backend)
  const totalAmount = paymentSession?.monicredit?.data?.total_amount || 
                      paymentSession?.monicredit?.data?.amount || 
                      null;
  
  // For Paystack - amount is in kobo from backend, convert to naira for display
  const paystackAmount = paymentSession?.amount 
    ? Number(paymentSession.amount) / 100 
    : null;

  const { verifyMonicredit, verifyPaystack } = usePaymentVerification();

  // Invalidate cars + notifications cache so dashboard and bell update immediately
  const navigateAfterPayment = useCallback((state) => {
    queryClient.invalidateQueries({ queryKey: ['cars'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    navigate('/dashboard', { state });
  }, [navigate, queryClient]);

  // Abandon any initialized-but-unpaid transaction when user leaves this page
  useEffect(() => {
    return () => {
      const paystackRef = paymentSession?.paystack?.reference;
      const monicreditRef = paymentSession?.monicredit?.data?.reference ||
                            paymentSession?.monicredit?.data?.orderid;
      const ref = paystackRef || monicreditRef;
      if (ref && isPaymentMethodConfirmed && !isProcessing) {
        abandonPayment(ref, 'User left payment page');
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSession, isPaymentMethodConfirmed, isProcessing]);

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
        // Default method selection: prefer provided method, else default to Monicredit
        const defaultMethod = sessionData.method || PAYMENT_METHODS.MONICREDIT;
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
    setIsPaymentMethodConfirmed(false);
    setMonicreditFallbackError(null);
  };

  // Helper function to build payment payload
  const buildPaymentPayload = () => {
    const car_slug = paymentSession?.car_slug || paymentSession?.car_id || paymentSession?.monicredit?.data?.car_slug;

    // ── Plate number payment: no schedules or delivery needed ────────────────
    if (paymentSession?.type === PAYMENT_TYPES.PLATE_NUMBER) {
      return {
        car_slug,
        payment_type: 'plate_number',
        plate_type: paymentSession.plate_type,
        ...(paymentSession.sub_type ? { sub_type: paymentSession.sub_type } : {}),
      };
    }

    // ── Renewal / other payment types ────────────────────────────────────────
    const schedules = paymentSession?.selectedSchedules || [];
    
    // Normalize payment_schedule_id - backend REQUIRES a non-empty array
    let payment_schedule_id = [];
    
    if (Array.isArray(schedules) && schedules.length > 0) {
      payment_schedule_id = schedules.map(s => s?.id || s).filter(id => id !== null && id !== undefined && id !== '');
    } else if (paymentSession?.payment_schedule_id) {
      if (Array.isArray(paymentSession.payment_schedule_id)) {
        payment_schedule_id = paymentSession.payment_schedule_id.filter(id => id !== null && id !== undefined && id !== '');
      } else {
        payment_schedule_id = [paymentSession.payment_schedule_id].filter(id => id !== null && id !== undefined && id !== '');
      }
    } else {
      const monicreditScheduleId = paymentSession?.monicredit?.data?.payment_schedule_id;
      if (monicreditScheduleId) {
        if (Array.isArray(monicreditScheduleId)) {
          payment_schedule_id = monicreditScheduleId.filter(id => id !== null && id !== undefined && id !== '');
        } else {
          payment_schedule_id = [monicreditScheduleId].filter(id => id !== null && id !== undefined && id !== '');
        }
      }
    }

    const delivery = paymentSession?.deliveryDetails || paymentSession?.delivery_details || paymentSession?.meta_data || {};

    // Extract delivery fields
    const address = delivery?.address || delivery?.delivery_address || "";
    const contact = delivery?.contact || delivery?.delivery_contact || "";
    const stateId = delivery?.state_id;
    const state = delivery?.state;
    const lgaId = delivery?.lga_id;
    const lga = delivery?.lga;

    // For license renewal, delivery details are optional
    // For other payment types, backend requires: address, state/state_id, lga/lga_id, and contact
    const hasAddress = address && address.trim() !== "";
    const hasContact = contact && contact.trim() !== "";
    const hasState = (stateId !== undefined && stateId !== null && stateId !== "") || 
                     (state !== undefined && state !== null && state !== "");
    const hasLga = (lgaId !== undefined && lgaId !== null && lgaId !== "") || 
                   (lga !== undefined && lga !== null && lga !== "");

    // Backend requires: if ANY delivery field is sent, ALL must be complete
    // For license renewal: send meta_data only if ALL fields are provided, otherwise omit entirely
    // For other types: require all fields to be complete
    const hasCompleteDeliveryDetails = hasAddress && hasContact && hasState && hasLga;

    const payload = {
      car_slug,
      payment_schedule_id
    };

    // Only include meta_data if ALL delivery details are complete
    // This prevents backend validation errors (backend rejects partial delivery details)
    if (hasCompleteDeliveryDetails) {
      payload.meta_data = {
        address: address.trim(),
        delivery_address: address.trim(),
        contact: contact.trim(),
        delivery_contact: contact.trim(),
        ...(stateId !== undefined && stateId !== null && stateId !== "" ? { state_id: stateId } : {}),
        ...(stateId === undefined && state && state.trim() !== "" ? { state: state.trim() } : {}),
        ...(lgaId !== undefined && lgaId !== null && lgaId !== "" ? { lga_id: lgaId } : {}),
        ...(lgaId === undefined && lga && lga.trim() !== "" ? { lga: lga.trim() } : {}),
      };
    }
    // For license renewal, if delivery details are incomplete, we simply don't send meta_data
    // Backend will handle this as "no delivery required"

    return payload;
  };

  // Confirm and initialize selected payment method
  const handleConfirmPaymentMethod = async () => {
    setIsInitializing(true);
    try {
      const payload = buildPaymentPayload();
      
      // Validate required fields
      if (!payload.car_slug) {
        toast.error('Car information is missing. Please try again.');
        return;
      }

      // Skip schedule validation for plate number payments
      if (paymentSession?.type !== PAYMENT_TYPES.PLATE_NUMBER) {
        if (!Array.isArray(payload.payment_schedule_id) || payload.payment_schedule_id.length === 0) {
          toast.error('Payment schedule information is missing. Please try again.');
          return;
        }
      }

      if (selectedMethod === PAYMENT_METHODS.PAYSTACK) {
        // Initialize Paystack
        payload.payment_gateway = 'paystack';
        console.log("Initializing Paystack with payload:", payload);

        const initRes = await initializePaystackPayment(payload);
        // Backend response structure: { status: true, data: {...}, message: '...' }
        const responseData = initRes?.data || initRes;
        const paystackUrl = responseData?.authorization_url || responseData?.data?.authorization_url;
        const reference = responseData?.reference || responseData?.data?.reference || responseData?.transaction_id;
        // Paystack amount is in kobo from backend
        const amount = responseData?.amount || responseData?.data?.amount;

        if (paystackUrl && reference) {
          setPaymentSession(prev => {
            const updated = {
              ...prev,
              paystack: {
                ...(prev?.paystack || {}),
                authorization_url: paystackUrl,
                reference,
              },
              // Store amount from Paystack response (in kobo)
              amount: amount || prev?.amount
            };
            try {
              sessionStorage.setItem("paymentData", JSON.stringify(updated));
            } catch (storageError) {
              console.warn("Failed to save payment data to sessionStorage:", storageError);
            }
            return updated;
          });
          setIsPaymentMethodConfirmed(true);
          toast.success('Paystack payment initialized successfully');
        } else {
          toast.error('Failed to initialize Paystack payment');
        }
      } else if (selectedMethod === PAYMENT_METHODS.MONICREDIT) {
        // Initialize Monicredit
        payload.payment_gateway = 'monicredit';
        setMonicreditFallbackError(null);

        const initRes = await initiateMonicreditPayment(payload);
        const responseData = initRes?.data || initRes;

        if (initRes?.status && responseData) {
          setPaymentSession(prev => {
            const updated = {
              ...prev,
              monicredit: {
                ...(prev?.monicredit || {}),
                data: responseData
              }
            };
            try {
              sessionStorage.setItem("paymentData", JSON.stringify(updated));
            } catch (storageError) {
              console.warn("Failed to save payment data to sessionStorage:", storageError);
            }
            return updated;
          });
          setIsPaymentMethodConfirmed(true);
          toast.success('Monicredit payment initialized successfully');
        } else {
          toast.error(initRes?.message || 'Failed to initialize Monicredit payment');
        }
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to initialize payment';

      // When Monicredit fails, offer the user a clear path to switch to card payment
      if (selectedMethod === PAYMENT_METHODS.MONICREDIT) {
        setMonicreditFallbackError(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Switch to Paystack after Monicredit failure
  const handleSwitchToPaystack = () => {
    setMonicreditFallbackError(null);
    setSelectedMethod(PAYMENT_METHODS.PAYSTACK);
    setIsPaymentMethodConfirmed(false);
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

  // Handle Paystack payment - redirects to Paystack payment page
  const handlePaystackPayment = async () => {
    try {
      const paystackUrl = paymentSession?.paystack?.authorization_url;
      const reference = paymentSession?.paystack?.reference;

      if (!paystackUrl) {
        toast.error('Payment not initialized. Please confirm your payment method first.');
        return;
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
        navigateAfterPayment({
          paymentSuccess: true,
          reference,
          amount: paymentSession.amount
        });
      } else {
        toast.error('Payment verification failed. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to verify payment');
      setIsProcessing(false);
    }
  };

  // Handle Monicredit verification
  const handleVerifyMonicredit = async () => {
    const orderId = paymentSession?.monicredit?.data?.orderid ||
                    paymentSession?.monicredit?.data?.order_id ||
                    paymentSession?.monicredit?.data?.reference;
    if (!orderId) {
      toast.error("No payment reference found. Please contact support.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await verifyMonicredit.mutateAsync(orderId);
      if (result.data.status === "APPROVED") {
        toast.success('Payment successful! Your renewal is being processed.');
        navigateAfterPayment({
          paymentSuccess: true,
          orderId,
          amount: paymentSession.amount,
          paymentMethod: "monicredit"
        });
      } else {
        toast.error("Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
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
      
      const responseData = result?.data || result;
      const status = responseData?.status || responseData?.data?.status;
      const isSuccess = status === 'success' || status === true || 
                       result?.data?.status === 'success' || 
                       responseData?.status === 'success';

      if (isSuccess) {
        toast.success('Payment successful! Your renewal is being processed.');
        navigateAfterPayment({
          paymentSuccess: true,
          reference,
          amount: paymentSession.amount,
          paymentMethod: "paystack"
        });
      } else {
        toast.error("Payment verification failed");
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  // Listen for messages from PaystackCallback window
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        const { reference } = event.data;
        if (reference) {
          setIsProcessing(true);
          try {
            toast.success('Payment successful! Your renewal is being processed.');
            navigateAfterPayment({
              paymentSuccess: true,
              reference,
              amount: paymentSession?.amount,
              paymentMethod: 'paystack'
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
  }, [navigate, navigateAfterPayment, paymentSession, verifyPaystack, getReceiptUrl]);

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

              {/* Monicredit fallback banner — shown when initialization fails */}
              {monicreditFallbackError && (
                <div className="mb-4 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800 mb-1">Bank transfer unavailable</p>
                  <p className="text-xs text-amber-700 mb-3">{monicreditFallbackError}</p>
                  <button
                    onClick={handleSwitchToPaystack}
                    className="w-full rounded-full bg-[#2284DB] py-2 text-sm font-semibold text-white hover:bg-[#1a6fc2] transition-colors"
                  >
                    Pay via Paystack instead
                  </button>
                </div>
              )}

              {!isPaymentMethodConfirmed ? (
                <div className="space-y-4 rounded-[20px] border border-[#697B8C]/11 px-6 py-6">
                  <div className="text-center">
                    <p className="text-sm text-[#05243F]/60 mb-4">
                      Click the button below to confirm your payment method and view bank transfer details.
                    </p>
                    <button
                      onClick={handleConfirmPaymentMethod}
                      disabled={isInitializing}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6bb8] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitializing ? (
                        <span className="flex items-center justify-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Initializing...
                        </span>
                      ) : (
                        "Confirm Payment Method"
                      )}
                    </button>
                  </div>
                </div>
              ) : paymentSession?.monicredit?.data?.customer ? (
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
              {!isPaymentMethodConfirmed ? (
                <div className="space-y-4 rounded-[20px] border border-[#697B8C]/11 px-6 py-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Secure Payment
                        </h3>
                        <p className="text-sm text-gray-600">
                          Pay securely with your card, bank transfer, or mobile money
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[#05243F]/60 mb-4">
                      Click the button below to confirm your payment method and proceed with payment.
                    </p>
                    <button
                      onClick={handleConfirmPaymentMethod}
                      disabled={isInitializing}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#1a6bb8] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isInitializing ? (
                        <span className="flex items-center justify-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                          Initializing...
                        </span>
                      ) : (
                        "Confirm Payment Method"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
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
                          ₦{(paystackAmount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reference:</span>
                        <span className="font-mono text-xs">
                          {paymentSession?.paystack?.reference || "Not initialized"}
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

                  <button
                    onClick={handlePaystackPayment}
                    disabled={!paymentSession?.paystack?.authorization_url || isProcessing}
                    className="flex w-full items-center justify-center rounded-full bg-[#2284DB] px-4 py-3 text-base font-semibold text-white hover:bg-[#1a6bb8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Verifying payment...
                      </>
                    ) : (
                      "Pay with Paystack"
                    )}
                  </button>
                  <p className="mt-2 text-center text-xs text-[#697C8C]">
                    You will be redirected to Paystack's secure payment page. Verification is automatic after payment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
