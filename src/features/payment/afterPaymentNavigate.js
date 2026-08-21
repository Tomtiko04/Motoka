/** Shared post-pay routing for renewal / plate / DL (not Ladipo). */

export function paymentSessionWantsDelivery(session) {
  if (!session) return false;
  const delivery = session.deliveryDetails || session.delivery_details || session.meta_data || {};
  const address = String(
    delivery.address || delivery.delivery_address || session.delivery_address || ""
  ).trim();
  const fee = Number(delivery.fee || session.delivery_fee || 0);
  return Boolean(address || (Number.isFinite(fee) && fee > 0));
}

export function readStoredPaymentSession() {
  try {
    const raw = sessionStorage.getItem("paymentData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function pickOrderNumber(...candidates) {
  for (const value of candidates) {
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return null;
}

export function pathAfterDocumentPayment({ orderNumber, session }) {
  if (orderNumber) {
    return `/orders/${encodeURIComponent(orderNumber)}/track`;
  }
  return "/dashboard";
}
