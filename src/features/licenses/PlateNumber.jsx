import React, { useCallback } from "react";
import { BsArrowRight } from "react-icons/bs";
import LicenseLayout from "./components/LicenseLayout";
import { useNavigate } from "react-router-dom";

 const plateType = [
   {
     title: "New Plate Number",
     description:
       "Ideal for cars that are new or foreign used, or for cars that have been registered but has changed ownership",
     icon: <BsArrowRight className="text-2xl text-[#2284DB]" />,
     link: "new-plate-number",
   },
   {
     title: "Reprint",
     description:
       "Ideal for car owners who want to change their vehicle plates due to fading or damage",
     icon: <BsArrowRight className="text-2xl text-[#2284DB]" />,
     link: "reprint",
   },
 ];


export default function PlateNumber() {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (link) => {
      navigate(`/licenses/plate-number/${link}`);
    },
    [navigate],
  );


  return (
    <LicenseLayout
      title="Plate Number"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="mx-auto w-full max-w-md px-4 md:px-0">
        <div className="grid gap-4">
          {plateType.map((type, index) => (
            <button
            role="button"
              key={index}
              className="group flex cursor-pointer flex-col rounded-[20px] bg-[#F4F5FC] px-4 py-4 transition-colors hover:bg-[#FFF4DD]"
              onClick={() => handleClick(type.link)}
            >
              <h2 className="mb-2 text-left text-sm font-medium text-[#05243F]">
                {type.title}
              </h2>
              <p className="mb-2 text-left text-xs font-normal text-[#05243F]/40">
                {type.description}
              </p>
              <div className="flex items-end justify-end">
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
