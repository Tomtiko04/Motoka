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
              <h3 className="font-medium">Motoka Language</h3>
              <p className="text-sm text-gray-500">Select your preferred language</p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer"
            onClick={() => setActiveTab("region")}
          >
            <div>
              <h3 className="font-medium">Region</h3>
              <p className="text-sm text-gray-500"></p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          <div className="pt-4">
            <button className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
              Confirm
            </button>
          </div>
        </div>
      )}

      {activeTab === "language" && (
        <div>
          <div className="flex mb-6">
            <button
              className="flex-1 py-2 bg-sky-500 text-white rounded-l-full"
              onClick={() => setActiveTab("language")}
            >
              Motoka Language
            </button>
            <button
              className="flex-1 py-2 bg-white text-gray-700 border border-gray-200 rounded-r-full"
              onClick={() => setActiveTab("region")}
            >
              Region
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="ml-2">English</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-sky-500 bg-sky-500 flex items-center justify-center text-white">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="ml-2">Spanish</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="ml-2">Italian</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="ml-2">Deutsch</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="ml-2">France</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>
          </div>

          <div className="mt-6">
            <button
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors"
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
              className="flex-1 py-2 bg-white text-gray-700 border border-gray-200 rounded-l-full"
              onClick={() => setActiveTab("language")}
            >
              Motoka Language
            </button>
            <button className="flex-1 py-2 bg-sky-500 text-white rounded-r-full" onClick={() => setActiveTab("region")}>
              Region
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇳🇬</span>
                <span>Nigeria</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-sky-500 bg-sky-500 flex items-center justify-center text-white">
                <span className="text-xs">✓</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇦🇺</span>
                <span>Australia</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇧🇪</span>
                <span>Belgium</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇨🇦</span>
                <span>Canada</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇫🇷</span>
                <span>France</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🇩🇪</span>
                <span>Germany</span>
              </div>
              <div className="h-5 w-5 rounded-full border border-gray-300"></div>
            </div>
          </div>

          <div className="mt-6">
            <button
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors"
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
