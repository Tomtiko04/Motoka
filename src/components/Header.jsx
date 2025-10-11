"use client";

import React from "react"
import { Link, useNavigate } from "react-router-dom";

import Logo from "../assets/images/Logo.svg";
import { BsStars } from "react-icons/bs";

export default function Header() {
  const navigate = useNavigate();
  function handleHome() {
    navigate("/");
  }
  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between py-4">
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
