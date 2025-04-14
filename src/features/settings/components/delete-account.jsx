"use client"

import { ChevronLeft } from "lucide-react"

export default function DeleteAccount({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Delete Account</h2>
      </div>

      <div className="text-center space-y-6">
        <div className="flex justify-center items-center w-full h-full text-center ">

         <p className="text-gray-500 mb-4 text-center text-sm md:text-base w-80 ">Are You Sure You Want To Delete Your Account?</p>
        </div>

        <div className="flex justify-center gap-4">
          <button className="rounded-3xl bg-[#2389E3] hover:bg-sky-600 text-base font-semibold text-white py-2 px-10  transition-colors">Yes</button>
          <button className="rounded-3xl bg-white border border-gray-300 text-base font-semibold text-gray-700 py-2 px-10  transition-colors">
            No
          </button>
        </div>
      </div>
    </div>
  )
}
