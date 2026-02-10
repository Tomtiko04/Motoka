import logo from "../../assets/images/landing/Group 209.svg";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#services" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQs", href: "#faqs" },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto px-6 sm:px-10">
        <header className="flex flex-wrap items-center justify-between py-2">
          <div className="flex cursor-pointer items-center">
            <img
              src={logo}
              alt="Motoka"
              className="h-8 w-auto object-contain"
            />
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center h-fit ">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`mx-4 text-base font-normal hover:text-[#126cbb] ${item.name === "Home" ? "text-[#2388E1] bg-[#FFFFFF] rounded-lg px-8 py-2 font-bold" : "text-[#05243F99]"}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          {/* Mobile Nav Toggle */}
          <div className="flex items-center gap-2">
            <button 
             className="hidden md:block rounded-[10px] border-[1.7px] border-[#2287E0] text-[#05243F] hover:text-white hover:bg-[#2287E0] transition-colors duration-300 ease-in-out px-8 py-2 text-base font-semibold sm:mt-0 "
             onClick={() => navigate("/auth/login")}
             >
              Login
            </button>
            <button
              className="rounded-[10px] bg-[#EBB850] px-4 py-2 text-base font-semibold text-[#05243F] sm:mt-0"
              onClick={() => navigate("/auth/signup")}
            >
              Register
            </button>
            <div className="ms-2 flex items-center md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="focus:outline-none"
                aria-label="Toggle navigation"
              >
                <Icon icon="mingcute:menu-fill" width="28" height="28" />
              </button>
              
            </div>
          </div>
        </header>
        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <nav className=" bg-[#ffffff] px-4 py-4 pt-2 md:hidden">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block py-2 text-base font-normal hover:text-[#126cbb] ${item.name === "Home" ? "text-[#2388E1]" : "text-[#05243F99]"}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>

            ))}
            <button 
             className="rounded-[10px] border-[1.7px] border-[#2287E0] text-white bg-[#2287E0] transition-colors duration-300 ease-in-out px-8 py-2 text-base font-semibold sm:mt-0 "
             onClick={() => navigate("/auth/login")}
             >
              Login
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

export default Header;
