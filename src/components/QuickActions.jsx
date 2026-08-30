import { ArrowUpRight } from 'lucide-react'
import changeOwnership from '../assets/photos/change-ownership-card.png'
import registerCar from '../assets/photos/register-car-card.png'
import paperwork from '../assets/photos/paperwork.jpg'

export default function QuickActions() {
  return (
    <section className="bg-[#f8fafc]">
      <div style={{ paddingLeft: 'clamp(24px, 7.9vw, 114px)', paddingRight: 'clamp(24px, 7.9vw, 114px)', paddingTop: 112, paddingBottom: 112 }}>
        <div style={{ maxWidth: 640 }}>
          <p style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.1em', color: '#2389e3', textTransform: 'uppercase', marginBottom: 12 }}>What you can do</p>
          <h2 className="text-[clamp(22.4px,2.8vw,35px)] lg:text-[clamp(32px,4vw,50px)]" style={{ fontWeight: 800, color: '#05243f', lineHeight: 1.15 }}>
            What do you want to do today?
          </h2>
        </div>

        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <a
            href="#waitlist"
            className="group block overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            style={{ borderRadius: 24 }}
          >
            <img src={changeOwnership} alt="Change vehicle ownership" className="w-full h-auto" />
          </a>

          <a
            href="#waitlist"
            className="group block overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
            style={{ borderRadius: 24 }}
          >
            <div style={{ padding: 32, paddingBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 24, color: '#2389e3', lineHeight: 1.3 }}>
                Track every
                <br />
                document
              </h3>
              <ArrowUpRight className="shrink-0 text-[#21b993] mt-1" style={{ width: 24, height: 24 }} strokeWidth={2.5} />
            </div>
            <img src={paperwork} alt="Vehicle documents organized in a folder" className="w-full object-cover" style={{ height: 224 }} />
          </a>

          <a
            href="#waitlist"
            className="group block overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
            style={{ borderRadius: 24 }}
          >
            <img src={registerCar} alt="Register your new car" className="w-full h-auto" />
          </a>
        </div>
      </div>
    </section>
  )
}
