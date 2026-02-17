
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import image from "../../assets/images/signuppage.gif";
import { Link } from "react-router-dom";

export default function RenewModal({ isOpen, onClose, initialPlateNumber }) {
  if (!isOpen) return null;

  const [plateNumber, setPlateNumber] = useState(initialPlateNumber || "");

  useEffect(() => {
    setPlateNumber(initialPlateNumber);
  }, [initialPlateNumber]);

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
        <div className="hidden md:block w-1/2 relative">
             <div className="absolute inset-0 bg-[#E5F0FF]">
                 <img src={image} alt="Motoka Keeps you going" className="h-full w-full object-cover" />
                 <div style={{ background: 'linear-gradient(179.96deg, rgba(35, 137, 227, 0.2) 36.13%, #2389E3 99.96%)' }} className="absolute inset-0 flex items-end justify-center pb-12">
                     <p className="text-3xl font-bold text-white text-center px-6">Motoka Keeps you going.</p>
                 </div>
             </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="mb-6 mt-2">
            <h2 className="text-2xl font-bold text-[#05243F]">Just a sec.</h2>
            <p className="text-sm text-gray-500 mt-1">Kindly fill in your details. This is a one-time setup</p>
          </div>

          <form className="space-y-4">
            <div>
            <label className="block text-xs text-gray-500 mb-1 ml-1">Your plate no.</label>
              <input
                type="text"
                value={plateNumber}
                readOnly
                className="w-full rounded-lg bg-[#FFFBEB] px-4 py-3 text-[#05243F] font-bold focus:outline-none border-none"
              />
            </div>

            <div className="flex gap-3">
                 <div className="relative w-full">
                    <input
                        type="text"
                        id="fullName"
                        className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] focus:bg-[#FFF4DD] focus:outline-none transition-colors placeholder-transparent"
                        placeholder="Enter full Name"
                    />
                    <label 
                        htmlFor="fullName"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600 pointer-events-none"
                    >
                        Enter full Name
                    </label>
                 </div>
                 <div className="relative w-full">
                    <input
                        type="tel"
                        id="phone"
                        className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] focus:bg-[#FFF4DD] focus:outline-none transition-colors placeholder-transparent"
                        placeholder="Enter phone no."
                    />
                    <label 
                        htmlFor="phone"
                        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600 pointer-events-none"
                    >
                        Enter phone no.
                    </label>
                 </div>
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] focus:bg-[#FFF4DD] focus:outline-none transition-colors placeholder-transparent"
                placeholder="Enter your email"
              />
              <label 
                htmlFor="email"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600 pointer-events-none"
              >
                Enter your email
              </label>
            </div>

            <div className="relative">
              <input
                type="text"
                id="expiryDate"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => (e.target.type = "text")}
                className="peer block w-full rounded-lg bg-[#F4F5FC] px-4 pb-2.5 pt-5 text-sm text-[#05243F] focus:bg-[#FFF4DD] focus:outline-none transition-colors placeholder-transparent"
                placeholder="Enter last expiry date"
              />
               <label 
                htmlFor="expiryDate"
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-blue-600 pointer-events-none"
              >
                Enter last expiry date
              </label>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-tight">
                I confirm that I have entered the correct information and agree with the terms and conditions.
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-[#2389E3] py-3 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Proceed
            </button>
            
            <div className="text-center text-sm text-gray-500 mt-4">
                Have an account? <Link to="/auth/login" className="text-[#2389E3] font-medium hover:underline">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
