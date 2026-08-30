import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import EverythingSection from '../components/EverythingSection'
import WhyUs from '../components/WhyUs'
import Mission from '../components/Mission'
import FAQ from '../components/FAQ'
import Waitlist from '../components/Waitlist'
import Footer from '../components/Footer'
import ChatWidget from '../components/ChatWidget'
import useSeoHead from '../hooks/useSeoHead'

export default function HomePage() {
  useSeoHead(
    'Motoka — Renew Your Vehicle License Online in Nigeria | MVAA Licensed',
    'Renew your vehicle license, road worthiness, and insurance online — no queues, no office visits. Motoka tracks your renewal dates and handles the rest. MVAA-certified.'
  )

  // Hash links (a service page's "Renew Now" button, or a footer link like
  // "/#everything") land here via client-side nav, so the browser's native
  // hash-scroll never fires — this does it manually. Keyed on location, not
  // just mount, so it also fires for a hash link clicked while already on
  // "/" (same route, no remount, so a mount-only effect would miss it).
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const el = document.querySelector(location.hash)
    el?.scrollIntoView({ behavior: 'instant' })
  }, [location.pathname, location.hash])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <EverythingSection />
        <WhyUs />
        <Mission />
        <FAQ />
        <Waitlist />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
