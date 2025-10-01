// import { Icon } from "@iconify/react";
// import NotificationCard from "./notificationCard";

// function NotificationList({ notificationsCategory, notificationData }) {
//   const formatHeaderDate = (label) => {
//     const now = new Date();
//     const y = new Date();
//     y.setDate(y.getDate() - 1);

//     const fmt = (d) =>
//       d.toLocaleDateString(undefined, {
//         month: "short",
//         day: "2-digit",
//         year: "numeric",
//       });

//     if (label === "Today") return fmt(now);
//     if (label === "Yesterday") return fmt(y);
//     return "";
//   };

//   const groups = ["Today", "Yesterday", "Last week", "Others"];

//   const getItemsFor = (label) => {
//     const base = notificationData.filter((n) => n.date === label);
//     if (notificationsCategory === "All") return base;
//     return base.filter((n) => n.category === notificationsCategory);
//   };

//   let hasAnyVisible = false;

//   return (
//     <div>
//       {groups.map((label) => {
//         const items = getItemsFor(label);
//         if (!items.length) return null;
//         hasAnyVisible = true;
//         return (
//           <div key={label}>
//             <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
//               <p>{label}</p>
//               <p>{formatHeaderDate(label)}</p>
//             </div>

//             <div className="flex flex-col gap-3">
//               {items.map((notification, index) => (
//                 <NotificationCard
//                   key={`${label}-${index}`}
//                   notification={notification}
//                 />
//               ))}
//             </div>
//           </div>
//         );
//       })}

//       {!hasAnyVisible && (
//         <div className="flex w-full items-center justify-center py-8 text-sm text-[#05243F66]">
//           <Icon icon="mdi:information-outline" className="mr-2" />
//           No notifications for this category.
//         </div>
//       )}
//     </div>
//   );
// }

// export default NotificationList;
import { Icon } from "@iconify/react";
import NotificationCard from "./NotificationCard";

export default function NotificationList({ notificationsCategory, notificationData }) {
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
    <div>
      {groups.map((label) => {
        const items = getItemsFor(label);
        if (!items.length) return null;
        hasAnyVisible = true;
        return (
          <div key={label}>
            <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
              <p>{label}</p>
              <p>{formatHeaderDate(label)}</p>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((n) => (
                <NotificationCard key={n.id} notification={n} />
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
