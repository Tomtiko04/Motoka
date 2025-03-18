import React from "react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="animate-fadeIn w-full max-w-[380px] rounded-[20px] bg-white p-8 text-center shadow-lg">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F9FF]">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.55 18.5L3.85 12.8L5.275 11.375L9.55 15.65L18.725 6.475L20.15 7.9L9.55 18.5Z"
              fill="#2389E3"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-2xl font-medium text-[#05243F]">Verified</h2>

        {/* Description */}
        <p className="mb-8 text-base text-[#05243F]/40">
          Your Account has been successfully Verified
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/add-car")}
          className="mt-5 rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
        >
          Add your Car
        </button>
      </div>
    </div>
  );
}
