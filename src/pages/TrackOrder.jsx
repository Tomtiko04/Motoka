import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { Icon } from "@iconify/react";
import ShipmentTracker from "../components/delivery/ShipmentTracker";
import { useOrderTracking } from "../hooks/useOrderTracking";
import { buildWhatsAppUrl, SUPPORT_PHONE_DISPLAY } from "../constants/support";

export default function TrackOrder() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { data, isPending, error, isFetching } = useOrderTracking(orderNumber);
  const progress = data?.progress;
  const justPaid = Boolean(location.state?.paymentSuccess);
  const reference = location.state?.reference || null;
  const whatsappUrl = buildWhatsAppUrl([
    "Hello Motoka, I've just made a payment.",
    orderNumber ? `Order: ${orderNumber}` : null,
    reference ? `Reference: ${reference}` : null,
  ]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <Link to="/dashboard" className="mb-5 inline-flex items-center gap-1 text-sm text-[#697C8C]">
        <IoIosArrowBack className="h-4 w-4" />
        Back
      </Link>

      <h1 className="text-xl font-semibold text-[#05243F]">Track package</h1>
      {orderNumber && (
        <p className="mt-1 text-sm text-[#697C8C]">Order {orderNumber}</p>
      )}

      <div className="mt-5">
        {error ? (
          <div className="rounded-2xl bg-white p-5 text-sm text-red-600 shadow-sm">
            {error.response?.data?.message || error.message || "Could not load tracking."}
          </div>
        ) : (
          <ShipmentTracker progress={progress} loading={isPending} />
        )}
      </div>

      {isFetching && !isPending && (
        <p className="mt-3 text-center text-xs text-[#97A6B4]">Checking for courier updates…</p>
      )}

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-[#05243F]">
          {justPaid ? "Paid? Let us know on WhatsApp" : "Questions about this order?"}
        </p>
        <p className="mt-1 text-sm text-[#697C8C]">
          {justPaid
            ? "Your payment is confirmed and our team has started. A quick message with your order number helps us reach you faster if anything comes up."
            : `Message us on WhatsApp (${SUPPORT_PHONE_DISPLAY}) with your order number and we'll check it for you.`}
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white hover:bg-[#1fb85a]"
        >
          <Icon icon="ic:baseline-whatsapp" fontSize={18} />
          Message Motoka on WhatsApp
        </a>
      </div>
    </div>
  );
}
