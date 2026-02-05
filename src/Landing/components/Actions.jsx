import Action1 from "../../assets/images/landing/Group 1171279843.png";
import Action2 from "../../assets/images/landing/Group 1171279844.png";
import Action3 from "../../assets/images/landing/Group 1171279845.png";
export default function Action(){
    return(
        <div className="bg-[#2389E3] mt-15 py-16 px-6">
            <h1 className="text-white text-5xl font-bold">What do you want to do now?</h1>

            <div className="grid gird-cols-1 sm:grid-cols-3 gap-3 py-12">

                <img src={Action2} alt="action 1" />
                <img src={Action3} alt="action 2" />
                <img src={Action1} alt="action 3" />
            </div>
             </div>
    )
}