"use client"

import { ChevronLeft, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function FAQs({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState("autocare") // account, licensing, autocare
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const autocareFaqs = [
    {
      id: "schedule-service",
      question: "How can I schedule an auto care service through Motoka?",
      answer:
        'To schedule a service, log in to Motoka, select "Auto Care," choose your vehicle and service, pick a date and time, and confirm your booking.',
    },
    {
      id: "service-types",
      question: "What types of auto care services are available on Motoka?",
      answer:
        "Motoka offers a wide range of auto care services to keep your vehicle in top condition, including: Battery services, Tire services, Road side assistance and other car spare parts",
    },
    {
      id: "track-history",
      question: "How do I track the service history of my vehicle",
      answer:
        'Log in to your Motoka account, go to "My Vehicles" or "Service History," select your vehicle, and view the service history.',
    },
    {
      id: "rate-provider",
      question: "How do I rate and review an auto care service provider?",
      answer:
        'Log in to Motoka, go to "Service History," select the service, rate it, write a review (optional), and submit.',
    },
    {
      id: "set-reminders",
      question: "Can I set reminders for upcoming maintenance tasks?",
      answer:
        "Yes! Motoka helps you stay on top of your vehicle's maintenance with our convenient reminder feature. Proactive maintenance ensures your vehicle stays in optimal condition, saving you time and money in the long run.",
    },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">FAQs / Auto Care & Maintenance</h2>
      </div>

      <div className="space-y-4">
        {autocareFaqs.map((faq) => (
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
