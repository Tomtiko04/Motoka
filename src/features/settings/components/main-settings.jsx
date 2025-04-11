// import Image from "next/image"
import React from "react";
import { Pencil } from "lucide-react"

export default function MainSettings({ onNavigate }) {
  return (
    
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <div className="rounded-full border-4 border-sky-200 overflow-hidden h-24 w-24">
          <img src="/path/to/profile.jpg" alt="Profile" className="object-cover h-full w-full" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
          <Pencil className="h-4 w-4 text-sky-500" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800">Salisu Anjola</h2>
      <p className="text-gray-500 mb-6">salisuanjola@gmail.com</p>

      <div className="flex items-center gap-1 mb-4">
        <span className="bg-sky-500 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">👍</span>
        <span className="bg-sky-200 h-6 w-6 rounded-full flex items-center justify-center text-white text-xs">❤️</span>
      </div>

      <p className="text-gray-600 text-center">Thank you for trusting in us.</p>
    </div>
  )
}

