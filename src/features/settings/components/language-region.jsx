"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function LanguageRegion({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("main") // main, language, region

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => (activeTab === "main" ? onNavigate("main") : setActiveTab("main"))} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Language & Region</h2>
      </div>

      {activeTab === "main" && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer"
            onClick={() => setActiveTab("language")}
          >
            <div>
              <h3 className="font-medium text-sm md:text-base">Motoka Language</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Select your preferred language</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer"
            onClick={() => setActiveTab("region")}
          >
            <div>
              <h3 className="font-medium text-sm md:text-base">Region</h3>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Select your preferred region</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-6 md:mt-8">
            <button className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95">
              Confirm
            </button>
          </div>
        </div>
      )}

      {activeTab === "language" && (
        <div>
          <div className="flex mb-6 md:mb-6">
            <button
               className={`flex-1 py-2 text-sm md:text-base ${
                activeTab === "language"
                  ? "bg-sky-500 text-white rounded-l-full"
                  : "bg-white text-gray-700 border border-gray-200 rounded-l-full"
              }`}
              onClick={() => setActiveTab("language")}
            >
              Motoka Language
            </button>
            <button
              className={`flex-1 py-2 text-sm md:text-base ${
                activeTab === "region"
                  ? "bg-sky-500 text-white rounded-r-full"
                  : "bg-white text-gray-700 border border-gray-200 rounded-r-full"
              }`}
              onClick={() => setActiveTab("region")}
            >
              Region
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="font-medium text-sm md:text-base">English</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-sky-500 bg-sky-500 flex items-center justify-center text-white">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="font-medium text-sm md:text-base">Spanish</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="font-medium text-sm md:text-base">Italian</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="font-medium text-sm md:text-base">Deutsch</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="font-medium text-sm md:text-base">France</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 sticky bottom-0  flex justify-center rounded-b-[20px]  p-6 pt-4 sm:p-8 sm:pt-4">
            <button
              type="submit"
              className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
              onClick={() => setActiveTab("main")}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {activeTab === "region" && (
        <div>
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-sm md:text-base ${
                activeTab === "language"
                  ? "bg-sky-500 text-white rounded-l-full"
                  : "bg-white text-gray-700 border border-gray-200 rounded-l-full"
              }`}
              onClick={() => setActiveTab("language")}
            >
              Motoka Language
            </button>
            <button className={`flex-1 py-2 text-sm md:text-base ${
                activeTab === "region"
                  ? "bg-sky-500 text-white rounded-r-full"
                  : "bg-white text-gray-700 border border-gray-200 rounded-r-full"
              }`} onClick={() => setActiveTab("region")}>
              Region
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇳🇬</span>
                <span className="font-medium text-sm md:text-base">Nigeria</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-sky-500 bg-sky-500 flex items-center justify-center text-white">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇦🇺</span>
                <span className="font-medium text-sm md:text-base">Australia</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇧🇪</span>
                <span className="font-medium text-sm md:text-base">Belgium</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇨🇦</span>
                <span className="font-medium text-sm md:text-base">Canada</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇫🇷</span>
                <span className="font-medium text-sm md:text-base">France</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-3xl bg-white">
              <div className="flex items-center">
                <span className="mr-2">🇩🇪</span>
                <span className="font-medium text-sm md:text-base">Germany</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 sticky bottom-0  flex justify-center rounded-b-[20px]  p-6 pt-4 sm:p-8 sm:pt-4">
            <button
              className="w-full rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95"
              onClick={() => setActiveTab("main")}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
