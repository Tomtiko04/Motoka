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

  const licensingFaqs = [
    {
      id: "license-types",
      question: "What types of licenses can I manage through Motoka",
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
        "Motoka will proactively send you push notifications to your mobile device whenever there's an update to your application status. This means you don't always have to manually check. However, you can also view the current status at any time by logging into your account and going to 'License Renewals.",
    },
    {
      id: "lost-license",
      question: "What do I do if i lose my physical license",
      answer:
        "If you lose your physical license, report the loss to the police, obtain a police report, and then apply for a duplicate license through Motoka. For specific requirements, please contact our support team at [support email or phone number].",
    },
  ]

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

  const getFaqsForCategory = () => {
    switch (activeCategory) {
      case "account":
        return accountFaqs
      case "licensing":
        return licensingFaqs
      case "autocare":
        return autocareFaqs
      default:
        return accountFaqs
    }
  }

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case "account":
        return "Account & App Usage"
      case "licensing":
        return "Licensing & Registration"
      case "autocare":
        return "Auto Care & Maintenance"
      default:
        return "Account & App Usage"
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => onNavigate("main")} className="mr-2">
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-medium">FAQs / {getCategoryTitle()}</h2>
      </div>

      <div className="space-y-4">
        {getFaqsForCategory().map((faq) => (
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