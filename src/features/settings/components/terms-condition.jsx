"use client"

import { ChevronLeft } from "lucide-react"
import { useState } from "react"

export default function TermsCondition({ onNavigate }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">Terms & Condition</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-medium">Acceptance of Terms</h3>
          <p className="text-sm text-gray-600">
            By accessing or using the Motoka application (the "App") and its services, you ("User" or "you") agree to be
            bound by these Terms & Conditions ("Terms"). If you do not agree with any part of these Terms, you must not
            use the App
          </p>

          <h3 className="font-medium">Description of Services</h3>
          <p className="text-sm text-gray-600">
            Motoka provides a platform for managing vehicle licenses, scheduling autocare services, and related services
            ("Services"). The Services may include, but are not limited to, license renewal, service booking, payment
            processing, and communication with service providers.
          </p>

          <h3 className="font-medium">License and Registration Services</h3>
          <p className="text-sm text-gray-600">
            Motoka facilitates license renewal and related services. You are responsible for ensuring the accuracy of
            the information provided.
          </p>

          <h3 className="font-medium">User Conduct</h3>
          <p className="text-sm text-gray-600">
            You must not engage in any activity that could harm, disrupt, or interfere with the App or Services.
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="h-4 w-4 text-sky-500 focus:ring-sky-400 border-gray-300 rounded"
          />
          <label htmlFor="agree" className="ml-2 block text-sm text-gray-700">
            I agree with the above Terms and Conditions
          </label>
        </div>

        <button
          className={`w-full py-3 px-4 rounded-md transition-colors ${
            agreed ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!agreed}
        >
          Agree to Terms & Conditions
        </button>
      </div>
    </div>
  )
}
