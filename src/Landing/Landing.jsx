import Categories from "./components/Categories";
import Header from "./components/Header";
import Hero from "./components/Hero";
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
        </div>
     );
}

export default LandingPage;