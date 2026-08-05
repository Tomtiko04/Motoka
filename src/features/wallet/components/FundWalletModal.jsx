import { useEffect, useMemo, useRef, useState } from "react";
import { X, Zap, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { getFundingQuote, initFunding } from "../../../services/apiWallet";

const PRESETS = [30000, 50000, 75000, 100000]; // naira — sized to Motoka's services (nothing is under ₦30k)
const naira = (n) => `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

export default function FundWalletModal({ open, onClose }) {
  const [amount, setAmount] = useState(50000); // naira
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef();

  // Live, debounced fee quote so the breakdown updates as they type/pick.
  useEffect(() => {
    if (!open) return;
    const kobo = Math.round(Number(amount) * 100);
    if (!kobo || kobo < 10000) {
      setQuote(null);
      setError(amount ? "Minimum top-up is ₦100." : null);
      return;
    }
    setError(null);
    setQuoting(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        setQuote(await getFundingQuote(kobo));
      } catch (e) {
        setError(e.response?.data?.message || "Couldn't fetch fee. Try a different amount.");
        setQuote(null);
      } finally {
        setQuoting(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [amount, open]);

  const feePct = useMemo(() => {
    if (!quote?.credit_kobo) return null;
    return (quote.fee_kobo / quote.credit_kobo) * 100;
  }, [quote]);

  if (!open) return null;

  const handleContinue = async () => {
    const kobo = Math.round(Number(amount) * 100);
    if (!kobo || kobo < 10000) return setError("Minimum top-up is ₦100.");
    setSubmitting(true);
    setError(null);
    try {
      const res = await initFunding(kobo);
      if (res?.authorization_url) {
        // Full-tab redirect to Paystack; it returns to /wallet/callback.
        window.location.href = res.authorization_url;
      } else {
        throw new Error("Could not start payment. Please try again.");
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Could not start payment.");
      toast.error("Could not start payment.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#05243F]">Add money</h2>
          <button onClick={onClose} className="rounded-full p-1 text-[#697C8C] hover:bg-[#E1E5EE]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The honest hook: pay the fee once, then spend fee-free. */}
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-[#FFF4DD] px-4 py-3">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#E0A200]" />
          <p className="text-xs leading-relaxed text-[#05243F]/80">
            Pay the card fee <span className="font-semibold">once</span> when you top up — then every renewal you pay from your wallet is instant and <span className="font-semibold">fee-free</span>.
          </p>
        </div>

        {/* Preset chips */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(p)}
              className={`relative rounded-xl py-2.5 text-sm font-semibold transition-all ${
                Number(amount) === p
                  ? "bg-[#2389E3] text-white"
                  : "bg-[#F1F4F9] text-[#05243F] hover:bg-[#E1E5EE]"
              }`}
            >
              ₦{(p / 1000)}k
              {p >= 75000 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1FA97A] px-1.5 py-0.5 text-[9px] font-bold text-white">
                  best value
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <label className="mb-1.5 block text-xs font-medium text-[#697C8C]">Or enter an amount</label>
        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[#05243F]">₦</span>
          <input
            type="number"
            inputMode="numeric"
            min={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={submitting}
            className="block w-full rounded-xl bg-[#F9FAFC] py-3 pl-10 pr-4 text-base font-semibold text-[#05243F] focus:bg-[#FFF4DD] focus:outline-none"
          />
        </div>

        {/* Live breakdown */}
        <div className="mb-4 rounded-2xl border border-[#EEF1F6] p-4 text-sm">
          <Row label="Added to wallet" value={quote ? naira(quote.credit_naira) : "—"} />
          <Row
            label={<span>Processing fee {feePct != null && <span className="text-[#697C8C]">({feePct.toFixed(1)}%)</span>}</span>}
            value={quoting ? "…" : quote ? naira(quote.fee_naira) : "—"}
            muted
          />
          <div className="my-2 border-t border-dashed border-[#EEF1F6]" />
          <Row label={<span className="font-semibold text-[#05243F]">You pay</span>} value={<span className="font-semibold text-[#05243F]">{quote ? naira(quote.total_charge_naira) : "—"}</span>} big />
        </div>

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <button
          onClick={handleContinue}
          disabled={submitting || quoting || !quote}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all hover:bg-[#1b6dbd] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</> : <>Continue to pay {quote ? naira(quote.total_charge_naira) : ""}</>}
        </button>
        <p className="mt-3 text-center text-[11px] text-[#697C8C]">Secured by Paystack · Card, bank transfer or USSD</p>
      </div>
    </div>
  );
}

function Row({ label, value, muted, big }) {
  return (
    <div className={`flex items-center justify-between ${big ? "" : "py-0.5"}`}>
      <span className={muted ? "text-[#697C8C]" : "text-[#05243F]/80"}>{label}</span>
      <span className={muted ? "text-[#697C8C]" : "text-[#05243F]"}>{value}</span>
    </div>
  );
}
