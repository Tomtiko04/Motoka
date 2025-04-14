import React from "react";
import { BsArrowRight } from "react-icons/bs";
import LicenseLayout from "./components/LicenseLayout";

export default function PlateNumber() {
  const plateType = [
    {
      title: "New Plate Number",
      description:
        "Ideal for cars that are new or foreign used, or for cars that have been registered but has changed ownership",
      icon: <BsArrowRight className="text-[#2284DB] text-2xl" />,
    },
    {
      title: "Reprint",
      description:
        "Ideal for car owners who want to change their vehicle plates due to fading or damage",
      icon: <BsArrowRight className="text-[#2284DB] text-2xl" />,
    },
  ];

  return (
    <LicenseLayout
      title="Plate Number"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="mx-auto w-full max-w-md px-4 md:px-0">
        <div className="grid gap-4">
          {plateType.map((type, index) => (
            <button
              key={index}
              className="group flex cursor-pointer flex-col rounded-[20px] bg-[#F4F5FC] py-4 px-4 transition-colors hover:bg-[#FFF4DD]"
            >
              <h2 className="text-sm font-medium text-[#05243F] text-left mb-2">
                {type.title}
              </h2>
              <p className="mb-2 text-xs text-[#05243F]/40 font-normal text-left">
                {type.description}
              </p>
              <div className="flex justify-end items-end">
                <span className="transform transition-transform group-hover:translate-x-2">
                  {type.icon}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </LicenseLayout>
  );
}
