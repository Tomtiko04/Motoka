import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
// import { FaCarAlt, FaPlus } from "react-icons/fa";
// import MercedesLogo from "../../assets/images/mercedes-logo.png";
import { formatCurrency } from "../../utils/formatCurrency";
import CarDetailsCard from "../../components/CarDetailsCard";
import { useGetLocalGovernment, useGetState, useInitializePayment } from "./useRenew";
import SearchableSelect from "../../components/shared/SearchableSelect";
import { useReminders } from '../../context/ReminderContext';
import { fetchPaymentSchedules, fetchPaymentHeads } from '../../services/apiMonicredit';
import { ClipLoader } from "react-spinners";

const bvn = import.meta.env.VITE_MONICREDIT_BVN;
const nin = import.meta.env.VITE_MONICREDIT_NIN;

export default function RenewLicense() {
  const navigate = useNavigate();
  const location = useLocation();
  const carDetail = location?.state?.carDetail;
  // Get user info from localStorage
  const userInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : {};
  const email = userInfo.email || "";
  const firstName = userInfo.name || "";
  const { reminders } = useReminders();
  const getCarReminder = (carId) => reminders.find(r => String(r.car_id) === String(carId));

  // Payment data
  const [paymentHeads, setPaymentHeads] = useState([]);
  const [paymentSchedules, setPaymentSchedules] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedSchedules, setSelectedSchedules] = useState([]); // array of payment schedule objects
  const [isPaymentInitializing, setIsPaymentInitializing] = useState(false);

  // Delivery details
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    lg: "",
    state: "",
    fee: "50",
    contact: "",
    amount: "0"
  });

  const {data:state, isPending:isGettingState} = useGetState();
  const {data:lg, isPending:isGettingLG} = useGetLocalGovernment();

  const isState = state?.data;
  const isLG = lg?.data;

  // Fetch payment heads and schedules on mount
  useEffect(() => {
    async function fetchData() {
      setLoadingPayments(true);
      try {
        const [heads, schedules] = await Promise.all([
          fetchPaymentHeads(),
          fetchPaymentSchedules()
        ]);
        setPaymentHeads(heads);
        setPaymentSchedules(schedules);
      } catch (e) {
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
    const selected = paymentSchedules.filter(sch =>
      selectedDocs.includes(sch.payment_head?.payment_head_name)
    );
    setSelectedSchedules(selected);
    // Sum the amounts for all selected (unit_cost)
    const total = selected.reduce((sum, sch) => sum + Number(sch.amount), 0);
    setDeliveryDetails((prev) => ({ ...prev, amount: total })); // store as number
  }, [selectedDocs, paymentSchedules]);

  // Document options from payment heads
  const docOptions = paymentHeads.map(h => h.payment_head_name);

  const handleToggleDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  const handleToggleSchedule = (schedule) => {
    setSelectedSchedules((prev) =>
      prev.includes(schedule) ? prev.filter((s) => s !== schedule) : [...prev, schedule]
    );
  };

  const handleScheduleChange = (schedule) => {
    setSelectedSchedules((prev) =>
      prev.includes(schedule) ? prev.filter((s) => s !== schedule) : [...prev, schedule]
    );
  };

  const handleDocChange = (doc) => {
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

  // Payment logic
  const handlePayNow = async () => {
    // Only navigate to payment selector, do not initiate payment here
    const paymentPayload = {
      selectedSchedules,
      deliveryDetails,
      selectedDocs,
      carDetail,
      // add any other info needed for payment
    };
    navigate("/payment", { state: paymentPayload });
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
            {/* <div className="rounded-2xl bg-white px-4 py-5 shadow">
              <div className="mb-6">
                <div className="text-sm font-light text-[#05243F]/60">
                  Car Model
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="">
                      <img
                        src={carDetail?.carLogo || MercedesLogo}
                        alt={carDetail?.vehicle_make || "Car"}
                        className="h-6 w-6"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-[#05243F]">
                      {carDetail?.vehicle_model || "-"}
                    </h3>
                  </div>
                  <div>
                    <FaCarAlt className="text-3xl text-[#2389E3]" />
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center">
                <div>
                  <div className="text-sm text-[#05243F]/60">Plate No:</div>
                  <div className="text-base font-semibold text-[#05243F]">
                    {carDetail?.plate_number || "-"}
                  </div>
                </div>
                <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
                <div>
                  <div className="text-sm text-[#05243F]/60">Exp. Date</div>
                  <div className="text-base font-semibold text-[#05243F]">
                    {carDetail?.expiry_date || "-"}
                  </div>
                </div>
                <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
                <div>
                  <div className="text-sm text-[#05243F]/60">Car Type</div>
                  <div className="text-base font-semibold text-[#05243F]">
                    {carDetail?.vehicle_make || "-"}
                  </div>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center gap-2 rounded-full bg-[#FFEFCE] px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#FDB022]"></span>
                  <span className="text-sm font-medium text-[#05243F]">
                    Expires in 3 days
                  </span>
                </div>
              </div>
            </div> */}

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
                  <div className="mx-auto flex items-center justify-center my-10">
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
