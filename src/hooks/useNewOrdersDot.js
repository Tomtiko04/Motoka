import { useEffect, useRef, useState } from "react";
import config from "../config/config";
import { adminListGuestOrders } from "../services/apiDelivery";

const POLL_MS = 45000;

// Drives the blue "new orders" dot: true while any order still needs
// attention (signed-in `pending`, guest `pending_payment`). Ticks are
// count-only queries (per_page/limit 1) so an always-open admin tab stays
// cheap, and a failed tick never clears a dot that is already showing —
// this is a background signal, so it never toasts.
export default function useNewOrdersDot({ enabled = true } = {}) {
  const [counts, setCounts] = useState({ signed: 0, guest: 0 });
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    cancelledRef.current = false;
    let timer;

    const tick = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) return;
        const [signedRes, guest] = await Promise.all([
          fetch(
            `${config.getApiBaseUrl()}/admin/orders?status=pending&page=1&per_page=1`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ).then((r) => r.json()),
          adminListGuestOrders({ page: 1, limit: 1, status: "pending_payment" }).catch(
            () => null,
          ),
        ]);
        if (cancelledRef.current) return;
        setCounts({
          signed: Number(signedRes?.data?.total) || 0,
          guest: Number(guest?.pagination?.total) || 0,
        });
      } catch {
        // Keep existing counts; retry on the next tick.
      } finally {
        if (!cancelledRef.current) timer = setTimeout(tick, POLL_MS);
      }
    };

    tick();
    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [enabled]);

  return { ...counts, hasNew: counts.signed + counts.guest > 0 };
}
