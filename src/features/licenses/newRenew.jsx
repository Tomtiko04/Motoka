import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
// import { FaCarAlt, FaPlus } from "react-icons/fa";
// import MercedesLogo from "../../assets/images/mercedes-logo.png";
import { formatCurrency } from "../../utils/formatCurrency";
import CarDetailsCard from "../../components/CarDetailsCard";
import { useGetLocalGovernment, useGetState } from "./useRenew";
import { useInitializePayment } from "./usePayment";
import SearchableSelect from "../../components/shared/SearchableSelect";

export default function RenewLicense() {
  const navigate = useNavigate();
  const location = useLocation();
  const carDetail = location?.state?.carDetail;
  const { startPayment, isPaymentInitializing, error: paymentError } = useInitializePayment();
  const {data:state, isPending:isGettingState} = useGetState();
  const {data:lg, isPending:isGettingLG} = useGetLocalGovernment();

  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    lg: "",
    state: "",
    fee: "50",
    contact: "",
    amount: "0"
  });

  const isState = state?.data;
  const isLG = lg?.data;

  // Add loadingPayments state to fix ReferenceError
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Add docOptions definition if missing
  const docOptions = [
    "Road Worthiness",
    "Vehicle License",
    "Insurance",
    "Proof of Ownership"
  ];

  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]); 

  const handleToggleDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const isFormValid = () => {
    return (
      deliveryDetails.address.trim() !== "" &&
      deliveryDetails.lg.trim() !== "" &&
      deliveryDetails.state.trim() !== "" &&
      deliveryDetails.contact.trim() !== "" &&
      selectedSchedules.length > 0
    );
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to get state_id and lga_id
  const getStateId = () => {
    if (!deliveryDetails.state || !isState) return null;
    const selectedState = isState.find(s => s.state_name === deliveryDetails.state);
    return selectedState?.id || null;
  };

  const getLgaId = () => {
    if (!deliveryDetails.lg || !isLG) return null;
    const selectedLga = isLG.find(l => l.lga_name === deliveryDetails.lg);
    return selectedLga?.id || null;
  };

  // Payment logic
  const handlePayNow = async () => {
    if (!isFormValid()) {
      return;
    }

    const stateId = getStateId();
    const lgaId = getLgaId();

    if (!stateId || !lgaId) {
      console.error("Invalid state or LGA selection");
      return;
    }

    // Create payload for each selected schedule
    const paymentPayloads = selectedSchedules.map(schedule => ({
      car_id: carDetail?.id,
      payment_schedule_id: schedule.id,
      meta_data: {
        delivery_address: deliveryDetails.address,
        delivery_contact: deliveryDetails.contact,
        state_id: stateId,
        lga_id: lgaId
      }
    }));

    // Initialize payment for the first schedule (you might want to handle multiple payments differently)
    if (paymentPayloads.length > 0) {
      startPayment(paymentPayloads[0]);
    }
  };

  const getCarReminder = (carId) => {
    // If you have reminders context, use it here
    // Example: return reminders.find(r => String(r.car_id) === String(carId));
    return null; // fallback if reminders are not available
  };

  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/2 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <IoIosArrowBack className="h-5 w-5" />
          </button>
          <h1 className="text-center text-2xl font-medium text-[#05243F]">
            Renew License
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8">
        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* Left Column - Car Details */}
          <div className="mt-2">
            <CarDetailsCard carDetail={carDetail} isRenew={false} reminderObj={getCarReminder(carDetail.id)} />

            {/* Document Details */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>
              <div className="flex flex-wrap gap-3">
                {loadingPayments ? (
                  <span>Loading...</span>
                ) : docOptions.map((doc) => (
                  <button
                    key={doc}
                    type="button"
                    onClick={() => handleToggleDoc(doc)}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors
                      ${selectedDocs.includes(doc)
                        ? "bg-green-500 text-white"
                        : "bg-[#F4F5FC] text-[#05243F] hover:bg-[#E5F3FF]"}
                    `}
                  >
                    {doc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="absolute top-0 left-1/2 hidden h-full w-[1px] -translate-x-1/2 bg-[#e9ecff] md:block"></div>

          {/* Right Column - Payment Details */}
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
                  {formatCurrency(Number(deliveryDetails.amount))}
                </div>
              </div>

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
                    value={deliveryDetails.state}
                    onChange={(e) => {
                      handleDeliveryChange("state", e.target.value);
                      handleDeliveryChange("lg", "");
                    }}
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
                  />
                </div>
                <div>
                  <SearchableSelect
                    label="Local Government"
                    name="lg"
                    value={deliveryDetails.lg}
                    onChange={(e) => handleDeliveryChange("lg", e.target.value)}
                    options={
                      Array.isArray(isLG)
                        ? isLG.map((lg) => ({ id: lg.id, name: lg.lga_name }))
                        : []
                    }
                    placeholder="Select LG"
                    filterKey="name"
                    isLoading={isGettingLG}
                    disabled={!deliveryDetails.state}
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
                  value={formatCurrency(deliveryDetails.fee)}
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

              {/* Error Message */}
              {paymentError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {paymentError.message}
                </div>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handlePayNow}
                disabled={isPaymentInitializing || !isFormValid()}
                className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50"
              >
                ₦
                {(
                  Number(deliveryDetails.amount) + Number(deliveryDetails.fee)
                ).toLocaleString()} Pay Now
                {isPaymentInitializing && "..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
