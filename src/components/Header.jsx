"use client"

import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import Logo from "../assets/images/motoka logo.svg";
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
          <div onClick={handleHome} className="flex cursor-pointer items-center gap-2">
            <img src={Logo} alt="Motoka" className="h-8 w-auto" />
            <h1 className="text-base font-bold whitespace-nowrap text-[#05243F] sm:text-lg">
              Motoka
            </h1>
          </div>

          <button className="mt-2 flex items-center gap-2 rounded-full ai-button px-4 py-2 text-sm font-semibold text-white sm:mt-0">
            <BsStars />
            <span className="whitespace-nowrap">MO'</span>
          </button>
        </header>
      </div>
    </div>
  );
}
