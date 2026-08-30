import { useParams, Navigate } from 'react-router-dom'
import ServicePageTemplate from '../components/ServicePageTemplate'
import { getStateBySlug } from '../data/states'

export default function StatePage() {
  const { slug } = useParams()
  const state = getStateBySlug(slug)

  if (!state) return <Navigate to="/" replace />

  return (
    <ServicePageTemplate
      seoTitle={`Renew Your Vehicle License in ${state.name} Online | Motoka`}
      seoDescription={`Vehicle owners in ${state.name} can renew their license, road worthiness certificate, and permits online through Motoka — no need to visit a government office.`}
      eyebrow={state.name}
      h1={`Vehicle license renewal in ${state.name}, handled online`}
      subcopy={state.intro}
      steps={[
        { title: 'Enter your plate number', description: `We pull your existing vehicle and license details for your ${state.name}-registered vehicle.` },
        { title: 'Confirm & pay', description: 'See the government fee plus service fee before approving anything.' },
        { title: 'Documents processed locally', description: `Handled through our licensed agent network within ${state.name}.` },
      ]}
      benefits={[
        { title: 'No office visit', description: `Renew from anywhere in ${state.name} — ${state.cities}.` },
        { title: 'Local processing', description: `Your renewal is handled through Motoka's licensed network within the state.` },
        { title: 'All your documents in one place', description: 'License, road worthiness, and permits, tracked with reminders before they expire.' },
      ]}
      faqs={[
        {
          q: `Can I renew my vehicle papers if I live outside a major city in ${state.name}?`,
          a: `Yes. Motoka processes ${state.name} vehicle license and road worthiness renewals for owners anywhere in the state — ${state.cities}.`,
        },
        {
          q: `Does Motoka cover other ${state.name} vehicle permits?`,
          a: `Alongside license and road worthiness renewal, Motoka tracks other statutory documents like proof of ownership and third-party insurance for vehicles registered in ${state.name}.`,
        },
      ]}
      ctaTo="/renew/vehicle-license"
    />
  )
}
