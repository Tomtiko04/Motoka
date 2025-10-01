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

export default function NotificationCard({ notification }) {
  const { category, message, time } = notification;

  const renderIcon = () => {
    if (category === "Warning") {
      return (
        <Icon
          icon="mingcute:warning-fill"
          width="30"
          height="30"
          className="text-[#FBBC04]"
        />
      );
    }
    if (
      category === "Successful" ||
      category === "Congratulations" ||
      category === "Payments"
    ) {
      return (
        <Icon
          icon="lets-icons:check-fill"
          width="30"
          height="30"
          className="text-[#50DD71]"
        />
      );
    }
    if (category === "Licenses Added") {
      return (
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2389E3]">
          <Icon icon="ci:bulb" className="text-white" />
        </div>
      );
    }
    return (
      <Icon
        icon="mdi:bell-outline"
        width="30"
        height="30"
        className="text-[#2389E3]"
      />
    );
  };

  return (
    <div className="flex items-center justify-between rounded-[10px] bg-[#F4F5FC] p-3 px-4">
      <div className="flex items-center gap-2">
        <div>{renderIcon()}</div>
        <div>
          <p className="p-0 text-[14px] font-[600] text-[#05243F]">
            {category}
          </p>
          <p className="p-0 text-[12px] leading-[16px] text-[#05243F66]">
            {message}
          </p>
        </div>
      </div>
      <p className="text-[12px] text-[#05243F66]">{time}</p>
    </div>
  );
}
