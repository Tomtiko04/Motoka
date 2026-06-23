import { useQuery } from "@tanstack/react-query";
import { getNotifications, getNotificationsByType } from "../../services/apiNotification";

export function useNotifications({ unreadOnly = false, ...options } = {}) {
  return useQuery({
    queryKey: ["notifications", unreadOnly ? "unread" : "all"],
    queryFn: () => getNotifications(unreadOnly),
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