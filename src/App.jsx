import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import EverythingSection from './components/EverythingSection'
import WhyUs from './components/WhyUs'
import Mission from './components/Mission'
import FAQ from './components/FAQ'
import Waitlist from './components/Waitlist'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'

function App() {
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

export default App
