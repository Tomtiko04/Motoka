"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Pencil } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import Avatar from "./ui/avatar"

export default function ProfileInformation({ onNavigate }) {
  const { loading, error, profileData, fetchProfile } = useProfile()

  
  const [fetchInitiated, setFetchInitiated] = useState(false)

  useEffect(() => {
   
    const loadProfile = async () => {
      setFetchInitiated(true)
      await fetchProfile(true) 
    }

    loadProfile()
  }, [fetchProfile])

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Profile Information</h2>
        </div>
        <button className="text-sky-500" onClick={handleEditClick}>
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 items-center justify-between mb-8">
        <div className="relative">
          <Avatar src={profileData?.image} alt={profileData?.name} />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">{profileData?.name || "User"}</h2>
          <p className="text-base font-normal text-[#05243F]/40 sm:text-lg">
            {profileData?.email || "user@example.com"}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Name</label>
          <input
            type="text"
            value={profileData?.name || ""}
            readOnly
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Address</label>
          <input
            type="text"
            value={profileData?.address || "Not provided"}
            readOnly
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Gender</label>
          <input
            type="text"
            value={profileData?.gender || "Not provided"}
            readOnly
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">Email</label>
          <input
            type="email"
            value={profileData?.email || ""}
            readOnly
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Fixed Footer Section */}
        <div className="mt-5 pt-5">
          <button
            type="button"
            onClick={handleEditClick}
            className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}
