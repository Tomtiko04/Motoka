import Image1 from "../../assets/images/landing/pngwing.com (2) 1 (1).webp"
import Checkmark from "../../assets/images/landing/bitcoin-icons_verify-filled.png"
function Hero() {
    return ( 
        <div className="p-4 sm:p-10 sm:pt-2 text-center">
            <div style={{background: 'linear-gradient(179.91deg, #2287E0 58.76%, #134A7A 99.92%)'}} className=" rounded-[20px] p-6 sm:p-10 text-white flex flex-col items-center justify-center pt-15 sm:pt-32">
                <h1 className="text-[40px] sm:text-[64px] font-bold max-w-4xl text-left sm:text-center">Drive Assured: Effortless Car Ownership in Nigeria</h1>
                <p className="text-xl max-w-[634px] pt-4 sm:pt-8 text-left sm:text-center">The all-in-one platform for managing your vehicle and vehicle documents, simplifying renewals, and connecting you with trusted services.</p>
                <div className="hidden bg-white rounded-[10px]  text-black sm:flex items-center  mt-10 text-base  sm:text-xl font-semibold w-full max-w-[700px]">
                    {/* <input type="text" placeholder="hello world" /> */}
                    <input type="text" placeholder="Enter Plate Number to Renew License" className="relative z-10 bg-transparent py-2 px-2 placeholder:text-[#05243F66] w-full ps-4 sm:ps-10 h-full outline-none font-normal" name="plateNo"/>
                    <button className="bg-[#EBB850] py-3 px-5 sm:py-4 sm:px-6 rounded-[10px] text-nowrap">Renew Now</button>
                </div>
                <div className=" rounded-[10px] text-black flex flex-col sm:hidden items-center  mt-10 text-base  sm:text-xl font-semibold w-full max-w-[700px]">
                    {/* <input type="text" placeholder="hello world" /> */}
                    <input type="text" placeholder="Enter Plate Number to Renew License" className="rounded-[10px]  relative z-10 bg-white py-3 px-2 placeholder:text-[#05243F66] w-full ps-4 sm:ps-10 h-full outline-none font-normal mb-3" name="plateNo"/>
                    <button className="bg-[#EBB850] py-3 px-5 sm:py-4 sm:px-6 rounded-[10px] text-nowrap w-full">Renew Now</button>
                </div>
                {/* <input type="text" placeholder="hello world" /> */}
                {/* <input type="text" placeholder="enter text" /> */}
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