/**
 * GuestRenewalCallback
 *
 * Landing page after a Paystack redirect (or any payment gateway that
 * redirects back to the frontend). Also reachable directly from
 * Monicredit manual-transfer flow as a "check status" page.
 *
 * URL: /guest/renewal/callback?reference=xxx
 *
 * The orderId is read from sessionStorage (saved in RenewModal before redirect).
 * On mount we call verifyGuestOrder() once, then poll getGuestOrderStatus()
 * every 5 s until resolved.
 */

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { getGuestOrderStatus, verifyGuestOrder } from "../../services/apiGuest";

const POLL_INTERVAL_MS = 5000;

export default function GuestRenewalCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [orderId]       = useState(() => sessionStorage.getItem("guest_order_id"));
  const [status, setStatus]   = useState("loading"); // loading | pending | success | failed | error
  const [receiptToken, setReceiptToken] = useState(null);
  const [message, setMessage] = useState("");
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const handleStatusUpdate = (paymentStatus, token) => {
    if (paymentStatus === "payment_success") {
      setStatus("success");
      setReceiptToken(token);
      sessionStorage.removeItem("guest_order_id");
      stopPolling();
    } else if (paymentStatus === "payment_failed") {
      setStatus("failed");
      setMessage("Your payment was not completed. You can close this page and try again.");
      stopPolling();
    } else {
      setStatus("pending");
      setMessage("Waiting for payment confirmation…");
    }
  };

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      setMessage("Order not found. Please check your email for the receipt link, or contact support.");
      return;
    }

    // 1) Active verify first (Paystack sends reference in URL)
    verifyGuestOrder(orderId, reference)
      .then((res) => {
        const data = res.data?.data;
        handleStatusUpdate(data?.status, data?.receiptToken);
      })
      .catch(() => {
        // Verify failed — fall back to status poll
        setStatus("pending");
      });

    // 2) Poll every 5 s as a fallback
    pollRef.current = setInterval(async () => {
      try {
        const res = await getGuestOrderStatus(orderId);
        const data = res.data?.data;
        if (data) handleStatusUpdate(data.paymentStatus, data.receiptToken);
      } catch {
        // silent
      }
    }, POLL_INTERVAL_MS);

    return stopPolling;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">

        {/* Logo */}
        <div className="mb-6">
          <span className="text-2xl font-bold text-[#104675]">Motoka</span>
        </div>

        {status === "loading" && (
          <>
            <RefreshCw className="h-12 w-12 animate-spin text-[#2389E3] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Verifying payment…</h2>
            <p className="text-sm text-[#697C8C]">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "pending" && (
          <>
            <RefreshCw className="h-12 w-12 animate-spin text-[#2389E3] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Waiting for confirmation</h2>
            <p className="text-sm text-[#697C8C] mb-4">{message}</p>
            <p className="text-xs text-[#697C8C]">This page checks automatically every few seconds.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Payment Confirmed!</h2>
            <p className="text-sm text-[#697C8C] mb-6">
              Your renewal order has been received. Our team will process it shortly.
            </p>
            {receiptToken && orderId ? (
              <Link
                to={`/guest/renewal/receipt?orderId=${orderId}&token=${receiptToken}`}
                className="inline-block w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1B6CB3]"
              >
                View Receipt
              </Link>
            ) : (
              <p className="text-sm text-[#697C8C]">Check your email for your receipt link.</p>
            )}
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Payment Failed</h2>
            <p className="text-sm text-[#697C8C] mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block w-full rounded-full bg-[#F4F5FC] py-3 text-sm font-semibold text-[#05243F] transition-colors hover:bg-[#E1E6F4]"
            >
              Back to Home
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-14 w-14 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Something went wrong</h2>
            <p className="text-sm text-[#697C8C] mb-6">{message}</p>
            <Link
              to="/"
              className="inline-block w-full rounded-full bg-[#F4F5FC] py-3 text-sm font-semibold text-[#05243F] transition-colors hover:bg-[#E1E6F4]"
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
