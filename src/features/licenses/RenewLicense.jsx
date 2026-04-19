import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetState, useGetLocalGovernment } from "./useRenew";
import { useInitializePayment } from "./usePayment";
import { PAYMENT_TYPES } from "../payment/config/paymentTypes";
import { fetchPaymentHeads, fetchPaymentSchedules } from "../../services/apiMonicredit";
import { checkExistingPayments } from "../../services/apiPayment";
import { updateProfile } from "../../services/apiProfile";
import { FaArrowLeft, FaCarAlt } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import CarDetailsCard from "../../components/CarDetailsCard";
import SearchableSelect from "../../components/shared/SearchableSelect";
import PartialRenewalPromptModal from "../../components/shared/PartialRenewalPromptModal";
import { saveDeferredReminders } from "../../services/apiDeferredReminders";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export default function RenewLicense() {
  const navigate = useNavigate();
  const location = useLocation();
  const carDetail = location?.state?.carDetail;
  const getCarReminder = (carId) => carDetail?.reminder || null;

  // Payment data
  const [paymentHeads, setPaymentHeads] = useState([]);
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]); // array of payment schedule objects
  const [existingPayments, setExistingPayments] = useState([]);
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false);

  // Delivery checkbox state
  const [wantsDelivery, setWantsDelivery] = useState(false);

  // Delivery details
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    lg: "",
    state: "",          // State code for backend
    stateName: "",      // State name for display
    fee: "0",
    contact: "",
    amount: "0",
  });

  // State of renewal (which state processes the renewal) — defaults to Ogun
  const [renewalState, setRenewalState] = useState("Ogun");

  // LGA options for the selected state
  const [lgaOptions, setLgaOptions] = useState([]);

  const { data: state, isPending: isGettingState } = useGetState();
  const {
    mutate: fetchLGAs,
    data: lgaData,
    isPending: isGettingLG,
  } = useGetLocalGovernment();
  const {
    startPayment,
    isPaymentInitializing,
    data: paymentInitData,
    error: paymentInitError,
    reset: resetPaymentInit,
  } = useInitializePayment();

  // Detect Monicredit "missing phone" error — show inline phone collector
  const monicreditPhoneError = paymentInitError &&
    (paymentInitError.response?.data?.message || paymentInitError.message || "")
      .toLowerCase().includes("phone")
    ? (paymentInitError.response?.data?.message || paymentInitError.message)
    : null;

  const [inlinePhone, setInlinePhone] = useState("");
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneStep, setPhoneStep] = useState(""); // "saving" | "initializing"
  const [showPartialPrompt, setShowPartialPrompt] = useState(false);
  const [pendingPaymentPayload, setPendingPaymentPayload] = useState(null);
  const [pendingSkippedDocs, setPendingSkippedDocs] = useState([]);

  const isState = state?.data;

  // Fetch payment heads and schedules on mount
  // Fetch payment heads and schedules on mount
  useEffect(() => {
    async function fetchData() {
      setLoadingPayments(true);
      try {
        const [heads, schedules] = await Promise.all([
          fetchPaymentHeads(),
          fetchPaymentSchedules(),
        ]);

        const headsArr = Array.isArray(heads) ? heads : [];
        const schedulesArr = Array.isArray(schedules) ? schedules : [];

        const filteredHeads =
          carDetail?.car_type === "private" ||
          carDetail?.car_type === "government"
            ? headsArr.filter((h) => h.payment_head_name !== "Hackney Permit")
            : headsArr;

        setPaymentHeads(filteredHeads);

        const filteredSchedules =
          carDetail?.car_type === "private" ||
          carDetail?.car_type === "government"
            ? schedulesArr.filter(
                (s) => s.payment_head?.payment_head_name !== "Hackney Permit",
              )
            : schedulesArr;

        setPaymentSchedules(filteredSchedules);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setPaymentHeads([]);
        setPaymentSchedules([]);
      } finally {
        setLoadingPayments(false);
      }
    }
    fetchData();
  }, [carDetail?.car_type]);

  // Default-select all document types when payment heads load
  useEffect(() => {
    if (paymentHeads?.length && selectedDocs.length === 0) {
      const validDocs = paymentHeads.map((h) => h.payment_head_name);

      const filteredDocs =
        carDetail?.car_type === "private" ||
        carDetail?.car_type === "government"
          ? validDocs.filter((d) => d !== "Hackney Permit")
          : validDocs;

      setSelectedDocs(filteredDocs);
    }
  }, [paymentHeads, selectedDocs.length, carDetail?.car_type]);

  // When selectedDocs changes, update selectedSchedules and amount
  useEffect(() => {
    // Find payment schedules for selected docs
    const selected = paymentSchedules.filter((sch) =>
      selectedDocs.includes(sch.payment_head?.payment_head_name),
    );
    setSelectedSchedules(selected);
  }, [selectedDocs, paymentSchedules]);

  // Update amount based on available schedules (excluding already paid ones)
  useEffect(() => {
    // Calculate available schedules (excluding already paid ones)
    let availableSchedules = selectedSchedules;
    if (existingPayments.length > 0) {
      const existingPaymentHeadNames = existingPayments.map(
        (p) => p.payment_head_name,
      );
      availableSchedules = selectedSchedules.filter(
        (schedule) =>
          !existingPaymentHeadNames.includes(
            schedule.payment_head?.payment_head_name,
          ),
      );
    }

    const total = availableSchedules.reduce(
      (sum, sch) => sum + Number(sch.amount),
      0,
    );
    setDeliveryDetails((prev) => ({ ...prev, amount: total }));
  }, [selectedSchedules, existingPayments]);

  // Check for existing payments when selectedSchedules changes
  useEffect(() => {
    if (selectedSchedules.length > 0 && carDetail?.slug) {
      checkForExistingPayments();
    }
  }, [selectedSchedules, carDetail?.slug]);

  // Format phone for display: 08012345678 → 080 1234 5678
  const formatPhoneDisplay = (raw) => {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
  };
  const handlePhoneChange = (raw, onDigits) => {
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    onDigits(digits);
  };

  const checkForExistingPayments = async () => {
    if (selectedSchedules.length === 0) return;

    setDuplicateCheckLoading(true);
    try {
      const paymentScheduleIds = selectedSchedules.map((schedule) => schedule.id);
      const result = await checkExistingPayments(carDetail.slug, paymentScheduleIds);
      if (result.status) {
        setExistingPayments(result.data.existing_payments || []);
      }
    } catch (error) {
      console.error("Error checking existing payments:", error);
    } finally {
      setDuplicateCheckLoading(false);
    }
  };

  // Update lgaOptions when lgaData changes
  useEffect(() => {
    if (lgaData && lgaData.data) {
      setLgaOptions(lgaData.data);
    } else {
      setLgaOptions([]);
    }
  }, [lgaData]);

  // Document options from payment heads
  const docOptions = (Array.isArray(paymentHeads) ? paymentHeads : []).map((h) => h.payment_head_name);

  const handleToggleDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc],
    );
  };

  const isFormValid = () => {
    // Basic validation: require selected schedules, available schedules, and renewal state
    const hasValidSchedules =
      selectedSchedules.length > 0 &&
      getAvailableSchedules().length > 0; // Has available (unpaid) schedules

    if (!renewalState) return false;

    // If user wants delivery, all delivery fields must be filled
    if (wantsDelivery) {
      const hasCompleteDeliveryDetails =
        deliveryDetails.address.trim() !== "" &&
        deliveryDetails.state.trim() !== "" &&
        deliveryDetails.lg.trim() !== "" &&
        deliveryDetails.contact.trim() !== "";

      return hasValidSchedules && hasCompleteDeliveryDetails;
    }

    // If delivery is not wanted, only validate schedules
    return hasValidSchedules;
  };

  const getAvailableSchedules = () => {
    if (existingPayments.length === 0) return selectedSchedules;

    const existingPaymentHeadNames = existingPayments.map(
      (p) => p.payment_head_name,
    );
    return selectedSchedules.filter(
      (schedule) =>
        !existingPaymentHeadNames.includes(
          schedule.payment_head?.payment_head_name,
        ),
    );
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle delivery checkbox change
  const handleDeliveryCheckboxChange = (e) => {
    const checked = e.target.checked;
    setWantsDelivery(checked);
    
    // Clear delivery details when unchecked
    if (!checked) {
      setDeliveryDetails({
        address: "",
        lg: "",
        state: "",
        stateName: "",
        fee: "0",
        contact: "",
        amount: deliveryDetails.amount, // Keep amount as it's not part of delivery
      });
      setLgaOptions([]);
    }
  };

  // When state changes, fetch LGAs for that state
  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;
    // Find state
    const selectedState = isState?.find(
      (s) => s.state_name === selectedStateName,
    );
    if (selectedState) {
      // Save BOTH state code (for backend) and name (for display)
      setDeliveryDetails((prev) => ({
        ...prev,
        state: selectedState.code,           // Backend needs code
        stateName: selectedStateName,        // Display needs name
        lg: "",
        fee: selectedState.delivery_fee || "0",
      }));
      // Fetch LGAs using state code
      fetchLGAs(selectedState.code);
    } else {
      setDeliveryDetails((prev) => ({
        ...prev,
        state: "",
        stateName: "",
        lg: "",
        fee: "0",
      }));
      setLgaOptions([]);
    }
  };

  // When LGA changes, just update the LGA (fee is already set from state)
  const handleLgaChange = (e) => {
    const selectedLgaName = e.target.value;
    handleDeliveryChange("lg", selectedLgaName);
    // Note: Delivery fee is per state, not per LGA, so no need to update it here
  };

  // Helper function to get state_id and lga_id
  const getStateId = () => {
    if (!deliveryDetails.state || !isState) return null;
    const selectedState = isState.find(
      (s) => s.state_name === deliveryDetails.state,
    );
    return selectedState?.id || null;
  };

  const getLgaId = () => {
    if (!deliveryDetails.lg || !lgaOptions) return null;
    const selectedLga = lgaOptions.find(
      (l) => l.lga_name === deliveryDetails.lg,
    );
    return selectedLga?.id || null;
  };

  // Payment logic
  const handlePayNow = async () => {
    if (!isFormValid()) {
      return;
    }

    // Get only available schedules (no duplicates)
    const availableSchedules = getAvailableSchedules();

    if (availableSchedules.length === 0) {
      alert(
        "All selected document types have already been paid for. Please select different documents.",
      );
      return;
    }

    // Create payload for bulk payment (supports multiple schedules)
    // Note: payment_gateway defaults to 'monicredit' in apiPayment.js
    // Users can change to Paystack in PaymentOptions.jsx after navigation
    const paymentPayload = {
      car_slug: carDetail?.slug,
      payment_schedule_id: availableSchedules.map((schedule) => schedule.id), // Array for bulk payments
      renewal_state: renewalState || undefined,
      // payment_gateway will default to 'monicredit' via apiPayment.js
      // Users can select Paystack in PaymentOptions page
      // Delivery details are optional for license renewal - only include if provided
      ...(deliveryDetails.address.trim() !== "" ||
          deliveryDetails.contact.trim() !== "" ||
          deliveryDetails.state.trim() !== "" ||
          deliveryDetails.lg.trim() !== "" ? {
        delivery_details: {
          ...(deliveryDetails.address.trim() !== "" && { address: deliveryDetails.address }),
          ...(deliveryDetails.contact.trim() !== "" && { contact: deliveryDetails.contact }),
          ...(deliveryDetails.state.trim() !== "" && { state: deliveryDetails.state }),
          ...(deliveryDetails.lg.trim() !== "" && { lga: deliveryDetails.lg }),
        },
      } : {}),
    };

    const unpaidDocs = docOptions.filter(
      (doc) => !existingPayments.some((p) => p.payment_head_name === doc),
    );
    const skippedDocs = unpaidDocs.filter((doc) => !selectedDocs.includes(doc));

    if (skippedDocs.length > 0) {
      setPendingPaymentPayload(paymentPayload);
      setPendingSkippedDocs(skippedDocs);
      setShowPartialPrompt(true);
      return;
    }

    // Initialize payment for all selected schedules
    if (paymentPayload.payment_schedule_id.length > 0) {
      startPayment(paymentPayload);
    }
  };

  const persistDeferred = async (reminders) => {
    if (!carDetail?.slug || !Array.isArray(reminders) || reminders.length === 0) return;
    try {
      await saveDeferredReminders({
        car_slug: carDetail.slug,
        reminders,
      });
    } catch (error) {
      toast.error("Could not save reminder preferences. Continuing to payment.");
    }
  };

  const handleSkipPartialPrompt = async () => {
    const reminders = pendingSkippedDocs.map((documentName) => ({
      document_name: documentName,
      reason: "skipped",
      expiry_date: null,
      custom_reason: null,
    }));
    await persistDeferred(reminders);
    setShowPartialPrompt(false);
    if (pendingPaymentPayload?.payment_schedule_id?.length > 0) {
      startPayment(pendingPaymentPayload);
    }
  };

  const handleConfirmPartialPrompt = async (reminders) => {
    await persistDeferred(reminders);
    setShowPartialPrompt(false);
    if (pendingPaymentPayload?.payment_schedule_id?.length > 0) {
      startPayment(pendingPaymentPayload);
    }
  };

  // When Monicredit fails due to missing phone, user can switch to Paystack
  const handlePayWithPaystack = () => {
    if (!isFormValid()) return;
    const availableSchedules = getAvailableSchedules();
    if (availableSchedules.length === 0) return;
    resetPaymentInit();
    const paymentPayload = {
      car_slug: carDetail?.slug,
      payment_schedule_id: availableSchedules.map((s) => s.id),
      payment_gateway: 'paystack',
      renewal_state: renewalState || undefined,
      ...(deliveryDetails.address.trim() !== "" ||
          deliveryDetails.contact.trim() !== "" ||
          deliveryDetails.state.trim() !== "" ||
          deliveryDetails.lg.trim() !== "" ? {
        delivery_details: {
          ...(deliveryDetails.address.trim() !== "" && { address: deliveryDetails.address }),
          ...(deliveryDetails.contact.trim() !== "" && { contact: deliveryDetails.contact }),
          ...(deliveryDetails.state.trim() !== "" && { state: deliveryDetails.state }),
          ...(deliveryDetails.lg.trim() !== "" && { lga: deliveryDetails.lg }),
        },
      } : {}),
    };
    startPayment(paymentPayload);
  };

  // Save phone to profile then retry Monicredit — no Settings round-trip needed
  const handleSavePhoneAndRetry = async () => {
    const phone = inlinePhone.trim();
    if (!phone || phone.length < 7) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setIsSavingPhone(true);
    setPhoneStep("saving");
    try {
      await updateProfile({ phone_number: phone });
      setPhoneStep("initializing");
      resetPaymentInit();
      const availableSchedules = getAvailableSchedules();
      const paymentPayload = {
        car_slug: carDetail?.slug,
        payment_schedule_id: availableSchedules.map((s) => s.id),
        payment_gateway: 'monicredit',
        renewal_state: renewalState || undefined,
        ...(deliveryDetails.address.trim() !== "" ||
            deliveryDetails.contact.trim() !== "" ||
            deliveryDetails.state.trim() !== "" ||
            deliveryDetails.lg.trim() !== "" ? {
          delivery_details: {
            ...(deliveryDetails.address.trim() !== "" && { address: deliveryDetails.address }),
            ...(deliveryDetails.contact.trim() !== "" && { contact: deliveryDetails.contact }),
            ...(deliveryDetails.state.trim() !== "" && { state: deliveryDetails.state }),
            ...(deliveryDetails.lg.trim() !== "" && { lga: deliveryDetails.lg }),
          },
        } : {}),
      };
      startPayment(paymentPayload);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save phone number");
    } finally {
      setIsSavingPhone(false);
      setPhoneStep("");
    }
  };

  // Navigate to payment page after successful payment initialization
  React.useEffect(() => {
    if (!paymentInitData) return;

    // Backend returns: { status, data: { reference, authorization_url, ... } }
    const inner = paymentInitData?.data || null;
    if (!inner) return;

    // Normalize into the structure PaymentOptions expects
    let normalized = {};
    // Check gateway field first, then check for gateway-specific fields
    const isMonicredit = inner?.gateway === 'monicredit' || 
                        inner?.customer || 
                        inner?.account_number || 
                        inner?.bank_name;
    const isPaystack = inner?.gateway === 'paystack' || 
                      (inner?.authorization_url && !isMonicredit);
    
    if (isPaystack) {
      // Paystack init
      const authUrl = inner.authorization_url;
      const reference = inner.reference || inner.transaction_id;
      normalized = {
        type: PAYMENT_TYPES.LICENSE_RENEWAL,
        paystack: {
          authorization_url: authUrl,
          reference,
        },
        amount: inner.amount,
        items: inner.items || [],
      };
    } else {
      // Monicredit init - ensure monicredit data is nested under monicredit.data
      let itemsArray = [];
      try {
        const itemsRaw = inner.items;
        itemsArray = typeof itemsRaw === 'string' ? JSON.parse(itemsRaw) : (Array.isArray(itemsRaw) ? itemsRaw : []);
      } catch (e) {
        itemsArray = [];
      }
      normalized = {
        type: PAYMENT_TYPES.LICENSE_RENEWAL,
        monicredit: { data: inner },
        amount: inner?.total_amount || inner?.amount,
        items: itemsArray,
      };
    }

    // Create a complete payment data object that includes all necessary information
    // For license renewal, delivery details are optional
    const completePaymentData = {
      ...normalized,
      car_slug: carDetail?.slug,
      selectedSchedules: getAvailableSchedules(), // Use only unpaid schedules
      // Only include delivery details if provided
      ...(deliveryDetails.address.trim() !== "" || 
          deliveryDetails.contact.trim() !== "" || 
          deliveryDetails.state.trim() !== "" || 
          deliveryDetails.lg.trim() !== "" ? {
        deliveryDetails: {
          ...(deliveryDetails.address.trim() !== "" && { address: deliveryDetails.address }),
          ...(deliveryDetails.contact.trim() !== "" && { contact: deliveryDetails.contact }),
          ...(getStateId() && { state_id: getStateId() }),
          ...(getLgaId() && { lga_id: getLgaId() }),
        },
        // Only include meta_data if delivery details are provided
        meta_data: {
          ...(deliveryDetails.address.trim() !== "" && { 
            delivery_address: deliveryDetails.address,
            address: deliveryDetails.address 
          }),
          ...(deliveryDetails.contact.trim() !== "" && { 
            delivery_contact: deliveryDetails.contact,
            contact: deliveryDetails.contact 
          }),
          ...(getStateId() && { state_id: getStateId() }),
          ...(getLgaId() && { lga_id: getLgaId() }),
        },
      } : {}),
    };

    // Persist for PaymentOptions fallback
    try {
      sessionStorage.setItem("paymentData", JSON.stringify(completePaymentData));
    } catch {}

    // Always route payments through the reusable payment page
    navigate(`/payment?type=${PAYMENT_TYPES.LICENSE_RENEWAL}`, {
      state: { paymentData: completePaymentData },
    });
  }, [
    paymentInitData,
    navigate,
    carDetail,
    selectedSchedules,
    deliveryDetails,
  ]);

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-center text-2xl font-medium text-[#05243F]">
            Renew License
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl relative rounded-[20px] bg-[#ffffff] p-8">
        <div className="absolute top-0 bottom-0 left-1/2 hidden w-[1px] -translate-x-1/2 bg-[#020202]/10 md:block"></div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="mt-2">
            <CarDetailsCard
              carDetail={carDetail}
              isRenew={false}
              reminderObj={getCarReminder(carDetail?.id)}
              bg="bg-[linear-gradient(to_bottom_right,#104675_0%,#104675_100%,#E3E3E3_0%,#E3E3E3_100%)]"
              textColor="text-white"
            />

            {/* Divider */}
            <div className="my-8 -ml-8 -mr-5 border-b border-[#020202]/10"></div>

            {/* Document Details */}
            <div className="mt-6">
              <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>

              {/* Already Paid Documents Card */}
              {existingPayments.length > 0 && (
                <div className="mb-4 overflow-hidden rounded-[16px] border border-[#FDB022]/30 bg-gradient-to-br from-[#FFFBF2] to-[#FFF8E7]">
                  <div className="flex gap-4 p-4">
                    <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#FDB022]/15 p-2.5">
                      <Icon
                        icon="solar:verified-check-bold"
                        className="text-[#C98B1A]"
                        fontSize={22}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-[#5C3D0B]">
                        Already paid
                      </h4>
                      <p className="mt-1.5 text-xs text-[#5C3D0B]/80">
                        These will be excluded from your payment.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {existingPayments.map((p) => (
                          <span
                            key={p.payment_head_name}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5C3D0B] shadow-sm ring-1 ring-[#FDB022]/20"
                          >
                            <Icon
                              icon="solar:check-circle-bold"
                              fontSize={14}
                              className="text-[#C98B1A]"
                            />
                            {p.payment_head_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {loadingPayments ? (
                  <div className="mx-auto my-10 flex items-center justify-center">
                    <ClipLoader color="#2284DB" />
                  </div>
                ) : (
                  docOptions.map((doc) => {
                    const isAlreadyPaid = existingPayments.some(
                      (p) => p.payment_head_name === doc,
                    );
                    const isSelected = selectedDocs.includes(doc);
                    const schedule = paymentSchedules.find(
                      (s) => s.payment_head?.payment_head_name === doc,
                    );
                    const price = schedule ? Number(schedule.amount) / 100 : null;

                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => !isAlreadyPaid && handleToggleDoc(doc)}
                        disabled={isAlreadyPaid}
                        className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all ${
                          isAlreadyPaid
                            ? "cursor-not-allowed border-[#E1E5EE] bg-[#F8F9FB] opacity-60"
                            : isSelected
                              ? "border-[#2389E3] bg-[#EEF5FD]"
                              : "border-[#E1E5EE] bg-white hover:border-[#2389E3]/40 hover:bg-[#F5F9FF]"
                        }`}
                      >
                        <Icon
                          icon={isAlreadyPaid ? "solar:check-circle-bold" : isSelected ? "solar:check-square-bold" : "mynaui:square"}
                          fontSize={20}
                          color={isAlreadyPaid ? "#9CA3AF" : isSelected ? "#2389E3" : "#C4C9D4"}
                          className="shrink-0"
                        />
                        <span className={`flex-1 text-left text-sm font-medium ${
                          isAlreadyPaid ? "text-[#9CA3AF]" : isSelected ? "text-[#05243F]" : "text-[#05243F]/80"
                        }`}>
                          {doc}
                        </span>
                        <span className={`shrink-0 text-sm font-semibold ${
                          isAlreadyPaid ? "text-[#9CA3AF]" : isSelected ? "text-[#2389E3]" : "text-[#05243F]/50"
                        }`}>
                          {isAlreadyPaid ? "Paid" : price === 0 ? "Free" : price != null ? `₦${price.toLocaleString()}` : ""}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>



          <div className="mt-2">
            <div className="rounded-2xl px-4">
              <div className="mb-6">
                <div className="text-base font-normal text-[#697C8C]">
                  Payment Details
                </div>
              </div>

              {/* Renewal Amount */}
              <div className="mb-6">
                <div className="text-sm font-medium text-[#05243F]">
                  Renewal Amount
                </div>
                <div className="mt-3 w-full rounded-[10px] border-3 border-[#F4F5FC] p-4 text-[16px] font-semibold text-[#05243F]/40">
                  {formatCurrency(Number(deliveryDetails.amount) / 100)}
                </div>
              </div>

              {/* State of Renewal */}
              <div className="mb-6">
                <div className="relative">
                  <SearchableSelect
                    label={<>State of Renewal <span className="text-red-500">*</span></>}
                    name="renewal_state"
                    value={renewalState}
                    onChange={(e) => setRenewalState(e.target.value)}
                    options={NIGERIAN_STATES.map((s) => ({ id: s, name: s }))}
                    placeholder="Select state of renewal"
                    filterKey="name"
                    allowCustom={false}
                  />
                  {renewalState && (
                    <button
                      type="button"
                      onClick={() => setRenewalState("")}
                      className="absolute right-9 top-[calc(0.75rem+1.25rem)] -translate-y-1/2 text-[#05243F]/30 hover:text-[#05243F]/60 transition-colors"
                      aria-label="Clear state"
                    >
                      <Icon icon="solar:close-circle-bold" fontSize={16} />
                    </button>
                  )}
                </div>
                {renewalState === "Lagos" && (
                  <div className="mt-3 flex gap-3 rounded-[10px] border border-[#FDB022]/40 bg-[#FFFBF0] p-3">
                    <Icon icon="solar:info-circle-bold" className="mt-0.5 shrink-0 text-[#C98B1A]" fontSize={18} />
                    <p className="text-xs text-[#7A5C00]">
                      Because you have chosen Lagos state you will be required to take your vehicle for inspection which may affect the documents process timeline.
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Checkbox */}
              <div className="mb-6">
                <label className="group flex w-full cursor-pointer items-center gap-3 rounded-full bg-[#F4F5FC] px-6 py-3 transition-all hover:bg-[#FFF4DD]/50">
                  <input
                    type="checkbox"
                    checked={wantsDelivery}
                    onChange={handleDeliveryCheckboxChange}
                    className="sr-only"
                  />
                  <div className="flex shrink-0 items-center justify-center text-[#05243F] transition-colors group-hover:text-[#05243F]">
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

              {/* Delivery Fields — only shown when checkbox is checked */}
              <AnimatePresence>
                {wantsDelivery && (
                  <motion.div
                    key="delivery-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="overflow-hidden"
                  >
                    {/* Delivery Address */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, duration: 0.25 }}
                    >
                      <div className="text-sm font-medium text-[#05243F]">
                        Delivery Address <span className="text-red-500">*</span>
                      </div>
                      <input
                        type="text"
                        value={deliveryDetails.address}
                        onChange={(e) =>
                          handleDeliveryChange("address", e.target.value)
                        }
                        className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                        placeholder="Enter delivery address"
                      />
                    </motion.div>

                    <motion.div
                      className="mb-6 grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.25 }}
                    >
                      <div>
                        <SearchableSelect
                          label={<>State <span className="text-red-500">*</span></>}
                          name="state"
                          value={deliveryDetails.stateName}
                          onChange={handleStateChange}
                          options={
                            Array.isArray(isState)
                              ? isState.map((state) => ({
                                  id: state.id,
                                  name: state.state_name,
                                }))
                              : []
                          }
                          placeholder="Select state"
                          filterKey="name"
                          isLoading={isGettingState}
                          className="text-[#05243F] placeholder:text-[#05243F]/40"
                        />
                      </div>
                      <div>
                        <SearchableSelect
                          label={<>Local Government <span className="text-red-500">*</span></>}
                          name="lg"
                          value={deliveryDetails.lg}
                          onChange={handleLgaChange}
                          options={
                            Array.isArray(lgaOptions)
                              ? lgaOptions.map((lg) => ({
                                  id: lg.id,
                                  name: lg.lga_name,
                                }))
                              : []
                          }
                          placeholder="Select LG"
                          filterKey="name"
                          isLoading={isGettingLG}
                          disabled={!deliveryDetails.state}
                          className="text-[#05243F] placeholder:text-[#05243F]/40"
                        />
                      </div>
                    </motion.div>

                    {/* Delivery Fee */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.25 }}
                    >
                      <div className="text-sm font-medium text-[#05243F]">
                        Delivery Fee <span className="text-red-500">*</span>
                      </div>
                      <input
                        disabled={true}
                        type="text"
                        value={formatCurrency(Number(deliveryDetails.fee) / 100)}
                        onChange={(e) => handleDeliveryChange("fee", e.target.value)}
                        className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                        placeholder="Enter delivery fee"
                      />
                    </motion.div>

                    {/* Delivery Contact */}
                    <motion.div
                      className="mb-6"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.25 }}
                    >
                      <div className="text-sm font-medium text-[#05243F] mb-3">
                        Delivery Contact <span className="text-red-500">*</span>
                      </div>
                      <div className="flex items-center gap-3 overflow-hidden rounded-[12px] border border-[#E1E5EE] bg-white transition-colors focus-within:border-[#2389E3] focus-within:ring-2 focus-within:ring-[#2389E3]/20">
                        <div className="flex shrink-0 items-center gap-2 border-r border-[#E1E5EE] bg-[#F4F5FC] px-4 py-3">
                          <Icon icon="solar:phone-bold" className="text-[#2389E3]" fontSize={20} />
                          <span className="text-sm font-medium text-[#697C8C]">+234</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={14}
                          value={formatPhoneDisplay(deliveryDetails.contact)}
                          onChange={(e) => handlePhoneChange(e.target.value, (d) => handleDeliveryChange("contact", d))}
                          className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                          placeholder="080 1234 5678"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phone required (Google OAuth users) — inline input, same Pay Now button */}
              {monicreditPhoneError && (
                <div className="mb-3 overflow-hidden rounded-[12px] border border-[#2389E3]/30 bg-[#F0F7FF] px-4 pt-4 pb-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2389E3]/15">
                      <Icon icon="solar:phone-bold" className="text-[#2389E3]" fontSize={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#05243F]">Phone number required</p>
                      <p className="text-xs text-[#05243F]/60">Saved to your profile for future payments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 overflow-hidden rounded-[10px] border border-[#2389E3]/30 bg-white transition-colors focus-within:border-[#2389E3] focus-within:ring-2 focus-within:ring-[#2389E3]/20">
                    <div className="flex shrink-0 items-center gap-2 border-r border-[#E1E5EE] bg-[#F4F5FC] px-4 py-3">
                      <Icon icon="solar:phone-bold" className="text-[#2389E3]" fontSize={18} />
                      <span className="text-sm font-medium text-[#697C8C]">+234</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={14}
                      value={formatPhoneDisplay(inlinePhone)}
                      onChange={(e) => handlePhoneChange(e.target.value, setInlinePhone)}
                      className="flex-1 bg-transparent px-4 py-3 text-base tracking-widest text-[#05243F] placeholder:tracking-normal placeholder:text-[#05243F]/40 outline-none"
                      placeholder="080 1234 5678"
                    />
                  </div>
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={monicreditPhoneError ? handleSavePhoneAndRetry : handlePayNow}
                disabled={
                  isPaymentInitializing ||
                  isSavingPhone ||
                  !isFormValid() ||
                  duplicateCheckLoading ||
                  (monicreditPhoneError && !inlinePhone.trim())
                }
                className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50"
              >
                {phoneStep === "saving" ? (
                  "Saving phone number..."
                ) : phoneStep === "initializing" || isPaymentInitializing ? (
                  "Initializing payment..."
                ) : isSavingPhone ? (
                  "Please wait..."
                ) : duplicateCheckLoading ? (
                  "Checking for existing payments..."
                ) : existingPayments.length > 0 &&
                  getAvailableSchedules().length === 0 ? (
                  "All documents already paid"
                ) : (
                  <>
                    ₦
                    {(
                      (Number(deliveryDetails.amount) +
                      Number(deliveryDetails.fee)) / 100
                    ).toLocaleString()}{" "}
                    Pay Now
                  </>
                )}
              </button>

              {/* Additional info for duplicate payments */}
              {existingPayments.length > 0 &&
                getAvailableSchedules().length > 0 && (
                  <p className="mt-2 text-center text-xs text-gray-600">
                    Only unpaid documents will be processed
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
      <PartialRenewalPromptModal
        isOpen={showPartialPrompt}
        skippedDocs={pendingSkippedDocs}
        onSkip={handleSkipPartialPrompt}
        onConfirm={handleConfirmPartialPrompt}
      />
    </>
  );
}
