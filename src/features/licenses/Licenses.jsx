import React from "react";

import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";

import { IoIosArrowForward } from "react-icons/io";
import LicenseLayout from "./components/LicenseLayout";

const licensesTypes = [
  {
    icons: [
      <Icon icon="mdi:car-pickup" key="car" fontSize={24} color="#2389E3" />,
      <Icon icon="mdi:umbrella" key="paper" fontSize={24} color="#2389E3" />,
      <Icon
        icon="ic:round-gpp-good"
        key="license"
        fontSize={24}
        color="#2389E3"
      />,
    ],
    title: "Vehicles Papers",
    link: "documents",
  },
  {
    icon: (
      <Icon icon="mingcute:steering-wheel-fill" fontSize={24} color="#2389E3" />
    ),
    title: "Driver’s license",
    // link: "drivers-license",
    comingSoon: true,
  },
  {
    icon: (
      <Icon icon="stash:data-numbers-duotone" fontSize={24} color="#2389E3" />
    ),
    title: "Plate Number",
    // link: "plate-number",
    comingSoon: true,
  },
  {
    icon: <Icon icon="mingcute:car-fill" fontSize={24} color="#2389E3" />,
    title: "Int’l Driver’s\nLicense",
    // link: "international-driver's-license",
    comingSoon: true,
  },
  {
    icon: (
      <Icon icon="mage:bookmark-check-fill" fontSize={24} color="#2389E3" />
    ),
    title: "Road Tax",
    // link: "/vehicle-license",
    comingSoon: true,
  },
  {
    icon: <Icon icon="mdi:car-door" fontSize={24} color="#2389E3" />,
    title: "Tint Permit",
    // link: "tint-permit",
    comingSoon: true,
  },
  {
    icon: <Icon icon="solar:bus-bold" fontSize={24} color="#2389E3" />,
    title: "Local Gov.\nPapers",
    // link: "local-government-papers",
    comingSoon: true,
  },
];

export default function Licenses() {
  return (
    <LicenseLayout
      title="Licenses"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
      mainContentTitle="Select the type of License(s) we can help you with?"
    >
      {/* Licenses Types */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {licensesTypes.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="group relative flex h-[161px] flex-col justify-between rounded-[20px] border border-[#05243F]/10 px-4 py-5 hover:border-0 hover:bg-[#FDF6E8]"
          >
            {action.comingSoon && (
              <span className="absolute -top-2 -right-2 flex h-[17px] items-center justify-center rounded-full bg-[#FFEFCE] px-2.5 text-[8px] whitespace-nowrap text-[#BA8823]">
                Coming Soon
              </span>
            )}
            <div className="flex flex-col items-start gap-y-10">
              <div>
                {Array.isArray(action.icons) ? (
                  <div className="flex -space-x-0">
                    {action.icons.map((icon, index) => (
                      <div
                        key={index}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2389E3]/10 text-lg"
                      >
                        {icon}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2389E3]/10 text-lg">
                    {action.icon}
                  </div>
                )}
              </div>
              <div className="mt-auto flex w-full items-center justify-between">
                <h3
                  className="text-base leading-tight font-normal whitespace-pre-line text-[#05243F] group-hover:text-[#05243F]"
                  // style={{
                  //   transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  // }}
                >
                  {action.title}
                </h3>
                <div
                  className="text-[#697B8C] group-hover:text-[#05243F]"
                  // style={{
                  //   transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  // }}
                >
                  <IoIosArrowForward className="text-xl opacity-29" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </LicenseLayout>
  );
}
