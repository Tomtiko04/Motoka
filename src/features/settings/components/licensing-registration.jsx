"use client"

import { ChevronLeft, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function FAQs({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState("licensing") // account, licensing, autocare
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const licensingFaqs = [
    {
      id: "license-types",
      question: "What types of licenses can I manage through Motoka?",
      answer:
        "Motoka supports management for both private and commercial vehicle licenses, as well as driver's licenses, including renewals and applications.",
    },
    {
      id: "renew-license",
      question: "How do I renew my driver's/vehicle license using Motoka?",
      answer:
        "You can update your license and registration details by logging into your Motoka account, going to the 'My Vehicles' section, selecting the relevant vehicle, and editing the license/registration information.",
    },
    {
      id: "upload-documents",
      question: "Can I upload digital copies of my license documents?",
      answer:
        "Uploading digital copies of your license documents to Motoka provides a convenient way to keep them organized and accessible. This eliminates the need for physical copies and ensures you always have your documents on hand.",
    },
    {
      id: "check-status",
      question: "How do I check the status of my license renewal applications?",
      answer:
        "Motoka will proactively send you push notifications to your mobile device whenever there's an update to your application status. This means you don't always have to manually check. However, you can also view the current status at any time by logging into your account and going to 'License Renewals'.",
    },
    {
      id: "lost-license",
      question: "What do I do if I lose my physical license?",
      answer:
        "If you lose your physical license, report the loss to the police, obtain a police report, and then apply for a duplicate license through Motoka. For specific requirements, please contact our support team at [support email or phone number].",
    },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">FAQs/Licensing & Registration</h2>
      </div>

      <div className="space-y-4">
        {licensingFaqs.map((faq) => (
          <div key={faq.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleQuestion(faq.id)}
            >
              <h3 className="font-medium">{faq.question}</h3>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedQuestions[faq.id] ? "transform rotate-180" : ""
                }`}
              />
            </div>
            {expandedQuestions[faq.id] && (
              <div className="px-4 pb-4 text-gray-600">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
