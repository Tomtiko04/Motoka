import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NavigationTabs({
  activeTab = "license",
  onLicenseClick,
  onGarageClick,
}) {
  const location = useLocation();
  const isLadipoActive = location.pathname.startsWith("/ladipo");

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

      <Link
        to="/ladipo"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
          isLadipoActive
            ? "bg-[#2389E3] text-white hover:bg-[#1b6dbd]"
            : "bg-[#E1E5EE] text-[#697C8C] hover:bg-[#d1d6e0]"
        }`}
      >
        Ladipo
      </Link>
    </div>
  );
}
