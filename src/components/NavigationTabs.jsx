import React from "react";

export default function NavigationTabs({
  activeTab = "license",
  onLicenseClick,
  onGarageClick,
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-3 sm:gap-4">
      <button
        onClick={onLicenseClick}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
          activeTab === "license"
            ? "bg-[#2389E3] text-white hover:bg-[#1b6dbd]"
            : "bg-[#E1E5EE] text-[#697C8C] hover:bg-[#d1d6e0]"
        }`}
      >
        Licence Status
      </button>

      <button
        onClick={onGarageClick}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
          activeTab === "garage"
            ? "bg-[#2389E3] text-white hover:bg-[#1b6dbd]"
            : "bg-[#E1E5EE] text-[#697C8C] hover:bg-[#d1d6e0]"
        }`}
      >
        Garage
      </button>

      <button
        disabled
        className="relative rounded-full bg-[#E1E5EE] px-4 py-2 text-sm font-semibold text-[#697C8C] transition-all hover:bg-[#d1d6e0] hover:shadow-md"
      >
        Ladipo
        <span className="absolute -top-2 -right-8 flex h-[17px] items-center justify-center rounded-full bg-[#FFEFCE] px-2.5 text-[8px] whitespace-nowrap text-[#BA8823]">
          Coming Soon
        </span>
      </button>
    </div>
  );
}