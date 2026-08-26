"use client";

import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import { getUserLadipoOrders } from "../../../services/apiLadipo";
import { getUserOrders } from "../../../services/apiPayment";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatKobo(kobo) {
  const n = Number(kobo);
  if (!Number.isFinite(n)) return "—";
  return `₦${(n / 100).toLocaleString("en-NG")}`;
}

function statusStyle(statusKey) {
  if (statusKey === "awaiting_payment") return "text-amber-700 bg-amber-50";
  if (statusKey === "confirmed") return "text-blue-700 bg-blue-50";
  if (statusKey === "processing") return "text-indigo-700 bg-indigo-50";
  if (statusKey === "out_for_delivery") return "text-purple-700 bg-purple-50";
  if (statusKey === "delivered") return "text-emerald-700 bg-emerald-50";
  if (statusKey === "cancelled") return "text-red-700 bg-red-50";
  if (statusKey === "payment_failed") return "text-red-700 bg-red-50";
  return "text-gray-600 bg-gray-50";
}

function getUserFacingStatus(order) {
  const paymentStatus = String(order?.payment_status || "").toLowerCase();
  const orderStatus = String(order?.order_status || "").toLowerCase();

  if (paymentStatus === "failed") return "payment_failed";
  if (orderStatus === "cancelled") return "cancelled";
  if (paymentStatus !== "paid") return "awaiting_payment";
  if (orderStatus === "pending_payment") return "confirmed";
  if (orderStatus === "processing" || orderStatus === "pending") return "processing";
  if (orderStatus === "out_for_delivery" || orderStatus === "shipped") return "out_for_delivery";
  if (orderStatus === "delivered" || orderStatus === "completed") return "delivered";
  return "confirmed";
}

function isPickupOrder(order) {
  return String(order?.delivery?.method || "").toLowerCase() === "pickup";
}

function getStatusLabel(statusKey, order) {
  const pickup = isPickupOrder(order);
  const labels = {
    awaiting_payment: "Awaiting payment",
    confirmed: "Confirmed",
    processing: "Processing",
    out_for_delivery: pickup ? "Ready for pickup" : "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    payment_failed: "Payment failed",
  };
  return labels[statusKey] || "Order update";
}

function getStatusDescription(statusKey, order) {
  const pickup = isPickupOrder(order);
  const descriptions = {
    awaiting_payment: "Complete payment to confirm this order.",
    confirmed: "We have confirmed your payment. Next: Processing.",
    processing: order?.has_delivery
      ? "Your documents are being prepared for courier delivery."
      : "Your order is being prepared.",
    out_for_delivery: pickup
      ? "Your order is ready for pickup at the selected pickup point."
      : "Your order is on the way to your delivery address.",
    delivered: "Order delivered successfully.",
    cancelled: "This order has been cancelled.",
    payment_failed: "Payment was not successful. Retry payment to continue this order.",
  };
  return descriptions[statusKey] || "";
}

function getTimelineStep(statusKey) {
  if (statusKey === "awaiting_payment") return 0;
  if (statusKey === "confirmed") return 1;
  if (statusKey === "processing") return 2;
  if (statusKey === "out_for_delivery") return 3;
  if (statusKey === "delivered") return 4;
  return -1;
}

const TIMELINE_STEPS = [
  "Awaiting payment",
  "Confirmed",
  "Processing",
  "Out for delivery",
  "Delivered",
];

function toKobo(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  // Heuristic: values under 1000 are almost always naira for Motoka document fees
  return n < 1000 ? Math.round(n * 100) : Math.round(n);
}

function orderTypeLabel(orderType) {
  const t = String(orderType || "").toLowerCase();
  if (t === "plate_number") return "Plate number";
  if (t === "driver_license") return "Driver's license";
  return "Vehicle papers";
}

function normalizeLadipoOrder(order) {
  return {
    ...order,
    source: "ladipo",
    has_delivery: String(order?.delivery?.method || "").toLowerCase() !== "pickup",
    track_path: null,
    sort_at: order.updated_at || order.paid_at || order.created_at,
  };
}

function normalizeRenewalOrder(order) {
  const hasDelivery = Boolean(
    order.delivery_address ||
      order.delivery_contact ||
      Number(order.delivery_fee) > 0
  );
  const status = String(order.status || "").toLowerCase();
  let order_status = "processing";
  if (status === "cancelled") order_status = "cancelled";
  else if (status === "completed") order_status = hasDelivery ? "delivered" : "completed";
  else if (status === "processing") order_status = "processing";
  else if (status === "pending") order_status = "processing";

  const items = [{ name: orderTypeLabel(order.order_type) }];
  const car = order.cars;
  if (car) {
    const carLabel = [car.vehicle_make, car.vehicle_model, car.registration_no]
      .filter(Boolean)
      .join(" · ");
    if (carLabel) items.push({ name: carLabel });
  }
  const selected = Array.isArray(order.selected_items) ? order.selected_items : [];
  for (const entry of selected.slice(0, 6)) {
    if (typeof entry === "string") items.push({ name: entry });
    else if (entry?.name) items.push({ name: entry.name });
    else if (entry?.title) items.push({ name: entry.title });
  }

  return {
    id: `renewal-${order.id}`,
    source: "renewal",
    order_number: order.order_number,
    total_kobo: toKobo(order.amount_paid || order.total_amount),
    payment_status: "paid",
    order_status,
    items,
    created_at: order.created_at,
    updated_at: order.updated_at,
    has_delivery: hasDelivery,
    track_path:
      hasDelivery && order.order_number
        ? `/orders/${order.order_number}/track`
        : null,
    sort_at: order.updated_at || order.created_at,
  };
}

export default function LadipoMyOrders({ onNavigate }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleRetryPayment = (order) => {
    if (!order?.order_number || order.source !== "ladipo") return;
    const paymentData = {
      type: "ladipo",
      order_number: order.order_number,
      amount: order.total_kobo,
      price: order.total_kobo,
      orderData: order,
    };
    try {
      sessionStorage.setItem("paymentData", JSON.stringify(paymentData));
    } catch {
      // ignore sessionStorage failures and continue with navigation state
    }
    navigate("/payment?type=ladipo", { state: { paymentData } });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [ladipoResult, renewalResult] = await Promise.allSettled([
          getUserLadipoOrders(),
          getUserOrders({ limit: 50 }),
        ]);

        const ladipoOrders =
          ladipoResult.status === "fulfilled" && Array.isArray(ladipoResult.value)
            ? ladipoResult.value.map(normalizeLadipoOrder)
            : [];

        const renewalPayload =
          renewalResult.status === "fulfilled"
            ? renewalResult.value?.data?.orders ||
              renewalResult.value?.orders ||
              []
            : [];
        const renewalOrders = Array.isArray(renewalPayload)
          ? renewalPayload.map(normalizeRenewalOrder)
          : [];

        const merged = [...renewalOrders, ...ladipoOrders].sort((a, b) => {
          const ta = new Date(a.sort_at || 0).getTime();
          const tb = new Date(b.sort_at || 0).getTime();
          return tb - ta;
        });

        if (!cancelled) {
          setOrders(merged);
          if (
            ladipoResult.status === "rejected" &&
            renewalResult.status === "rejected"
          ) {
            setError(
              ladipoResult.reason?.response?.data?.message ||
                ladipoResult.reason?.message ||
                "Could not load orders."
            );
          }
        }
      } catch (e) {
        if (!cancelled) {
          setOrders([]);
          setError(
            e?.response?.data?.message ||
              e?.message ||
              "Could not load orders."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        Track renewals, plates, licences, and marketplace orders — including courier delivery.
      </p>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1 md:space-y-4">
        {loading ? (
          <div className="my-10 flex items-center justify-center">
            <ClipLoader color="#2284DB" size={40} />
          </div>
        ) : error ? (
          <div className="my-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="my-10 flex items-center justify-center">
            <p className="text-base font-medium text-gray-500">
              No orders yet
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const statusKey = getUserFacingStatus(order);
            const statusLabel = getStatusLabel(statusKey, order);
            const statusDescription = getStatusDescription(statusKey, order);
            const timelineStep = getTimelineStep(statusKey);
            const timelineSteps = isPickupOrder(order)
              ? [...TIMELINE_STEPS.slice(0, 3), "Ready for pickup", TIMELINE_STEPS[4]]
              : TIMELINE_STEPS;
            return (
              <div
                key={order.id || order.order_number}
                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.order_number}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${statusStyle(statusKey)}`}
                      >
                        {statusLabel}
                      </span>
                      {order.source === "renewal" && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                          Documents
                        </span>
                      )}
                      {order.has_delivery && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                          Delivery
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Last updated: {formatDate(order.updated_at || order.paid_at || order.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">{statusDescription}</p>
                    {items.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-xs text-gray-600">
                        {items.slice(0, 5).map((line, idx) => (
                          <li key={idx}>
                            • {line.name || "Item"}{" "}
                            {line.quantity > 1 ? `(×${line.quantity})` : ""}
                          </li>
                        ))}
                        {items.length > 5 ? (
                          <li className="text-gray-400">
                            +{items.length - 5} more
                          </li>
                        ) : null}
                      </ul>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-sky-600">
                      {formatKobo(order.total_kobo)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      Order progress
                    </p>
                    {(statusKey === "cancelled" || statusKey === "payment_failed") && (
                      <p className="text-[11px] font-semibold text-red-600">
                        {statusLabel}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {timelineSteps.map((step, index) => {
                      const active = timelineStep >= index;
                      const current = timelineStep === index;
                      return (
                        <div key={step} className="flex flex-1 items-center gap-2">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                              active
                                ? "bg-[#2284DB] text-white"
                                : "bg-gray-200 text-gray-500"
                            } ${current ? "ring-2 ring-[#2284DB]/25" : ""}`}
                          >
                            {index + 1}
                          </span>
                          {index < timelineSteps.length - 1 && (
                            <span className={`h-0.5 flex-1 ${timelineStep > index ? "bg-[#2284DB]" : "bg-gray-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-500">
                    <span>{timelineSteps[0]}</span>
                    <span>•</span>
                    <span>{timelineSteps[1]}</span>
                    <span>•</span>
                    <span>{timelineSteps[2]}</span>
                    <span>•</span>
                    <span>{timelineSteps[3]}</span>
                    <span>•</span>
                    <span>{timelineSteps[4]}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {order.source === "ladipo" &&
                    (statusKey === "awaiting_payment" || statusKey === "payment_failed") && (
                    <button
                      type="button"
                      onClick={() => handleRetryPayment(order)}
                      className="rounded-full bg-[#2284DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1A73C2]"
                    >
                      {statusKey === "payment_failed" ? "Retry payment" : "Pay now"}
                    </button>
                  )}
                  {order.track_path && (
                    <Link
                      to={order.track_path}
                      className="rounded-full border border-[#2284DB]/40 bg-[#F0F7FF] px-3 py-1.5 text-xs font-semibold text-[#2284DB] hover:bg-[#E6F2FF]"
                    >
                      Track package
                    </Link>
                  )}
                  {(statusKey === "out_for_delivery" || statusKey === "processing") && (
                    <button
                      type="button"
                      onClick={() => onNavigate("contact-support")}
                      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Contact support
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
