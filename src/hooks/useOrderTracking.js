import { useQuery } from "@tanstack/react-query";
import { adminGetShipment, getGuestOrderTracking, getOrderTracking } from "../services/apiDelivery";

function stillMoving(progress) {
  const key = progress?.current_key;
  return Boolean(progress?.has_delivery && key && key !== "delivered");
}

export function useOrderTracking(orderNumber, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["order-tracking", orderNumber],
    queryFn: () => getOrderTracking(orderNumber),
    enabled: Boolean(enabled && orderNumber),
    refetchInterval: (query) => (stillMoving(query.state.data?.progress) ? 45000 : false),
  });
}

export function useGuestOrderTracking(orderId, { token, enabled = true } = {}) {
  return useQuery({
    queryKey: ["guest-order-tracking", orderId, token],
    queryFn: () => getGuestOrderTracking(orderId, token),
    enabled: Boolean(enabled && orderId && token),
    refetchInterval: (query) => (stillMoving(query.state.data?.progress) ? 45000 : false),
  });
}

export function useAdminOrderTracking(orderNumber, { enabled = true } = {}) {
  return useQuery({
    queryKey: ["admin-order-tracking", orderNumber],
    queryFn: () => adminGetShipment(orderNumber),
    enabled: Boolean(enabled && orderNumber),
    refetchInterval: (query) => (stillMoving(query.state.data?.progress) ? 45000 : false),
  });
}
