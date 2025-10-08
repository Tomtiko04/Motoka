import Image1 from "../../assets/images/landing/pngwing.com (2) 1 (1).png"
function Hero() {
    return ( 
        <div className="p-10 text-center">
            <div className="bg-[#2287E0] rounded-[20px] p-10 text-white flex flex-col items-center justify-center pt-32">
                <h1 className="text-[64px] font-bold max-w-4xl">Drive Assured: Effortless Car Ownership in Nigeria</h1>
                <p className="text-xl max-w-[634px] pt-8">The all-in-one platform for managing your vehicle and vehicle documents, simplifying renewals, and connecting you with trusted services.</p>
                <div>
                    <img src={Image1} alt="cars imge" />
                </div>
            </div>
        </div>
     );
}

export default Hero;