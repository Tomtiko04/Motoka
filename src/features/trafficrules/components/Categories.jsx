import React from "react";

const categories = [
  { key: "Licensing&Registration", label: "Licensing & Registration" },
  { key: "DrivingConduct", label: "Driving Conduct" },
  { key: "VehicleRequirements", label: "Vehicle Requirements" },
  { key: "Offenses&Fines", label: "Offenses & Fines" },
  { key: "EmergencyProcedures", label: "Emergency Procedures" },
  { key: "RoadSigns&Markings", label: "Road Signs & Markings" },
];

export default function Categories({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="pt-7">
      <h4 className="mb-4 text-sm font-medium text-[#05243F]/44">Categories</h4>
      <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] flex h-[fit] w-full flex-row gap-2 overflow-y-auto md:flex-col">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key)}
            className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
              selectedCategory === cat.key
                ? "border-2 border-[#2389E3] text-[#05243F]"
                : "border-2 border-[#F4F5FC] text-[#05243F]/40"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
