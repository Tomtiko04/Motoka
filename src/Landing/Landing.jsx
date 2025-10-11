import Categories from "./components/Categories";
import CtaSection from "./components/Cta";
import FaqsSection from "./components/FAQs";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Mobile from "./components/Mobile";
import Testimonials from "./components/Testimonials";
import Whyus from "./components/Whyus";

function LandingPage() {
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