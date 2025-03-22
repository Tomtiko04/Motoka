import React from "react";
import { Link } from "react-router-dom";
import { BsCarFront, BsQuestionCircle } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { TbLicense, TbSteeringWheel } from "react-icons/tb";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { PiNumberSquareThreeBold } from "react-icons/pi";
import AppLayout from "../../components/AppLayout";

export default function Dashboard() {
  const quickActions = [
    {
      icon: <BsCarFront className="h-6 w-6 text-[#2389E3]" />,
      title: "View Car Documents",
      link: "/documents",
    },
    {
      icon: <FaRegHandshake className="h-6 w-6 text-[#2389E3]" />,
      title: "Change of Ownership",
      link: "/ownership",
    },
    {
      icon: <TbLicense className="h-6 w-6 text-[#2389E3]" />,
      title: "Traffic Rules",
      link: "/rules",
    },
    {
      icon: <BsQuestionCircle className="h-6 w-6 text-[#2389E3]" />,
      title: "How can we Help?",
      link: "/help",
    },
    {
      icon: <TbSteeringWheel className="h-6 w-6 text-[#2389E3]" />,
      title: "Register/Renew Vehicle License",
      link: "/vehicle-license",
    },
    {
      icon: <MdOutlineAirplaneTicket className="h-6 w-6 text-[#2389E3]" />,
      title: "New/Renew Driver's License",
      link: "/drivers-license",
    },
    {
      icon: <PiNumberSquareThreeBold className="h-6 w-6 text-[#2389E3]" />,
      title: "Request Plate Number",
      link: "/plate-number",
    },
    {
      icon: <MdOutlineAirplaneTicket className="h-6 w-6 text-[#2389E3]" />,
      title: "International Driver's License",
      link: "/international-license",
    },
  ];

  return (
    <AppLayout>
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-[#05243F]">Welcome</h1>
            <h1 className="text-2xl font-medium text-[#05243F]">Anjola</h1>
            <span role="img" aria-label="wave">👋</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#05243F]/60">Transaction History</span>
          <span className="font-medium text-[#2389E3]">₦234,098</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 flex gap-4">
        <button className="rounded-full bg-[#F4F5FC] px-4 py-2 text-[#05243F]/60">
          Licence Status
        </button>
        <button className="rounded-full bg-[#2389E3] px-4 py-2 text-white">
          My Cars
        </button>
        <button className="relative rounded-full bg-[#F4F5FC] px-4 py-2 text-[#05243F]/60">
          Ladipo
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FDB022] text-xs text-white">
            Coming Soon
          </span>
        </button>
      </div>

      {/* Car Details Card */}
      <div className="mb-8 rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center gap-3">
          <img src="/mercedes-logo.svg" alt="Mercedes" className="h-8 w-8" />
          <div>
            <div className="text-sm text-[#05243F]/60">Car Model</div>
            <div className="text-lg font-medium text-[#05243F]">Mercedes Benz</div>
          </div>
          <img src="/car-icon.svg" alt="Car" className="ml-auto h-12 w-12" />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-[#05243F]/60">Plate No:</div>
            <div className="font-medium text-[#05243F]">LSD1234</div>
          </div>
          <div>
            <div className="text-sm text-[#05243F]/60">Exp. Date</div>
            <div className="font-medium text-[#05243F]">04-05-25</div>
          </div>
          <div>
            <div className="text-sm text-[#05243F]/60">Car Type</div>
            <div className="font-medium text-[#05243F]">Saloon</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IoWarningOutline className="text-[#FDB022]" />
            <span className="text-sm text-[#05243F]/60">Expires in 3 days</span>
          </div>
          <button className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-medium text-white">
            Renew Now
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h2 className="mb-4 text-lg font-medium text-[#05243F]">Quick Action.</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 transition-all hover:shadow-md"
            >
              {action.icon}
              <span className="text-sm font-medium text-[#05243F]">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
