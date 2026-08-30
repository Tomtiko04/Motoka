import ServicePageTemplate from '../components/ServicePageTemplate'

export default function InsuranceRenewalPage() {
  return (
    <ServicePageTemplate
      seoTitle="Vehicle Insurance Renewal Online Nigeria | Motoka"
      seoDescription="Renew your third-party vehicle insurance online with Motoka. Stay covered and compliant, with reminders before your policy expires."
      eyebrow="Insurance Renewal"
      h1="Renew your vehicle insurance online, before it lapses"
      subcopy="Third-party insurance is required for every vehicle on Nigerian roads, and it's one of the easiest documents to forget since it doesn't come up at every checkpoint. Motoka tracks your policy and renews it online before it lapses."
      steps={[
        { title: 'Enter your vehicle details', description: 'Plate number and current policy details, if you have one on file.' },
        { title: 'Confirm your coverage', description: 'Review your policy terms before renewing.' },
        { title: 'Get your renewed policy', description: 'A verified digital copy of your certificate lands in your Motoka wallet.' },
      ]}
      benefits={[
        { title: 'Stay compliant', description: 'Third-party insurance is legally required — Motoka makes sure it doesn’t quietly lapse.' },
        { title: 'One less document to track manually', description: 'Insurance renewal reminders alongside your license and road worthiness.' },
        { title: 'No paperwork visit', description: 'Renew entirely online, no office or agent visit required.' },
        { title: 'Verified certificate', description: 'A digital copy stored in your wallet, ready to show if asked.' },
      ]}
      faqs={[
        {
          q: 'Is third-party insurance mandatory in Nigeria?',
          a: 'Yes — every vehicle on Nigerian roads is legally required to carry at least third-party insurance coverage.',
        },
        {
          q: 'What does third-party insurance cover?',
          a: 'It covers damage or injury you cause to someone else — it does not cover damage to your own vehicle.',
        },
      ]}
    />
  )
}
