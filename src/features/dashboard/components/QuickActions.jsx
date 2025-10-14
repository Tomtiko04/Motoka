import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

const quickActions = [
  {
    icon: <Icon icon="mingcute:car-fill" fontSize={30} color="#2389E3" />,
    title: "View Car\nDocuments",
    link: "/documents",
  },
  {
    icon: <Icon icon="solar:document-bold" fontSize={30} color="#2389E3" />,
    title: "Change of\nOwnership",
    // link: "/ownership",
    comingSoon: true,
  },
  {
    icon: (
      <Icon
        icon="material-symbols:traffic-rounded"
        fontSize={30}
        color="#2389E3"
      />
    ),
    title: "Traffic\nRules",
    // link: "/traffic-rules",
    comingSoon: true,
  },
  {
    icon: (
      <Icon
        icon="material-symbols:contact-support-rounded"
        fontSize={30}
        color="#2389E3"
      />
    ),
    title: "How can\nwe Help?",
    // link: "/help",
    comingSoon: true,
  },
  {
    icon: <Icon icon="mdi:car-pickup" fontSize={30} color="#2389E3" />,
    title: "Register/Renew\nVehicle License",
    link: "/licenses/documents",
  },
  {
    icon: (
      <Icon icon="mingcute:steering-wheel-fill" fontSize={30} color="#2389E3" />
    ),
    title: "New/Renew\nDriver's License",
    link: "/licenses/drivers-license",
    comingSoon: true,
  },
  {
    icon: (
      <Icon
        icon="fluent:text-number-format-24-filled"
        fontSize={30}
        color="#2389E3"
      />
    ),
    title: "Request\nPlate Number",
    // link: "/licenses/plate-number",
    comingSoon: true,
  },
  {
    icon: <Icon icon="jam:plane-f" fontSize={30} color="#2389E3" />,
    title: "International\nDriver's License",
    // link: "/licenses/international-driver's-license",
    comingSoon: true,
  },
];

export default function QuickActions() {
  return (
    <div className="mb-4">
      <h2 className="mb-6 text-sm font-semibold text-[#939FAA]">
        Quick Action
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group relative flex h-[161px] flex-col justify-between rounded-3xl border-2 border-transparent bg-white px-2 py-6 will-change-transform hover:border-2 hover:border-[#45A1F2] hover:shadow-lg sm:px-4"
            style={{ transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            {/* Coming Soon Badge */}
            {action.comingSoon && (
              <span className="absolute -top-2 -right-2 flex h-[17px] items-center justify-center rounded-full bg-[#FFEFCE] px-2.5 text-[8px] whitespace-nowrap text-[#BA8823]">
                Coming Soon
              </span>
            )}
            <div className="flex flex-col items-start gap-y-10">
              <div
                className="will-change-transform"
                style={{
                  transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div
                  className="group-hover:scale-110"
                  style={{
                    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {action.icon}
                </div>
              </div>
              <div className="flex w-full items-center justify-between">
                <h3
                  className="text-base leading-tight font-normal whitespace-pre-line text-[#05243F] group-hover:text-[#45A1F2]"
                  style={{
                    transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {action.title}
                </h3>
                <div
                  className="text-[#697B8C] group-hover:translate-x-1 group-hover:text-[#45A1F2]"
                  style={{
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Icon
                    icon="ion:chevron-forward"
                    fontSize={20}
                    className="text-[#697B8C]/29"
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
