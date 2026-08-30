import ServicePageTemplate from '../components/ServicePageTemplate'

export default function VehicleLicenseRenewalPage() {
  return (
    <ServicePageTemplate
      seoTitle="Vehicle License Renewal Online — Fast, Verified | Motoka"
      seoDescription="Renew your Nigerian vehicle license online in minutes. Motoka processes it through our licensed agent network across 17 states — get your renewed license in 24-48 hours."
      eyebrow="License Renewal"
      h1="Renew your vehicle license online, without the office visit"
      subcopy="Skip the queue at the licensing office. Enter your plate number, confirm your details in the app, and Motoka's licensed agent network handles the rest — most renewals are completed in 24–48 hours."
      steps={[
        {
          title: 'Enter your plate number',
          description: 'We pull your existing vehicle license details so you don’t have to re-type everything.',
        },
        {
          title: 'Confirm & pay',
          description: 'See the full breakdown — government fee plus service fee — before you approve anything.',
        },
        {
          title: 'Get your renewed license',
          description: 'A verified digital copy lands in your Motoka wallet, ready to show at any checkpoint.',
        },
      ]}
      benefits={[
        { title: 'No office visits', description: 'The entire renewal happens from your phone — no queue, no touts.' },
        { title: 'Verified against real records', description: 'Every renewal is checked against the issuing agency, not just a printout.' },
        { title: 'Deadline reminders', description: 'Motoka alerts you weeks ahead of your next expiry, not the day before.' },
        { title: 'MVAA-certified', description: 'Processed through a licensed, certified agent network — not a roadside middleman.' },
      ]}
      faqs={[
        {
          q: 'How long does vehicle license renewal take through Motoka?',
          a: 'Most renewals are completed within 24–48 hours of submitting your details and payment, depending on your state licensing office.',
        },
        {
          q: 'What documents do I need to renew my vehicle license?',
          a: 'Just your plate number and current license details to start — Motoka will tell you if anything else is required for your specific case.',
        },
        {
          q: 'Can I renew an already-expired vehicle license?',
          a: 'Yes. An expired license usually means a slightly higher fee, not starting the process over — Motoka handles that automatically.',
        },
      ]}
    />
  )
}
