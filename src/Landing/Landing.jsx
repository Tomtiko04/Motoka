import { useLocation } from "react-router-dom";
import Categories from "./components/Categories";
import CtaSection from "./components/Cta";
import FaqsSection from "./components/FAQs";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Mobile from "./components/Mobile";
import Testimonials from "./components/Testimonials";
import Whyus from "./components/Whyus";
import { useEffect, useState } from "react";

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;
  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 rounded-full bg-[#2388E1] text-white px-4 py-3 shadow-lg hover:bg-[#126cbb] transition"
      aria-label="Scroll to top"
    >
      ↑
    </button>
  );
}

function LandingPage() {
    const location = useLocation();
    useEffect(()=> {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({behavior:'smooth'})
            }
        }
    },[location])
    return ( 
        <div className="bg-white">
            <Header/>
            <Hero/>
            <Categories/>
            <Whyus/>
            <Testimonials/>
            <CtaSection/>
            <FaqsSection/>
            <Mobile/>
            <Footer/>
            <ScrollToTopButton />
        </div>
     );
}

export default LandingPage;