import { Icon } from "@iconify/react";
import NotificationCard from "./notificationCard";
function NotificationList({ notificationsCategory, notificationData }) {
  const filteredNotification = notificationData.filter(
    (notification) => notification.category === notificationsCategory,
  );
  return (
    <div>
      {notificationsCategory === "All" ? (
        <>
          <div>
            <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
              <p>Today </p>
              <p>May 28 2025</p>
            </div>
            <div className="flex flex-col gap-3">
              {notificationData
                .filter((category) => category.date === "Today")
                .map((category, index) => (
                  <NotificationCard category={category} key={index} />
                ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
              <p>Yesterday </p>
              <p>May 27 2025</p>
            </div>
            <div className="flex flex-col gap-3">
              {notificationData
                .filter((category) => category.date === "Yesterday")
                .map((category, index) => (
                  <NotificationCard category={category} key={index} />
                ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
              <p>Today </p>
              <p>May 28 2025</p>
            </div>
            <div className="flex flex-col gap-3">
              {notificationData
                .filter(
                  (category) =>
                    category.category === notificationsCategory &&
                    category.date === "Today",
                )
                .map((category, index) => (
                  <>
                    <NotificationCard category={category} key={index} />
                  </>
                ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between py-3 text-[14px] text-[#05243F66]">
              <p>Yesterday </p>
              <p>May 27 2025</p>
            </div>
            <div className="flex flex-col gap-3">
              {notificationData
                .filter((category) => category.category===notificationsCategory&&category.date === "Yesterday")
                .map((category, index) => (
                  <NotificationCard category={category} key={index} />
                ))}
            </div>
          </div>
        </>
      )}

      {/* {filteredNotification.map((category, index) => (
        <h1 key={index}><Icon icon="lets-icons:check-fill" width="24" height="24" />{category.message}</h1>
      ))} */}
    </div>
  );
}

export default NotificationList;
