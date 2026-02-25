import { useMemo } from "react";
import { useNotifications } from "../features/notifications/useNotification";
import NotificationCard from "../pages/components/notificationCard";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

export default function RecentNotificationModal({ setNotificationsModal }) {
  const { data } = useNotifications({ enabled: true });
  const navigate = useNavigate();
  function mapUiCategory(type, action) {
    const t = (type || "").toLowerCase();
    const a = (action || "").toLowerCase();
    if (t === "payment") return "Payments";
    if (t === "car") return "Licenses Added";
    if (t === "warning" || a === "warning") return "Warning";
    if (a === "completed" || a === "success" || a === "created")
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
  const lastFive = useMemo(() => {
    if (!data) return [];
    const allNotifications = flattenNotifications(data);
    return allNotifications.slice(-5);
  }, [data]);
  
  return (
    <div className="">
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
        onClick={() => setNotificationsModal(false)}
      ></div>
      <div className="absolute top-3 right-2 z-60 w-[90%] max-w-md rounded-2xl bg-white p-4 !pt-10 shadow-lg sm:right-5 sm:p-6">
        <ul className="flex h-fit flex-col items-center space-y-3">
          {lastFive.length > 0 ? (
            lastFive.map((n) => (
              // <li
              //   key={n.id}
              //   className="flex flex-col gap-1 border-b pb-2 last:border-0"
              // >
              //   <span className="text-sm text-gray-800">{n.message}</span>
              //   <span className="text-xs text-gray-500">
              //     {new Date(n.created_at).toLocaleTimeString([], {
              //       hour: "2-digit",
              //       minute: "2-digit",
              //     })}
              //   </span>
              // </li>
              <NotificationCard key={n.id} notification={n} />
            ))
          ) : (
            <li className="text-sm text-gray-500">No notifications</li>
          )}
          <button
            className="m-auto w-full rounded-full bg-[#2389E3] px-6 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#1b6dbd] hover:shadow-md"
            onClick={() => {
              navigate("/notifications"), setNotificationsModal(false);
            }}
          >
            Show All
          </button>
        </ul>

        <button
          onClick={() => setNotificationsModal(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 sm:right-6"
        >
          <FaTimes size={20} />
        </button>
      </div>
    </div>
  );
}
