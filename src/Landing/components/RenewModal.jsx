import React, { useState, useEffect, useCallback } from "react";
import { X, ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import AuthSideHero from "../../components/AuthSideHero";
import CarDetailsCard from "../../components/CarDetailsCard";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  getRenewalItems,
  getStates,
  getLGAs,
  initGuestRenewal,
  getGuestOrderStatus,
  verifyGuestOrder,
} from "../../services/apiGuest";

// ─── Step identifiers ─────────────────────────────────────────────────────────
const STEP_INFO     = 1;  // Personal info
const STEP_SERVICES = 2;  // Select services + delivery
const STEP_PAYMENT  = 3;  // Virtual account (Monicredit) or redirect holding (Paystack)

export default function RenewModal({ isOpen, onClose, initialPlateNumber }) {
  const [step, setStep] = useState(STEP_INFO);
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "");

  // ── Step 1 data ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", expiryDate: "", terms: false,
  });

  // ── Step 2 data ─────────────────────────────────────────────────────────────
  const [renewalItems, setRenewalItems]       = useState([]);
  const [itemsLoading, setItemsLoading]       = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState([]);

  const [states, setStates]       = useState([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [lgas, setLgas]           = useState([]);
  const [lgasLoading, setLgasLoading] = useState(false);

  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "", stateCode: "", stateName: "", lgaName: "", contact: "",
  });

  const [paymentGateway, setPaymentGateway] = useState("monicredit");
  const [isSubmitting, setIsSubmitting]     = useState(false);

  // ── Step 3 data ─────────────────────────────────────────────────────────────
  const [guestOrder, setGuestOrder] = useState(null); // { orderId, accountNumber, bankName, accountName, totalAmount }
  const [pollStatus, setPollStatus] = useState("pending_payment");
  const [copied, setCopied]         = useState(null); // "account" | "amount"
  const [isVerifying, setIsVerifying] = useState(false);

  // ── Sync plate number from parent ───────────────────────────────────────────
  useEffect(() => {
    setPlateNumber(initialPlateNumber || "");
  }, [initialPlateNumber]);

  // ── Load renewal items on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setItemsLoading(true);
    getRenewalItems()
      .then((res) => {
        const items = res.data?.data || [];
        setRenewalItems(items);
        // Pre-select all items (mirrors previous behaviour)
        setSelectedItemKeys(items.map((i) => i.id));
      })
      .catch(() => toast.error("Failed to load renewal items"))
      .finally(() => setItemsLoading(false));
  }, [isOpen]);

  // ── Load states on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setStatesLoading(true);
    getStates()
      .then((res) => setStates(res.data?.data || []))
      .catch(() => toast.error("Failed to load states"))
      .finally(() => setStatesLoading(false));
  }, [isOpen]);

  // ── Load LGAs when state changes ────────────────────────────────────────────
  useEffect(() => {
    if (!deliveryDetails.stateCode) { setLgas([]); return; }
    setLgasLoading(true);
    getLGAs(deliveryDetails.stateCode)
      .then((res) => setLgas(res.data?.data || []))
      .catch(() => toast.error("Failed to load local governments"))
      .finally(() => setLgasLoading(false));
  }, [deliveryDetails.stateCode]);

  // ── Poll order status (Monicredit step 3) ───────────────────────────────────
  useEffect(() => {
    if (step !== STEP_PAYMENT || !guestOrder?.orderId) return;
    if (pollStatus === "payment_success" || pollStatus === "payment_failed") return;

    const interval = setInterval(async () => {
      try {
        const res = await getGuestOrderStatus(guestOrder.orderId);
        const status = res.data?.data?.paymentStatus;
        if (status && status !== pollStatus) {
          setPollStatus(status);
          if (status === "payment_success") {
            const receiptToken = res.data?.data?.receiptToken;
            toast.success("Payment confirmed!");
            clearInterval(interval);
            setTimeout(() => {
              window.location.href = `/guest/renewal/receipt?orderId=${guestOrder.orderId}&token=${receiptToken}`;
            }, 1500);
          }
          if (status === "payment_failed") {
            toast.error("Payment failed. Please try again.");
            clearInterval(interval);
          }
        }
      } catch {
        // silent
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [step, guestOrder?.orderId, pollStatus]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
  };

  const handleToggleItem = (key) => {
    setSelectedItemKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const formatPhoneDisplay = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  };

  const handlePhoneChange = (raw, setter) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    setter((prev) => ({ ...prev, contact: digits }));
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied!");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  // ── Computed values ─────────────────────────────────────────────────────────
  const selectedItems  = renewalItems.filter((i) => selectedItemKeys.includes(i.id));
  const renewalAmount  = selectedItems.reduce((sum, i) => sum + (i.price || 0), 0); // kobo

  // Find delivery fee from the selected state
  const selectedState  = states.find((s) => s.state_code === deliveryDetails.stateCode);
  const deliveryFee    = wantsDelivery ? (selectedState?.delivery_fee || 0) : 0;
  const totalAmount    = renewalAmount + deliveryFee;

  const isFormValid = useCallback(() => {
    if (selectedItemKeys.length === 0) return false;
    if (wantsDelivery) {
      return (
        deliveryDetails.address.trim() &&
        deliveryDetails.stateCode &&
        deliveryDetails.lgaName &&
        deliveryDetails.contact.trim()
      );
    }
    return true;
  }, [selectedItemKeys, wantsDelivery, deliveryDetails]);

  // ── Submission ───────────────────────────────────────────────────────────────
  const handleSubmitStep1 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.expiryDate) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!formData.terms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    setStep(STEP_SERVICES);
  };

  const handlePayNow = async () => {
    if (!isFormValid() || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      plate_number: plateNumber.trim().toUpperCase(),
      expiry_date: formData.expiryDate,
      selected_items: selectedItemKeys,
      wants_delivery: wantsDelivery,
      payment_gateway: paymentGateway,
      ...(wantsDelivery && {
        delivery_details: {
          address: deliveryDetails.address.trim(),
          state: deliveryDetails.stateCode,
          lga: deliveryDetails.lgaName,
          contact: deliveryDetails.contact.trim(),
        },
      }),
    };

    try {
      const res = await initGuestRenewal(payload);
      const data = res.data?.data;
      if (!data) throw new Error("Invalid response from server");

      if (paymentGateway === "paystack") {
        // Save orderId so the callback page can poll status
        sessionStorage.setItem("guest_order_id", data.orderId);
        window.location.href = data.paymentUrl;
        return;
      }

      // Monicredit — show virtual account in step 3
      setGuestOrder({
        orderId: data.orderId,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        totalAmount: data.totalAmount, // in Naira
        reference: data.paymentReference,
      });
      setPollStatus("pending_payment");
      setStep(STEP_PAYMENT);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to initialise payment. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyNow = async () => {
    if (!guestOrder?.orderId || isVerifying) return;
    setIsVerifying(true);
    try {
      const res = await verifyGuestOrder(guestOrder.orderId, guestOrder.reference);
      const status = res.data?.data?.status;
      if (status === "payment_success") {
        const receiptToken = res.data?.data?.receiptToken;
        setPollStatus("payment_success");
        toast.success("Payment verified!");
        setTimeout(() => {
          window.location.href = `/guest/renewal/receipt?orderId=${guestOrder.orderId}&token=${receiptToken}`;
        }, 1000);
      } else if (status === "payment_failed") {
        setPollStatus("payment_failed");
        toast.error("Payment was not successful. Please try again.");
      } else {
        toast("Payment not yet confirmed. Please wait a moment and try again.", { icon: "⏳" });
      }
    } catch {
      toast.error("Could not check payment status. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const guestCarDetail = {
    vehicle_model: formData.name ? `${formData.name}'s Vehicle` : "Vehicle",
    plate_number: plateNumber,
    registration_no: plateNumber,
    expiry_date: formData.expiryDate,
    vehicle_make: "Private",
    car_type: "private",
    reminder: null,
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl flex-col md:flex-row max-h-[90vh] md:h-auto text-left overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">

          {/* ── Step 1: Personal info ─────────────────────────────────────── */}
          {step === STEP_INFO && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex w-full flex-col md:flex-row"
            >
              <AuthSideHero text="Motoka Keeps you going." />

              <div className="w-full md:w-1/2 relative">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="w-full overflow-hidden p-1 pb-4 pt-6 sm:p-8 flex flex-col h-full flex-1 justify-center">
                  <div className="animate-slideDown mb-4 flex flex-col space-y-1 sm:mb-2 sm:space-y-1 md:mt-3">
                    <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">Just a sec.</h2>
                    <div className="flex items-center">
                      <span className="text-sm text-[#697B8C]/50 font-normal">
                        Kindly fill in your details. This is a one-time setup
                      </span>
                    </div>
                  </div>

                  <form className="flex flex-col flex-1" onSubmit={handleSubmitStep1}>
                    <div className="space-y-3 sm:space-y-3 flex-1 flex items-center flex-col justify-center">
                      {/* Plate number */}
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="plateNumber"
                          value={plateNumber}
                          readOnly
                          className="peer block w-full rounded-lg bg-[#FFFBEB] px-4 pb-4 pt-7 text-lg text-[#05243F] font-bold shadow-2xs focus:outline-none border-none sm:px-5 placeholder-transparent"
                          placeholder="Your plate no."
                        />
                        <label htmlFor="plateNumber" className="absolute left-4 top-5 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none">
                          Your plate no.*
                        </label>
                      </div>

                      {/* Expiry date */}
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          onFocus={(e) => (e.target.type = "date")}
                          onBlur={(e) => (e.target.type = "text")}
                          className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                          placeholder="Enter last expiry date"
                        />
                        <label htmlFor="expiryDate" className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none">
                          Enter last expiry date*
                        </label>
                      </div>

                      {/* Phone + Name */}
                      <div className="flex gap-3 w-full">
                        <div className="relative w-full">
                          <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                            placeholder="Enter phone no."
                          />
                          <label htmlFor="phone" className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none">
                            Enter phone no.*
                          </label>
                        </div>
                        <div className="relative w-full">
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                            placeholder="Enter full Name"
                          />
                          <label htmlFor="name" className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none">
                            Enter full Name*
                          </label>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="relative w-full">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                          placeholder="Enter your email"
                        />
                        <label htmlFor="email" className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none">
                          Enter your email*
                        </label>
                      </div>

                      {/* Terms */}
                      <div className="flex items-center w-full mt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.terms}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#2389E3] focus:ring-[#2389E3]"
                        />
                        <label htmlFor="terms" className="ml-3 block text-sm text-[#05243F] opacity-40">
                          I confirm that I have entered the correct information and agree with the terms and conditions.
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 w-full">
                      <button
                        type="submit"
                        className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
                      >
                        Proceed
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Services + Delivery ───────────────────────────────── */}
          {step === STEP_SERVICES && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <button
                  onClick={() => setStep(STEP_INFO)}
                  className="absolute left-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
                <h1 className="text-center text-2xl font-medium text-[#05243F] mb-6 pt-3 md:pt-1">
                  Renew License
                </h1>

                <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="absolute top-0 bottom-0 left-1/2 hidden w-[1px] -translate-x-1/2 bg-[#020202]/10 md:block" aria-hidden="true" />

                  {/* Left — Car card + Document selection */}
                  <div className="md:pb-0 md:pr-3">
                    <CarDetailsCard
                      carDetail={guestCarDetail}
                      isRenew={false}
                      reminderObj={null}
                      bg="bg-[linear-gradient(to_bottom_right,#104675_0%,#104675_100%,#E3E3E3_0%,#E3E3E3_100%)]"
                      textColor="text-white"
                    />

                    <div className="my-8 -ml-6 md:-ml-8 -mr-3 border-b border-[#020202]/10" />

                    <div className="mt-6">
                      <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>
                      {itemsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-[#697C8C]">
                          <RefreshCw className="h-4 w-4 animate-spin" /> Loading items…
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          {renewalItems.map((item) => {
                            const isSelected = selectedItemKeys.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleItem(item.id)}
                                className="group relative flex w-full items-center gap-2 rounded-full px-4 py-3 bg-[#F4F5FC] transition-all hover:bg-[#EBEEFA]"
                              >
                                <Icon
                                  icon={isSelected ? "solar:check-square-bold" : "mynaui:square"}
                                  fontSize={22}
                                  color={isSelected ? "#2389E3" : "#9CA3AF"}
                                />
                                <span className={`text-[13px] md:text-sm text-left font-normal truncate transition-colors ${isSelected ? "text-[#05243F]" : "text-[#05243F]/60 group-hover:text-[#05243F]/80"}`}>
                                  {item.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right — Payment details */}
                  <div className="rounded-2xl px-2">
                    <div className="mb-6">
                      <div className="text-base font-normal text-[#697C8C]">Payment Details</div>
                    </div>

                    {/* Renewal amount */}
                    <div className="mb-6">
                      <div className="text-sm font-medium text-[#05243F]">Renewal Amount</div>
                      <div className="mt-3 w-full rounded-[10px] border border-[#F4F5FC] p-4 text-[16px] font-semibold text-[#05243F]/90">
                        {formatCurrency(renewalAmount / 100)}
                      </div>
                    </div>

                    {/* Delivery toggle */}
                    <div className="mb-4">
                      <label className="group flex w-full cursor-pointer items-center gap-3 rounded-full bg-[#F4F5FC] px-6 py-3 transition-all hover:bg-[#FFF4DD]/50">
                        <input
                          type="checkbox"
                          checked={wantsDelivery}
                          onChange={(e) => setWantsDelivery(e.target.checked)}
                          className="sr-only"
                        />
                        <Icon
                          icon={wantsDelivery ? "solar:check-square-bold" : "mynaui:square"}
                          fontSize={24}
                          color={wantsDelivery ? "#2389E3" : "#9CA3AF"}
                        />
                        <div className="flex flex-1 items-center gap-2">
                          <Icon icon="solar:delivery-bold" fontSize={20} className="text-[#697C8C]" />
                          <span className="text-sm font-medium text-[#05243F]">Request Delivery</span>
                        </div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {wantsDelivery && (
                        <motion.div
                          key="delivery-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                          className="overflow-hidden space-y-4 mb-4"
                        >
                          <div>
                            <div className="text-sm font-medium text-[#05243F]">
                              Delivery Address <span className="text-red-500">*</span>
                            </div>
                            <input
                              type="text"
                              value={deliveryDetails.address}
                              onChange={(e) => setDeliveryDetails((p) => ({ ...p, address: e.target.value }))}
                              className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                              placeholder="Enter delivery address"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-[#05243F] mb-2">
                                State <span className="text-red-500">*</span>
                              </div>
                              <select
                                value={deliveryDetails.stateCode}
                                onChange={(e) => {
                                  const code = e.target.value;
                                  const name = states.find((s) => s.state_code === code)?.name || "";
                                  setDeliveryDetails((p) => ({ ...p, stateCode: code, stateName: name, lgaName: "" }));
                                }}
                                disabled={statesLoading}
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50"
                              >
                                <option value="">Select state</option>
                                {states.map((s) => (
                                  <option key={s.state_code} value={s.state_code}>{s.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#05243F] mb-2">
                                Local Government <span className="text-red-500">*</span>
                              </div>
                              <select
                                value={deliveryDetails.lgaName}
                                onChange={(e) => setDeliveryDetails((p) => ({ ...p, lgaName: e.target.value }))}
                                disabled={!deliveryDetails.stateCode || lgasLoading}
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50"
                              >
                                <option value="">Select LGA</option>
                                {lgas.map((lg, i) => (
                                  <option key={i} value={lg.name || lg}>{lg.name || lg}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-[#05243F]">Delivery Fee</div>
                            <div className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F]">
                              {selectedState ? formatCurrency(selectedState.delivery_fee / 100) : "Select a state to see fee"}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-[#05243F] mb-3">
                              Delivery Contact <span className="text-red-500">*</span>
                            </div>
                            <div className="flex items-center gap-3 overflow-hidden rounded-[12px] border border-[#E1E5EE] bg-white focus-within:border-[#2389E3] focus-within:ring-2 focus-within:ring-[#2389E3]/20">
                              <div className="flex shrink-0 items-center gap-2 border-r border-[#E1E5EE] bg-[#F4F5FC] px-4 py-3">
                                <Icon icon="solar:phone-bold" className="text-[#2389E3]" fontSize={20} />
                                <span className="text-sm font-medium text-[#697C8C]">+234</span>
                              </div>
                              <input
                                type="tel"
                                inputMode="numeric"
                                maxLength={14}
                                value={formatPhoneDisplay(deliveryDetails.contact)}
                                onChange={(e) => handlePhoneChange(e.target.value, setDeliveryDetails)}
                                className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                                placeholder="080 1234 5678"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Gateway toggle */}
                    <div className="mb-5">
                      <div className="text-sm font-medium text-[#05243F] mb-2">Payment Method</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "monicredit", label: "Bank Transfer", icon: "solar:transfer-horizontal-bold" },
                          { id: "paystack",   label: "Card / Paystack", icon: "solar:card-bold" },
                        ].map((gw) => (
                          <button
                            key={gw.id}
                            type="button"
                            onClick={() => setPaymentGateway(gw.id)}
                            className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-all border-2 ${
                              paymentGateway === gw.id
                                ? "border-[#2389E3] bg-[#E5F3FF] text-[#2389E3]"
                                : "border-transparent bg-[#F4F5FC] text-[#697C8C] hover:bg-[#EBEEFA]"
                            }`}
                          >
                            <Icon icon={gw.icon} fontSize={18} />
                            {gw.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handlePayNow}
                      disabled={!isFormValid() || isSubmitting}
                      className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Processing…</>
                      ) : (
                        `₦${(totalAmount / 100).toLocaleString()} — Pay Now`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Monicredit virtual account ────────────────────────── */}
          {step === STEP_PAYMENT && guestOrder && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="w-full"
            >
              <div className="p-6 md:p-10">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="max-w-sm mx-auto text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F3FF]">
                    <Icon icon="solar:bank-bold" fontSize={28} className="text-[#2389E3]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#05243F] mb-1">Make Bank Transfer</h2>
                  <p className="text-sm text-[#697C8C] mb-6">
                    Transfer exactly <strong>₦{guestOrder.totalAmount?.toLocaleString()}</strong> to the account below. Your order is confirmed automatically once payment is received.
                  </p>

                  <div className="rounded-2xl border border-[#E1E6F4] bg-[#F9FAFC] p-5 text-left space-y-4 mb-6">
                    {[
                      { label: "Bank", value: guestOrder.bankName },
                      { label: "Account Name", value: guestOrder.accountName },
                      { label: "Account Number", value: guestOrder.accountNumber, copyKey: "account" },
                      { label: "Amount", value: `₦${guestOrder.totalAmount?.toLocaleString()}`, copyKey: "amount" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-[#697C8C]">{row.label}</div>
                          <div className="text-sm font-semibold text-[#05243F]">{row.value || "—"}</div>
                        </div>
                        {row.copyKey && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(row.value, row.copyKey)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F3FF] text-[#2389E3] transition-colors hover:bg-[#2389E3] hover:text-white"
                          >
                            {copied === row.copyKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {pollStatus === "payment_success" ? (
                    <div className="flex items-center justify-center gap-2 rounded-full bg-green-100 py-3 text-sm font-semibold text-green-700">
                      <Icon icon="solar:check-circle-bold" fontSize={18} />
                      Payment confirmed! Redirecting…
                    </div>
                  ) : pollStatus === "payment_failed" ? (
                    <div className="rounded-full bg-red-100 py-3 text-sm font-semibold text-red-700 text-center">
                      Payment failed. Please try again.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyNow}
                      disabled={isVerifying}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isVerifying ? (
                        <><RefreshCw className="h-4 w-4 animate-spin" /> Checking…</>
                      ) : (
                        "I've Made the Transfer"
                      )}
                    </button>
                  )}

                  <p className="mt-4 text-xs text-[#697C8C]">
                    We also check automatically every few seconds. This order expires in 24 hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
