import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import cardValidator from "card-validator";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  initiateMonicreditPayment,
} from "../../services/apiMonicredit";
import { verifyPayment as verifyPaymentApi, verifyPaystackPayment, getPaystackReference } from "../../services/apiPayment";
import { initializePaystackPayment } from "../../services/apiPaystack";
import { usePaystackPayment } from "./usePaystackPayment";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  
  // Check if this is a fallback from Monicredit or return from Paystack
  const urlParams = new URLSearchParams(location.search);
  const isFallback = urlParams.get('fallback') === 'true';
  const fallbackData = urlParams.get('data');
  const paystackReturn = urlParams.get('paystack') === 'true';
  const paystackRef = urlParams.get('ref');
  
  const [selectedPayment, setSelectedPayment] = useState(isFallback || paystackReturn ? "paystack" : "transfer");

  // Handle fallback from Monicredit
  useEffect(() => {
    if (isFallback && fallbackData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(fallbackData));
        console.log("Fallback data received:", parsedData);
        
        // Show notification about fallback
        toast.info("Monicredit payment failed, using Paystack instead", {
          duration: 5000,
        });
      } catch (error) {
        console.error("Error parsing fallback data:", error);
      }
    }
  }, [isFallback, fallbackData]);

  // Handle return from Paystack
  useEffect(() => {
    if (paystackReturn && paystackRef) {
      console.log("Returned from Paystack with reference:", paystackRef);
      setPaystackReference(paystackRef);
      setSelectedPayment("paystack");
      
      // Show notification
      toast.info("Welcome back! Please verify your payment below.", {
        duration: 5000,
      });
    }
  }, [paystackReturn, paystackRef]);

  // Monicredit payment state
  const [monicreditAuthUrl, setMonicreditAuthUrl] = useState("");
  // const [monicreditTransId, setMonicreditTransId] = useState("");
  // const [monicreditStatus, setMonicreditStatus] = useState(null);
  const [monicreditLoading, setMonicreditLoading] = useState(false);
  const [monicreditError, setMonicreditError] = useState("");

  // Paystack payment hook
  const {
    initializePayment: initializePaystack,
    isInitializing: isPaystackInitializing,
    error: paystackError,
  } = usePaystackPayment();

  // Paystack verification state
  const [paystackReference, setPaystackReference] = useState("");
  const [paystackAuthUrl, setPaystackAuthUrl] = useState("");

  const paymentMethods = [
    // { id: "wallet", label: "Wallet Balance: N30,876" },
    { id: "transfer", label: "Pay Via Transfer" },
    // { id: "card", label: "Pay Via Card" },
    { id: "paystack", label: "Pay Via Paystack", icon: "💳" },
    // { id: "Monicredit_Transfer", label: "Pay Via Monicredit" },
  ];

  const walletDetails = {
    availableBalance: "N300,876",
    renewalCost: "N30,876",
    newBalance: "N270,000",
  };

  const [cardType, setCardType] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  // Optional: CDN that has common logos, based on type name
  const getCardLogoURL = (type) => {
    if (!type) return null;

    const supported = [
      "visa",
      "mastercard",
      "amex",
      "discover",
      "jcb",
      "diners",
      "unionpay",
    ];

    if (supported.includes(type)) {
      return `https://img.icons8.com/color/48/${type}.png`;
    }

    // fallback icon
    return "https://img.icons8.com/ios-filled/50/bank-card-back-side.png";
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, ""); // remove non-digits
    const groups = digits.match(/.{1,4}/g); // split into groups of 4
    return groups ? groups.join("-") : "";
  };

  const handleCardNumberChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatCardNumber(rawValue);

    setCardNumber(formatted);

    const validation = cardValidator.number(rawValue);
    setCardType(validation.card?.type || "");
  };

  const cardLogo = getCardLogoURL(cardType);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [touched, setTouched] = useState({
    month: false,
    year: false,
    cvv: false,
  });

  const currentYear = new Date().getFullYear();

  const isMonthValid = month >= 1 && month <= 12;
  const isYearValid = year >= currentYear && year <= currentYear + 15;
  const isCvvValid = /^[0-9]{3,4}$/.test(cvv);

  // Initiate Monicredit payment when selected
  useEffect(() => {
    if (
      selectedPayment === "Monicredit_Transfer" &&
      !monicreditAuthUrl &&
      !monicreditLoading
    ) {
      async function initiateMonicredit() {
        setMonicreditLoading(true);
        setMonicreditError("");
        try {
          // Build items from selectedSchedules
          let items = (paymentData.selectedSchedules || []).map((sch) => ({
            payment_schedule_id: sch.id,
            // revenue_head_code: sch.revenue_head?.revenue_head_code, // dynamic, commented out for now
            revenue_head_code: "REV686003f87e350", // hardcoded for testing
            unit_cost: Number(sch.amount),
          }));
          const deliveryFee = Number(paymentData.deliveryDetails?.fee || 0);
          if (items.length > 0 && deliveryFee > 0) {
            items[0].unit_cost += deliveryFee;
          }
          const data = await initiateMonicreditPayment({ items });
          setMonicreditAuthUrl(data.authorization_url);
          // setMonicreditTransId(data.id);
        } catch (err) {
          setMonicreditError(
            err.message || "Failed to initiate payment. Please try again.",
          );
        } finally {
          setMonicreditLoading(false);
        }
      }
      initiateMonicredit();
    }
  }, [selectedPayment]);

  // Initiate Paystack when selected
  useEffect(() => {
    if (selectedPayment !== "Paystack" || paystackAuthUrl || paystackLoading) return;
    async function initPaystack() {
      try {
        setPaystackLoading(true);
        setPaystackError("");
        const car = paymentData?.carDetail || {};
        const schedules = paymentData?.selectedSchedules || [];
        const firstScheduleId = schedules[0]?.id; // if multiple, backend spec needed
        const delivery = paymentData?.deliveryDetails || {};

        const payload = {
          car_slug: car.slug || car.car_slug || car.id, // prefer slug, fallback
          payment_schedule_id: firstScheduleId,
          meta_data: {
            delivery_address: delivery.address,
            delivery_contact: delivery.contact,
            state_id: delivery.state_id, // ensure caller sets ids
            lga_id: delivery.lga_id,
          },
        };
        const res = await initializePaystackPayment(payload);
        // Expecting { authorization_url, reference } or similar
        const authUrl = res.authorization_url || res.data?.authorization_url || res.url;
        const reference = res.reference || res.data?.reference || res.data?.reference_code;
        console.log('Paystack init response:', res);
        console.log('Extracted authUrl:', authUrl);
        console.log('Extracted reference:', reference);
        
        if (!authUrl) throw new Error("Missing authorization URL from Paystack init");
        setPaystackAuthUrl(authUrl);
        if (reference) {
          console.log('Setting Paystack reference:', reference);
          setPaystackReference(reference);
        } else {
          console.warn('No reference found in Paystack response');
        }
      } catch (err) {
        setPaystackError(err.message || "Failed to initialize Paystack");
      } finally {
        setPaystackLoading(false);
      }
    }
    initPaystack();
  }, [selectedPayment]);

  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  // Handle Paystack payment
  const handlePaystackPayment = async () => {
    if (!paymentData) {
      toast.error("No payment data available");
      return;
    }

    // Clear any previous payment state
    setPaystackReference("");
    setVerifyError("");
    setVerifyResult(null);
    setVerifying(false);
    
    // Clear old payment data from localStorage
    localStorage.removeItem('recentPayments');

    try {
      // Debug: Log the payment data to see what we have
      console.log("Payment Data:", paymentData);
      
      // Extract the necessary data from paymentData
      // The paymentData might have different structures depending on how it was passed
      const car_slug = paymentData.car_slug || paymentData.car?.slug;
      
      // Handle both single and bulk payments
      let payment_schedule_id = paymentData.payment_schedule_id;
      if (paymentData.selectedSchedules && Array.isArray(paymentData.selectedSchedules)) {
        // If we have selectedSchedules array, use those IDs
        payment_schedule_id = paymentData.selectedSchedules.map(schedule => schedule.id);
      } else if (paymentData.payment_schedule_id && !Array.isArray(paymentData.payment_schedule_id)) {
        // If it's a single ID, ensure it's in array format for consistency
        payment_schedule_id = [paymentData.payment_schedule_id];
      }
      
      const delivery_address = paymentData.delivery_address || paymentData.deliveryDetails?.address || paymentData.meta_data?.delivery_address;
      const delivery_contact = paymentData.delivery_contact || paymentData.deliveryDetails?.contact || paymentData.meta_data?.delivery_contact;
      const state_id = paymentData.state_id || paymentData.deliveryDetails?.state_id || paymentData.meta_data?.state_id;
      const lga_id = paymentData.lga_id || paymentData.deliveryDetails?.lga_id || paymentData.meta_data?.lga_id;

      // Validate required fields
      if (!car_slug) {
        toast.error("Car information is missing");
        return;
      }
      
      if (!payment_schedule_id || (Array.isArray(payment_schedule_id) && payment_schedule_id.length === 0)) {
        toast.error("Payment schedule information is missing");
        return;
      }

      // Prepare data in the format expected by the backend
      const paystackData = {
        car_slug: car_slug,
        payment_schedule_id: payment_schedule_id, // Can be single ID or array
        meta_data: {
          delivery_address: delivery_address || "",
          delivery_contact: delivery_contact || "",
          state_id: state_id || 1,
          lga_id: lga_id || 1,
        }
      };

      console.log("Paystack Data:", paystackData);

      const result = await initializePaystackPayment(paystackData);
      console.log('Paystack init result:', result);
      
      if (result?.data?.authorization_url) {
        // Store the Paystack reference for verification
        if (result.data.reference) {
          setPaystackReference(result.data.reference);
          console.log('Stored Paystack reference:', result.data.reference);
          
          // Store in localStorage for auto-verification
          const recentPayments = JSON.parse(localStorage.getItem('recentPayments') || '[]');
          recentPayments.unshift({
            reference: result.data.reference,
            gateway: 'paystack',
            timestamp: Date.now(),
            amount: result.data.amount || paymentData.amount
          });
          // Keep only last 5 payments
          localStorage.setItem('recentPayments', JSON.stringify(recentPayments.slice(0, 5)));
          
          // Auto-verification will be handled by useEffect when paystackReference changes
        }
        
        // Open Paystack payment page in new window
        window.open(result.data.authorization_url, '_blank');
        
        // Show success message
        toast.success('Redirecting to Paystack payment page...');
        
        // Show verification button after payment initiation
        console.log('Payment initiated. User can now verify after completing payment.');
        
      } else {
        toast.error("Failed to initialize Paystack payment");
      }
    } catch (error) {
      const errorMessage = error.message || "Paystack payment error";
      toast.error(errorMessage);
    }
  };

 
  const handleVerifyBankTransfer = async () => {
    setVerifying(true);
    setVerifyError("");
    setVerifyResult(null);
    try {
      console.log("transid",paymentData?.order_id);
      const reference = paymentData?.order_id;
      console.log("reference",reference);
      if (!reference) throw new Error("No payment reference found.");
      const result = await verifyPaymentApi(reference);
      console.log("result", result);
      setVerifyResult(result);
    } catch (err) {
      console.error('Bank transfer verification error:', err);
      setVerifyError(err?.message || err?.toString() || "Failed to verify payment. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  // Helper to open Monicredit payment in a new tab with absolute URL
  const openMonicreditPayment = () => {
    let url = monicreditAuthUrl;
    if (url && !/^https?:\/\//i.test(url)) {
      url = "https://" + url.replace(/^\/+/, "");
    }
    window.open(url, "_blank");
  };

  // Helper to open Paystack page
  const openPaystackPayment = () => {
    let url = paystackAuthUrl;
    if (url && !/^https?:\/\//i.test(url)) {
      url = "https://" + url.replace(/^\/+/, "");
    }
    window.open(url, "_blank");
  };

  const handleVerifyPaystack = async () => {
    setVerifying(true);
    setVerifyError("");
    setVerifyResult(null);
    try {
      console.log('=== VERIFYING PAYSTACK PAYMENT ===');
      console.log('paystackReference state:', paystackReference);
      
      if (!paystackReference) {
        throw new Error("No Paystack reference found. Please initialize a Paystack payment first.");
      }
      
      console.log('Calling POST /api/payment/paystack/verify/' + paystackReference);
      const result = await verifyPaystackPayment(paystackReference);
      console.log('Verification successful:', result);
      setVerifyResult(result);
      
      // Show success message
      toast.success('Payment verified successfully! Orders are being created...');
      
      // Clear the reference after successful verification
      setPaystackReference("");
      
    } catch (err) {
      console.error('Verification failed:', err);
      setVerifyError(err?.message || err?.toString() || "Failed to verify Paystack payment.");
      toast.error('Verification failed: ' + (err?.message || err?.toString() || 'Unknown error'));
    } finally {
      setVerifying(false);
    }
  };

  // Clear payment state when component mounts with new payment data
  React.useEffect(() => {
    if (paymentData) {
      setPaystackReference("");
      setVerifyError("");
      setVerifyResult(null);
      setVerifying(false);
    }
  }, [paymentData]);

  // Auto-verify when paystackReference changes
  React.useEffect(() => {
    if (paystackReference) {
      console.log('Paystack reference changed, auto-verifying:', paystackReference);
      setTimeout(() => {
        handleVerifyPaystack();
      }, 60000); // 1 minute delay
    }
  }, [paystackReference]);

  // Auto-verify payments on page load (only if returning from Paystack)
  React.useEffect(() => {
    // Only auto-verify if we have a reference from URL params (returning from Paystack)
    if (paystackRef) {
      console.log('Setting Paystack reference from URL:', paystackRef);
      setPaystackReference(paystackRef);
      // Auto-verification will be handled by useEffect when paystackReference changes
    }
  }, [paystackRef]);

  // Listen for payment success messages from callback window
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('Payment success message received:', event.data);
        toast.success('Payment completed successfully! Orders are being created...');
        
        // Set the reference for verification
        if (event.data && event.data.reference) {
          console.log('Setting Paystack reference from callback:', event.data.reference);
          setPaystackReference(event.data.reference);
        } else {
          console.log('No reference found in payment success message');
        }
      } else if (event.data.type === 'PAYMENT_ERROR') {
        // console.log('Payment error message received');
        // toast.error('Payment failed. Please try again.');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  React.useEffect(() => {
    if (verifyResult && verifyResult.data.status && paymentData?.car_slug) {
      const timeout = setTimeout(() => {
        navigate(`/payment/car-receipt/${paymentData.car_slug}`);
      }, 2000); // 2 seconds delay
      return () => clearTimeout(timeout);
    }
  }, [verifyResult, navigate, paymentData]);

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

      {/* Fallback Notification */}
      {isFallback && (
        <div className="mx-auto mb-4 max-w-4xl">
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-orange-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-orange-800">
                  <strong>Payment Method Changed:</strong> Monicredit payment
                  failed, so we've automatically selected Paystack for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto_1fr]">
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
                  className={`w-full rounded-[10px] bg-[#F4F5FC] p-4 text-left transition-all ${
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

          <div className="hidden h-full w-px bg-[#F4F5FC] md:block"></div>

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
                <button className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white transition-all hover:bg-[#FDF6E8] hover:text-[#05243F] md:mt-10">
                  N35,000 Pay Now
                </button>
              </div>
            </div>
          )}

          {selectedPayment === "transfer" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Bank Transfer Details
              </h2>
              {paymentData ? (
                <div className="space-y-3 rounded-[20px] border border-[#697B8C]/11 px-6 py-4">
                  <div className="text-center">
                    <h3 className="text-sm font-normal text-[#05243F]/40">
                      Transfer
                    </h3>
                    <p className="mt-2 text-4xl font-semibold text-[#2284DB]">
                      ₦{paymentData.total_amount || paymentData.amount}
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
                        {paymentData.customer?.account_number}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Bank Name:
                      </span>
                      <span className="text-base font-semibold text-[#05243F]">
                        {paymentData.customer?.bank_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Account Name:
                      </span>
                      <span className="text-base font-semibold text-[#05243F]">
                        {paymentData.customer?.account_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#697B8C]/11 pb-3">
                      <span className="text-[15px] font-light text-[#05243F]/60">
                        Amount:
                      </span>
                      <span className="text-base font-semibold text-[#05243F]">
                        ₦{paymentData.total_amount || paymentData.amount}
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
                    onClick={handleVerifyBankTransfer}
                    disabled={verifying}
                  >
                    {verifying ? "Verifying..." : "I've Made Payment"}
                  </button>
                  {verifyResult && (
                    <div
                      className={`mt-4 text-center text-sm font-semibold ${(verifyResult.data?.status ?? verifyResult.status) ? "text-green-600" : "text-red-600"}`}
                    >
                      {typeof verifyResult === "object" && verifyResult !== null
                        ? verifyResult.data?.message ||
                          verifyResult.message ||
                          "Verification completed"
                        : String(verifyResult)}
                    </div>
                  )}
                  {verifyError && (
                    <div className="mt-4 text-center text-sm font-semibold text-red-600">
                      {typeof verifyError === "string"
                        ? verifyError
                        : String(verifyError)}
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
                      className={`w-full rounded-[10px] border ${
                        touched.month && !isMonthValid
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
                      className={`w-full rounded-[10px] border ${
                        touched.year && !isYearValid
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
                      className={`w-full rounded-[10px] border ${
                        touched.cvv && !isCvvValid
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

          {selectedPayment === "Monicredit_Transfer" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Transfer Method
              </h2>
              {monicreditLoading ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center">
                  <span className="mb-2 animate-pulse text-3xl font-bold text-[#2284DB]">
                    Loading...
                  </span>
                  {/* Optional: Add a spinner below */}
                  <svg
                    className="h-8 w-8 animate-spin text-[#2284DB]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <>
                  {monicreditError && (
                    <div className="mb-4 text-center text-red-500">
                      {typeof monicreditError === "string"
                        ? monicreditError
                        : String(monicreditError)}
                    </div>
                  )}
                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-[#05243F]">
                      How to Complete Your Payment
                    </h3>
                    <ol className="list-inside list-decimal space-y-1 text-base text-[#697C8C]">
                      <li>
                        Click the{" "}
                        <span className="font-semibold text-[#2284DB]">
                          Proceed to Monicredit Payment
                        </span>{" "}
                        button below.
                      </li>
                    </ol>
                    <div className="mt-4 text-sm text-[#F26060]">
                      <span className="font-semibold">Note:</span> Do not close
                      the payment tab until your payment is completed.
                    </div>
                  </div>
                  {monicreditAuthUrl && (
                    <button
                      className="mt-5 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white"
                      onClick={openMonicreditPayment}
                    >
                      Proceed to Monicredit Payment
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {selectedPayment === "Paystack" && (
            <div>
              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">
                Paystack
              </h2>
              {paystackLoading ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center">
                  <span className="mb-2 animate-pulse text-3xl font-bold text-[#2284DB]">
                    Loading...
                  </span>
                </div>
              ) : (
                <>
                  {paystackError && (
                    <div className="mb-4 text-center text-red-500">
                      {typeof paystackError === "string"
                        ? paystackError
                        : String(paystackError)}
                    </div>
                  )}
                  {paystackAuthUrl && (
                    <button
                      className="mt-2 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white"
                      onClick={openPaystackPayment}
                    >
                      Proceed to Paystack Payment
                    </button>
                  )}
                  <div className="mt-4 rounded-[10px] bg-[#F4F5FC] p-4 drop-shadow-xs">
                    <div className="flex gap-3">
                      <span className="text-base font-medium text-[#05243F]">
                        Note:
                      </span>
                      <p className="text-sm font-normal text-[#05243F]/60">
                        After completing Paystack payment, click verify to
                        confirm your payment.
                      </p>
                    </div>
                  </div>
                  <button
                    className="mt-4 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white disabled:opacity-50"
                    onClick={handleVerifyPaystack}
                    disabled={verifying || !paystackReference}
                  >
                    {verifying ? "Verifying..." : "Verify Paystack Payment"}
                  </button>
                  {verifyResult && (
                    <div
                      className={`mt-4 text-center text-sm font-semibold ${(verifyResult.data?.status ?? verifyResult.status) ? "text-green-600" : "text-red-600"}`}
                    >
                      {typeof verifyResult === "object" && verifyResult !== null
                        ? verifyResult.data?.message ||
                          verifyResult.message ||
                          "Verification completed"
                        : String(verifyResult)}
                    </div>
                  )}
                  {verifyError && (
                    <div className="mt-4 text-center text-sm font-semibold text-red-600">
                      {typeof verifyError === "string"
                        ? verifyError
                        : String(verifyError)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedPayment === "paystack" && (
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

                {paymentData && (
                  <div className="rounded-lg bg-gray-50 p-1">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                      Payment Summary
                    </h4>
                    <div className="space-y-1 text-xs text-[#697C8C]">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          ₦
                          {parseFloat(
                            paymentData.amount || paymentData.total_amount || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Paystack Reference:</span>
                        <span className="font-mono text-xs">
                          {paystackReference || "Not initialized"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span>Paystack</span>
                      </div>
                      {paymentData.selectedSchedules &&
                        paymentData.selectedSchedules.length > 1 && (
                          <div className="flex justify-between">
                            <span>Documents:</span>
                            <span className="font-semibold text-blue-600">
                              {paymentData.selectedSchedules.length} items
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
                )}

                {paystackError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                      {typeof paystackError === "string"
                        ? paystackError
                        : String(paystackError)}
                    </p>
                  </div>
                )}

                {!paystackReference ? (
                  <>
                    <button
                      onClick={handlePaystackPayment}
                      disabled={isPaystackInitializing}
                      className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPaystackInitializing ? (
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
