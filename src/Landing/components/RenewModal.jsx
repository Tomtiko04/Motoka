import React, { useState, useEffect } from "react";
import { X, ArrowLeft } from "lucide-react";
import AuthSideHero from "../../components/AuthSideHero";
import CarDetailsCard from "../../components/CarDetailsCard";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatCurrency";

// Hardcoded for guest flow — will add endpoints later
const HARDCODED_DOCS = ["Vehicle License", "Road Worthiness", "Insurance"];
const HARDCODED_AMOUNT_PER_DOC = 15000; // in kobo (15000 = ₦150)
const HARDCODED_DELIVERY_FEE = 5000; // ₦50 in kobo
const HARDCODED_STATES = [
  { id: 1, name: "Lagos" },
  { id: 2, name: "Abuja" },
  { id: 3, name: "Rivers" },
  { id: 4, name: "Kano" },
];
const HARDCODED_LGAS = {
  Lagos: [{ id: 1, name: "Ikeja" }, { id: 2, name: "Lagos Island" }],
  Abuja: [{ id: 1, name: "Abuja Municipal" }, { id: 2, name: "Gwagwalada" }],
  Rivers: [{ id: 1, name: "Port Harcourt" }, { id: 2, name: "Obio-Akpor" }],
  Kano: [{ id: 1, name: "Nassarawa" }, { id: 2, name: "Fagge" }],
};

export default function RenewModal({ isOpen, onClose, initialPlateNumber }) {
  const [step, setStep] = useState(1);
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    expiryDate: "",
    terms: false,
  });

  // Step 2 — renew state (hardcoded)
  const [selectedDocs, setSelectedDocs] = useState(HARDCODED_DOCS);
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    stateName: "",
    lg: "",
    fee: String(HARDCODED_DELIVERY_FEE),
    contact: "",
  });

  useEffect(() => {
    setPlateNumber(initialPlateNumber);
  }, [initialPlateNumber]);

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

  const handleBack = () => setStep(1);

  const handleToggleDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const renewalAmount = selectedDocs.length * HARDCODED_AMOUNT_PER_DOC;
  const totalAmount =
    renewalAmount + (wantsDelivery ? HARDCODED_DELIVERY_FEE : 0);

  const isFormValid = () => {
    if (selectedDocs.length === 0) return false;
    if (wantsDelivery) {
      return (
        deliveryDetails.address.trim() &&
        deliveryDetails.stateName &&
        deliveryDetails.lg &&
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

  const handlePhoneChange = (raw, setter) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    setter((prev) => ({ ...prev, contact: digits }));
  };

  const handlePayNow = () => {
    toast.success("Payment integration coming soon.");
    // TODO: Add endpoint when ready
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

  const lgaOptions = deliveryDetails.stateName
    ? HARDCODED_LGAS[deliveryDetails.stateName] || []
    : [];

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
          ) : (
            <motion.div
              key="step2"
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
                <h1 className="text-center text-2xl font-medium text-[#05243F] mb-6 pt-3 md:pt-1">
                  Renew License
                </h1>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {/* Left — Car card + Document selection */}
                  <div className="border-b border-[#E1E5EE] pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-3">
                    <CarDetailsCard
                      carDetail={guestCarDetail}
                      isRenew={false}
                      reminderObj={null}
                      bg="bg-[linear-gradient(to_bottom_right,#104675_0%,#104675_100%,#E3E3E3_0%,#E3E3E3_100%)]"
                      textColor="text-white"
                    />

                    <div className="mt-6">
                      <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>
                      <div className="flex flex-col gap-3">
                        {HARDCODED_DOCS.map((doc) => {
                          const isSelected = selectedDocs.includes(doc);
                          return (
                            <button
                              key={doc}
                              type="button"
                              onClick={() => handleToggleDoc(doc)}
                              className={`group relative flex w-full items-center gap-3 rounded-full px-6 py-3 transition-all ${
                                isSelected
                                  ? "bg-[#F4F5FC] hover:bg-[#EBEEFA]"
                                  : "bg-[#F4F5FC] hover:bg-[#EBEEFA]"
                              }`}
                            >
                              <div
                                className={`flex shrink-0 items-center justify-center transition-colors ${
                                  isSelected ? "text-[#05243F]" : "text-[#9CA3AF] group-hover:text-[#697C8C]"
                                }`}
                              >
                                <Icon
                                  icon={isSelected ? "solar:check-square-bold" : "mynaui:square"}
                                  fontSize={24}
                                  color={isSelected ? "#2389E3" : "#9CA3AF"}
                                />
                              </div>
                              <span
                                className={`text-sm md:text-base font-normal transition-colors ${
                                  isSelected ? "text-[#05243F]" : "text-[#05243F]/60 group-hover:text-[#05243F]/80"
                                }`}
                              >
                                {doc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
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
                                value={deliveryDetails.stateName}
                                onChange={(e) =>
                                  setDeliveryDetails((p) => ({
                                    ...p,
                                    stateName: e.target.value,
                                    lg: "",
                                  }))
                                }
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                              >
                                <option value="">Select state</option>
                                {HARDCODED_STATES.map((s) => (
                                  <option key={s.id} value={s.name}>
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
                                value={deliveryDetails.lg}
                                onChange={(e) =>
                                  setDeliveryDetails((p) => ({ ...p, lg: e.target.value }))
                                }
                                disabled={!deliveryDetails.stateName}
                                className="mt-2 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50"
                              >
                                <option value="">Select LG</option>
                                {lgaOptions.map((lg) => (
                                  <option key={lg.id} value={lg.name}>
                                    {lg.name}
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
                              value={formatCurrency(HARDCODED_DELIVERY_FEE / 100)}
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
                                onChange={(e) =>
                                  handlePhoneChange(e.target.value, setDeliveryDetails)
                                }
                                className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                                placeholder="080 1234 5678"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handlePayNow}
                      disabled={!isFormValid()}
                      className="mt-6 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50"
                    >
                      ₦{(totalAmount / 100).toLocaleString()} Pay Now
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
