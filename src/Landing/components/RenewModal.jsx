
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import AuthSideHero from "../../components/AuthSideHero";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function RenewModal({ isOpen, onClose, initialPlateNumber }) {
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    expiryDate: "",
    terms: false
  });

  useEffect(() => {
    setPlateNumber(initialPlateNumber);
  }, [initialPlateNumber]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.expiryDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!formData.terms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

   console.log(formData);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl flex-col md:flex-row max-h-[90vh] md:h-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Side - Image */}
        <AuthSideHero text="Motoka Keeps you going." />

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="w-full overflow-hidden p-1 pb-4 pt-6 sm:p-8 flex flex-col h-full flex-1 justify-center">
            <div className="animate-slideDown mb-4 flex flex-col space-y-1 sm:mb-2 sm:space-y-1 md:mt-3">
              <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">
                Just a sec.
              </h2>
              <div className="flex items-center">
                <span className="text-sm text-[#697B8C]/50 font-normal">
                  Kindly fill in your details. This is a one-time setup
                </span>
              </div>
            </div>

            <form className="flex flex-col flex-1" onSubmit={handleSubmit}>
              <div className="space-y-3 sm:space-y-3 flex-1 flex items-center flex-col justify-center">
                <div className="relative w-full">
                  <input
                    type="text"
                    id="plateNumber"
                    value={plateNumber}
                    readOnly
                    className="peer block w-full rounded-lg bg-[#FFFBEB] px-4 pb-4 pt-7 text-lg text-[#05243F] font-bold shadow-2xs focus:outline-none border-none sm:px-5 placeholder-transparent"
                    placeholder="Your plate no."
                  />
                  <label 
                    htmlFor="plateNumber"
                    className="absolute left-4 top-5 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                  >
                    Your plate no.*
                  </label>
                </div>

               <div className="relative w-full">
                <input
                  type="text"
                  id="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                  placeholder="Enter last expiry date"
                />
                <label 
                    htmlFor="expiryDate"
                    className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                >
                    Enter last expiry date*
                </label>
              </div>

              <div className="flex gap-3 w-full">
                <div className="relative w-full">
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                    placeholder="Enter phone no."
                  />
                  <label 
                    htmlFor="phone"
                    className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                  >
                    Enter phone no.*
                  </label>
                </div>
            

                <div className="relative w-full">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                  placeholder="Enter full Name"
                />
                <label 
                  htmlFor="name"
                  className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                >
                  Enter full Name*
                </label>
              </div>
              </div>

                  <div className="relative w-full">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] shadow-2xs transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none sm:px-5 placeholder-transparent"
                    placeholder="Enter your email"
                  />
                   <label 
                    htmlFor="email"
                    className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-[#2389E3] pointer-events-none"
                  >
                    Enter your email*
                  </label>
                </div>

                <div className="flex items-center w-full mt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                    className="h-4 w-4 cursor-pointer rounded border-[#F4F5FC] text-[#2389E3] focus:ring-[#2389E3]"
                  />
                  <label htmlFor="terms" className="ml-3 block text-sm text-[#05243F] opacity-40">
                    I confirm that i have entered the correct information and agree with the terms and conditions.
                  </label>
                </div>
              </div>

              <div className="mt-4 w-full">
                 <button
                    type="submit"
                    className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none hover:focus:ring-[#FFF4DD] active:scale-95"
                  >
                    Proceed
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
