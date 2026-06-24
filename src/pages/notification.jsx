// import { useState } from "react";
// import { Icon } from "@iconify/react";
// import PageLayout from "./components/PageLayout";
// import NotificationList from "./components/notificationList";
// import { useNotifications, useNotificationsByType } from "../features/notifications/useNotification";

// function formatTime(date) {
//   const d = new Date(date);
//   const hh = String(d.getHours()).padStart(2, "0");
//   const mm = String(d.getMinutes()).padStart(2, "0");
//   return `${hh}:${mm}`;
// }

// function isToday(date) {
//   const d = new Date(date);
//   const now = new Date();
//   return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
// }

// function isYesterday(date) {
//   const d = new Date(date);
//   const y = new Date();
//   y.setDate(y.getDate() - 1);
//   return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
// }

// function daysAgo(date) {
//   const d = new Date(date);
//   const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
//   const now = new Date();
//   const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const diffMs = startOfNow - startOfD;
//   return Math.floor(diffMs / (1000 * 60 * 60 * 24));
// }

// function labelForDate(date) {
//   if (isToday(date)) return "Today";
//   if (isYesterday(date)) return "Yesterday";
//   const diff = daysAgo(date);
//   if (diff >= 2 && diff <= 7) return "Last week";
//   return "Others";
// }

// function mapUiCategory(type, action) {
//   const t = (type || "").toLowerCase();
//   const a = (action || "").toLowerCase();

//   if (t === "payment") return "Payments";
//   if (t === "car") return "Licenses Added";
//   if (t === "warning" || a === "warning") return "Warning";
//   if (a === "completed" || a === "success" || a === "created") return "Successful";

//   return t ? t.charAt(0).toUpperCase() + t.slice(1) : "Notification";
// }

// function mapCategoryIcon(category) {
//   if (category === "Warning") {
//     return (
//       <Icon
//         icon="mingcute:warning-fill"
//         width="30"
//         height="30"
//         className="text-[#FBBC04]"
//       />
//     );
//   }

//   if (category === "Successful" || category === "Congratulations" || category === "Payments") {
//     return (
//       <Icon
//         icon="lets-icons:check-fill"
//         width="30"
//         height="30"
//         className="text-[#50DD71]"
//       />
//     );
//   }

//   if (category === "Licenses Added") {
//     return (
//       <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2389E3]">
//         <Icon icon="ci:bulb" className="text-white" />
//       </div>
//     );
//   }

//   // Default fallback
//   return (
//     <Icon
//       icon="mingcute:notification-fill"
//       width="30"
//       height="30"
//       className="text-[#697C8C]"
//     />
//   );
// }

// function normalizeToArray(source) {
//   const container = source?.data ?? source;
//   if (Array.isArray(container)) return container;
//   if (container && typeof container === "object") {
//     const out = [];
//     Object.values(container).forEach((val) => {
//       if (Array.isArray(val)) out.push(...val);
//     });
//     return out;
//   }
//   return [];
// }

// function mapNotifications(raw = []) {
//   const list = Array.isArray(raw) ? raw : [];
//   return list.map((n) => {
//     const created = n.created_at || n.createdAt || n.date || Date.now();
//     const category = mapUiCategory(n.type, n.action) || n.category || n.title || "Notification";
//     const message = n.message || n.body || n.description || "";
//     const dateLabel = labelForDate(created);
//     const time = n.time || formatTime(created);
//     const icon = mapCategoryIcon(category);

//     return { category, message, date: dateLabel, time, icon };
//   });
// }

// export default function Notification() {
//   const [notificationsCategory, setNotificationsCategory] = useState("All");

//   const isAll = notificationsCategory === "All";
//   const { data: allData } = useNotifications({ enabled: isAll });
//   const { data: typeData } = useNotificationsByType(notificationsCategory, { enabled: !isAll });

//   const source = isAll ? allData : typeData;
//   const raw = normalizeToArray(source);
//   const notificationData = mapNotifications(raw);

// return(
//   <PageLayout title={"Notifications"}>
//   <div className="px-5 py-5 pt-8">
//     <div>
//       <ul className="items-center gap-3 hidden sm:flex">
//         {["All", "Warning", "Payments", "Licenses Added", "Successful"].map(
//           (category, index) => (
//             <li
//               key={index}
//               className={`rounded-full transition-[.5s] px-6 py-1.5 text-[16px] cursor-pointer ${
//                 notificationsCategory === category
//                   ? "bg-[#2389E3] text-white hover:bg-[#1b6dbb]"
//                   : "bg-[#F0F2F4] text-[#697C8C] hover:bg-[#dcddde]"
//               }`}
//               onClick={() => setNotificationsCategory(category)}
//             >
//               {category}
//             </li>
//           )
//         )}
//       </ul>
//     </div>

//     <NotificationList
//       notificationsCategory={notificationsCategory}
//       notificationData={notificationData}
//     />
//   </div>
// </PageLayout>
// )

// }
    
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import PageLayout from "./components/PageLayout";
import NotificationList from "./components/notificationList";
import {
  updateNotificationsCache,
  useNotifications,
  useNotificationsByType,
} from "../features/notifications/useNotification";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/apiNotification";

const markNotificationReadCache = (cacheData, notificationId) =>
  updateNotificationsCache(cacheData, (notification) =>
    notification.id === notificationId ? { ...notification, is_read: true } : notification,
  );

function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isYesterday(date) {
  const d = new Date(date);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return (
    d.getFullYear() === y.getFullYear() &&
    d.getMonth() === y.getMonth() &&
    d.getDate() === y.getDate()
  );
}

function daysAgo(date) {
  const d = new Date(date);
  const startOfD = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const now = new Date();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = startOfNow - startOfD;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function labelForDate(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  const diff = daysAgo(date);
  if (diff >= 2 && diff <= 7) return "Last week";
  return "Others";
}

function mapUiCategory(type, action) {
  const t = (type || "").toLowerCase();
  const a = (action || "").toLowerCase();
  if (t === "payment") return "Payments";
  if (t === "car") return "Licenses Added";
  if (t === "warning" || a === "warning" || a === "ladipo_payment_failed") return "Warning";
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
    time: created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    dateLabel: labelForDate(created),
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

export default function Notification() {
  const [notificationsCategory, setNotificationsCategory] = useState("All");
  const queryClient = useQueryClient();

  const isAll = notificationsCategory === "All";
  const { data: allData } = useNotifications({ unreadOnly: false, enabled: isAll });
  const { data: typeData } = useNotificationsByType(notificationsCategory, { enabled: !isAll });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"], exact: false });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["notifications"], exact: false });

      queryClient.setQueriesData({ queryKey: ["notifications"], exact: false }, (prev) =>
        updateNotificationsCache(prev, (notification) => ({ ...notification, is_read: true })),
      );

      return { previousQueries };
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
    },
    onError: (error, _variables, context) => {
      context?.previousQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error(error.response?.data?.message || error.message || "Unable to mark all notifications as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });
    },
    retry: false,
  });

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

  const hasUnreadNotifications = () => {
    const source = allData?.data ?? allData;
    if (!source || typeof source !== "object") return false;
    return Object.values(source).some(
      (arr) => Array.isArray(arr) && arr.some((notification) => notification?.is_read === false),
    );
  };

  const handleMarkAllRead = () => {
    if (!markAllMutation.isLoading) {
      markAllMutation.mutate();
    }
  };

  const handleMarkRead = (id) => {
    if (!markSingleMutation.isLoading) {
      markSingleMutation.mutate(id);
    }
  };

  const source = isAll ? allData : typeData;
  const notificationData = flattenNotifications(source);
  const visibleUnreadCount = notificationData.filter((notification) => !notification.isRead).length;

  return (
    <PageLayout title={"Notifications"}>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3 pb-3">
          <div>
            <p className="text-sm font-medium text-[#697C8C]">
              {visibleUnreadCount} unread
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={!visibleUnreadCount || markAllMutation.isLoading}
            className="text-sm font-semibold text-[#2389E3] transition-colors hover:text-[#1b6dbb] disabled:text-[#94A3B8]"
          >
            {markAllMutation.isLoading ? "Marking read..." : "Mark all read"}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {["All", "Warning", "Payments", "Licenses Added", "Successful"].map((category, index) => (
            <button
              key={index}
              type="button"
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                notificationsCategory === category
                  ? "bg-[#2389E3] text-white"
                  : "bg-[#F3F5F8] text-[#697C8C] hover:bg-[#E9EEF4]"
              }`}
              onClick={() => setNotificationsCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <NotificationList
          notificationsCategory={notificationsCategory}
          notificationData={notificationData}
          onMarkRead={handleMarkRead}
        />
      </div>
    </PageLayout>
  );
}
