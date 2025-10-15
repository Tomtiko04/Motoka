import { useState } from "react";
import { Icon } from "@iconify/react";
function FaqsSection() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div className="py-20 text-center px-6" id="faqs">
      <h2 className="text-[56px] font-bold text-[#05243F]">FAQs</h2>
          {[
        {
          title: "How do i create account on Motoka",
          content:
            "Download the Motoka app or visit our website, click 'Sign Up,' and follow the on-screen instructions. You'll need to provide your name, email, phone number, and create a password.",
        },
        {
          title: "How do I renew my driver’s/vehicle license usuing Motoka?",
          content:
            "Log in to your Motoka account, navigate to the 'License Renewal' section, and follow the prompts to enter your vehicle details and make payment. We'll handle the rest and notify you when your renewed license is ready.",
        },
        {
          title: "Can I upload digital copies of my license documents?",
          content:
            "Yes, Motoka allows you to securely upload digital copies of your license documents for easy access and verification during the renewal process.",
        },
        {
          title: "Can I set reminders for upcoming maintenance tasks?",
          content:
            "Absolutely! Motoka offers a reminder feature that allows you to set notifications for upcoming maintenance tasks, ensuring you never miss an important service.",
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="mx-auto mt-5 w-full max-w-[903px] rounded-[27px] overflow-hidden border border-[#0000001A] text-left"
        >
          <button
            onClick={() => setExpanded(expanded === idx + 1 ? 0 : idx + 1)}
            className={`flex w-full items-center justify-between ${expanded === idx + 1 ? "bg-[#2389E3]" : ""} focus:outline-none px-6 py-5`}
          >
            <h4 className={`text-[18px] font-medium text-[#05243F] text-left ${expanded === idx + 1 ? "text-white" : ""}`}>
              {item.title}
            </h4>
            <span
              className={`text-[32px] font-bold transition-transform duration-300  flex items-center justify-center  h-8 w-8  rounded-full flex-shrink-0 ${expanded === idx + 1 ? "rotate-45 bg-white text-[#2389E3]" : "bg-[#2389E3] text-white"}`}
            >
              <Icon icon="qlementine-icons:plus-16" width="16" height="16" />
            </span>
          </button>
          {expanded === idx + 1 && (
            <div>
              <p className="p-4 bg-[#45A1F233] text-[16px] font-medium text-[#05243F99]">
                {item.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FaqsSection;
