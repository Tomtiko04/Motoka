import React, { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import AuthSideHero from "../../components/AuthSideHero";
import CarDetailsCard from "../../components/CarDetailsCard";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatCurrency";
import { fetchRenewalItems, fetchStates, fetchLGAs, initGuestRenewal } from "../../services/apiGuest";
import { useNavigate } from "react-router-dom";

export default function RenewModal({ isOpen, onClose, initialPlateNumber }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    expiryDate: "",
    terms: false,
  });

  // Step 2 — renewal state (loaded from backend)
  const [renewalItems, setRenewalItems] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectAllDocs, setSelectAllDocs] = useState(true);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    stateCode: "",
    stateName: "",
    lga: "",
    contact: "",
    fee: 0,
  });

  // Step 3 — gateway selection
  const [selectedGateway, setSelectedGateway] = useState("monicredit");

  // Location data (loaded from backend)
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Sync plate number from parent ────────────────────────────────────────
  useEffect(() => {
    setPlateNumber(initialPlateNumber || "");
  }, [initialPlateNumber]);
  // ── Reset to step 1 when modal closes so it starts fresh on next open ────
  useEffect(() => {
    if (!isOpen) setStep(1);
  }, [isOpen]);
  // ── Load renewal items when reaching step 2 ──────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    setLoadingItems(true);
    fetchRenewalItems()
      .then((items) => {
        setRenewalItems(items);
        // Pre-select all items by default (Select All)
        const allIds = items.map((i) => i.id);
        setSelectedDocs(allIds);
        setSelectAllDocs(true);
      })
      .catch(() => toast.error("Failed to load renewal options"))
      .finally(() => setLoadingItems(false));
  }, [step]);

  // ── Load states when delivery checkbox is ticked ─────────────────────────
  useEffect(() => {
    if (!wantsDelivery || states.length > 0) return;
    setLoadingStates(true);
    fetchStates()
      .then(setStates)
      .catch(() => toast.error("Failed to load states"))
      .finally(() => setLoadingStates(false));
  }, [wantsDelivery]);

  // ── Load LGAs when a state is selected ───────────────────────────────────
  useEffect(() => {
    if (!deliveryDetails.stateCode) { setLgas([]); return; }
    setLoadingLgas(true);
    fetchLGAs(deliveryDetails.stateCode)
      .then(setLgas)
      .catch(() => toast.error("Failed to load local governments"))
      .finally(() => setLoadingLgas(false));
  }, [deliveryDetails.stateCode]);

  // ── Pricing calculation ───────────────────────────────────────────────────
  const renewalAmount = renewalItems
    .filter((i) => selectedDocs.includes(i.id))
    .reduce((sum, i) => sum + (i.price || 0), 0);

  const totalAmount = renewalAmount + (wantsDelivery ? (deliveryDetails.fee || 0) : 0);

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

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
    setStep(2);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleToggleDoc = (docId) => {
    const item = renewalItems.find((i) => i.id === docId);
    if (item?.required) return; // required items can't be deselected
    setSelectedDocs((prev) => {
      const next = prev.includes(docId)
        ? prev.filter((d) => d !== docId)
        : [...prev, docId];

      // Keep select-all state in sync: true only when every non-required
      // item is selected.
      const nonRequiredIds = renewalItems.filter((i) => !i.required).map((i) => i.id);
      const allNonRequiredSelected =
        nonRequiredIds.length > 0 &&
        nonRequiredIds.every((id) => next.includes(id));
      setSelectAllDocs(allNonRequiredSelected);

      return next;
    });
  };

  const handleToggleAllDocs = () => {
    if (!renewalItems.length) return;
    if (selectAllDocs) {
      // Deselect all optional docs, keep required ones checked
      const requiredIds = renewalItems.filter((i) => i.required).map((i) => i.id);
      setSelectedDocs(requiredIds);
      setSelectAllDocs(false);
    } else {
      // Select every document
      const allIds = renewalItems.map((i) => i.id);
      setSelectedDocs(allIds);
      setSelectAllDocs(true);
    }
  };

  const handleStateChange = (e) => {
    const selected = states.find((s) => s.code === e.target.value);
    setDeliveryDetails((p) => ({
      ...p,
      stateCode: selected?.code || "",
      stateName: selected?.name || "",
      lga: "",
      fee: selected?.delivery_fee || 0,
    }));
  };

  const isFormValid = () => {
    if (selectedDocs.length === 0) return false;
    if (wantsDelivery) {
      return (
        deliveryDetails.address.trim() &&
        deliveryDetails.stateCode &&
        deliveryDetails.lga &&
        deliveryDetails.contact.trim()
      );
    }
    return true;
  };

  const formatPhoneDisplay = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  };

  const handlePhoneChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    setDeliveryDetails((prev) => ({ ...prev, contact: digits }));
  };

  // ── Step 2 → Step 3: advance to gateway selection ────────────────────────
  const handleProceedToPayment = () => {
    if (!isFormValid()) return;
    setStep(3);
  };

  // ── Step 3: confirm and call the API ─────────────────────────────────────
  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      const result = await initGuestRenewal({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        plate_number: plateNumber.replace(/\s+/g, "").toUpperCase(),
        expiry_date: formData.expiryDate,
        selected_items: selectedDocs,
        wants_delivery: wantsDelivery,
        delivery_details: wantsDelivery
          ? {
              address: deliveryDetails.address,
              state: deliveryDetails.stateCode,
              lga: deliveryDetails.lga,
              contact: deliveryDetails.contact,
            }
          : null,
        payment_gateway: selectedGateway,
      });

      sessionStorage.setItem("guestOrderId", result.orderId);

      if (result.paymentUrl) {
        // Paystack — redirect to hosted checkout
        window.location.href = result.paymentUrl;
      } else if (result.accountNumber) {
        // MoniCredit bank transfer — persist bank details to sessionStorage so
        // the callback page can recover them if the user navigates back
        sessionStorage.setItem("guestBankDetails", JSON.stringify({
          accountNumber: result.accountNumber,
          bankName: result.bankName,
          accountName: result.accountName,
          totalAmount: result.totalAmount,
        }));
        navigate(`/guest/renewal/callback?orderId=${result.orderId}&gateway=monicredit`);
      } else {
        toast.error("Payment could not be initialized. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to initialize payment";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Guest car detail for CarDetailsCard
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
          {step === 1 ? (
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
                    <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">
                      Just a sec.
                    </h2>
                    <div className="flex items-center">
                      <span className="text-sm text-[#697B8C]/50 font-normal">
                        Kindly fill in your details. This is a one-time setup
                      </span>
                    </div>
                  </div>

                  <form className="flex flex-col flex-1" onSubmit={handleSubmitStep1}>
                    <div className="space-y-3 sm:space-y-3 flex-1 flex items-center flex-col justify-center">
                      <div className="relative w-full">
                        <input
                          type="text"
                          id="plateNumber"
                          value={plateNumber}
                          readOnly
                          className="peer block w-full rounded-lg bg-[#FFFBEB] px-4 pb-4 pt-7 text-lg text-[#05243F] font-bold shadow-2xs focus:outline-none border-none sm:px-5 placeholder-transparent"
                          placeholder="Your plate no."
                        />
                        <label
                          htmlFor="plateNumber"
                          className="absolute left-4 top-5 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                        >
                          Your plate no.*
                        </label>
                      </div>

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
                        <label
                          htmlFor="expiryDate"
                          className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                        >
                          Enter last expiry date*
                        </label>
                      </div>

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
                          <label
                            htmlFor="phone"
                            className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                          >
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
                          <label
                            htmlFor="name"
                            className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                          >
                            Enter full Name*
                          </label>
                        </div>
                      </div>

                      <div className="relative w-full">
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                          placeholder="Enter your email"
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                        >
                          Enter your email*
                        </label>
                      </div>

                      <div className="flex items-center w-full mt-2">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={formData.terms}
                          onChange={handleChange}
                          className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#2389E3] focus:ring-[#2389E3]"
                        />
                        <label htmlFor="terms" className="ml-3 block text-sm text-[#05243F] opacity-40">
                          I confirm that i have entered the correct information and agree with the terms and conditions.
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 w-full">
                      <button
                        type="submit"
                        className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95"
                      >
                        Proceed
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          ) : step === 3 ? (
            /* ── Step 3: Payment method selection ─────────────────────────── */
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full overflow-y-auto"
            >
              <div className="p-6 md:p-8 relative">
                <button
                  onClick={handleBack}
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

                <h1 className="text-center text-2xl font-medium text-[#05243F] mb-2 pt-3 md:pt-1">
                  Payment Options
                </h1>
                <p className="text-center text-sm text-[#697C8C] mb-8">
                  Total: <span className="font-semibold text-[#05243F]">₦{(totalAmount / 100).toLocaleString()}</span>
                </p>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto_1fr] items-start max-w-2xl mx-auto">
                  {/* Left — method selector */}
                  <div className="space-y-3">
                    {[
                      { id: "monicredit", label: "Pay Via MoniCredit", sub: "Bank transfer — virtual account" },
                      { id: "paystack", label: "Pay Via Paystack", sub: "Card, bank or mobile money" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedGateway(m.id)}
                        className={`w-full rounded-[10px] bg-[#F4F5FC] p-4 text-left transition-all ${
                          selectedGateway === m.id
                            ? "shadow-sm ring-1 ring-[#2389E3]"
                            : "hover:bg-[#FDF6E8] hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-sm ${selectedGateway === m.id ? "font-semibold text-[#05243F]" : "font-normal text-[#05243F]/40"}`}>
                              {m.label}
                            </span>
                            <p className={`text-xs mt-0.5 ${selectedGateway === m.id ? "text-[#697C8C]" : "text-[#05243F]/30"}`}>{m.sub}</p>
                          </div>
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#2389E3]">
                            {selectedGateway === m.id && <div className="h-2 w-2 rounded-full bg-[#2389E3]" />}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="hidden h-full w-px bg-[#F4F5FC] md:block" />

                  {/* Right — detail panel */}
                  <div className="space-y-4">
                    {selectedGateway === "monicredit" ? (
                      <div className="rounded-[20px] border border-[#697B8C]/11 px-6 py-5 space-y-3">
                        <p className="text-sm text-[#697C8C]">Bank Transfer Details</p>
                        <p className="text-xs text-[#05243F]/60">
                          Click confirm below. We'll generate a dedicated virtual account number for this transaction. Transfer the exact amount to complete your renewal.
                        </p>
                        <div className="rounded-[10px] bg-[#F4F5FC] p-3">
                          <p className="text-xs text-[#697C8C]">
                            <span className="font-medium text-[#05243F]">Note:</span> Account expires in 30 mins. After payment, you'll be redirected to a status page.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-[20px] border border-[#697B8C]/11 px-6 py-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">💳</span>
                          <div>
                            <p className="text-sm font-semibold text-[#05243F]">Secure Payment</p>
                            <p className="text-xs text-[#697C8C]">Pay with card, bank transfer, or mobile money</p>
                          </div>
                        </div>
                        <div className="rounded-[10px] bg-gray-50 p-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#697C8C]">Amount:</span>
                            <span className="font-semibold text-[#05243F]">₦{(totalAmount / 100).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#697C8C]">Gateway:</span>
                            <span className="text-[#05243F]">Paystack</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#697C8C]">You will be redirected to Paystack's secure checkout page.</p>
                      </div>
                    )}

                    <button
                      onClick={handleConfirmPayment}
                      disabled={submitting}
                      className="w-full rounded-full bg-[#2284DB] py-3 text-base font-semibold text-white transition-all hover:bg-[#1B6CB3] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Initializing...
                        </>
                      ) : (
                        "Confirm Payment Method"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <button
                  onClick={handleBack}
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
                  <div className="absolute top-0 bottom-0 left-1/2 hidden w-[1px] -translate-x-1/2 bg-[#020202]/10 md:block" aria-hidden="true"></div>
                  {/* Left — Car card + Document selection */}
                  <div className="md:pb-0 md:pr-3">
                    <CarDetailsCard
                      carDetail={guestCarDetail}
                      isRenew={false}
                      reminderObj={null}
                      bg="bg-[linear-gradient(to_bottom_right,#104675_0%,#104675_100%,#E3E3E3_0%,#E3E3E3_100%)]"
                      textColor="text-white"
                    />

                    {/* Divider */}
                    <div className="my-8 -ml-6 md:-ml-8 -mr-3 border-b border-[#020202]/10"></div>

                    <div className="mt-6">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-sm text-[#697C8C]">Document Details</h3>
                        {renewalItems.length > 0 && (
                          <button
                            type="button"
                            onClick={handleToggleAllDocs}
                            className="flex items-center gap-2 rounded-full border border-[#E1E5EE] px-3 py-1 text-xs font-medium text-[#05243F]/70 hover:bg-[#F4F5FC] transition-colors"
                          >
                            <span
                              className={`inline-flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                                selectAllDocs ? "border-[#2389E3] bg-[#2389E3]" : "border-[#CBD5E1] bg-white"
                              }`}
                            >
                              {selectAllDocs && (
                                <Icon icon="solar:check-bold" className="text-white" fontSize={10} />
                              )}
                            </span>
                            <span>Select all</span>
                          </button>
                        )}
                      </div>
                      {loadingItems ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {renewalItems.map((item) => {
                            const isSelected = selectedDocs.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleToggleDoc(item.id)}
                                className="group relative flex w-full items-center gap-3 rounded-full px-6 py-3 transition-all bg-[#F4F5FC] hover:bg-[#EBEEFA]"
                              >
                                <div className="flex shrink-0 items-center justify-center transition-colors">
                                  <Icon
                                    icon={isSelected ? "solar:check-square-bold" : "mynaui:square"}
                                    fontSize={24}
                                    color={isSelected ? "#2389E3" : "#9CA3AF"}
                                  />
                                </div>
                                <span className={`text-sm md:text-base font-normal transition-colors flex-1 text-left ${isSelected ? "text-[#05243F]" : "text-[#05243F]/60 group-hover:text-[#05243F]/80"}`}>
                                  {item.name}
                                  {item.required && (
                                    <span className="ml-2 text-xs text-[#2389E3] font-medium">(Required)</span>
                                  )}
                                </span>
                                <span className="text-xs text-[#697C8C]">
                                  {formatCurrency(item.price / 100)}
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
                      <div className="text-base font-normal text-[#697C8C]">
                        Payment Details
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="text-sm font-medium text-[#05243F]">
                        Renewal Amount
                      </div>
                      <div className="mt-3 w-full rounded-[10px] border border-[#F4F5FC] p-4 text-[16px] font-semibold text-[#05243F]/90">
                        {formatCurrency(renewalAmount / 100)}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="group flex w-full cursor-pointer items-center gap-3 rounded-full bg-[#F4F5FC] px-6 py-3 transition-all hover:bg-[#FFF4DD]/50">
                        <input
                          type="checkbox"
                          checked={wantsDelivery}
                          onChange={(e) => setWantsDelivery(e.target.checked)}
                          className="sr-only"
                        />
                        <div className="flex shrink-0 items-center justify-center">
                          <Icon
                            icon={wantsDelivery ? "solar:check-square-bold" : "mynaui:square"}
                            fontSize={24}
                            color={wantsDelivery ? "#2389E3" : "#9CA3AF"}
                          />
                        </div>
                        <div className="flex flex-1 items-center gap-2">
                          <Icon icon="solar:delivery-bold" fontSize={20} className="text-[#697C8C]" />
                          <span className="text-sm font-medium text-[#05243F]">
                            Request Delivery
                          </span>
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
                          className="overflow-hidden space-y-4"
                        >
                          <div>
                            <div className="text-sm font-medium text-[#05243F]">
                              Delivery Address <span className="text-red-500">*</span>
                            </div>
                            <input
                              type="text"
                              value={deliveryDetails.address}
                              onChange={(e) =>
                                setDeliveryDetails((p) => ({ ...p, address: e.target.value }))
                              }
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
                                onChange={handleStateChange}
                                disabled={loadingStates}
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50"
                              >
                                <option value="">{loadingStates ? "Loading..." : "Select state"}</option>
                                {states.map((s) => (
                                  <option key={s.code} value={s.code}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#05243F] mb-2">
                                Local Government <span className="text-red-500">*</span>
                              </div>
                              <select
                                value={deliveryDetails.lga}
                                onChange={(e) =>
                                  setDeliveryDetails((p) => ({ ...p, lga: e.target.value }))
                                }
                                disabled={!deliveryDetails.stateCode || loadingLgas}
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50"
                              >
                                <option value="">
                                  {loadingLgas ? "Loading..." : "Select LG"}
                                </option>
                                {lgas.map((lgaName) => (
                                  <option key={lgaName} value={lgaName}>
                                    {lgaName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-[#05243F]">
                              Delivery Fee <span className="text-red-500">*</span>
                            </div>
                            <input
                              readOnly
                              type="text"
                              value={deliveryDetails.stateCode
                                ? formatCurrency(deliveryDetails.fee / 100)
                                : "Select a state first"}
                              className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none"
                            />
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
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                                placeholder="080 1234 5678"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleProceedToPayment}
                      disabled={!isFormValid()}
                      className="mt-6 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {`₦${(totalAmount / 100).toLocaleString()} — Choose Payment`}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
