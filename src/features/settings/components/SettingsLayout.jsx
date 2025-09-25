import React from "react";

export default function SettingsLayout({ children, title, subTitle, mainContentTitle }) {
  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative mt-3 mb-6">
          <h1 className="text-center text-2xl font-medium text-[#05243F]">
            {title}
          </h1>
          <p className="mt-2 text-center text-sm font-normal text-[#05243F]/40">
            {subTitle}
          </p>
        </div>
      </div>
      <div className="mx-4 max-w-4xl rounded-[20px] bg-[#F9FAFC] px-4 pt-6 pb-10 shadow-sm sm:mx-auto sm:px-8">
        <h2 className="mb-5 text-center text-[15px] font-normal text-[#05243F]/71">
          {mainContentTitle}
        </h2>
        {children}
      </div>
    </>
  );
}
