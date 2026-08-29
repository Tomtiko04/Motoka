import { useState } from "react";
import { Icon } from "@iconify/react";
function FaqsSection() {
  const [expanded, setExpanded] = useState(1);
  return (
    <div className="py-20 text-center px-6 pt-10" id="faqs">
      <h2 className="text-[56px] font-bold text-[#05243F]">FAQs</h2>
          {[
        {
          // Website-only wording on purpose: the mobile app is still "Coming
          // soon" in the Mobile section, so telling visitors to download it
          // here contradicted the same page.
          title: "How do I create an account on Motoka?",
          content:
            "Visit motokaapp.ng, click 'Sign Up,' and follow the on-screen instructions. You'll need to provide your name, email, phone number, and create a password. Everything works in your browser — no download needed.",
        },
        {
          title: "How do I renew my driver’s or vehicle licence using Motoka?",
          content:
            "Log in to your Motoka account, go to the 'License Renewal' section, and follow the prompts to enter your vehicle details and make payment. We handle the rest and notify you when your renewed licence is ready.",
        },
        {
          title: "How much does a renewal cost?",
          content:
            "You see a full breakdown before you pay — the government fee for your document and vehicle type, plus Motoka's service fee, itemised separately. Nothing is added at checkout, and the price you approve is the price you pay.",
        },
        {
          title: "My vehicle papers have already expired. Can Motoka still help?",
          content:
            "Yes. Expired papers are one of the most common reasons people come to us. Start the renewal the same way you would before expiry — enter your vehicle details and we process it. Any penalty an agency applies for late renewal is shown in your breakdown before payment, so there are no surprises.",
        },
        {
          title: "How do I know the documents I get back are genuine?",
          content:
            "Every renewal is processed through the issuing authority for your document, and you receive the official document with the verification details intact. You can independently check it through the agency's own verification channel — we encourage it. Motoka never issues or prints documents itself.",
        },
        {
          title: "How do I avoid fake agents and fraudulent documents?",
          content:
            "Never pay an individual into a personal account for vehicle papers, and be wary of anyone who cannot show you an itemised government fee. On Motoka, payment happens only inside your account through our payment provider, every transaction produces a receipt, and no staff member will ever ask you for your password or a transfer to a personal account.",
        },
        {
          title: "Can I upload digital copies of my licence documents?",
          content:
            "Yes. Motoka lets you securely upload digital copies of your documents so you can reach them instantly during a roadside check, and so they are ready for verification when you renew.",
        },
        {
          title: "Can I set reminders for renewals and maintenance?",
          content:
            "Yes. Motoka sends automated reminders ahead of every licence, insurance and service due date, so you can renew before a penalty applies rather than after.",
        },
      ].map((item, idx) => (
        <div
          key={idx}
          className="mx-auto mt-5 w-full max-w-[903px] rounded-[27px] overflow-hidden border border-[#0000001A] text-left"
        >
          <button
            onClick={() => setExpanded(expanded === idx + 1 ? 0 : idx + 1)}
            className={`flex w-full items-center justify-between ${expanded === idx + 1 ? "bg-[#2389E3]" : ""} focus:outline-none px-6 sm:px-12  py-5 sm:py-6`}
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
              <p className="p-4 sm:p-12 sm:py-8 bg-[#FFFFFF] text-[16px] font-medium text-[#05243F99]">
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
