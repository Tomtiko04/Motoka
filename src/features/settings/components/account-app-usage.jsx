"use client"

import { ChevronLeft, ChevronDown } from "lucide-react"
import { useState } from "react"

export default function FAQs({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState("account") // account, licensing, autocare
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const toggleQuestion = (id) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const accountFaqs = [
    {
      id: "create-account",
      question: "How do I create an account on Motoka?",
      answer:
        'Download the Motoka app or visit our website, click "Sign Up," and follow the on-screen instructions. You\'ll need to provide your name, email, phone number, and create a password.',
    },
    {
      id: "update-profile",
      question: "How do I update my profile information?",
      answer:
        'Log in to your Motoka account, go to "Profile," select "Edit Profile," make your changes, and then save.',
    },
    {
      id: "change-password",
      question: "How do I change my password?",
      answer:
        'Log in to your Motoka account, go to your profile settings, select "Change Password," enter your current and new passwords, and save.',
    },
    {
      id: "info-secure",
      question: "Is my personal information secure on Motoka?",
      answer:
        "Absolutely. We take data security very seriously and use industry-standard security measures to protect your information.",
    },
    {
      id: "contact-support",
      question: "How do I contact Motoka customer support?",
      answer:
        "You can contact our support team via email at support@motoka.com, by phone at +1-800-MOTOKA, or through the in-app support feature.",
    },
  ]

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">FAQs / Account & App Usage</h2>
      </div>

      <div className="space-y-4">
        {accountFaqs.map((faq) => (
          <div key={faq.id} className="border border-gray-100 rounded-lg overflow-hidden">
            <div
              className="flex justify-between items-center rounded-[12px] bg-[#F4F5FC] shadow-xs px-4 py-3 cursor-pointer my-2"
              onClick={() => toggleQuestion(faq.id)}
            >
              <span className="text-sm font-semibold text-[#05243F]/95">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-gray-400 transition-transform ${
                  expandedQuestions[faq.id] ? "transform rotate-180" : ""
                }`}
              />
            </div>
            {expandedQuestions[faq.id] && (
              <div className="px-4 pb-4 text-gray-600">
                <p className="text-sm font-semibold-600 text-[#05243FA1]/95">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
