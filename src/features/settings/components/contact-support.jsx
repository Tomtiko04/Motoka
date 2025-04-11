"use client"

import { ChevronLeft, Mail, Phone } from "lucide-react"

export default function ContactSupport({ onNavigate }) {
  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Contact Support</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" defaultValue="Salisu Anjola" className="w-full p-3 border border-gray-200 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            defaultValue="salisuanjola@gmail.com"
            className="w-full p-3 border border-gray-200 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about the problem</label>
          <textarea
            placeholder="Describe the issue..."
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-md resize-none"
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
  )
}
