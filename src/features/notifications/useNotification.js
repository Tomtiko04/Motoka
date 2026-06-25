import { useQuery } from "@tanstack/react-query";
import { getNotifications, getNotificationsByType } from "../../services/apiNotification";

export function updateNotificationsCache(cacheData, updater) {
  if (!cacheData) return cacheData;

  const container = cacheData?.data ?? cacheData;
  if (!container || typeof container !== "object") return cacheData;

  if (Array.isArray(container)) {
    return container.map((item) => (item && typeof item === "object" ? updater(item) : item));
  }

  const next = {};
  let changed = false;

  Object.entries(container).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const updated = value.map((item) => (item && typeof item === "object" ? updater(item) : item));
      changed = changed || updated !== value;
      next[key] = updated;
    } else {
      next[key] = value;
    }
  });

  return changed ? next : cacheData;
}

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