import ServicePageTemplate from '../components/ServicePageTemplate'

export default function LadipoPage() {
  return (
    <ServicePageTemplate
      seoTitle="Genuine Car Parts for Your Exact Vehicle | Motoka Ladipo"
      seoDescription="Browse spare parts, lubricants, and accessories matched to your car's make and model. No confusing options, no counterfeit risk — powered by Motoka."
      eyebrow="Ladipo Marketplace"
      h1="Genuine spare parts, matched to your exact vehicle"
      subcopy="Skip the guesswork of shopping for parts at Ladipo in person. Tell Motoka your car's make, model, and year, and we surface genuine parts and lubricants from vetted vendors — no counterfeit risk, no haggling."
      ctaText="Browse Parts"
      ctaTo="/#covers"
      steps={[
        { title: 'Tell us your vehicle', description: 'Make, model, and year — so every result actually fits your car.' },
        { title: 'Compare vetted vendors', description: 'See genuine parts side by side, with prices you can actually compare.' },
        { title: 'Order with confidence', description: 'Every vendor in the network is checked before they’re allowed to list.' },
      ]}
      benefits={[
        { title: 'Fitment-matched results', description: 'No more guessing whether a part actually fits your specific vehicle.' },
        { title: 'Vetted vendor network', description: 'Vendors can be removed for bad service — the list stays small on purpose.' },
        { title: 'Transparent pricing', description: 'Compare prices across vendors instead of haggling in person.' },
        { title: 'No counterfeit risk', description: 'Every listed part is genuine, not a lookalike sold as OEM.' },
      ]}
      faqs={[
        {
          q: 'Does Motoka guarantee the parts are genuine?',
          a: 'Yes — every vendor in the Ladipo marketplace is vetted before being listed, specifically to keep counterfeit parts out.',
        },
        {
          q: 'Can I find parts for any car make and model?',
          a: 'The marketplace matches results to your specific vehicle, so you only see parts that actually fit — coverage grows as more vendors join the network.',
        },
      ]}
    />
  )
}
