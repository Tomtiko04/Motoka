import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsCarFront, BsQuestionCircle } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { TbLicense, TbSteeringWheel } from "react-icons/tb";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import { Icon } from "@iconify/react";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { PiNumberSquareThreeBold, PiHandWavingFill } from "react-icons/pi";
import AppLayout from "../../components/AppLayout";
import MercedesLogo from "../../assets/images/mercedes-logo.png";
import { formatCurrency } from "../../utils/formatCurrency";

const quickActions = [
  {
    icon: <BsCarFront className="text-3xl text-[#2389E3]" />,
    title: "View Car\nDocuments",
    link: "/documents",
  },
  {
    icon: <FaRegHandshake className="text-3xl text-[#2389E3]" />,
    title: "Change of\nOwnership",
    link: "/ownership",
  },
  {
    icon: <TbLicense className="text-3xl text-[#2389E3]" />,
    title: "Traffic\nRules",
    link: "/rules",
  },
  {
    icon: <BsQuestionCircle className="text-3xl text-[#2389E3]" />,
    title: "How can\nwe Help?",
    link: "/help",
  },
  {
    icon: <FaCarAlt className="text-3xl text-[#2389E3]" />,
    title: "Register/Renew\nVehicle License",
    link: "/vehicle-license",
  },
  {
    icon: <TbSteeringWheel className="text-3xl text-[#2389E3]" />,
    title: "New/Renew\nDriver's License",
    link: "/drivers-license",
  },
  {
    icon: <PiNumberSquareThreeBold className="text-3xl text-[#2389E3]" />,
    title: "Request\nPlate Number",
    link: "/plate-number",
  },
  {
    icon: <MdOutlineAirplaneTicket className="text-3xl text-[#2389E3]" />,
    title: "International\nDriver's License",
    link: "/international-license",
  },
];

export default function Dashboard() {
  const [showBalance, setShowBalance] = useState(true);
  const balance = 234098;
  const navigate = useNavigate();

  function handleRenewLicense() {
    navigate("licenses/renew");
  }

  function handleGarage() {
    navigate("garage");
  }

  function handleAddCar() {
    navigate("/add-car");
  }

  const userName = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).name
    : "";

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-0.5 flex flex-col gap-1 sm:mt-0 md:mt-4">
              <h1 className="text-base font-medium text-[#05243F]/40 sm:text-lg">
                Welcome
              </h1>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">
                  {userName}
                </h1>
                <span role="img" aria-label="wave">
                  {/* <PiHandWavingFill color="#EBB850" size={30} /> */}
                  <Icon icon="mdi:hand-wave" fontSize={30} color="#B18378" />
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm font-normal text-[#05243F]/44 sm:text-base">
              Wallet Balance
            </span>
            <div className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-2">
              <span>
                {showBalance ? (
                  <Icon
                    icon="mingcute:eye-fill"
                    fontSize={24}
                    color="#697C8C"
                    onClick={() => setShowBalance(!showBalance)}
                  />
                ) : (
                  <Icon
                    icon="majesticons:eye-off"
                    fontSize={24}
                    color="#697C8C"
                    onClick={() => setShowBalance(!showBalance)}
                  />
                )}
              </span>
              <span className="text-lg font-semibold text-[#2389E3] sm:text-xl">
                {showBalance ? (
                  formatCurrency(balance)
                ) : (
                  <Icon
                    icon="mdi:shield-lock-outline"
                    fontSize={24}
                    color="#2389E3"
                  />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-5 flex flex-wrap gap-3 sm:gap-4">
          <button className="rounded-full bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#1b6dbd] hover:shadow-md sm:text-base">
            Licence Status
          </button>
          <button
            onClick={handleGarage}
            className="rounded-full bg-[#E1E5EE] px-4 py-2 text-sm font-semibold text-[#697C8C] transition-all hover:bg-[#d1d6e0] hover:shadow-md sm:text-base"
          >
            Garage
          </button>
          <button className="relative rounded-full bg-[#E1E5EE] px-4 py-2 text-sm font-semibold text-[#697C8C] transition-all hover:bg-[#d1d6e0] hover:shadow-md sm:text-base">
            Ladipo
            <span className="absolute -top-2 -right-8 flex h-[17px] items-center justify-center rounded-full bg-[#FFEFCE] px-2.5 text-[8px] whitespace-nowrap text-[#BA8823]">
              Coming Soon
            </span>
          </button>
        </div>

        {/* Car Details Card */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white px-4 py-5">
            <div className="mb-6">
              <div className="text-sm font-light text-[#05243F]/60">
                Car Model
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="">
                    <img
                      src={MercedesLogo}
                      alt="Mercedes"
                      className="h-6 w-6"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-[#05243F]">
                    Mercedes Benz
                  </h3>
                </div>
                <div>
                  <FaCarAlt className="text-3xl text-[#2389E3]" />
                </div>
              </div>
            </div>

            <div className="mb-6 flex items-center">
              <div>
                <div className="text-sm text-[#05243F]/60">Plate No:</div>
                <div className="text-base font-semibold text-[#05243F]">
                  LSD1234
                </div>
              </div>
              <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
              <div>
                <div className="text-sm text-[#05243F]/60">Exp. Date</div>
                <div className="text-base font-semibold text-[#05243F]">
                  04-05-25
                </div>
              </div>
              <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
              <div>
                <div className="text-sm text-[#05243F]/60">Car Type</div>
                <div className="text-base font-semibold text-[#05243F]">
                  Saloon
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full bg-[#FFEFCE] px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FDB022]"></span>
                <span className="text-sm font-medium text-[#05243F]">
                  Expires in 3 days
                </span>
              </div>
              <button
                onClick={handleRenewLicense}
                className="rounded-full bg-[#2389E3] px-6 py-2 text-base font-semibold text-white hover:bg-[#2389E3]/90"
              >
                Renew Now
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl bg-white p-6">
            <button
              onClick={handleAddCar}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2389E3] text-xl">
                <FaPlus className="text-xl text-white" />
              </span>
              <span className="text-base font-medium text-[#05243F]">
                Add a New Car
              </span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h2 className="mb-6 text-sm font-semibold text-[#939FAA]">
            Quick Action
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group relative flex h-[161px] flex-col justify-between rounded-3xl bg-white px-4 py-6 will-change-transform hover:border-2 hover:border-[#45A1F2] hover:shadow-lg"
                style={{ transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)" }}
              >
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
                        transition:
                          "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                      <IoIosArrowForward className="text-xl opacity-29" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
