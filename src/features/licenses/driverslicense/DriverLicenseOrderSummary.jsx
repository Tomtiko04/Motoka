import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Icon } from "@iconify/react";
import { PAYMENT_TYPES } from "../../payment/config/paymentTypes";

const SESSION_KEY = "driverLicenseOrderSummary";

function formatNaira(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const LICENSE_LABELS = {
  new: "New Driver's License",
  renew: "Driver's License Renewal",
};

export default function DriverLicenseOrderSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const summaryState =
    state ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      } catch {
        return null;
      }
    })();

  useEffect(() => {
    if (summaryState) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(summaryState));
      } catch {
        /* storage full */
      }
    }
  }, [summaryState]);

  if (!summaryState?.license_type) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <Icon
          icon="ion:alert-circle-outline"
          className="text-5xl text-yellow-500"
        />
        <p className="text-base font-medium text-[#05243F]">
          No order information found. Please start your driver's license
          application again.
        </p>
        <button
          onClick={() => navigate("/licenses/drivers-license")}
          className="rounded-full bg-[#2284DB] px-6 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { license_type, price } = summaryState;
  const label = LICENSE_LABELS[license_type] || license_type;

  const handleProceedToPayment = () => {
    const paymentData = {
      type: PAYMENT_TYPES.DRIVERS_LICENSE,
      license_type,
      price,
    };

    try {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
    } catch {
      /* ignore */
    }

    navigate(`/payment?type=${PAYMENT_TYPES.DRIVERS_LICENSE}`, {
      state: { paymentData },
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 md:px-0">
      <div className="relative mb-8 flex h-12 items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
        >
          <IoIosArrowBack className="h-5 w-5" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-medium text-[#05243F]">
          Confirm Request
        </h1>
      </div>

      <div className="mb-6 rounded-[20px] border border-[#E1E5EE] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#05243F]/40">
          Order Details
        </h2>

        <div className="flex items-center gap-3 rounded-[14px] bg-[#F4F5FC] px-4 py-3 mb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF4FD]">
            <Icon icon="mingcute:steering-wheel-fill" fontSize={20} color="#2389E3" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#05243F]">
              Driver's License
            </p>
            <p className="text-xs text-[#05243F]/50">
              {label}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#F4F5FC] pb-3">
            <span className="text-sm text-[#05243F]/60">Service</span>
            <span className="text-sm font-semibold text-[#05243F]">
              {label}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-medium text-[#05243F]/70">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-[#2284DB]">
              {formatNaira(price)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-[16px] bg-[#EBF4FD] px-5 py-4">
        <div className="flex gap-3">
          <Icon
            icon="mdi:information-outline"
            className="mt-0.5 shrink-0 text-xl text-[#2389E3]"
          />
          <p className="text-sm text-[#05243F]/70">
            Kindly check your license to proceed with the following request. On the next page you can choose your preferred payment method —{" "}
            <strong>Monicredit</strong> (bank transfer) or{" "}
            <strong>Paystack</strong> (card / online).
          </p>
        </div>
      </div>

      <button
        onClick={handleProceedToPayment}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2284DB] py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1a6bb8] active:scale-[0.98]"
      >
        Complete Pay Now
        <Icon icon="mdi:arrow-right" className="text-lg" />
      </button>
    </div>
  );
}
