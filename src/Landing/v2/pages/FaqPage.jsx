import ServicePageTemplate from '../ServicePageTemplate'
import faqs from '../../../Data/faqs'

export default function FaqPage() {
  return (
    <ServicePageTemplate
      seoTitle="Frequently Asked Questions | Motoka"
      seoPath="/faq"
      seoDescription="Answers to common questions about renewing vehicle documents through Motoka — cost, timing, document storage, and how the process works."
      eyebrow="Help Center"
      h1="Frequently asked questions"
      subcopy="Everything you need to know about renewing and storing your vehicle documents through Motoka."
      faqs={faqs}
    />
  )
}
