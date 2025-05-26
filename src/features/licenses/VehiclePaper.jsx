import React from "react";

import { IoIosArrowBack } from "react-icons/io";
import {  useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import LicenseLayout from "./components/LicenseLayout";

 const documentTypes = [
   {
     icons: [
       <Icon
         key="umbrella"
         icon="mdi:umbrella"
         fontSize={24}
         color="#2389E3"
       />,
       <Icon
         key="check"
         icon="ic:round-gpp-good"
         fontSize={24}
         color="#2389E3"
       />,
       <Icon icon="mdi:car-pickup" key="car" fontSize={24} color="#2389E3" />,
       <Icon
         icon="iconamoon:profile-fill"
         fontSize={24}
         color="#2389E3"
         key="person"
       />,
     ],
     title: "Private",
     link: "/licenses/drivers-license",
     description:
       "Vehicle License, Road Worthiness, Insurance, Proof of ownership",
   },
   {
     icons: [
       <Icon
         key="umbrella"
         icon="mdi:umbrella"
         fontSize={24}
         color="#2389E3"
       />,
       <Icon
         key="check"
         icon="ic:round-gpp-good"
         fontSize={24}
         color="#2389E3"
       />,
       <Icon icon="mdi:car-pickup" key="car" fontSize={24} color="#2389E3" />,
       <Icon
         icon="iconamoon:profile-fill"
         fontSize={24}
         color="#2389E3"
         key="person"
       />,
       <Icon
         icon="solar:bus-bold"
         fontSize={24}
         color="#2389E3"
         key="car"
       />,
     ],
     title: "Commercial",
     link: "commercial",
     description:
       "Vehicle License, Road Worthiness, Insurance, Proof of ownership, Commercial permit",
   },
 ];

export default function VehiclePaper() {
  const navigate = useNavigate();
  const [hoveredType, setHoveredType] = React.useState(null);

  const handleLicenseSelect = (type) => {
    let items = [];
    let totalAmount = 0;

    switch (type.title) {
      case "Private":
        items = [
          { name: "Proof of Ownership", amount: 45000 },
          { name: "Vehicle License", amount: 5876 },
          { name: "Insurance", amount: 15000 },
          { name: "Road Worthiness", amount: 45000 },
        ];
        break;
      case "Commercial":
        items = [
          { name: "Proof of Ownership", amount: 45000 },
          { name: "Vehicle License", amount: 5876 },
          { name: "Insurance", amount: 15000 },
          { name: "Road Worthiness", amount: 45000 },
          { name: "Commercial License", amount: 8500 },
        ];
        break;
      default:
        toast.error("Invalid license type");
        return;
    }

    totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    navigate("/payment", {
      state: {
        type: "vehicle_paper",
        amount: totalAmount,
        details: {
          paperType: type.title,
          items
        }
      }
    });
  };

  return (
    <LicenseLayout
      title="Licenses"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
      mainContentTitle="Select the type of Vehicle License we can help you with?"
    >
      {/* License Options */}
      <div className="mt-5 flex flex-col justify-center gap-4 sm:flex-row">
        {documentTypes.map((type, index) => (
          <button
            key={type.title}
            onClick={() => handleLicenseSelect(type)}
            className="group relative flex w-full flex-col items-center rounded-[20px] border border-[#697B8C]/29 px-4 py-5 transition-all duration-300 ease-in-out hover:border-0 hover:bg-[#FDF6E8] sm:w-[187px]"
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
          </button>
        ))}
      </div>

      {/* Package Description Card */}
      <div
        className={`mx-auto mt-6 max-w-md rounded-[20px] bg-[#FDF6E8] p-6 transition-all duration-300 ease-in-out ${hoveredType ? "translate-y-0 opacity-100" : "pointer-events-none absolute -translate-y-4 opacity-0"}`}
      >
        <h4 className="mb-2 text-sm font-medium text-[#05243F]">
          This Package contains the Following:
        </h4>
        <p className="text-sm font-normal text-[#05243F]/60">
          {hoveredType?.description || ""}
        </p>
      </div>
    </LicenseLayout>
  );
}
