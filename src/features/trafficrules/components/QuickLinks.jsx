import React from "react";

 const links = [
   { label: "Driver’s License", href: "#" },
   { label: "Road Worthiness", href: "#" },
   { label: "Speed Limit", href: "#" },
   { label: "Traffic Lights", href: "#" },
 ];

export default function QuickLinks() {
 
  return (
    <ul className="mt-4 flex flex-row flex-wrap gap-1.5">
      {links.map((link, index) => (
        <li
          key={index}
          className="text-xs font-medium text-[#05243F]/40 underline hover:text-[#05243F]"
        >
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  );
}
