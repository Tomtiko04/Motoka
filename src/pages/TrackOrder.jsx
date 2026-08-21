import React from "react";
import { Link, useParams } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import ShipmentTracker from "../components/delivery/ShipmentTracker";
import { useOrderTracking } from "../hooks/useOrderTracking";

export default function TrackOrder() {
  const { orderNumber } = useParams();
  const { data, isPending, error, isFetching } = useOrderTracking(orderNumber);
  const progress = data?.progress;

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
    </div>
  );
}
