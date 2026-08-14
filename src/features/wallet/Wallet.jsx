import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, ArrowDownLeft, ArrowUpRight, Wallet as WalletIcon, ShieldCheck } from "lucide-react";
import { getWallet, getWalletLedger } from "../../services/apiWallet";
import FundWalletModal from "./components/FundWalletModal";

const naira = (kobo) => `₦${(Number(kobo || 0) / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;

const REASON_LABEL = {
  funding: "Wallet top-up",
  payment: "Payment",
  refund: "Refund",
  admin_adjustment: "Adjustment",
  reversal: "Reversal",
  referral: "Referral bonus",
};

export default function Wallet() {
  const [fundOpen, setFundOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
  });
  const { data: ledger, isLoading: ledgerLoading } = useQuery({
    queryKey: ["wallet-ledger"],
    queryFn: () => getWalletLedger({ page: 1, limit: 25 }),
  });

  const entries = ledger?.entries || [];

  return (
    <div className="mx-auto max-w-2xl px-3 pb-16 sm:px-6">
      <h1 className="mb-5 text-xl font-medium text-[#05243F] sm:text-2xl">Wallet</h1>

      {/* Balance hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#05243F] to-[#0A3B66] p-6 text-white shadow-sm">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -left-6 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-white/70">
            <WalletIcon className="h-4 w-4" />
            <span className="text-sm">Available balance</span>
          </div>
          <div className="mb-6 text-4xl font-semibold tracking-tight">
            {walletLoading ? <span className="opacity-50">₦—</span> : naira(wallet?.balance_kobo)}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFundOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#2389E3] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1b6dbd] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Add money
            </button>
            {wallet?.status === "frozen" && (
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-100">Frozen</span>
            )}
          </div>
        </div>
      </div>

      {/* Reassurance strip */}
      <div className="mt-3 flex items-center gap-2 px-1 text-xs text-[#697C8C]">
        <ShieldCheck className="h-3.5 w-3.5" />
        Funds stay in your wallet and can be used for any Motoka renewal.
      </div>

      {/* History */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-[#05243F]">Transaction history</h2>
        {ledgerLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#F1F4F9]" />)}
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E1E5EE] p-8 text-center">
            <p className="text-sm text-[#697C8C]">No transactions yet.</p>
            <p className="mt-1 text-xs text-[#697C8C]/70">Add money to get started.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F4F9] overflow-hidden rounded-2xl border border-[#EEF1F6] bg-white">
            {entries.map((e) => {
              const credit = e.direction === "credit";
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${credit ? "bg-[#E7F6EF] text-[#1FA97A]" : "bg-[#FDEEF0] text-[#C0435C]"}`}>
                    {credit ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#05243F]">{REASON_LABEL[e.reason] || e.reason}</p>
                    <p className="text-xs text-[#697C8C]">{new Date(e.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${credit ? "text-[#1FA97A]" : "text-[#05243F]"}`}>
                      {credit ? "+" : "−"}{naira(e.amount_kobo)}
                    </p>
                    <p className="text-[11px] text-[#697C8C]">{naira(e.balance_after)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <FundWalletModal open={fundOpen} onClose={() => setFundOpen(false)} />
    </div>
  );
}
