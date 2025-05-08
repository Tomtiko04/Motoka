import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { formatCurrency } from "../utils/formatCurrency";

export default function WelcomeSection({ userName }) {
  const [showBalance, setShowBalance] = useState(true);
  const balance = 234098;

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mt-0.5 flex flex-col gap-1 sm:mt-0 md:mt-4">
          <h1 className="text-base font-medium text-[#05243F]/40 sm:text-sm">
            Welcome
          </h1>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">
              {userName}
            </h1>
            <span role="img" aria-label="wave">
              <Icon icon="mdi:hand-wave" fontSize={30} color="#B18378" />
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-base font-normal text-[#05243F]/44 sm:text-sm">
          Wallet Balance
        </span>
        <div className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 sm:gap-3 sm:px-4 sm:py-2">
          <span>
            {showBalance ? (
              <Icon
                icon="mingcute:eye-fill"
                fontSize={24}
                color="#697C8C"
                onClick={() => setShowBalance(!showBalance)}
              />
            ) : (
              <Icon
                icon="majesticons:eye-off"
                fontSize={24}
                color="#697C8C"
                onClick={() => setShowBalance(!showBalance)}
              />
            )}
          </span>
          <span className="text-lg font-semibold text-[#2389E3] sm:text-base">
            {showBalance ? (
              formatCurrency(balance)
            ) : (
              <Icon
                icon="mdi:shield-lock-outline"
                fontSize={24}
                color="#2389E3"
              />
            )}
          </span>
        </div>
      </div>
    </div>
  );
} 