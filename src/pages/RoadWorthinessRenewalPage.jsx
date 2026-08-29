import ServicePageTemplate from '../components/ServicePageTemplate'

export default function RoadWorthinessRenewalPage() {
  return (
    <ServicePageTemplate
      seoTitle="Road Worthiness Certificate Renewal Online Nigeria | Motoka"
      seoDescription="Skip the VIO queue. Renew your road worthiness certificate online with Motoka and get a verified digital copy sent straight to your phone."
      eyebrow="Road Worthiness"
      h1="Road worthiness certificate renewal, without the VIO queue"
      subcopy="No more waking up early to beat the line at the VIO office. Submit your vehicle details online, and Motoka's network handles your inspection booking and certificate renewal end to end."
      steps={[
        { title: 'Submit vehicle details', description: 'Plate number, vehicle type, and current road worthiness status.' },
        { title: 'We book your inspection', description: 'Motoka schedules and coordinates the inspection slot on your behalf.' },
        { title: 'Get your certificate', description: 'A verified digital copy of your road worthiness certificate lands in your wallet.' },
      ]}
      benefits={[
        { title: 'No early-morning queue', description: 'Book and track your inspection from your phone instead of standing in line.' },
        { title: 'Booking handled for you', description: 'Motoka coordinates the inspection slot — you just show up.' },
        { title: 'Digital copy, always on hand', description: 'Your certificate is stored in your Motoka wallet for any checkpoint.' },
        { title: 'Renewal reminders', description: 'Get notified before your road worthiness certificate lapses.' },
      ]}
      faqs={[
        {
          q: 'Do I still need a physical inspection for road worthiness renewal?',
          a: 'Yes — road worthiness certification requires a vehicle inspection. Motoka books and coordinates that slot for you so you skip the queue.',
        },
        {
          q: 'How long is a road worthiness certificate valid for?',
          a: 'Validity depends on your vehicle category and state, but Motoka tracks your specific expiry date and reminds you before it lapses.',
        },
      ]}
    />
  )
}
