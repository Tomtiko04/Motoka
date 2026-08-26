import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { updateNotificationsCache, useNotifications } from "../features/notifications/useNotification";
import NotificationCard from "../pages/components/notificationCard";
import { useNavigate } from "react-router-dom";
import { markNotificationAsRead } from "../services/apiNotification";
import { FaTimes } from "react-icons/fa";

const markNotificationReadCache = (cacheData, notificationId) =>
  updateNotificationsCache(cacheData, (notification) =>
    notification.id === notificationId ? { ...notification, is_read: true } : notification,
  );

export default function RecentNotificationModal({ setNotificationsModal }) {
  const { data } = useNotifications({ unreadOnly: true, enabled: true });
  const navigate = useNavigate();
  function mapUiCategory(type, action) {
    const t = (type || "").toLowerCase();
    const a = (action || "").toLowerCase();
    if (t === "payment") return "Payments";
    if (t === "car") return "Licenses Added";
    if (t === "warning" || a === "warning" || a === "ladipo_payment_failed")
      return "Warning";
    if (
      a === "completed" ||
      a === "success" ||
      a === "created" ||
      a === "ladipo_payment_success"
    )
      return "Successful";
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Notification";
  }
  const normalizeNotification = (n) => {
    const category = mapUiCategory(n.type, n.action);
    const created = new Date(n.created_at);
    return {
      id: n.id,
      category,
      message: n.message,
      time: created.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      rawDate: created,
      isRead: Boolean(n.is_read),
    };
  };

  const flattenNotifications = (source) => {
    const container = source?.data ?? source;
    let all = [];
    if (container && typeof container === "object") {
      Object.values(container).forEach((arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((n) => all.push(normalizeNotification(n)));
        }
      });
    }

    return all;
  };

  const queryClient = useQueryClient();
  const markSingleMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"], exact: false });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["notifications"], exact: false });

      queryClient.setQueryData(["notifications", "unread"], (prev) =>
        markNotificationReadCache(prev, notificationId),
      );
      queryClient.setQueryData(["notifications", "all"], (prev) =>
        markNotificationReadCache(prev, notificationId),
      );
      queryClient.setQueriesData({ queryKey: ["notifications"], exact: false }, (prev) =>
        markNotificationReadCache(prev, notificationId),
      );

      return { previousQueries };
    },
    onSuccess: () => {
      toast.success("Notification marked as read");
    },
    onError: (error, _notificationId, context) => {
      context?.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || error.message || "Unable to mark notification as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });
    },
    retry: false,
  });

  const handleMarkRead = (id) => {
    if (!markSingleMutation.isLoading) {
      markSingleMutation.mutate(id);
    }
  };

  const recentTwo = useMemo(() => {
    if (!data) return [];
    const allNotifications = flattenNotifications(data);
    allNotifications.sort((a, b) => b.rawDate - a.rawDate);
    return allNotifications.slice(0, 2);
  }, [data]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={() => setNotificationsModal(false)}
      />
      <div className="absolute top-2 right-2 z-50 w-[300px] sm:w-[350px] rounded-2xl bg-white p-4 shadow-xl border border-gray-100 sm:right-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-[#05243F]">Notifications</h3>
            {recentTwo.length > 0 && (
              <span className="rounded-full bg-[#EAF5FF] px-2 py-0.5 text-[10px] font-semibold text-[#2389E3]">
                {recentTwo.length} Recent
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setNotificationsModal(false)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentTwo.length > 0 ? (
            recentTwo.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onMarkRead={() => handleMarkRead(n.id)}
                markReadButtonType="icon"
              />
            ))
          ) : (
            <div className="py-6 text-center text-xs text-gray-400">
              No unread notifications
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center">
          <button
            type="button"
            className="text-xs font-semibold text-[#2389E3] hover:text-[#1a6dba] hover:underline cursor-pointer transition-colors"
            onClick={() => {
              navigate("/notifications");
              setNotificationsModal(false);
            }}
          >
            View all notifications &rarr;
          </button>
        </div>
      </div>
    </>
  );
}
