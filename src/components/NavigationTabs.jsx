import React from "react";
import { Link, useLocation } from "react-router-dom";

const pillClass = (active) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition-all hover:shadow-md ${
    active
      ? "bg-[#2389E3] text-white hover:bg-[#2389E3]"
      : "bg-[#E1E5EE] text-[#697C8C] hover:bg-[#d1d6e0]"
  }`;

export default function NavigationTabs({ activeTab = "cars", onCarsClick }) {
  const location = useLocation();
  const isLadipoActive = location.pathname.startsWith("/ladipo");

  return (
    <div className="mb-5 flex flex-wrap gap-3 sm:gap-4">
      <button onClick={onCarsClick} className={pillClass(activeTab === "cars")}>
        My Cars
      </button>

      <Link to="/ladipo" className={pillClass(isLadipoActive)}>
        Ladipo
      </Link>

      <Link
        to="/settings"
        state={{ settingsPage: "transaction" }}
        className={pillClass(false)}
      >
        Transaction History
      </Link>
    </div>
  );
}
