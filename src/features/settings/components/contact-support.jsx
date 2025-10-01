"use client"

import { ChevronLeft, Mail, Phone } from "lucide-react"

export default function ContactSupport({ onNavigate }) {
  return (
    <div className="flex flex-col justify-between h-full">

      <div>
        <div className="flex items-center mb-6">
          <button onClick={() => onNavigate("main")} className="mr-2">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-medium">Contact Support</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Full Name</label>
            <input type="text" defaultValue="Salisu Anjola" className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Email</label>
            <input
              type="email"
              defaultValue="salisuanjola@gmail.com"
              className="block w-full rounded-lg bg-[#FFF] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#05243F]">Tell us about the problem</label>
            <textarea
              placeholder="Describe the issue..."
              rows={4}
              className="text-md text-[#05243F] block bg-white rounded-lg w-full px-4 py-3 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200 resize-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-white border border-sky-500 text-sky-500 py-3 px-4 rounded-md transition-colors">
              <Mail className="h-5 w-5" />
            </button>
            <button className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-md transition-colors">
              <Phone className="h-5 w-5" />
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 mt-6">
            <h3 className="font-medium text-gray-700 mb-2">Need Help? Contact Motoka Support</h3>
            <p>
              For any inquiries regarding licenses, autocare services, or app functionality, please reach out to us. We're
              committed to providing you with prompt and helpful assistance.
            </p>
          </div>
        </div>
      </div>
      <div className="pb-5 md:mt-8">
        <button className="w-full rounded-3xl bg-[#2389E3] px-4 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95">
          Submit
        </button>
      </div>
    </div>
  )
}
