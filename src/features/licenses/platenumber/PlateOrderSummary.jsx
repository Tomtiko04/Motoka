import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Icon } from "@iconify/react";
import { PAYMENT_TYPES } from "../../payment/config/paymentTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SESSION_KEY = "plateOrderSummary";

function formatNaira(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PLATE_LABELS = {
  Normal: "Normal Plate Number",
  Customized: "Customized Plate Number",
  Dealership: "Dealership Plate Number",
  Reprint: "Plate Number Reprint",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PlateOrderSummary() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Restore state from sessionStorage on back-navigation
  const summaryState =
    state ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      } catch {
        return null;
      }
    })();

  // Persist to sessionStorage so back-navigation works
  useEffect(() => {
    if (summaryState) {
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(summaryState));
      } catch {
        /* storage full */
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Guard — no state means user landed here directly
  if (!summaryState?.carSlug) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <Icon
          icon="ion:alert-circle-outline"
          className="text-5xl text-yellow-500"
        />
        <p className="text-base font-medium text-[#05243F]">
          No order information found. Please start your plate number application
          again.
        </p>
        <button
          onClick={() => navigate("/licenses/plate-number")}
          className="rounded-full bg-[#2284DB] px-6 py-2 text-sm font-semibold text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { car, carSlug, plateTypeName, subType, price } = summaryState;
  const plateLabel = PLATE_LABELS[plateTypeName] || plateTypeName || "Plate Number";
  const subLabel =
    subType && subType !== "Dealership" ? subType : null;

  // ── Navigate to the shared PaymentOptions page ─────────────────────────────
  const handleProceedToPayment = () => {
    const paymentData = {
      type: PAYMENT_TYPES.PLATE_NUMBER,   // 'plate_number'
      car_slug: carSlug,
      plate_type: plateTypeName,           // 'Normal' | 'Customized' | 'Dealership' | 'Reprint'
      sub_type: subLabel || null,
      price,
    };

    try {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
    } catch {
      /* ignore */
    }

    navigate(`/payment?type=${PAYMENT_TYPES.PLATE_NUMBER}`, {
      state: { paymentData },
    });
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 md:px-0">
      {/* Header */}
      <div className="relative mb-8 flex h-12 items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
        >
          <IoIosArrowBack className="h-5 w-5" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-medium text-[#05243F]">
          Order Summary
        </h1>
      </div>

      {/* ── Order Details Card ──────────────────────────────────────────────── */}
      <div className="mb-6 rounded-[20px] border border-[#E1E5EE] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#05243F]/40">
          Order Details
        </h2>

        {/* Car info */}
        {car && (
          <div className="mb-5 flex items-center gap-3 rounded-[14px] bg-[#F4F5FC] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EBF4FD]">
              <Icon icon="ion:car-sport-sharp" fontSize={20} color="#2389E3" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#05243F]">
                {car.vehicle_make} {car.vehicle_model}
              </p>
              <p className="text-xs text-[#05243F]/50">
                {car.registration_no || car.plate_number || "No plate yet"}
              </p>
            </div>
          </div>
        )}

        {/* Line items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#F4F5FC] pb-3">
            <span className="text-sm text-[#05243F]/60">Service</span>
            <span className="text-sm font-semibold text-[#05243F]">
              Plate Number Application
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-[#F4F5FC] pb-3">
            <span className="text-sm text-[#05243F]/60">Plate Type</span>
            <span className="text-sm font-semibold text-[#05243F]">
              {plateLabel}
            </span>
          </div>

          {subLabel && (
            <div className="flex items-center justify-between border-b border-[#F4F5FC] pb-3">
              <span className="text-sm text-[#05243F]/60">Sub-Type</span>
              <span className="text-sm font-semibold text-[#05243F]">
                {subLabel}
              </span>
            </div>
          )}

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

      {/* ── What Happens Next ───────────────────────────────────────────────── */}
      <div className="mb-8 rounded-[16px] bg-[#EBF4FD] px-5 py-4">
        <div className="flex gap-3">
          <Icon
            icon="mdi:information-outline"
            className="mt-0.5 shrink-0 text-xl text-[#2389E3]"
          />
          <p className="text-sm text-[#05243F]/70">
            On the next page you can choose your preferred payment method —{" "}
            <strong>Monicredit</strong> (bank transfer) or{" "}
            <strong>Paystack</strong> (card / online) — and complete your
            payment.
          </p>
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <button
        onClick={handleProceedToPayment}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2284DB] py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1a6bb8] active:scale-[0.98]"
      >
        Proceed to Payment
        <Icon icon="mdi:arrow-right" className="text-lg" />
      </button>
    </div>
  );
}
