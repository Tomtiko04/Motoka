import React from "react";

export default function ActionButton({ children, onClick, variant = "primary", disabled, className = "", ...props }) {
  const baseClasses = "rounded-full p-3 text-base text-center font-semibold transition-colors";
  const variants = {
    primary: "bg-[#2284DB] text-white hover:bg-[#2284DB]/90",
    secondary: "border border-[#2284DB] text-[#05243F] hover:bg-[#FDF6E8]",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
