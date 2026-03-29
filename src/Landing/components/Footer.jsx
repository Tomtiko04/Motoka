import { Icon } from "@iconify/react";
import logo from "../../assets/images/landing/Group 1171279822.svg";
import sponsors from "../../assets/images/landing/Group 1171279823.svg";
import { Link } from "react-router-dom";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="flex flex-col items-center bg-[#05243F] px-6 py-30 sm:px-30 sm:py-40">
      <div className="flex flex-col items-center max-w-5xl">
        <h2 className="text-center text-[30px] leading-[42px] font-semibold text-white sm:text-[44px] sm:leading-[56px]">
          Subscribe to get updates on new features, promotions, and auto-care
          tips.
        </h2>
        <p className="text-regular mt-6 text-center text-base text-[#D8D8D8]">
          Join our community of smart drivers. Get insights, updates, and
          special deals delivered monthly.
        </p>
        <div
          className="mt-6 flex w-full items-center justify-between gap-4 rounded-[15px] rounded-[20px] border-1 border-[#FFFFFF08] p-2 py-2"
          style={{
            background:
              "radial-gradient(108.71% 228.83% at -22.65% 12.33%, rgba(0, 230, 118, 0.16) 0%, rgba(108, 99, 255, 0.08) 21.97%, rgba(0, 230, 118, 0.03) 98.44%)",
          }}
        >
          <input
            type="Email"
            className="w-full bg-transparent ps-4 text-base text-white outline-none placeholder:text-[#FFFFFF] sm:ps-6"
            placeholder="Your E-mail"
            name="email"
          />
          <button className="w-fit flex-shrink-0 rounded-[15px] bg-[#2389E3] px-[15px] py-[10px] text-base text-nowrap text-white sm:px-[25px] sm:py-[15px]">
            Get Started
          </button>
        </div>
        <div className="py-10 w-full flex items-center">
          <img src={sponsors} alt="sponsors" className="h-8 w-fit" /></div>
      </div>
      <div className="grid justify-center w-full grid-cols-1 gap-6 mt-20 justify-items-start sm:mt-40 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-start gap-6 mt-10 col-span sm:mt-0 sm:gap-8">
          <div onClick={scrollToTop}>
            <img src={logo} alt="motoka logo" className="h-[52px] w-fit" />
          </div>{" "}
          <p className="font-regular text-[15px] leading-[25px] text-white/70">
            Simplifying vehicle licensing, maintenance, and auto services — all
            in one smart platform.
          </p>
          <div className="flex items-center gap-2 rounded-[10px] bg-[#00000029] px-6 py-3">
            <p className="text-[10px] font-medium text-[#EEF2FF]">
              Follow us on:
            </p>
            <a href="https://www.instagram.com/trymotoka" target="_blank">
              <Icon
                icon="ant-design:instagram-filled"
                className="text-white"
                width={28}
                height={28}
              />
            </a>

            <a href="https://x.com/trymotoka" target="_blank">
              <Icon
                icon="simple-icons:x"
                className="text-white"
                width={24}
                height={24}
              />
            </a>

            <a
              href="https://www.tiktok.com/@trymotoka1?_r=1&_t=ZS-951PN4XJO5p"
              target="_blank"
            >
              <Icon
                icon="streamline-logos:tiktok-logo-block"
                className="text-white"
                width={24}
                height={24}
              />
            </a>
          </div>
          <p className="font-regular text-[13px] text-white/70">
            &copy; {new Date().getFullYear()} Motoka Inc
          </p>
        </div>
        {
          [
            { title: 'Services', links: ['License Auto Renewal', 'License Auto Reminder', 'Vehicle Maintenance', 'Ladipo Car parts', 'Traffic Education'] },
            { title: 'Resources', links: ['Blog & News', 'Driver Guides', 'Community Forum', 'How Motoka Works'] },
            { title: 'Company', links: ['About Motoka', 'Our Mission', 'Careers', 'Partners', 'Contact Us'] },
          ].map((section) => (
            <div key={section.title} className="w-full flex justify-start sm:justify-end">
              <div className="mt-10 flex flex-col items-start gap-6 sm:mt-0 w-fit">
                <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                <div className="flex flex-col items-start gap-4">
                  {section.links.map((link) => (
                    <a key={link} href="#" className="text-[15px] font-regular text-white/70 hover:text-white">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Footer;
