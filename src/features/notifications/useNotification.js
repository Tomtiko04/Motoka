import { useQuery } from "@tanstack/react-query";
import { getNotifications, getNotificationsByType } from "../../services/apiNotification";

export function useNotifications(options = {}) {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    retry: false,
    ...options,
  });
}

export function useNotificationsByType(type, options = {}) {
  return useQuery({
    queryKey: ["notifications", "type", type],
    queryFn: () => getNotificationsByType(type),
    enabled: Boolean(type),
    retry: false,
    ...options,
  });
}