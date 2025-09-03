// import Image from "next/image"
import React from "react";
import { Pencil } from "lucide-react"
import Profile from "../../../assets/images/setting/profile3.png"

export default function MainSettings({ onNavigate }) {
  return (
    
    <div className="flex flex-col items-center justify-start mt-10">
      <div className="relative mb-4">
        <div className="rounded-full border-4 border-sky-200 overflow-hidden h-24 w-24">
          <img src={Profile} alt="Profile" className="object-cover h-full w-full" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
          <Pencil className="h-4 w-4 text-sky-500" />
        </div>
      </div>

      <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">Salisu Anjola</h1>
      <p className="text-base font-normal text-[#05243F]/40 sm:text-lg">salisuanjola@gmail.com</p>

      {/* <div className="flex items-center gap-1 mb-4">
        <span className="bg-sky-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">👍</span>
        <span className="bg-sky-200 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">❤️</span>
      </div> */}

      {/* <p className="text-gray-600 text-center">Thank you for trusting in us.</p> */}
      <div className="mt-5">

        <button
          type="button"
        
          className=" text-[#05243F] rounded-[26px]  px-4 py-3 text-sm font-medium transition-colors mt-5 bg-[#FFF] shadow-sm"
        >
        Thank you for trusting in us.
        </button>
      </div>
    </div>
  )
}

