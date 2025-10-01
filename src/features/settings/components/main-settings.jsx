// import Image from "next/image"
// import React from "react";
// import { Pencil } from "lucide-react"
// import Profile from "../../../assets/images/setting/profile3.png"

// export default function MainSettings({ onNavigate }) {
//   return (
//     <div></div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Pencil } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import Avatar from "./ui/avatar"
import { Icon } from "@iconify/react"

export default function MainSettings({ onNavigate }) {
  const { loading, error, profileData, fetchProfile } = useProfile()

  
  const [fetchInitiated, setFetchInitiated] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!fetchInitiated) {
        setFetchInitiated(true)
        await fetchProfile(true) 
      }
    }

    loadProfile()
  }, [fetchProfile, fetchInitiated])

  // Add this effect to refresh data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      await fetchProfile(true) 
    }
    refreshData()
  }, [])

  const handleEditClick = () => {
    onNavigate("edit-profile")
  }

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (error && !profileData) {
    return <div className="text-red-500 text-center p-4">{error}</div>
  }

  return (
    <div className="flex flex-col h-50 items-center justify-center">
      <div>
        <div>
          <div className="flex items-center justify-center">
            <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">
              Hello, {profileData?.name || "User"}
            </h2>
            <span
              role="img"
              aria-label="wave"
              className="ml-2 transform cursor-pointer transition-transform duration-300 hover:scale-110"
            >
              <Icon icon="mdi:hand-wave" fontSize={28} color="#B18378" />
            </span>
          </div>
          <p className="text-base font-normal text-[#05243F]/40 sm:text-lg">
            {profileData?.email || "user@example.com"}
          </p>
        </div>
      </div>
      <div>
        <button
          type="button"
          className="mt-5 rounded-[26px] bg-[#FFF] px-4 py-3 text-sm font-medium text-[#05243F] shadow-sm transition-colors"
        >
          Thank you for trusting in us.
        </button>
      </div>
    </div>
  );
}


//  <div className="mt-10 flex flex-col items-center justify-start">
//    <div className="relative mb-4">
//      <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-sky-200">
//        <img
//          src={Profile}
//          alt="Profile"
//          className="h-full w-full object-cover"
//        />
//      </div>
//      <div className="absolute -right-1 -bottom-1 rounded-full bg-white p-1 shadow-md">
//        <Pencil className="h-4 w-4 text-sky-500" />
//      </div>
//    </div>

//    {/* <h1 className="text-2xl font-medium text-[#05243F] sm:text-3xl">Salisu Anjola</h1>
//       <p className="text-base font-normal text-[#05243F]/40 sm:text-lg">salisuanjola@gmail.com</p> */}

//    {/* <div className="flex items-center gap-1 mb-4">
//         <span className="bg-sky-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">👍</span>
//         <span className="bg-sky-200 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">❤️</span>
//       </div> */}

//    {/* <p className="text-gray-600 text-center">Thank you for trusting in us.</p> */}
  //  <div className="mt-5">
  //    <button
  //      type="button"
  //      className="mt-5 rounded-[26px] bg-[#FFF] px-4 py-3 text-sm font-medium text-[#05243F] shadow-sm transition-colors"
  //    >
  //      Thank you for trusting in us.
  //    </button>
  //  </div>
//  </div>;