import React from "react";
import { Icon } from "@iconify/react";

export default function AddCarCard({ onAddCarClick }) {
  return (
    <div className="flex items-center justify-center rounded-2xl bg-white p-6">
      <button
        onClick={onAddCarClick}
        type="button"
        aria-label="Add a New Car"
        className="flex flex-col items-center gap-2"
      >
        <span className="flex items-center justify-center rounded-full bg-[#2389E3] p-0.5 transition hover:bg-[#1b6dbb]">
          <Icon icon="lets-icons:add-round" fontSize={24} color="#ffffff" />
        </span>
        <span className="text-sm font-medium text-[#05243F]">
          Add a New Car
        </span>
      </button>
    </div>
  );
} 