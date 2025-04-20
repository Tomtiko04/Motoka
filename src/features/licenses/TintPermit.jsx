import React from 'react'
import LicenseLayout from './components/LicenseLayout'
import ActionButton from './components/ActionButton';

export default function TintPermit() {
  return (
    <LicenseLayout
      title="Tint Permit"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div>
        <h5 className="text-center text-sm font-semibold text-[#2284DB]">
          Contact Us
        </h5>
        <form className="flex flex-col items-center justify-center">
          <textarea
            className="h-2xl border border-amber-100 bg-[##F4F5FC] outline-0 placeholder:text-sm placeholder:text-[#05243F]/40 focus:border-amber-800"
            placeholder="Send us a message..."
          />
          <ActionButton type="submit">Send</ActionButton>
        </form>
      </div>
    </LicenseLayout>
  );
}
