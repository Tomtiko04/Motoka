import React from "react";

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  autoFilled = false,
  ...props
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-[#05243F]">{label}</p>
        {autoFilled && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path
                fillRule="evenodd"
                d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                clipRule="evenodd"
              />
            </svg>
            Auto-filled
          </span>
        )}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-[10px] px-4 py-3 text-sm font-normal text-[#05243F] transition-colors duration-300 placeholder:text-[#05243F]/40 focus:outline-none ${
          error
            ? "border-2 border-red-500 bg-[#F4F5FC]"
            : autoFilled
              ? "border border-emerald-200 bg-emerald-50 hover:bg-emerald-50/80 focus:bg-[#FFF4DD]"
              : "bg-[#F4F5FC] hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
