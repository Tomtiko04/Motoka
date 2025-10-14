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
import { useEffect } from "react";


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
        </div>
     );
}

export default LandingPage;