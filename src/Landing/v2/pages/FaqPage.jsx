import ServicePageTemplate from '../ServicePageTemplate'

export default function FaqPage() {
  return (
    <ServicePageTemplate
      seoTitle="Frequently Asked Questions | Motoka"
      seoPath="/faq"
      seoDescription="Answers to common questions about renewing vehicle documents through Motoka — cost, timing, document storage, and how the process works."
      eyebrow="Help Center"
      h1="Frequently asked questions"
      subcopy="Everything you need to know about renewing and storing your vehicle documents through Motoka."
      faqs={[
        {
          q: 'How do I create an account on Motoka?',
          a: 'Join the waitlist with your email. When we launch, you\'ll get an invite to sign up with your name, email, phone number, and a password.',
        },
        {
          q: 'How will I renew my license through Motoka?',
          a: 'You\'ll enter your plate or license number, confirm your details, and pay for the renewal in the app. Our team handles the rest of the process on your behalf.',
        },
        {
          q: 'How do I know a document is genuine, not a fake sold by an agent?',
          a: 'Every renewal processed through Motoka is checked against the issuing agency\'s own records before it\'s marked complete in your wallet, so what you see in the app matches what\'s on file with the regulator — not just a printout from a roadside agent.',
        },
        {
          q: 'What does it cost, and are there hidden fees?',
          a: 'You\'ll see the full breakdown — the official government fee plus Motoka\'s service fee — before you pay anything. No surprise charges added after the fact.',
        },
        {
          q: 'My license or road worthiness certificate has already expired — can Motoka still help?',
          a: 'Yes. Expired documents usually just mean a higher renewal fee, not starting over. Enter your details and Motoka will show you exactly what\'s needed to get compliant again.',
        },
        {
          q: 'Can I store digital copies of my documents?',
          a: 'Yes — every license, insurance certificate, and road worthiness paper you renew is stored in an encrypted digital wallet you can access anytime, including at a checkpoint.',
        },
        {
          q: 'Will I get reminders before a document expires?',
          a: 'Yes, Motoka sends alerts ahead of every expiry date so you can renew before penalties or lapses in compliance.',
        },
        {
          q: 'Can I renew a document if I live in a different state from where my vehicle is registered?',
          a: 'Yes — renewal is tied to the state where your vehicle is registered, not your current location. Motoka\'s agent network handles the renewal through that state regardless of where you are.',
        },
        {
          q: 'What is the save-ahead wallet?',
          a: 'It lets you set aside money toward your next renewal gradually, instead of finding the full fee in one lump sum when it\'s due.',
        },
        {
          q: 'What is Mo?',
          a: 'Mo is Motoka\'s built-in AI assistant — ask it about renewal steps, document requirements, or costs, and get an instant answer.',
        },
      ]}
    />
  )
}
