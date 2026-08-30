import ServicePageTemplate from '../components/ServicePageTemplate'

export default function AboutPage() {
  return (
    <ServicePageTemplate
      seoTitle="About Motoka — Simplifying Vehicle Documents in Nigeria"
      seoDescription="Motoka exists to make renewing vehicle documents in Nigeria straightforward — online renewals, document storage, and reminders, without the office queue."
      eyebrow="About Motoka"
      h1="Renewing your vehicle documents shouldn't require a day off work"
      subcopy="Motoka was built around one problem: vehicle document renewal in Nigeria means real time lost to queues, uncertainty about whether an agent is legitimate, and no easy way to track when something's about to expire. We handle the renewal, verify it against the issuing agency, and keep it all in one place."
      benefits={[
        { title: 'Licensed, verified processing', description: 'Every renewal runs through our licensed agent network and is checked against the issuing agency\'s own records — not just a printout.' },
        { title: 'One wallet for every document', description: 'Vehicle license, road worthiness, insurance, and driver\'s license — tracked with reminders before any of them lapse.' },
        { title: 'Multi-state coverage', description: 'Motoka\'s agent network spans multiple states, so renewal is possible wherever your vehicle is registered, regardless of where you\'re based.' },
        { title: 'No hidden fees', description: 'Every renewal shows the government fee and Motoka\'s service fee separately, before you pay anything.' },
      ]}
      faqs={[
        {
          q: 'Is Motoka a government service?',
          a: 'No — Motoka is a private platform that processes renewals through a licensed agent network and verifies the result against the issuing government agency\'s records.',
        },
        {
          q: 'Which states does Motoka currently serve?',
          a: 'Coverage includes Lagos, Ogun, Oyo, Osun, Edo, and Rivers, with more states being added as the agent network grows.',
        },
        {
          q: 'Is Motoka related to any car dealership or "Motoka" social media account?',
          a: 'No — Motoka (motoka.ng) is a vehicle document renewal platform only. We\'re not affiliated with any car dealership or other business using a similar name.',
        },
      ]}
      ctaText="See how renewal works"
      ctaTo="/renew/vehicle-license"
    />
  )
}
