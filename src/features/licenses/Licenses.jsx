import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { BsQuestionCircle } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { TbLicense, TbSteeringWheel } from "react-icons/tb";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { PiNumberSquareThreeBold } from "react-icons/pi";
import { FaIdCard } from "react-icons/fa";
import { BsCardText } from "react-icons/bs";
import { IoCarSportOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import { useNavigate } from "react-router-dom";
import LicenseLayout from "./components/LicenseLayout";

export default function Licenses() {
  const navigate = useNavigate();
  const licensesTypes = [
    {
      icons: [
        <IoCarSportOutline key="car" className="text-2xl text-[#2389E3]" />,
        <BsCardText key="paper" className="text-2xl text-[#2389E3]" />,
        <FaIdCard key="license" className="text-2xl text-[#2389E3]" />,
      ],
      title: "Vehicles Papers",
      link: "documents",
    },
    {
      icon: <FaRegHandshake className="text-3xl text-[#2389E3]" />,
      title: "Driver’s license",
      link: "/ownership",
    },
    {
      icon: <TbLicense className="text-3xl text-[#2389E3]" />,
      title: "Plate Number",
      link: "/rules",
    },
    {
      icon: <BsQuestionCircle className="text-3xl text-[#2389E3]" />,
      title: "Int’l Driver’s\nLicense",
      link: "/help",
    },
    {
      icon: <FaCarAlt className="text-3xl text-[#2389E3]" />,
      title: "Road Tax",
      link: "/vehicle-license",
    },
    {
      icon: <TbSteeringWheel className="text-3xl text-[#2389E3]" />,
      title: "Tint Permit",
      link: "/drivers-license",
    },
    {
      icon: <PiNumberSquareThreeBold className="text-3xl text-[#2389E3]" />,
      title: "Local Gov.\nPapers",
      link: "/plate-number",
    },
  ];

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
