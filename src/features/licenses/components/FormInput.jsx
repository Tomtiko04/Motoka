import React from "react";

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  ...props
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-[#05243F]">{label}</p>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 text-sm font-normal text-[#05243F] transition-colors duration-300 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none ${
          error ? "border-2 border-red-500" : ""
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
