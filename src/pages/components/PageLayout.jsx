import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";

export default function PageLayout({ children, title, subTitle }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const navigate = useNavigate();
  
    useEffect(() => {
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }
  
      // Initial check
      checkIfMobile()
  
      // Add event listener
      window.addEventListener("resize", checkIfMobile)
  
      // Cleanup
      return () => window.removeEventListener("resize", checkIfMobile)
    }, [])
  
  return (
    <>
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 min-h-full">
        <div className="relative mt-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="absolute top-1/4 left-0 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#E1E6F4] text-[#697C8C] transition-colors hover:bg-[#E5F3FF]"
          >
            <IoIosArrowBack className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-center text-xl font-medium text-[#05243F] md:text-2xl">
              {title}
            </h1>
            <p className="mt-2 text-center text-sm font-normal text-[#05243F]/40">
              {subTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-4 max-w-4xl rounded-[20px] bg-[#F9FAFC]  shadow-sm sm:mx-auto ">
        {children}
      </div>
    </>
  );
}
