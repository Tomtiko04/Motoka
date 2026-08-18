import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Seo from "../components/Seo";

const WHATSAPP_NUMBER = "2348128685978";

const SOCIALS = [
  {
    label: "Call us",
    handle: "0812 868 5978",
    href: "tel:+2348128685978",
    icon: "solar:phone-bold",
    external: false,
  },
  {
    label: "WhatsApp",
    handle: "0812 868 5978",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    icon: "ic:baseline-whatsapp",
    external: true,
  },
  {
    label: "Instagram",
    handle: "@trymotoka",
    href: "https://www.instagram.com/trymotoka",
    icon: "ant-design:instagram-filled",
    external: true,
  },
  {
    label: "X",
    handle: "@trymotoka",
    href: "https://x.com/trymotoka",
    icon: "simple-icons:x",
    external: true,
  },
  {
    label: "TikTok",
    handle: "@trymotoka1",
    href: "https://www.tiktok.com/@trymotoka1",
    icon: "streamline-logos:tiktok-logo-block",
    external: true,
  },
];

const fieldClass =
  "mt-1 block w-full rounded-xl bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F66] transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 sm:py-4";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (website.trim()) return;

    const text = [
      "Hello Motoka,",
      "",
      `Name: ${name.trim()}`,
      email.trim() ? `Email: ${email.trim()}` : null,
      "",
      message.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    toast.success("WhatsApp is opening — tap Send to deliver the message.");
  };

  return (
    <section className="px-6 py-12 sm:px-10 sm:py-16">
      <Seo
        title="Contact Us"
        description="Call, WhatsApp, or message Motoka about a renewal, an order, or the app."
        path="/contact"
      />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[32px] font-bold leading-tight text-[#05243F] sm:text-[44px]">
          Contact Us
        </h1>
        <p className="mt-4 text-lg text-[#05203DB2]">
          Questions about a renewal, an order, or the app — call, WhatsApp, or
          send a message.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SOCIALS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-4 text-[#05243F] transition-colors hover:bg-[#FFF4DD]"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#2389E3]">
                <Icon icon={item.icon} className="text-white" width={22} height={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="block text-xs text-[#05203DB2]">{item.handle}</span>
              </span>
            </a>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-[20px] bg-white p-6 sm:p-8"
        >
          <p className="text-lg font-semibold text-[#05243F]">Message us on WhatsApp</p>
          <p className="text-sm text-[#05203DB2]">
            Fill this in and we will open WhatsApp with your message ready to
            send to 0812 868 5978.
          </p>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="contact-name" className="text-sm font-medium text-[#05243F]">
              Full name
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={80}
              className={fieldClass}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="text-sm font-medium text-[#05243F]">
              Email <span className="font-normal text-[#05203DB2]">(optional)</span>
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="text-sm font-medium text-[#05243F]">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              maxLength={2000}
              className={`${fieldClass} resize-y`}
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#2389E3] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#126cbb] sm:w-auto"
          >
            <Icon icon="ic:baseline-whatsapp" width={22} height={22} />
            Send on WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
