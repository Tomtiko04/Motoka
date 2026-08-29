import ServicePageTemplate from '../components/ServicePageTemplate'

export default function DriversLicenseRenewalPage() {
  return (
    <ServicePageTemplate
      seoTitle="Driver's License Renewal in Nigeria Online | Motoka"
      seoDescription="Renew your Nigerian driver's license online with Motoka. Track your expiry date, get reminders, and avoid the FRSC office queue."
      eyebrow="Driver's License Renewal"
      h1="Renew your driver's license without the FRSC office queue"
      subcopy="Your driver's license is tied to you, not your vehicle — and it runs on its own expiry date. Motoka tracks it alongside your other documents and handles the renewal online, through the FRSC process."
      steps={[
        { title: 'Enter your license details', description: 'We pull your existing driver’s license record to confirm your details.' },
        { title: 'Confirm & pay', description: 'See the full fee breakdown before you approve anything.' },
        { title: 'Get your renewed license', description: 'A verified digital copy lands in your Motoka wallet.' },
      ]}
      benefits={[
        { title: 'No FRSC office visit', description: 'Submit your renewal from your phone instead of standing in line.' },
        { title: 'Tracked separately from your vehicle license', description: 'Two different expiry dates, two different reminders — nothing gets missed.' },
        { title: 'Deadline reminders', description: 'Motoka alerts you weeks ahead of your next expiry, not the day before.' },
        { title: 'One wallet for every document', description: 'Driver’s license, vehicle license, road worthiness — all in one place.' },
      ]}
      faqs={[
        {
          q: 'Is a driver’s license the same as a vehicle license?',
          a: 'No — your driver’s license is tied to you personally and stays valid across vehicles. Your vehicle license is tied to a specific car. They renew on separate schedules.',
        },
        {
          q: 'Can I renew an expired driver’s license through Motoka?',
          a: 'Yes. An expired driver’s license can still be renewed online — Motoka will flag if anything additional is required for your specific case.',
        },
      ]}
    />
  )
}
