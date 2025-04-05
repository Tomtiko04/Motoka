import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { BsQuestionCircle } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { TbLicense, TbSteeringWheel } from "react-icons/tb";
import {  FaCarAlt, FaPlus } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { PiNumberSquareThreeBold } from "react-icons/pi";
import {  FaIdCard } from "react-icons/fa";
import { BsCardText } from "react-icons/bs";
import { IoCarSportOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import AppLayout from "../../components/AppLayout";
import { useNavigate } from "react-router-dom";

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
    <AppLayout>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-1/4 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <IoIosArrowBack className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-center text-2xl font-medium text-[#05243F]">
              Licenses
            </h1>
            <p className="mt-2 text-center text-sm font-normal text-[#05243F]/40">
              All licenses are issued by government, we are only an agent that
              helps you with the process.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] p-8 shadow-sm">
        <h2 className="mb-5 text-center text-[15px] font-normal text-[#05243F]/71">
          Select the type of License(s) we can help you with?
        </h2>
        {/* Licenses Types */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {licensesTypes.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group relative flex h-[161px] flex-col justify-between rounded-[20px] border border-[#05243F]/10 py-5 px-4 hover:border-0 hover:bg-[#FDF6E8]"
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
                <div className="flex w-full items-center justify-between mt-auto">
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
      </div>
    </AppLayout>
  );
}
