import React from "react";

// Demerit points are the stable, comparable field across both schedules, so
// they lead the card. The previous card was image-led, which worked for five
// placeholder rows sharing one stock photo but not for 116 real offences with
// no imagery — and downloading a photo per offence would cost users data for
// no informational gain.
const POINT_TONE = {
  0: "bg-[#ECEFF8] text-[#05243F]/50",
  1: "bg-[#E8F5EE] text-[#1B7F53]",
  2: "bg-[#E8F5EE] text-[#1B7F53]",
  3: "bg-[#FDF3E2] text-[#A86A00]",
  4: "bg-[#FBEDEB] text-[#B3372C]",
  5: "bg-[#FBEDEB] text-[#B3372C]",
};

export default function TrafficRuleCard({
  title,
  points,
  fine,
  additional,
  authority,
}) {
  const n = Number.parseInt(points, 10);
  const tone = POINT_TONE[Number.isNaN(n) ? 0 : n] ?? POINT_TONE[0];

  return (
    <div className="flex h-full flex-col gap-3 rounded-lg bg-[#F4F5FC] p-4 text-[#05243F] shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h5 className="text-sm font-semibold leading-snug">{title}</h5>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}
          title={
            Number.isNaN(n)
              ? "No demerit points stated in the schedule"
              : `${n} demerit point${n === 1 ? "" : "s"}`
          }
        >
          {Number.isNaN(n) ? "No pts" : `${n} pt${n === 1 ? "" : "s"}`}
        </span>
      </div>

      {fine && fine !== "—" && (
        <p className="text-xs font-semibold text-[#05243F]/70">{fine}</p>
      )}

      {additional && additional !== "—" && (
        <p className="text-xs leading-relaxed text-[#05243F]/50">{additional}</p>
      )}

      <span className="mt-auto pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#05243F]/35">
        {authority === "VIS" ? "Vehicle Inspection Service" : "LASTMA"}
      </span>
    </div>
  );
}
