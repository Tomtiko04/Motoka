import { useState } from "react";

// Nigerian mobile: 080..., 070..., 090..., 081... (11 digits) or +234 / 234 prefix.
const NG_PHONE_RE = /^(?:\+?234|0)[789]\d{9}$/;

const normalize = (raw) => (raw || "").replace(/[\s-]/g, "");

/**
 * Shown when a Monicredit (bank-transfer) init fails because the user has no
 * phone number on file. Lets them add it inline and continue, rather than being
 * bounced to Settings → Profile and losing the checkout. Falls back to card.
 */
export default function PhonePromptModal({
  open,
  onSubmit,
  onUseCard,
  onClose,
  saving = false,
  error = null,
}) {
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState(null);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = normalize(phone);
    if (!NG_PHONE_RE.test(value)) {
      setLocalError("Enter a valid Nigerian phone number, e.g. 08012345678.");
      return;
    }
    setLocalError(null);
    onSubmit(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-prompt-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2
          id="phone-prompt-title"
          className="text-lg font-semibold text-[#05243F]"
        >
          Add your phone number
        </h2>
        <p className="mt-2 text-sm text-[#05243F]/60">
          Bank transfer needs a phone number to generate your account details.
          Add it once and we&apos;ll continue your payment right away.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="tel"
            inputMode="tel"
            autoFocus
            placeholder="e.g. 08012345678"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (localError) setLocalError(null);
            }}
            disabled={saving}
            className="block w-full rounded-lg bg-[#F9FAFC] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200 disabled:opacity-60"
          />

          {(localError || error) && (
            <p className="text-xs text-red-600">{localError || error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-3xl bg-[#2389E3] px-4 py-2.5 text-base font-semibold text-white transition-all duration-300 hover:bg-[#1B6FB8] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save & continue"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={onUseCard}
            disabled={saving}
            className="font-medium text-[#2389E3] hover:underline disabled:opacity-60"
          >
            Pay with card instead
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-[#05243F]/50 hover:text-[#05243F] disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
