import { useState } from "react";
import PageLayout from "./components/PageLayout";
import NotificationList from "./components/notificationList";

function Notification() {
  const [notificationsCategory, setNotificationsCategory] = useState("All");
  const notificationData=[
    {
        category:"Warning",
        message: "Your car license is about to expire!",
        date:"Today",
        time: "21:38"
    },
    {
        category:"Successful",
        message: "Account created successfully",
        date:"Today",
        time: "21:38"
    },
    {
        category:"Licenses Added",
        message: "Your latest vehicle license has been added",
        date:"Today",
        time: "21:38"
    },
    {
        category:"Payments",
        message: "Your latest vehicle license has been added",
        date:"Today",
        time: "21:38"
    },
    {
        category:"Licenses Added",
        message: "Your latest vehicle license has been added",
        date:"Yesterday",
        time: "21:38"
    },
    {
        category:"Congratulations",
        message: "License Renewed Successfully",
        date:"Yesterday",
        time: "21:38"
    }
  ]
  return (
    <PageLayout title={"Notifications"}>
      <div className="px-5 py-5 pt-8">
        <div>
          <ul className="items-center gap-3 hidden sm:flex">
            {["All", "Warning", "Payments", "Licenses Added"].map((category, index) => (
              <li key={index} className={`rounded-full transition-[.5s] px-6 py-1.5 text-[16px]  ${notificationsCategory===category?"bg-[#2389E3] text-white hover:bg-[#1b6dbb]":"bg-[#F0F2F4] text-[#697C8C] hover:bg-[#dcddde]"}`} onClick={()=>setNotificationsCategory(category)}>
                {category}
              </li>
            ))}
          </ul>
        </div>
          <NotificationList 
          notificationsCategory={notificationsCategory}
          notificationData={notificationData}
          />
      </div>
    </PageLayout>
  );
}

export default Notification;
