"use client";

import { useNavigate } from "react-router-dom";

import Logo from "../assets/images/Logo.svg";
import { BsStars } from "react-icons/bs";

export default function Header() {
  const navigate = useNavigate();
  function handleHome() {
    navigate("/dashboard");
  }
  return (
    <div className="w-full">
      <div className="mx-auto max-w-[864px] px-4 sm:px-0">
        <header className="flex flex-wrap items-center justify-center md:justify-between py-6 sm:py-4">
          <div
            onClick={handleHome}
            className="flex cursor-pointer items-center"
          >
            <img
              src={Logo}
              alt="Motoka"
              className="h-8 w-auto object-contain"
            />
          </div>

          {/* <button className="ai-button mt-2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white sm:mt-0">
            <BsStars />
            <span className="whitespace-nowrap">MO'</span>
          </button> */}
        </header>
      </div>
    </div>
  );
}
