import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { getGuestReceipt, guestSignup, resendGuestReceiptEmail } from "../services/apiGuest";
import { authStorage } from "../utils/authStorage";
import { Icon } from "@iconify/react";
import { formatCurrency } from "../utils/formatCurrency";
import toast from "react-hot-toast";

export default function GuestRenewalReceipt() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = searchParams.get("orderId");
  // Token comes from navigate state (in-app flow) or URL param (email link).
  // Prefer state so the token doesn't appear in browser history for in-app nav.
  const token = location.state?.receiptToken || searchParams.get("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("receipt"); // "receipt" | "signup"

  // "Find my receipt" state — used when orderId/token are missing
  const [findEmail, setFindEmail] = useState("");
  const [findLoading, setFindLoading] = useState(false);
  const [findSent, setFindSent] = useState(false);

  // Signup form state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!orderId || !token) { setLoading(false); return; }
    getGuestReceipt(orderId, token)
      .then(setReceipt)
      .catch(() => toast.error("Failed to load receipt"))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSignupLoading(true);
    try {
      // Persist guest vehicle details so AddCar can prefill after OTP verification.
      // Normalize plate number by stripping non-alphanumeric characters so it
      // passes AddCar's /^[A-Za-z0-9]{3,8}$/ validation.
      const normalizedPlate = (receipt.plateNumber || "").replace(/[^A-Za-z0-9]/g, "");
      sessionStorage.setItem("guestCarPrefill", JSON.stringify({
        ownerName: receipt.guestName || "",
        registrationNo: normalizedPlate,
        expiryDate: receipt.expiryDate || "",
        phoneNo: receipt.guestPhone || "",
      }));

      const result = await guestSignup(orderId, {
        receipt_token: token,
        password,
        password_confirmation: confirmPassword,
      });
      sessionStorage.setItem("pendingVerificationEmail", receipt.guestEmail);
      if (result?.session?.access_token) {
        authStorage.setRegistrationToken(result.session.access_token);
      }
      toast.success("Account created! Check your email for the verification code.");
      navigate("/auth/verify-account", {
        state: { email: receipt.guestEmail }
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Account creation failed";
      if (err?.response?.status === 409) {
        toast.error(msg);
        navigate("/auth/login");
      } else {
        toast.error(msg);
      }
    } finally {
      setSignupLoading(false);
    }
  };

  const handleDownload = () => {
    if (!receipt) return;

    const items = receipt.selectedItems
      .map((i) => `  - ${i.name}: ${formatCurrency(i.price / 100)}`)
      .join("\n");

    const lines = [
      "==============================",
      "      MOTOKA PAYMENT RECEIPT  ",
      "==============================",
      "",
      `Reference   : ${receipt.reference}`,
      `Date        : ${new Date(receipt.paidAt).toLocaleString()}`,
      `Gateway     : ${receipt.gateway?.toUpperCase() || "—"}`,
      "",
      "--- Customer ---",
      `Name        : ${receipt.guestName}`,
      `Email       : ${receipt.guestEmail}`,
      `Phone       : ${receipt.guestPhone || "—"}`,
      `Plate No.   : ${receipt.plateNumber}`,
      "",
      "--- Documents Renewed ---",
      items,
      "",
      ...(receipt.deliveryFee > 0
        ? [`Delivery Fee: ${formatCurrency(receipt.deliveryFee / 100)}`, ""]
        : []),
      `TOTAL PAID  : ${formatCurrency(receipt.totalAmount / 100)}`,
      "",
      "==============================",
      "   Thank you for using Motoka",
      "==============================",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `motoka-receipt-${receipt.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5FC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
      </div>
    );
  }

  if (!loading && (!orderId || !token)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5FC] p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-[#E5F3FF]">
            <Icon icon="solar:letter-bold" fontSize={36} className="text-[#2389E3]" />
          </div>
          <h2 className="text-xl font-semibold text-[#05243F] mb-2">Find Your Receipt</h2>
          <p className="text-sm text-[#697C8C] mb-6">
            Enter the email address you used during checkout and we&apos;ll resend your
            payment receipt.
          </p>
          {!findSent ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!findEmail.trim()) return;
                setFindLoading(true);
                try {
                  await resendGuestReceiptEmail(findEmail.trim().toLowerCase());
                } finally {
                  setFindLoading(false);
                  setFindSent(true);
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="email"
                required
                value={findEmail}
                onChange={(e) => setFindEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[#E1E5EE] px-4 py-3 text-sm text-[#05243F] outline-none focus:border-[#2389E3]"
              />
              <button
                type="submit"
                disabled={findLoading}
                className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors disabled:opacity-50"
              >
                {findLoading ? "Sending…" : "Send My Receipt"}
              </button>
            </form>
          ) : (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
              If we found a paid order for that email, we&apos;ve sent the receipt to your inbox.
              Check your spam folder if you don&apos;t see it.
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full rounded-full border border-[#E1E5EE] py-3 text-sm font-medium text-[#697C8C] hover:bg-[#F4F5FC] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!loading && !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F5FC] p-4">
        <div className="text-center">
          <Icon icon="solar:danger-triangle-bold" fontSize={48} className="text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#05243F] mb-2">Receipt Not Found</h2>
          <p className="text-sm text-[#697C8C] mb-6">
            This receipt link is invalid or the payment has not been confirmed yet.
          </p>
          <button onClick={() => navigate("/")} className="rounded-full bg-[#2389E3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5FC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* ── Receipt view ── */}
        {step === "receipt" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#104675] px-6 py-8 text-center">
              <div className="mx-auto mb-3 h-14 w-14 flex items-center justify-center rounded-full bg-white/10">
                <Icon icon="solar:check-circle-bold" fontSize={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-white mb-1">Payment Successful</h1>
              <p className="text-sm text-white/70">Vehicle document renewal confirmed</p>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#697C8C]">Reference</span>
                <span className="font-mono font-medium text-[#05243F]">{receipt.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#697C8C]">Name</span>
                <span className="font-medium text-[#05243F]">{receipt.guestName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#697C8C]">Email</span>
                <span className="font-medium text-[#05243F]">{receipt.guestEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#697C8C]">Plate Number</span>
                <span className="font-bold text-[#05243F]">{receipt.plateNumber}</span>
              </div>

              <hr className="border-[#F4F5FC]" />

              <div>
                <p className="text-sm text-[#697C8C] mb-2">Documents Renewed</p>
                {receipt.selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1">
                    <span className="text-[#05243F]">{item.name}</span>
                    <span className="text-[#697C8C]">{formatCurrency(item.price / 100)}</span>
                  </div>
                ))}
              </div>

              {receipt.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#697C8C]">Delivery Fee</span>
                  <span className="text-[#05243F]">{formatCurrency(receipt.deliveryFee / 100)}</span>
                </div>
              )}

              <hr className="border-[#F4F5FC]" />

              <div className="flex justify-between font-semibold">
                <span className="text-[#05243F]">Total Paid</span>
                <span className="text-[#2389E3] text-lg">{formatCurrency(receipt.totalAmount / 100)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex flex-col gap-3">
              {receipt.hasLinkedAccount ? (
                <>
                  <div className="rounded-xl bg-[#E5F3FF] border border-[#2389E3]/20 px-4 py-3 text-sm text-[#104675]">
                    This renewal has been linked to your Motoka account. Log in to view it on your dashboard.
                  </div>
                  <button
                    onClick={() => navigate("/auth/login")}
                    className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors"
                  >
                    Log In to Your Account
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStep("signup")}
                  className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors"
                >
                  Create Account to Track Documents
                </button>
              )}
              <button
                onClick={handleDownload}
                className="w-full rounded-full border border-[#E1E5EE] py-3 text-sm font-medium text-[#05243F] hover:bg-[#F4F5FC] transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="solar:download-bold" fontSize={16} />
                Download Receipt
              </button>
            </div>
          </div>
        )}

        {/* ── Account creation ── */}
        {step === "signup" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-[#104675] px-6 py-6 text-center">
              <h1 className="text-xl font-semibold text-white mb-1">Create Your Account</h1>
              <p className="text-sm text-white/70">Keep track of your documents anytime</p>
            </div>

            <form onSubmit={handleSignup} className="px-6 py-6 space-y-4">
              {/* Email — prefilled and locked */}
              <div className="relative">
                <input
                  type="email"
                  value={receipt.guestEmail}
                  readOnly
                  className="w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] opacity-70 outline-none"
                />
                <label className="absolute left-4 top-1.5 text-xs text-[#697C8C]">Email</label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 pr-11 text-sm text-[#05243F] outline-none focus:bg-[#FFF4DD]"
                  placeholder=" "
                />
                <label className="absolute left-4 top-1.5 text-xs text-[#697C8C]">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#697C8C]"
                >
                  <Icon icon={showPassword ? "solar:eye-closed-bold" : "solar:eye-bold"} fontSize={18} />
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] outline-none focus:bg-[#FFF4DD]"
                  placeholder=" "
                />
                <label className="absolute left-4 top-1.5 text-xs text-[#697C8C]">Confirm Password</label>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full rounded-full bg-[#2389E3] py-3 text-sm font-semibold text-white hover:bg-[#1B6CB3] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signupLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("receipt")}
                className="w-full rounded-full border border-[#E1E5EE] py-3 text-sm font-medium text-[#697C8C] hover:bg-[#F4F5FC] transition-colors"
              >
                Back to Receipt
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
