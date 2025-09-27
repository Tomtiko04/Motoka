import { Icon } from "@iconify/react";
function NotificationCard({ category }) {
  return (
    <div className="flex items-center rounded-[10px] bg-[#F4F5FC] p-3 px-4 justify-between">
      <div className="flex items-center gap-2">
        <div>
          {category.category === "Warning" ? (
            <Icon
              icon="mingcute:warning-fill"
              width="30"
              height="30"
              className="text-[#FBBC04]"
            />
          ) : category.category === "Successful" ||
            category.category === "Congratulations" ||category.category==="Payments"? (
            <Icon
              icon="lets-icons:check-fill"
              width="30"
              height="30"
              className="text-[#50DD71]"
            />
          ) : category.category === "Licenses Added" ? (
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#2389E3]">
              <Icon icon="ci:bulb" className="text-white" />
            </div>
          ) : null}
        </div>
        <div>
          <p className="p-0 text-[16px] font-[600] text-[#05243F]">
            {category.category}
          </p>
          <p className="p-0 text-[12px] leading-[16px] text-[#05243F66]">
            {category.message}
          </p>
        </div>
      </div>
      <p className="text-[12px] text-[#05243F66] ">
        {category.time}
      </p>
    </div>
  );
}

export default NotificationCard;
