"use client"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import Avatar from "./ui/avatar"
import { toast } from "react-hot-toast"

export default function EditProfile({ onNavigate }) {
  const { loading, error, profileData, fetchProfile, updateUserProfile, resetProfileState } = useProfile()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    gender: "",
    phone_number: "",
  })
 
  const [displayData, setDisplayData] = useState({
    name: "",
    email: "",
    address: "",
    gender: "",
    phone_number: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [fetchInitiated, setFetchInitiated] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!fetchInitiated && !profileData) {
        setFetchInitiated(true)
        const data = await fetchProfile(true)
        if (data) {
          const newFormData = {
            name: data.name || "",
            email: data.email || "",
            address: data.address || "",
            gender: data.gender || "",
            phone_number: data.phone_number || "",
          }
          setFormData(newFormData)
          setDisplayData({
            name: data.name || "",
            email: data.email || "",
            address: data.address || "",
            gender: data.gender || "",
            phone_number: data.phone_number || "",
          })
        }
      }
    }
    loadProfile()
  }, [fetchProfile, fetchInitiated, profileData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)

    try {
      const response = await updateUserProfile(formData)
      if (response && response.success) {
        await fetchProfile(true)
        
        resetProfileState()
        
      

        setTimeout(() => {
          onNavigate("profile")
        }, 1500)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
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
          <button onClick={() => onNavigate("profile")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Edit Profile</h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-6 items-center justify-between mb-8">
        <div className="relative">
          <Avatar src={profileData?.image} alt={displayData.name} />
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-medium text-[#05243F] sm:text-2xl">{displayData.name}</h2>
          <p className="text-base font-normal text-[#05243F]/40 sm:text-lg">{displayData.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#05243F]">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F66] placeholder:text-[#05243F66]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="phone_number" className="mb-2 block text-sm font-medium text-[#05243F]">
            Phone Number <span className="text-xs text-amber-600 font-normal">(Required for bank transfer)</span>
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="e.g. 08012345678"
            value={formData.phone_number}
            onChange={handleChange}
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F66] placeholder:text-[#05243F66]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block text-sm font-medium text-[#05243F]">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F66] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="gender" className="mb-2 block text-sm font-medium text-[#05243F]">
            Gender
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F66] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#05243F]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F66] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Fixed Footer Section */}
        <div className="mt-5 pt-5">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  )
}
