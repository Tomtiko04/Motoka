"use client"

import { ChevronLeft } from "lucide-react"

export default function DataPermission({ onNavigate }) {
  return (
    <div className="pb-10 mb-10">
      <div className="flex items-center mb-6 ">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium text-sm md:text-base">Data & Permission</h2>
      </div>



      <div className="space-y-10 ">
        <div className="flex justify-center items-center w-full h-full text-center ">
          <p className="text-sm text-[#05243F]/40  w-85">
            At Motoka, we believe in transparency and empowering you to manage your data and permissions.
          </p>

        </div>

        <div className="space-y-4 ">
          <div className="px-4 py-5 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between ">
              <h3 className="font-medium text-sm md:text-base">Camera</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>

          <div className="px-4 py-5 bg-white rounded-lg shadow-sm">

            <div className="flex items-center justify-between ">
              <h3 className="font-medium text-sm md:text-base">Storage</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>

          <div className="px-4 py-5 bg-white rounded-lg shadow-sm">

            <div className="flex items-center justify-between ">
              <h3 className="font-medium text-sm md:text-base">Contacts</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>

          <div className="px-4 py-5 bg-white rounded-lg shadow-sm">

            <div className="flex items-center justify-between ">
              <h3 className="font-medium text-sm md:text-base">Location Services</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
          <div className="px-4 py-5 bg-white rounded-lg shadow-sm">

            <div className="flex items-center justify-between ">
              <h3 className="font-medium text-sm md:text-base">Network Access</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  )
}
