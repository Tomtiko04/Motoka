// import { Icon } from "@iconify/react";
// export default function NotificationCard({ notification }) {
//   return (
//     <div className="flex items-center justify-between rounded-[10px] bg-[#F4F5FC] p-3 px-4">
//       <div className="flex items-center gap-2">
//         <div>
//           {notification.category === "Warning" ? (
//             <Icon
//               icon="mingcute:warning-fill"
//               width="30"
//               height="30"
//               className="text-[#FBBC04]"
//             />
//           ) : notification.category === "Successful" ||
//             notification.category === "Congratulations" ||
//             notification.category === "Payments" ? (
//             <Icon
//               icon="lets-icons:check-fill"
//               width="30"
//               height="30"
//               className="text-[#50DD71]"
//             />
//           ) : notification.category === "Licenses Added" ? (
//             <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2389E3]">
//               <Icon icon="ci:bulb" className="text-white" />
//             </div>
//           ) : null}
//         </div>
//         <div>
//           <p className="p-0 text-[16px] font-[600] text-[#05243F]">
//             {notification.category}
//           </p>
//           <p className="p-0 text-[12px] leading-[16px] text-[#05243F66]">
//             {notification.message}
//           </p>
//         </div>
//       </div>
//       <p className="text-[12px] text-[#05243F66]">{notification.time}</p>
//     </div>
//   );
// }

import { Icon } from "@iconify/react";

export default function NotificationCard({ notification, onMarkRead, markReadButtonType = "icon" }) {
  const { category, message, time, isRead } = notification;

  const renderStatus = () => {
    if (isRead) {
      return <Icon icon="mdi:check-circle" width="18" height="18" className="text-[#22C55E]" />;
    }

    return <span className="h-2.5 w-2.5 rounded-full bg-[#2389E3]" />;
  };

  return (
    <div
      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 transition-colors ${
        isRead ? "border-slate-100 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F5F8] text-[#697C8C]">
        {renderStatus()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#05243F]">{category}</p>
            <p className="mt-1 text-[13px] leading-5 text-[#4B5D6D]">{message}</p>
          </div>
          <p className="shrink-0 text-[11px] text-[#94A3B8]">{time}</p>
        </div>
      </div>

      {onMarkRead && !isRead && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead();
          }}
          aria-label="Mark as read"
          className="mt-0.5 rounded-full p-1.5 text-[#2389E3] transition hover:bg-[#EAF5FF]"
        >
          <Icon icon="mdi:check" width="16" height="16" />
        </button>
      )}
    </div>
  );
}
