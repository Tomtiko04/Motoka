import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyPaystackPayment } from "../services/apiPaystack";

// Paystack redirects here after a wallet top-up. Verifying the reference is what
// credits the wallet on the backend (the verify path handles wallet_funding).
export default function WalletCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState("verifying"); // verifying | success | error
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      setState("error");
      return;
    }
    verifyPaystackPayment(reference)
      .then(() => {
        setState("success");
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
        queryClient.invalidateQueries({ queryKey: ["wallet-ledger"] });
        setTimeout(() => navigate("/wallet", { replace: true }), 1600);
      })
      .catch(() => {
        setState("error");
        setTimeout(() => navigate("/wallet", { replace: true }), 2200);
      });
  }, [params, navigate, queryClient]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {state === "verifying" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-[#2389E3]" />
          <p className="mt-4 text-sm text-[#697C8C]">Confirming your top-up…</p>
        </>
      )}
      {state === "success" && (
        <>
          <CheckCircle2 className="h-12 w-12 text-[#1FA97A]" />
          <p className="mt-4 text-lg font-semibold text-[#05243F]">Wallet funded</p>
          <p className="mt-1 text-sm text-[#697C8C]">Taking you back to your wallet…</p>
        </>
      )}
      {state === "error" && (
        <>
          <XCircle className="h-12 w-12 text-[#C0435C]" />
          <p className="mt-4 text-lg font-semibold text-[#05243F]">We couldn't confirm that payment</p>
          <p className="mt-1 text-sm text-[#697C8C]">If you were charged, your wallet will update shortly. Redirecting…</p>
        </>
      )}
    </div>
  );
}
