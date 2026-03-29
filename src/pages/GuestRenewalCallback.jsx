/**
 * GuestRenewalCallback
 *
 * Landing page after payment provider redirect (both MoniCredit and Paystack).
 * Polls GET /api/guest/renewals/:orderId/status until payment_status changes
 * from "pending_payment", then routes the user to the receipt page.
 */

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { getGuestOrderStatus, verifyGuestOrder, resendGuestReceiptEmail } from "../services/apiGuest";
import { Icon } from "@iconify/react";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 40; // ~2 minutes

export default function GuestRenewalCallback() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const orderId =
    searchParams.get("orderId") || sessionStorage.getItem("guestOrderId");
  const gateway = searchParams.get("gateway") || "monicredit";
  // Paystack appends reference/trxref to the redirect URL
  const paystackRef =
    searchParams.get("reference") || searchParams.get("trxref") || null;
  const bankDetails =
    location.state?.bankDetails ||
    JSON.parse(sessionStorage.getItem("guestBankDetails") || "null");

  const [status, setStatus] = useState("polling"); // polling | success | failed | error | expired
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef(null);
  const paymentRefRef = useRef(null); // cached from first status poll for MoniCredit active verify

  // Resend receipt form (shown in expired state)
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleSuccess = (receiptToken) => {
    clearInterval(pollRef.current);
    setStatus("success");
    setTimeout(() => {
      navigate(`/guest/renewal/receipt?orderId=${orderId}`, { state: { receiptToken } });
    }, 1500);
  };

  useEffect(() => {
    if (!orderId) { setStatus("error"); return; }

    // For Paystack: hit the verify endpoint first so we don't have to wait
    // for the webhook (which can't reach localhost). If that confirms payment,
    // skip polling entirely.
    if (gateway === "paystack" && paystackRef) {
      verifyGuestOrder(orderId, paystackRef)
        .then((result) => {
          if (result.status === "payment_success") {
            handleSuccess(result.receiptToken);
          } else if (result.status === "payment_failed") {
            setStatus("failed");
          } else {
            // Still pending — fall through to normal polling
            startPolling();
          }
        })
        .catch((err) => {
          if (err?.response?.status === 410) {
            setStatus("expired");
          } else {
            startPolling();
          }
        });
      return;
    }

    startPolling();

    function startPolling() {
      const poll = async () => {
        try {
          const order = await getGuestOrderStatus(orderId);

          if (!order) { setStatus("error"); clearInterval(pollRef.current); return; }

          if (order.paymentStatus === "payment_success") {
            handleSuccess(order.receiptToken);
            return;
          }

          if (order.paymentStatus === "payment_failed") {
            clearInterval(pollRef.current);
            setStatus("failed");
            return;
          }

          if (order.isExpired) {
            clearInterval(pollRef.current);
            setStatus("expired");
            return;
          }

          // Cache the payment reference on first poll
          if (order.paymentReference && !paymentRefRef.current) {
            paymentRefRef.current = order.paymentReference;
          }

          // For MoniCredit: every 4 polls attempt an active gateway verify as a
          // webhook fallback (webhook may be delayed or misconfigured in dev).
          setPollCount((c) => {
            const next = c + 1;
            if (next >= MAX_POLLS) {
              clearInterval(pollRef.current);
              setStatus("error");
            } else if (gateway === "monicredit" && next % 4 === 0 && paymentRefRef.current) {
              verifyGuestOrder(orderId, paymentRefRef.current)
                .then((result) => {
                  if (result.status === "payment_success") handleSuccess(result.receiptToken);
                  else if (result.status === "payment_failed") { clearInterval(pollRef.current); setStatus("failed"); }
                })
                .catch(() => { /* ignore — keep polling */ });
            }
            return next;
          });
        } catch {
          clearInterval(pollRef.current);
          setStatus("error");
        }
      };

      poll();
      pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }

    return () => clearInterval(pollRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, gateway, paystackRef]);

  return (
    <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">

        {/* MoniCredit bank transfer instructions */}
        {gateway === "monicredit" && bankDetails?.accountNumber && status === "polling" && (
          <div className="mb-6 text-left rounded-xl bg-[#FFFBEB] border border-[#FDB022]/30 p-4">
            <p className="text-sm font-semibold text-[#05243F] mb-3">Transfer to this account</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#697C8C]">Bank</span>
                <span className="font-medium text-[#05243F]">{bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697C8C]">Account No.</span>
                <span className="font-medium text-[#05243F] font-mono tracking-wider">{bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697C8C]">Account Name</span>
                <span className="font-medium text-[#05243F]">{bankDetails.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#697C8C]">Amount</span>
                <span className="font-semibold text-[#2389E3]">₦{bankDetails.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status icon */}
        {status === "polling" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-[#E5F3FF]">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#2389E3] border-t-transparent" />
            </div>
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Waiting for Payment</h2>
            <p className="text-sm text-[#697C8C]">
              We&apos;re monitoring your payment. This page will update automatically once your
              payment is confirmed.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-green-50">
              <Icon icon="solar:check-circle-bold" fontSize={40} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Payment Confirmed!</h2>
            <p className="text-sm text-[#697C8C]">Redirecting to your receipt…</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-red-50">
              <Icon icon="solar:close-circle-bold" fontSize={40} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Payment Failed</h2>
            <p className="text-sm text-[#697C8C] mb-6">
              Your payment could not be processed. Please try again.
            </p>
            <button
              onClick={() => window.history.back()}
              className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors"
            >
              Try Again
            </button>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-orange-50">
              <Icon icon="solar:clock-circle-bold" fontSize={40} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Payment Window Expired</h2>
            <p className="text-sm text-[#697C8C] mb-5">
              This payment link has expired. If you already completed a bank transfer, your
              payment may still be processing — we&apos;ll send you a receipt once it&apos;s confirmed.
            </p>
            {!resendSent ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!resendEmail.trim()) return;
                  setResendLoading(true);
                  try {
                    await resendGuestReceiptEmail(resendEmail.trim().toLowerCase());
                  } finally {
                    setResendLoading(false);
                    setResendSent(true);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter the email you used at checkout"
                  className="w-full rounded-lg border border-[#E1E5EE] px-4 py-3 text-sm text-[#05243F] outline-none focus:border-[#2389E3]"
                />
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors disabled:opacity-50"
                >
                  {resendLoading ? "Sending…" : "Resend My Receipt"}
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                If we found a paid order for that email, we&apos;ve sent the receipt to your inbox.
              </div>
            )}
            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full rounded-full border border-[#E1E5EE] py-3 text-sm font-medium text-[#697C8C] hover:bg-[#F4F5FC] transition-colors"
            >
              Back to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-yellow-50">
              <Icon icon="solar:danger-triangle-bold" fontSize={40} className="text-yellow-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#05243F] mb-2">Something Went Wrong</h2>
            <p className="text-sm text-[#697C8C] mb-6">
              We couldn&apos;t verify your payment status. If you completed the payment, please
              contact support with your reference number.
            </p>
            <button
              onClick={() => navigate("/")}
              className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
