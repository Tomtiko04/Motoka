// import Image from "next/image"
"use client"

import {ChevronLeft, Pencil } from "lucide-react"

export default function EditProfileInformation({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Profile Information</h2>
        </div>
        <button className="text-sky-500">
          <Pencil className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          <div className="rounded-full overflow-hidden h-20 w-20">
          <img src="/images/profile.png" alt="Profile" className="object-cover h-full w-full" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 text-center md:text-left">Salisu Anjola</h2>
          <p className="text-gray-500">salisuanjola@gmail.com</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value="Salisu Anjola"
            readOnly
            className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value="No 4 Aliko estate"
            readOnly
            className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <input
            type="text"
            value="Female"
            readOnly
            className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value="salisuanjola@gmail.com"
            readOnly
            className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
          />
        </div>

        <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
          Save Profile
        </button>
      </div>
    </div>
  )
}

