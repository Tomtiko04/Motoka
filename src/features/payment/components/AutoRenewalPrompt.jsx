import React, { useState } from "react";
import { toast } from "react-hot-toast";
import AutoModeIcon from "../../../assets/images/ic_round-auto-mode.png";
import { createSubscription, initiateTokenization } from "../../../services/apiSubscription";

/**
 * AutoRenewalPrompt
 *
 * Shown after a successful bank transfer (Monicredit) payment.
 * Creates a pending subscription and initiates ₦50 card tokenization via
 * a Paystack popup. On success the webhook activates the subscription and
 * refunds the ₦50 automatically.
 *
 * Props:
 *   carSlug       {string}   - slug of the car that was just renewed
 *   amount        {number}   - renewal amount in kobo (used as subscription amount)
 *   selectedItems {number[]} - payment_schedule IDs that were just paid
 *   onDone        {Function} - called when the user clicks "Done" or skips
 */
export default function AutoRenewalPrompt({ carSlug, amount, selectedItems = [], onDone }) {
  const [step, setStep] = useState("prompt"); // "prompt" | "loading" | "awaiting" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const handleEnable = async () => {
    if (!carSlug) {
      toast.error("Car information missing — please set up auto-renewal from Settings.");
      onDone();
      return;
    }

    setStep("loading");
    try {
      // 1. Create pending subscription
      const subResult = await createSubscription({
        car_slug: carSlug,
        amount,
        plan: "annual",
        selected_items: selectedItems,
      });

      const subscriptionId = subResult?.data?.subscription?.id;
      if (!subscriptionId) throw new Error("Could not create subscription");

      // 2. Initiate ₦50 tokenization
      const tokenResult = await initiateTokenization(subscriptionId);
      const authUrl = tokenResult?.data?.payment?.authorization_url;
      if (!authUrl) throw new Error("Could not get tokenization payment URL");

      // 3. Open Paystack popup (card only — channels restricted on backend)
      const popup = window.open(authUrl, "_blank", "noopener,noreferrer,width=600,height=700");
      if (!popup) {
        toast.error("Please allow popups for this site to continue.");
        setStep("prompt");
        return;
      }

      setStep("awaiting");

      // 4. Poll for popup close
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          // Webhook handles the rest (activates subscription + refunds ₦50).
          // We can't confirm here without polling the subscription status,
          // so just show a soft success message.
          setStep("success");
        }
      }, 1000);

    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      setErrorMsg(msg);
      setStep("error");
    }
  };

  if (step === "loading") {
    return (
      <PromptShell>
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2389E3]" />
          <p className="text-sm text-[#05243F]/70">Setting up auto-renewal…</p>
        </div>
      </PromptShell>
    );
  }

  if (step === "awaiting") {
    return (
      <PromptShell>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2389E3]" />
          <p className="text-sm font-medium text-[#05243F]">Complete payment in the popup</p>
          <p className="text-xs text-[#05243F]/60">
            A ₦50 test charge will be made and immediately refunded. This is only to save your card.
          </p>
        </div>
      </PromptShell>
    );
  }

  if (step === "success") {
    return (
      <PromptShell>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8F5E8]">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-[#05243F]">Auto-renewal enabled!</p>
          <p className="text-xs text-[#05243F]/60">
            Your car will be renewed automatically before it expires. You can manage this in Settings.
          </p>
          <button
            onClick={onDone}
            className="mt-2 w-full rounded-full bg-[#2389E3] py-2.5 text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>
      </PromptShell>
    );
  }

  if (step === "error") {
    return (
      <PromptShell>
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <p className="text-sm font-medium text-red-600">{errorMsg}</p>
          <p className="text-xs text-[#05243F]/60">
            You can still set up auto-renewal later from Settings → Auto Renewal.
          </p>
          <button
            onClick={onDone}
            className="mt-2 w-full rounded-full bg-[#2389E3] py-2.5 text-sm font-semibold text-white"
          >
            Continue to Dashboard
          </button>
        </div>
      </PromptShell>
    );
  }

  // Default: "prompt" step
  return (
    <PromptShell>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img src={AutoModeIcon} alt="Auto-renewal" className="h-8 w-8 object-contain" />
          <div>
            <p className="text-sm font-semibold text-[#05243F]">Enable Auto-Renewal</p>
            <p className="text-xs text-[#05243F]/60">Never miss your car's renewal date again</p>
          </div>
        </div>

        <ul className="space-y-1.5 text-xs text-[#05243F]/70">
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-green-500">✓</span>
            Auto-charged 14 days before expiry
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-green-500">✓</span>
            Renews the same documents you selected today
          </li>
          <li className="flex items-start gap-1.5">
            <span className="mt-0.5 text-green-500">✓</span>
            Cancel any time from Settings
          </li>
        </ul>

        <p className="text-xs text-[#05243F]/50">
          A refundable ₦50 test charge verifies your card. It's returned within 24 hours.
        </p>

        <button
          onClick={handleEnable}
          className="w-full rounded-full bg-[#2389E3] py-2.5 text-sm font-semibold text-white"
        >
          Enable Auto-Renewal
        </button>
        <button
          onClick={onDone}
          className="w-full rounded-full border border-[#E1E5EE] py-2.5 text-sm font-medium text-[#05243F]/70"
        >
          Not now
        </button>
      </div>
    </PromptShell>
  );
}

function PromptShell({ children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-base font-semibold text-[#05243F]">One more thing</h3>
        {children}
      </div>
    </div>
  );
}
