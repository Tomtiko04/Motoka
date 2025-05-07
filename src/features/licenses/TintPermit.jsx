import React from 'react'
import LicenseLayout from './components/LicenseLayout'
import ActionButton from './components/ActionButton';

export default function TintPermit() {
  return (
    <LicenseLayout
      title="Tint Permit"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="w-full max-w-[380px] mx-auto ">
        <h5 className="text-center text-base font-semibold text-[#2284DB] mb-3">
          Contact US
        </h5>
        <form className="flex flex-col items-center justify-center w-full">
          <textarea
            className="w-full h-[175px] bg-[#F4F5FC] outline-none border-none resize-none text-sm placeholder:text-[#05243F]/40 rounded-[10px] p-4 mb-5"
            placeholder="Send us a message..."
          />
          <ActionButton type="submit" className="w-[100px]">Send</ActionButton>
        </form>
      </div>
    </LicenseLayout>
  );
}
