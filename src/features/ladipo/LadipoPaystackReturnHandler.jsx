import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { verifyLadipoPayment } from "../../services/apiLadipo";
import useCartStore from "../../store/cartStore";
import { useLadipoPaymentModalStore } from "../../store/ladipoPaymentModalStore";

/**
 * When Paystack redirects to /ladipo/payment/callback, show processing modal,
 * verify payment, then success modal — without a dedicated “verifying” page.
 */
export default function LadipoPaystackReturnHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearCart = useCartStore((s) => s.clearCart);
  const openProcessing = useLadipoPaymentModalStore((s) => s.openProcessing);
  const openSuccess = useLadipoPaymentModalStore((s) => s.openSuccess);
  const close = useLadipoPaymentModalStore((s) => s.close);
  const lastHandledRef = useRef(null);

  useEffect(() => {
    if (!location.pathname.endsWith("/ladipo/payment/callback")) return;

    const params = new URLSearchParams(location.search);
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      toast.error("No payment reference found");
      navigate("/ladipo/cart-page", { replace: true });
      return;
    }

    const dedupeKey = `ladipo_paystack_cb_${reference}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) {
        navigate("/ladipo", { replace: true });
        return;
      }
      sessionStorage.setItem(dedupeKey, "1");
    } catch {
      if (lastHandledRef.current === reference) {
        navigate("/ladipo", { replace: true });
        return;
      }
      lastHandledRef.current = reference;
    }

    let amountKobo = 0;
    try {
      const pd = JSON.parse(sessionStorage.getItem("paymentData") || "null");
      amountKobo = Number(pd?.amount || 0);
    } catch {
      /* ignore */
    }

    openProcessing(amountKobo);
    navigate("/ladipo", { replace: true });

    verifyLadipoPayment(reference)
      .then((order) => {
        clearCart();
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.success("Payment successful! Your order is confirmed.");
        openSuccess({
          order,
          amountKobo: order?.total_kobo ?? amountKobo,
        });
      })
      .catch((err) => {
        try {
          sessionStorage.removeItem(dedupeKey);
        } catch {
          /* ignore */
        }
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Payment verification failed";
        toast.error(msg);
        close();
        navigate("/ladipo/cart-page", { replace: true });
      });
  }, [
    location.pathname,
    location.search,
    navigate,
    queryClient,
    clearCart,
    openProcessing,
    openSuccess,
    close,
  ]);

  return null;
}
