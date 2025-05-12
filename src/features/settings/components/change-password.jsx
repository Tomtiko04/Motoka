"use client"

import { useState } from "react"
import { ChevronLeft, Eye, EyeOff } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import { toast } from "react-hot-toast"

export default function ChangePassword({ onNavigate }) {
  const { changeUserPassword } = useProfile()
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  })
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!formData.old_password.trim()) {
      newErrors.old_password = "Current password is required"
      isValid = false
    }

    if (!formData.new_password.trim()) {
      newErrors.new_password = "New password is required"
      isValid = false
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters"
      isValid = false
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const response = await changeUserPassword(formData)
      if (response && response.success) {
        
        setFormData({
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        })
        setTimeout(() => {
          onNavigate("main")
        }, 1500)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message, {
        duration: 5000,
        id: 'password-change-error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Change Password</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div>
            <label htmlFor="old_password" className="mb-2 block text-sm font-medium text-[#05243F]">
              Old Password
            </label>
            <div className="relative">
              <input
                id="old_password"
                name="old_password"
                type={showOldPassword ? "text" : "password"}
                value={formData.old_password}
                onChange={handleChange}
                className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.old_password && <p className="mt-1 text-xs text-red-500">{errors.old_password}</p>}
          </div>

          <div>
            <label htmlFor="new_password" className="mb-2 block text-sm font-medium text-[#05243F]">
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showNewPassword ? "text" : "password"}
                value={formData.new_password}
                onChange={handleChange}
                className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password && <p className="mt-1 text-xs text-red-500">{errors.new_password}</p>}
          </div>

          <div>
            <label htmlFor="new_password_confirmation" className="mb-2 block text-sm font-medium text-[#05243F]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="new_password_confirmation"
                name="new_password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.new_password_confirmation}
                onChange={handleChange}
                className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.new_password_confirmation && (
              <p className="mt-1 text-xs text-red-500">{errors.new_password_confirmation}</p>
            )}
          </div>

          <div className="pb-5 md:mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
