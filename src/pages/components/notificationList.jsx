import { Icon } from "@iconify/react";
import NotificationCard from "./notificationCard";

export function NotificationSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="space-y-2.5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-3"
              >
                <div className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-slate-200 animate-pulse" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex justify-between gap-2">
                    <div className="h-3.5 w-24 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-12 rounded bg-slate-200 animate-pulse" />
                  </div>
                  <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationList({ notificationsCategory, notificationData, onMarkRead, isLoading }) {
  if (isLoading) {
    return <NotificationSkeleton />;
  }

  const groups = ["Today", "Yesterday", "Last week", "Others"];

  const formatHeaderDate = (label) => {
    const now = new Date();
    const y = new Date();
    y.setDate(y.getDate() - 1);

    const fmt = (d) =>
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

    if (label === "Today") return fmt(now);
    if (label === "Yesterday") return fmt(y);
    return "";
  };

  const getItemsFor = (label) => {
    const base = notificationData.filter((n) => n.dateLabel === label);
    if (notificationsCategory === "All") return base;
    return base.filter((n) => n.category === notificationsCategory);
  };

  let hasAnyVisible = false;

  return (
    <div className="space-y-4">
      {groups.map((label) => {
        const items = getItemsFor(label);
        if (!items.length) return null;
        hasAnyVisible = true;

        return (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#697C8C]">
                {label}
              </p>
              <p className="text-[11px] text-[#94A3B8]">{formatHeaderDate(label)}</p>
            </div>
            <div className="space-y-2.5">
              {items.map((n) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  onMarkRead={() => onMarkRead?.(n.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
      {!hasAnyVisible && (
        <div className="flex w-full items-center justify-center py-8 text-sm text-[#05243F66]">
          <Icon icon="mdi:information-outline" className="mr-2" />
          No notifications for this category.
        </div>
      )}
    </div>
  );
}
