import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import cardValidator from "card-validator";
import { useNavigate, useLocation } from "react-router-dom";
import {
  initiateMonicreditPayment,
} from "../../services/apiMonicredit";
import { verifyPayment as verifyPaymentApi, initializePaystackPayment, verifyPaystackPayment } from "../../services/apiPayment";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  const [selectedPayment, setSelectedPayment] = useState("wallet");

  // Monicredit payment state
  const [monicreditAuthUrl, setMonicreditAuthUrl] = useState("");
  // const [monicreditTransId, setMonicreditTransId] = useState("");
  // const [monicreditStatus, setMonicreditStatus] = useState(null);
  const [monicreditLoading, setMonicreditLoading] = useState(false);
  const [monicreditError, setMonicreditError] = useState("");

  // Paystack payment state
  const [paystackAuthUrl, setPaystackAuthUrl] = useState("");
  const [paystackReference, setPaystackReference] = useState("");
  const [paystackLoading, setPaystackLoading] = useState(false);
  const [paystackError, setPaystackError] = useState("");
+
  const paymentMethods = [
    { id: "wallet", label: "Wallet Balance: N30,876" },
    { id: "transfer", label: "Pay Via Transfer" },
    { id: "card", label: "Pay Via Card" },
    { id: "Monicredit_Transfer", label: "Pay Via Monicredit" },
    { id: "Paystack", label: "Pay Via Paystack" },
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
        if (!authUrl) throw new Error("Missing authorization URL from Paystack init");
        setPaystackAuthUrl(authUrl);
        if (reference) setPaystackReference(reference);
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

 
  const handleVerifyBankTransfer = async () => {
    setVerifying(true);
    setVerifyError("");
    setVerifyResult(null);
    try {
      console.log("transid",paymentData?.transid);
      const reference = paymentData?.transid;
      console.log("reference",reference);
      if (!reference) throw new Error("No payment reference found.");
      const result = await verifyPaymentApi(reference);
      console.log("result",result);
      setVerifyResult(result);
    } catch (err) {
      setVerifyError(err.message || "Failed to verify payment. Please try again.");
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
      const ref = paystackReference || paymentData?.transid;
      if (!ref) throw new Error("No Paystack reference found.");
      const result = await verifyPaystackPayment(ref);
      setVerifyResult(result);
    } catch (err) {
      setVerifyError(err.message || "Failed to verify Paystack payment.");
    } finally {
      setVerifying(false);
    }
  };

  React.useEffect(() => {
    const status = verifyResult?.data?.status ?? verifyResult?.status;
    if (verifyResult && status && (paymentData?.car_id || paymentData?.carDetail?.id)) {
       const timeout = setTimeout(() => {
        const id = paymentData?.car_id || paymentData?.carDetail?.id;
        navigate(`/payment/car-receipt/${id}`);
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
                      ₦{paymentData.total_amount}
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
                        ₦{paymentData.total_amount}
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
                    <div className={`mt-4 text-center text-sm font-semibold ${verifyResult.data?.status ?? verifyResult.status ? "text-green-600" : "text-red-600"}`}>
                      {verifyResult.data?.message || verifyResult.message}
                    </div>
                  )}
                  {verifyError && (
                    <div className="mt-4 text-center text-sm text-red-600 font-semibold">{verifyError}</div>
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
                        Activate Auto renewal to enjoy {" "}
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
                      {monicreditError}
                    </div>
                  )}
                  <div className="mb-6 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-[#05243F]">
                      How to Complete Your Payment
                    </h3>
                    <ol className="list-inside list-decimal space-y-1 text-base text-[#697C8C]">
                      <li>
                        Click the {" "}
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
+
+          {selectedPayment === "Paystack" && (
+            <div>
+              <h2 className="mb-5 text-sm font-normal text-[#697C8C]">Paystack</h2>
+              {paystackLoading ? (
+                <div className="flex min-h-[200px] flex-col items-center justify-center">
+                  <span className="mb-2 animate-pulse text-3xl font-bold text-[#2284DB]">Loading...</span>
+                </div>
+              ) : (
+                <>
+                  {paystackError && (
+                    <div className="mb-4 text-center text-red-500">{paystackError}</div>
+                  )}
+                  {paystackAuthUrl && (
+                    <button
+                      className="mt-2 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white"
+                      onClick={openPaystackPayment}
+                    >
+                      Proceed to Paystack Payment
+                    </button>
+                  )}
+                  <div className="mt-4 rounded-[10px] bg-[#F4F5FC] p-4 drop-shadow-xs">
+                    <div className="flex gap-3">
+                      <span className="text-base font-medium text-[#05243F]">Note:</span>
+                      <p className="text-sm font-normal text-[#05243F]/60">
+                        After completing Paystack payment, click verify to confirm your payment.
+                      </p>
+                    </div>
+                  </div>
+                  <button
+                    className="mt-4 w-full rounded-full bg-[#2284DB] py-3 text-center text-base font-semibold text-white disabled:opacity-50"
+                    onClick={handleVerifyPaystack}
+                    disabled={verifying || !paystackReference}
+                  >
+                    {verifying ? "Verifying..." : "Verify Paystack Payment"}
+                  </button>
+                  {verifyResult && (
+                    <div className={`mt-4 text-center text-sm font-semibold ${verifyResult.data?.status ?? verifyResult.status ? "text-green-600" : "text-red-600"}`}>
+                      {verifyResult.data?.message || verifyResult.message}
+                    </div>
+                  )}
+                  {verifyError && (
+                    <div className="mt-4 text-center text-sm text-red-600 font-semibold">{verifyError}</div>
+                  )}
+                </>
+              )}
+            </div>
+          )}
        </div>
      </div>
    </>
  );
}
