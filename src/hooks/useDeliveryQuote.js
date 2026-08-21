import { useEffect, useState } from "react";
import { quoteDelivery } from "../services/apiDelivery";

export function useDeliveryQuote({
  enabled,
  state,
  lga,
  purpose = "renewal",
  selectedItems = [],
  guest = false,
}) {
  const [feeKobo, setFeeKobo] = useState(0);
  const [weightKg, setWeightKg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !state || !lga) {
      setFeeKobo(0);
      setWeightKg(null);
      setError("");
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const quote = await quoteDelivery({
          state,
          lga,
          purpose,
          selected_items: selectedItems,
          guest,
        });
        if (cancelled) return;
        setFeeKobo(Number(quote.fee_kobo) || 0);
        setWeightKg(quote.weight_kg);
        setError("");
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.message || err.message || "Could not calculate delivery fee";
        setFeeKobo(0);
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, state, lga, purpose, guest, JSON.stringify(selectedItems)]);

  return { feeKobo, weightKg, loading, error };
}
