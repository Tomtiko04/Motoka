import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import useV2Chrome from "./v2/useV2Chrome";
import Header from "./v2/Header";
import Hero from "./v2/Hero";
import Services from "./v2/Services";
import EverythingSection from "./v2/EverythingSection";
import WhyUs from "./v2/WhyUs";
import Mission from "./v2/Mission";
import FAQ from "./v2/FAQ";
import Waitlist from "./v2/Waitlist";
import Footer from "./v2/Footer";
import ChatWidget from "./v2/ChatWidget";
import { ORGANIZATION, WEBSITE } from "../utils/schema";

// Module scope so the identity is stable — Seo re-appends the script whenever
// this changes.
const JSON_LD = [ORGANIZATION, WEBSITE];

function LandingV2() {
  const location = useLocation();

  // Arriving from another page (Header's "Service" -> /#covers, "Home" ->
  // /#top) changes the pathname, and ScrollToTop smooth-scrolls to 0 on every
  // pathname change. Scrolling to the anchor immediately just races that, so
  // let it start first and land on the target after.
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.substring(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => clearTimeout(timer);
  }, [location]);

  useV2Chrome({ landing: true });

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Motoka — Renew Your Vehicle Licence & Documents Online in Nigeria"
        description="Renew your vehicle licence, insurance, roadworthiness and driver's licence online in Nigeria. Track expiry dates, get reminders before you're fined, and buy car parts at Ladipo — all from one app."
        path="/"
        jsonLd={JSON_LD}
      />
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
  );
}

export default LandingV2;
