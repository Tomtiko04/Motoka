import React from "react";
import TrafficRuleCard from "./TrafficRuleCard";
import TrafficImage from "../../../assets/images/traffic.png";

// const trafficRules = [
//   {
//     title: "Driving under influence (DUI)",
//     image: TrafficImage,
//     fine: "Fine: Vehicle impoundment...",
//   },
//   {
//     title: "Speeding",
//     image: TrafficImage,
//     fine: "Fine: Penalty points & fines...",
//   },
//   {
//     title: "Wrong Parking",
//     image: TrafficImage,
//     fine: "Fine: Towing + Fine...",
//   },
// ];

const trafficRules = [
  {
    title: "Driver’s License",
    category: "Licensing&Registration",
    image: TrafficImage,
    fine: "Fine: Vehicle impoundment...",
    slug: "drivers-license",
    description:
      "You must possess a valid driver's license while operating a vehicle.",
  },
  {
    title: "Speed Limit Violation",
    category: "DrivingConduct",
    image: TrafficImage,
    fine: "Fine: Points deduction...",
    slug: "speed-limit-violation",
    description:
      "Exceeding the speed limit can cause accidents and legal penalties.",
  },
  {
    title: "Traffic Light Violation",
    category: "DrivingConduct",
    image: TrafficImage,
    fine: "Fine: Suspension of license...",
    slug: "traffic-light-violation",
    description: "Running a red light endangers other road users.",
  },
  {
    title: "Vehicle Overload",
    category: "VehicleRequirements",
    image: TrafficImage,
    fine: "Fine: Heavy penalties...",
    slug: "vehicle-overload",
    description: "Overloading reduces vehicle control and safety.",
  },
  {
    title: "Broken Headlights",
    category: "VehicleRequirements",
    image: TrafficImage,
    fine: "Fine: Small ticket...",
    slug: "broken-headlights",
    description:
      "Driving without headlights at night is dangerous and illegal.",
  },
];

export default function TrafficRuleList({ selectedCategory, searchTerm }) {
  const filteredRules = trafficRules.filter(
    (rule) =>
      rule.category === selectedCategory &&
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  return (
    <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto pr-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule, index) => {
            return <TrafficRuleCard
              key={index}
              title={rule.title}
              image={rule.image}
              fine={rule.fine}
            />;
          })
        ) : (
          <p className="text-sm text-[#05243F]/60">
            No traffic rules found for this category.
          </p>
        )}
      </div>
    </div>
  );
}
