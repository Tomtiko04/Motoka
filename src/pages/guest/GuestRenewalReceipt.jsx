/**
 * GuestRenewalReceipt
 *
 * Displays the full receipt for a paid guest renewal order.
 * Accessible only with a valid receipt_token (passed in URL query).
 *
 * URL: /guest/renewal/receipt?orderId=xxx&token=yyy
 *
 * Also shows a "Create Account" prompt so the guest can upgrade to a
 * full Motoka account and see their renewal history.
 */

import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, RefreshCw, User, FileText } from "lucide-react";
import { getGuestReceipt, resendGuestReceipt } from "../../services/apiGuest";
import toast from "react-hot-toast";

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2 border-b border-[#F4F5FC] last:border-0">
      <span className="text-sm text-[#697C8C]">{label}</span>
      <span className="text-sm font-medium text-[#05243F]">{value}</span>
    </div>
  );
}

export default function GuestRenewalReceipt() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token   = searchParams.get("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent]       = useState(false);

  useEffect(() => {
    if (!orderId || !token) {
      setError("Invalid receipt link. Please check your email for the correct link.");
      setLoading(false);
      return;
    }

    getGuestReceipt(orderId, token)
      .then((res) => {
        setReceipt(res.data?.data);
      })
      .catch((err) => {
        const msg = err.response?.status === 404
          ? "Receipt not found. Payment may still be processing — please wait a moment and refresh."
          : "Failed to load receipt. Please try again.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const handleResend = async () => {
    if (!receipt?.guestEmail || resending || resent) return;
    setResending(true);
    try {
      await resendGuestReceipt(receipt.guestEmail);
      setResent(true);
      toast.success("Receipt sent to your email!");
    } catch {
      toast.error("Failed to resend receipt. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[#2389E3]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#05243F] mb-2">Receipt Not Available</h2>
          <p className="text-sm text-[#697C8C] mb-6">{error}</p>
          <Link to="/" className="inline-block w-full rounded-full bg-[#F4F5FC] py-3 text-sm font-semibold text-[#05243F] hover:bg-[#E1E6F4] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalNaira = receipt.totalAmount / 100;
  const renewalNaira = receipt.renewalAmount / 100;
  const deliveryNaira = receipt.deliveryFee / 100;

  return (
    <div className="min-h-screen bg-[#F4F5FC] py-8 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold text-[#104675]">Motoka</span>
        </div>

        {/* Success banner */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-[#05243F]">Payment Confirmed</h1>
          <p className="text-sm text-[#697C8C] mt-1">
            Your renewal request has been received. We'll process it shortly.
          </p>
        </div>

        {/* Receipt card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-[#2389E3]" />
            <h2 className="text-base font-semibold text-[#05243F]">Receipt</h2>
          </div>

          <DetailRow label="Reference"     value={receipt.reference} />
          <DetailRow label="Date"          value={receipt.paidAt ? new Date(receipt.paidAt).toLocaleDateString("en-NG", { dateStyle: "medium" }) : null} />
          <DetailRow label="Plate Number"  value={receipt.plateNumber} />
          <DetailRow label="Name"          value={receipt.guestName} />
          <DetailRow label="Email"         value={receipt.guestEmail} />

          {receipt.selectedItems?.length > 0 && (
            <div className="py-2 border-b border-[#F4F5FC]">
              <span className="text-sm text-[#697C8C]">Services</span>
              <ul className="mt-1 space-y-0.5">
                {receipt.selectedItems.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm font-medium text-[#05243F]">
                    <span>{item.name}</span>
                    <span>₦{(item.price / 100).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {deliveryNaira > 0 && (
            <DetailRow label="Delivery Fee" value={`₦${deliveryNaira.toLocaleString()}`} />
          )}

          <div className="flex justify-between pt-3 mt-1">
            <span className="text-sm font-semibold text-[#05243F]">Total Paid</span>
            <span className="text-base font-bold text-[#2389E3]">₦{totalNaira.toLocaleString()}</span>
          </div>
        </div>

        {/* Delivery details */}
        {receipt.deliveryDetails && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
            <h2 className="text-base font-semibold text-[#05243F] mb-3">Delivery Details</h2>
            <DetailRow label="Address" value={receipt.deliveryDetails.address} />
            <DetailRow label="State"   value={receipt.deliveryDetails.state} />
            <DetailRow label="LGA"     value={receipt.deliveryDetails.lga} />
            <DetailRow label="Contact" value={receipt.deliveryDetails.contact} />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Resend email */}
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full rounded-full border border-[#2389E3] bg-white py-3 text-sm font-semibold text-[#2389E3] transition-colors hover:bg-[#E5F3FF] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {resending ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            {resent ? "Receipt sent to your email ✓" : "Resend Receipt to Email"}
          </button>

          {/* Create account */}
          {!receipt.hasLinkedAccount && (
            <Link
              to={`/guest/renewal/signup?orderId=${orderId}&token=${token}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#104675] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0d3a5f]"
            >
              <User className="h-4 w-4" />
              Create a Motoka Account
            </Link>
          )}

          <Link
            to="/"
            className="block w-full rounded-full bg-[#F4F5FC] py-3 text-center text-sm font-semibold text-[#697C8C] transition-colors hover:bg-[#E1E6F4]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
