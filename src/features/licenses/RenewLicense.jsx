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
import { useReminders } from "../../context/ReminderContext";
import {
  fetchPaymentSchedules,
  fetchPaymentHeads,
} from "../../services/apiMonicredit";
import { ClipLoader } from "react-spinners";

export default function RenewLicense() {
  const navigate = useNavigate();
  const location = useLocation();
  const carDetail = location?.state?.carDetail;
  const { reminders } = useReminders();
  const getCarReminder = (carId) =>
    reminders.find((r) => String(r.car_id) === String(carId));

  // Payment data
  const [paymentHeads, setPaymentHeads] = useState([]);
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]); // array of payment schedule objects

  // Delivery details
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    lg: "",
    state: "",
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
  useEffect(() => {
    async function fetchData() {
      setLoadingPayments(true);
      try {
        const [heads, schedules] = await Promise.all([
          fetchPaymentHeads(),
          fetchPaymentSchedules(),
        ]);
        setPaymentHeads(heads);
        setPaymentSchedules(schedules);
      } catch (error) {
        console.error("Error fetching payment data:", error);
        setPaymentHeads([]);
        setPaymentSchedules([]);
      } finally {
        setLoadingPayments(false);
      }
    }
    fetchData();
  }, []);

  // When selectedDocs changes, update selectedSchedules and amount
  useEffect(() => {
    // Find payment schedules for selected docs
    const selected = paymentSchedules.filter((sch) =>
      selectedDocs.includes(sch.payment_head?.payment_head_name),
    );
    setSelectedSchedules(selected);
    // Sum the amounts for all selected (unit_cost)
    const total = selected.reduce((sum, sch) => sum + Number(sch.amount), 0);
    setDeliveryDetails((prev) => ({ ...prev, amount: total })); // store as number
  }, [selectedDocs, paymentSchedules]);

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

  // When state changes, fetch LGAs for that state
  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;
    handleDeliveryChange("state", selectedStateName);
    handleDeliveryChange("lg", "");
    // Find state_id
    const selectedState = isState?.find(
      (s) => s.state_name === selectedStateName,
    );
    if (selectedState) {
      fetchLGAs(selectedState.id);
    } else {
      setLgaOptions([]);
    }
    // Reset delivery fee when state changes
    handleDeliveryChange("fee", "0");
  };

  // When LGA changes, set delivery fee
  const handleLgaChange = (e) => {
    const selectedLgaName = e.target.value;
    handleDeliveryChange("lg", selectedLgaName);
    const selectedLga = lgaOptions.find(
      (lga) => lga.lga_name === selectedLgaName,
    );
    if (selectedLga && selectedLga.delivery_fee) {
      handleDeliveryChange("fee", selectedLga.delivery_fee.fee);
    } else {
      handleDeliveryChange("fee", "0");
    }
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

    const stateId = getStateId();
    const lgaId = getLgaId();

    if (!stateId || !lgaId) {
      console.error("Invalid state or LGA selection");
      return;
    }

    // Create payload for each selected schedule
    const paymentPayloads = selectedSchedules.map((schedule) => ({
      car_id: carDetail?.id,
      payment_schedule_id: schedule.id,
      meta_data: {
        delivery_address: deliveryDetails.address,
        delivery_contact: deliveryDetails.contact,
        state_id: stateId,
        lga_id: lgaId,
      },
    }));

    // Initialize payment for the first schedule (you might want to handle multiple payments differently)
    if (paymentPayloads.length > 0) {
      startPayment(paymentPayloads[0]);
    }

    // TODO works for multiple
    // const paymentPayload = {
    //   car_id: carDetail?.id,
    //   payment_schedule_id: selectedSchedules.map((schedule) => schedule.id),
    //   meta_data: {
    //     delivery_address: deliveryDetails.address,
    //     delivery_contact: deliveryDetails.contact,
    //     state_id: stateId,
    //     lga_id: lgaId,
    //   },
    // };

    // if (paymentPayload.payment_schedule_id.length > 0) {
    //   startPayment(paymentPayload);
    // }
  };

  // Navigate to payment page after successful payment initialization
  React.useEffect(() => {
    if (
      paymentInitData &&
      paymentInitData.data &&
      paymentInitData.data.data
    ) {
      navigate("/payment", { state: { paymentData: paymentInitData.data.data } });
    }
  }, [paymentInitData, navigate]);

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
          <div className="mt-2">

            <CarDetailsCard
              carDetail={carDetail}
              isRenew={false}
              reminderObj={getCarReminder(carDetail?.id)}
            />

            {/* Document Details */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm text-[#697C8C]">Document Details</h3>
              <div className="flex flex-wrap gap-3">
                {loadingPayments ? (
                  <div className="mx-auto my-10 flex items-center justify-center">
                    <div>
                      <ClipLoader color="#2284DB" />
                    </div>
                  </div>
                ) : (
                  docOptions.map((doc) => (
                    <button
                      key={doc}
                      type="button"
                      onClick={() => handleToggleDoc(doc)}
                      className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                        selectedDocs.includes(doc)
                          ? "bg-[#2284DB] text-white"
                          : "bg-[#F4F5FC] text-[#05243F] hover:bg-[#E5F3FF]"
                      } `}
                    >
                      {doc}
                    </button>
                  ))
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
              {/* {paymentError && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {paymentError.message}
                </div>
              )} */}

              {/* Pay Now Button */}
              <button
                onClick={handlePayNow}
                disabled={isPaymentInitializing || !isFormValid()}
                className="mt-2 w-full rounded-full bg-[#2284DB] py-[10px] text-base font-semibold text-white transition-colors hover:bg-[#1B6CB3] disabled:opacity-50"
              >
                ₦
                {(
                  Number(deliveryDetails.amount) + Number(deliveryDetails.fee)
                ).toLocaleString()}{" "}
                Pay Now
                {isPaymentInitializing && "..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
