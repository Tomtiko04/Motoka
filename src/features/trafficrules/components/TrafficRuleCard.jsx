import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TrafficRuleCard({ title, image, fine }) {
  return (
    <div className="rounded-lg bg-[#F4F5FC] p-4 text-[#05243F] shadow-sm transition hover:bg-[#FDF6E8] hover:text-[#2389E3] hover:shadow-md">
      <Link to="#">
        <img
          src={image}
          alt={title}
          className="mb-3 h-32 w-full rounded-md object-cover"
        />
        <h5 className="mb-2 text-sm font-semibold ">
          {title}
        </h5>
        <div className="flex flex-row items-center justify-between text-xs font-semibold text-[#05243F]/40">
          <p>{fine}</p>
          <ChevronRight size={20} className="text-[#05243F]/40" />
        </div>
      </Link>
    </div>
  );
}