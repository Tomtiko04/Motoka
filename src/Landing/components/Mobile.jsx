import phone from "../../assets/images/landing/Artboard.png";
import Apple from "../../assets/images/landing/ic_sharp-apple.svg";
import AppleName from "../../assets/images/landing/App Store.svg";
import Playstore from "../../assets/images/landing/Group 1171279821.svg";
function Mobile() {
  return (
    <div className="relative  mt-10 grid grid-cols-1 place-items-center gap-10 sm:gap-0 bg-[#DAECFC] p-20 px-0 sm:px-20 sm:pe-0 pb-0 lg:grid-cols-2 min-h-screen items-end">
      <div className="relatize z-10 flex h-full flex-col justify-between text-[56px] text-[#2389E3] px-10 sm:px-0">
        <div>
          {" "}
          <h3 className="text-[40px] sm:text-[56px] font-bold text-[#2389E3]">
            Our Mobile Experience
          </h3>
          <p className="py-5 pb-10 sm:py-10 text-lg font-medium text-[#05243F]">
            <b>Vehicle maintenance</b> involves the regular servicing and
            inspection of your car to ensure it remains safe, reliable, and
            efficient. It includes checking vital components, changing fluids,
            and addressing mechanical issues to keep your vehicle in top
            condition and compliant with safety standards
          </p>
        </div>

        <div className="pb-20">
          <h3 className="text-2xl sm:text-[36px] font-medium text-[#05243F]">
            Coming soon on
          </h3>
          <div className="mt-6 grid h-[80px] sm:h-[104px] sm:w-[419px] items-center justify-evenly gap-6 rounded-[15px] bg-[#2389E3] px-6 grid-cols-2">
            <div className="flex h-[55px] items-center w-full flex-shrink-0 border-0 border-[#00000040] justify-start text-left ">
              <img src={Apple} alt="appleLogo" className="h-[55px] w-[55px]" />
              <img src={AppleName} alt="apple" className="h-[16px] mt-2 w-fit" />
            </div>
            <img src={Playstore} className="h-[55px] w-fit" alt="playstore" />
          </div>
        </div>
      </div>
      <div className="lg:absolute pt-20 h-full right-0 block shrink-0">
        <img src={phone} alt="phone mockup" className="block  h-full"/>
      </div>
    </div>
  );
}

export default Mobile;
