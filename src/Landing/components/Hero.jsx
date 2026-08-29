import Image1 from "../../assets/images/landing/pngwing.com (2) 1 (1).webp"
import Checkmark from "../../assets/images/landing/bitcoin-icons_verify-filled.png"
import PlateRenewCta from "../../components/PlateRenewCta"

function Hero() {
    return ( 
        <div className="p-4 sm:p-10 sm:pt-2 text-center">
            <div style={{background: 'linear-gradient(179.91deg, #2287E0 58.76%, #134A7A 99.92%)'}} className=" rounded-[20px] p-6 sm:p-10 text-white flex flex-col items-center justify-center pt-15 sm:pt-32">
                <h1 className="text-[40px] sm:text-[64px] font-bold max-w-4xl text-left sm:text-center">Drive Assured: Effortless Car Ownership in Nigeria</h1>
                <p className="text-xl max-w-[634px] pt-4 sm:pt-8 text-left sm:text-center">The all-in-one platform for managing your vehicle and vehicle documents, simplifying renewals, and connecting you with trusted services.</p>
                <PlateRenewCta variant="hero" />
                
                <div className="sm:-mt-15 max-w-[1202px] w-full">
                    <img src={Image1} alt="cars imge" />
                </div>
                <div
                  className="relative text-[21px] mt-10"
                >
                  <p className="bg-[#FFFFFF2B] rounded-full py-3 px-12 sm:px-8 flex flex-col sm:block ">Trusted by <b>10k+ Car Owners</b></p>
                  <span className="absolute -top-6 -right-2 ">
                    <img
                    src={Checkmark}
                    alt="Checkmark icon"
                    className="cursor-pointer text-[#05243F]/60 hover:text-[#05243F] h-[47px] w-[47px]"
                  />
                  </span>
                </div>
            </div>
        </div>
     );
}

export default Hero;
