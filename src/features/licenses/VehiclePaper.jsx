import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { BsShieldCheck, BsPersonFill } from "react-icons/bs";
import { FaUmbrella, FaCar } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout";

export default function VehiclePaper() {
  const navigate = useNavigate();
  const [hoveredType, setHoveredType] = React.useState(null);

  const documentTypes = [
    {
      icons: [
        <FaUmbrella key="umbrella" className="text-2xl text-[#2389E3]" />,
        <BsShieldCheck key="check" className="text-2xl text-[#2389E3]" />,
        <FaCar key="car" className="text-2xl text-[#2389E3]" />,
        <BsPersonFill key="person" className="text-2xl text-[#2389E3]" />,
      ],
      title: "Private",
      link: "private",
      description:
        "Vehicle License, Road Worthiness, Insurance, Proof of ownership"
    },
    {
      icons: [
        <FaUmbrella key="umbrella" className="text-2xl text-[#2389E3]" />,
        <BsShieldCheck key="check" className="text-2xl text-[#2389E3]" />,
        <FaCar key="car" className="text-2xl text-[#2389E3]" />,
        <BsPersonFill key="person" className="text-2xl text-[#2389E3]" />,
        <FaCar key="car" className="text-2xl text-[#2389E3]" />,
      ],
      title: "Commercial",
      link: "commercial",
      description:
        "Vehicle License, Road Worthiness, Insurance, Proof of ownership, Commercial permit",
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-6">
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
      <div className="mx-4 sm:mx-auto max-w-4xl rounded-[20px] bg-[#F9FAFC] px-4 sm:px-8 pt-6 pb-10 shadow-sm">
        <h2 className="mb-5 text-center text-[15px] font-normal text-[#05243F]/71">
          Select the type of Vehicle License we can help you with?
        </h2>

        {/* License Options */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-5">
          {documentTypes.map((type, index) => (
            <Link
              key={type.title}
              to={type.link}
              className="group relative flex w-full sm:w-[187px] flex-col items-center rounded-[20px] border border-[#697B8C]/29 px-4 py-5 transition-all duration-300 ease-in-out hover:border-0 hover:bg-[#FDF6E8]"
              onMouseEnter={() => setHoveredType(type)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <div className="mb-4">
                <div
                  className={`grid grid-cols-2 gap-2 ${type.title === "Commercial" ? "grid-rows-3" : "grid-rows-2"}`}
                >
                  {type.icons.map((icon, iconIndex) => (
                    <div
                      key={iconIndex}
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-[#2389E3]/11 ${
                        type.title === "Commercial" &&
                        iconIndex === type.icons.length - 1
                          ? "col-span-2"
                          : ""
                      }`}
                    >
                      {React.cloneElement(icon, {
                        className: "h-6 w-6 text-[#2284DB]",
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-auto flex w-full items-center justify-between">
                <h3 className="text-base font-medium text-[#05243F]">
                  {type.title}
                </h3>
                <div>
                  <IoIosArrowBack className="h-5 w-5 rotate-180 text-[#697B8C]/29" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Package Description Card */}
        <div className={`mt-6 mx-auto max-w-md rounded-[20px] bg-[#FDF6E8] p-6 transition-all duration-300 ease-in-out ${hoveredType ? 'opacity-100  translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none absolute'}`}>
            <h4 className="mb-2 text-sm font-medium text-[#05243F]">
              This Package contains the Following:
            </h4>
            <p className="text-sm font-normal text-[#05243F]/60">
              {hoveredType?.description || ''}
            </p>
          </div>
      </div>
    </AppLayout>
  );
}
