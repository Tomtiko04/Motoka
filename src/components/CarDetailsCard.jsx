import React from "react";
import { Icon } from "@iconify/react";
import MercedesLogo from "../assets/images/mercedes-logo.png";

export default function CarDetailsCard({ onRenewClick }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-5">
      <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">
          Car Model
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="">
              <img
                src={MercedesLogo}
                lazyloading="lazy"
                alt="Mercedes"
                className="h-6 w-6"
              />
            </div>
            <h3 className="text-xl font-semibold text-[#05243F]">
              Mercedes Benz
            </h3>
          </div>
          <div>
            <Icon
              icon="ion:car-sport-sharp"
              fontSize={30}
              color="#2389E3"
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <div>
          <div className="text-sm text-[#05243F]/60">Plate No:</div>
          <div className="text-base font-semibold text-[#05243F]">
            LSD1234
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Exp. Date</div>
          <div className="text-base font-semibold text-[#05243F]">
            04-05-25
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Car Type</div>
          <div className="text-base font-semibold text-[#05243F]">
            Saloon
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full bg-[#FFEFCE] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#FDB022]"></span>
          <span className="text-sm font-medium text-[#05243F]">
            Expires in 3 days
          </span>
        </div>
        <button
          onClick={onRenewClick}
          className="rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
        >
          Renew Now
        </button>
      </div>
    </div>
  );
} 