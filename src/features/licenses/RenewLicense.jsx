import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetState, useGetLocalGovernment } from "./useRenew";
import { useInitializePayment } from "./usePayment";
import { PAYMENT_TYPES } from "../payment/config/paymentTypes";
import { fetchPaymentHeads, fetchPaymentSchedules } from "../../services/apiMonicredit";
import { checkExistingPayments } from "../../services/apiPayment";
import { FaArrowLeft, FaCarAlt } from "react-icons/fa";
import { formatCurrency } from "../../utils/formatCurrency";
import CarDetailsCard from "../../components/CarDetailsCard";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { ClipLoader } from "react-spinners";

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
  } = useInitializePayment();

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

        const filteredHeads =
          carDetail?.car_type === "private" ||
          carDetail?.car_type === "government"
            ? heads.filter((h) => h.payment_head_name !== "Hackney Permit")
            : heads;

        setPaymentHeads(filteredHeads);

        const filteredSchedules =
          carDetail?.car_type === "private" ||
          carDetail?.car_type === "government"
            ? schedules.filter(
                (s) => s.payment_head?.payment_head_name !== "Hackney Permit",
              )
            : schedules;

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

  const checkForExistingPayments = async () => {
    if (selectedSchedules.length === 0) return;

    console.log("🔍 Checking existing payments...", {
      selectedSchedules: selectedSchedules.map((s) => ({
        id: s.id,
        name: s.payment_head?.payment_head_name,
      })),
      carSlug: carDetail?.slug,
    });

    setDuplicateCheckLoading(true);
    try {
      const paymentScheduleIds = selectedSchedules.map(
        (schedule) => schedule.id,
      );

      console.log("📡 Calling checkExistingPayments API with:", {
        car_slug: carDetail.slug,
        payment_schedule_ids: paymentScheduleIds,
      });

      const result = await checkExistingPayments(
        carDetail.slug,
        paymentScheduleIds,
      );

      console.log("✅ API Response:", result);

      if (result.status) {
        setExistingPayments(result.data.existing_payments || []);
        console.log(
          "📋 Existing payments set:",
          result.data.existing_payments || [],
        );
      } else {
        console.error("❌ API returned false status:", result);
      }
    } catch (error) {
      console.error("❌ Error checking existing payments:", error);
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
  const docOptions = paymentHeads.map((h) => h.payment_head_name);

  const handleToggleDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc],
    );
  };

  const isFormValid = () => {
    // Basic validation: require selected schedules and available schedules
    const hasValidSchedules = 
      selectedSchedules.length > 0 &&
      getAvailableSchedules().length > 0; // Has available (unpaid) schedules

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

    // Initialize payment for all selected schedules
    if (paymentPayload.payment_schedule_id.length > 0) {
      startPayment(paymentPayload);
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
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8">
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="mt-2">
            <CarDetailsCard
              carDetail={carDetail}
              isRenew={false}
              reminderObj={getCarReminder(carDetail?.id)}
            />

            {/* Document Details */}
            <div className="mt-6">
              <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>

              {/* Duplicate Payment Warning */}
              {existingPayments.length > 0 && (
                <div className="mb-4 rounded-lg border border-[#FDB022] bg-[#FFFCF5] p-4">
                  <div className="flex items-start">
                    <div className="mr-3 text-[#FDB022]">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#FDB022]">
                        Already Paid Documents
                      </h4>
                      <p className="mt-1 text-sm text-[#5C3D0B]">
                        You have already paid for:{" "}
                        {existingPayments
                          .map((p) => p.payment_head_name)
                          .join(", ")}
                      </p>
                      <p className="mt-1 text-xs text-[#5C3D0B]">
                        These documents will be excluded from your payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {loadingPayments ? (
                  <div className="mx-auto my-10 flex items-center justify-center">
                    <div>
                      <ClipLoader color="#2284DB" />
                    </div>
                  </div>
                ) : (
                  docOptions.map((doc) => {
                    const isAlreadyPaid = existingPayments.some(
                      (p) => p.payment_head_name === doc,
                    );
                    const isSelected = selectedDocs.includes(doc);

                    return (
                      <button
                        key={doc}
                        type="button"
                        onClick={() => !isAlreadyPaid && handleToggleDoc(doc)}
                        disabled={isAlreadyPaid}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                          isAlreadyPaid
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : isSelected
                              ? "bg-[#2284DB] text-white"
                              : "bg-[#F4F5FC] text-[#05243F] hover:bg-[#E5F3FF]"
                        } `}
                      >
                        {doc}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-1/2 hidden h-full w-[1px] -translate-x-1/2 bg-[#e9ecff] md:block"></div>

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

              {/* Delivery Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsDelivery}
                    onChange={handleDeliveryCheckboxChange}
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[#2284DB] focus:ring-2 focus:ring-[#2284DB] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[#05243F]">
                    Request Delivery
                  </span>
                </label>
              </div>

              {/* Delivery Fields — only shown when checkbox is checked */}
              {wantsDelivery && (
                <>
                  {/* Delivery Address */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#05243F]">
                      Delivery Address
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
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div>
                      <SearchableSelect
                        label="State"
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
                        label="Local Government"
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
                  </div>

                  {/* Delivery Fee */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#05243F]">
                      Delivery Fee
                    </div>
                    <input
                      disabled={true}
                      type="text"
                      value={formatCurrency(Number(deliveryDetails.fee) / 100)}
                      onChange={(e) => handleDeliveryChange("fee", e.target.value)}
                      className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                      placeholder="Enter delivery fee"
                    />
                  </div>

                  {/* Delivery Contact */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-[#05243F]">
                      Delivery Contact
                    </div>
                    <input
                      type="tel"
                      value={deliveryDetails.contact}
                      onChange={(e) =>
                        handleDeliveryChange("contact", e.target.value)
                      }
                      className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
                      placeholder="08012345678"
                    />
                  </div>
                </>
              )}

              {/* Error Message */}
              {/* {paymentError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {paymentError.message}
                </div>
              )} */}

              {/* Pay Now Button */}
              <button
                onClick={handlePayNow}
                disabled={
                  isPaymentInitializing ||
                  !isFormValid() ||
                  duplicateCheckLoading
                }
                className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50"
              >
                {duplicateCheckLoading ? (
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
                    {isPaymentInitializing && "..."}
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
    </>
  );
}
