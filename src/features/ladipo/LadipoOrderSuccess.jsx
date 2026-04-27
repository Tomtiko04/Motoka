import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getLadipoOrder } from "../../services/apiLadipo";
import { useLadipoPaymentModalStore } from "../../store/ladipoPaymentModalStore";

/**
 * Legacy route: opens the same success modal as checkout, then sends users to Ladipo.
 * Prefer landing on /ladipo with the modal (no full success page).
 */
export default function LadipoOrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const openedRef = useRef(false);

  const orderFromState = location.state?.order;
  const orderNumber = orderFromState?.order_number || searchParams.get("order");

  const { data: fetchedOrder, isSuccess, isError } = useQuery({
    queryKey: ["ladipo-order", orderNumber],
    queryFn: () => getLadipoOrder(orderNumber),
    enabled: !orderFromState && !!orderNumber,
  });

  const order = orderFromState || (isSuccess ? fetchedOrder : null);

  useEffect(() => {
    if (!orderFromState && orderNumber && isError) {
      navigate("/ladipo/cart-page", { replace: true });
    }
  }, [orderFromState, orderNumber, isError, navigate]);

  useEffect(() => {
    if (!order || openedRef.current) return;
    openedRef.current = true;
    useLadipoPaymentModalStore.getState().openSuccess({
      order,
      amountKobo: order.total_kobo,
    });
    navigate("/ladipo", { replace: true });
  }, [order, navigate]);

  if (!orderNumber && !orderFromState) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center px-4">
        <p className="text-[13px] text-[#697C8C]">No order to show.</p>
      </div>
    );
  }

  if (!order && !isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-[#E1E6F4] border-t-[#2389E3] animate-spin" />
          <p className="text-[13px] text-[#697C8C]">Loading order…</p>
        </div>
      </div>
    );
  }

  if (isError && !orderFromState) {
    return null;
  }

  return null;
}
