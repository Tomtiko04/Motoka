import ServicePageTemplate from '../components/ServicePageTemplate'

export default function WalletPage() {
  return (
    <ServicePageTemplate
      seoTitle="Motoka Save-Ahead Wallet — Save for Renewals Gradually | Motoka"
      seoDescription="Set aside money toward your next vehicle document renewal gradually with Motoka's save-ahead wallet, instead of finding the full fee in one lump sum when it's due."
      eyebrow="Motoka Wallet"
      h1="Save toward your next renewal, a little at a time"
      subcopy="Most renewals don't lapse because someone forgot — they lapse because the full fee wasn't ready when it was due. Motoka's save-ahead wallet lets you set money aside gradually, so it's already there when your next renewal comes up."
      steps={[
        { title: 'See your next renewal date', description: 'Motoka tracks the expiry for every document you\'ve added to your wallet.' },
        { title: 'Set aside money ahead of time', description: 'Contribute smaller amounts in the lead-up to your renewal instead of the full fee at once.' },
        { title: 'Renew without the scramble', description: 'When the renewal is due, the funds are already set aside — no finding a lump sum on short notice.' },
      ]}
      benefits={[
        { title: 'Solves the real problem', description: 'A reminder tells you a deadline is coming — saving ahead helps you actually afford it.' },
        { title: 'All your documents, one wallet', description: 'License, road worthiness, insurance — track and save for all of them in one place.' },
        { title: 'No surprise lump sum', description: 'Spread the cost out instead of finding it all at once when the fee is due.' },
        { title: 'Encrypted and secure', description: 'Your documents and wallet balance are stored securely, accessible only to you.' },
      ]}
      faqs={[
        {
          q: 'How is the save-ahead wallet different from just getting a reminder?',
          a: 'A reminder only tells you a deadline is coming. The wallet helps you set money aside gradually so the fee is already available when the renewal is due.',
        },
        {
          q: 'Can I use the wallet for more than one document?',
          a: 'Yes — you can save ahead for your vehicle license, road worthiness certificate, insurance, and driver\'s license renewals, all tracked separately.',
        },
      ]}
      ctaText="Set up your wallet"
      ctaTo="/renew/vehicle-license"
    />
  )
}
