"use client"

import { useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import { useProfile } from "../hooks/useProfile"
import { authStorage } from "../../../utils/authStorage"

export default function DeleteAccount({ onNavigate }) {
  const { deleteUserAccount } = useProfile()
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleOpenModal = () => {
    setShowModal(true)
    setError(null)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setConfirmText("")
    setPassword("")
    setError(null)
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()

    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    if (!password.trim()) {
      setError("Password is required")
      return
    }

    setSubmitting(true)

    try {
      const response = await deleteUserAccount(password)
      if (response && response.success) {
        // Clear auth token and redirect to login
        authStorage.removeToken()
        window.location.href = "/auth/login"
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting account")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Delete Account</h2>
      </div>

      <div className="text-center space-y-6">
        <div className="flex justify-center items-center w-full h-full text-center">
          <p className="text-gray-500 mb-4 text-center text-sm md:text-base w-80">
            Are You Sure You Want To Delete Your Account?
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="rounded-3xl bg-[#2389E3] hover:bg-sky-600 text-base font-semibold text-white py-2 px-10 transition-colors"
            onClick={handleOpenModal}
          >
            Yes
          </button>
          <button
            className="rounded-3xl bg-white border border-gray-300 text-base font-semibold text-gray-700 py-2 px-10 transition-colors"
            onClick={() => onNavigate("main")}
          >
            No
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Account Deletion</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <h4 className="mb-2">
                  <span className="text-gray-700">This action cannot be undone. Please type </span><strong className="text-red-600">DELETE</strong> <span className="text-gray-700">to confirm.</span>
                </h4>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2389E3]"
                  placeholder="Type DELETE here"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#05243F] mb-2">
                  Enter your password to confirm
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2389E3]"
                  placeholder="Your password"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-3xl bg-white border border-gray-300 text-base font-semibold text-gray-700 py-2 px-6 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || confirmText !== "DELETE" || !password}
                  className="rounded-3xl bg-red-600 hover:bg-red-700 text-base font-semibold text-white py-2 px-6 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
