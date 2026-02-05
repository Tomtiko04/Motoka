import phone from "../../assets/images/landing/Artboard.png";
import Download from "../../assets/images/landing/Group 1171279833.svg"
function Mobile() {
  return (
    <div className="relative  mt-10 grid grid-cols-1 place-items-center gap-10 sm:gap-0 bg-gradient-to-b from-[#DAECFC] to-[#ffffff] p-20 px-0 sm:px-20 sm:pe-0 pb-0 lg:grid-cols-2 min-h-screen items-end">
      <div className="relatize z-10 flex h-full flex-col justify-between text-[56px] text-[#2389E3] px-10 sm:px-0">
        <div>
          {" "}
          <h3 className="text-[40px] sm:text-[48px] font-bold text-[#2389E3]">
            Our Mobile Experience
          </h3>
          <p className="py-5 pb-10 sm:py-10 text-lg font-normal text-[#05243F]">
            Built for today’s driver — fast, intuitive, and deeply human.
Motoka brings everything together: vehicle licensing, maintenance tracking, traffic education, and smart reminders — making car management effortless and rewarding, every step of the way.
          </p>
        </div>

        <div className=" pb-10 sm:pb-20 ">
          <h3 className="text-2xl sm:text-[32px] font-normal text-[#05243F]">
            Coming soon on
          </h3>
          <div className="w-[350px] mt-6">
            <img src={Download} alt="playstore & apple stores" className="" />
          </div>
        </div>
      </div>
      <div className="lg:absolute pt-10 sm:pt-20 h-full right-0 block shrink-0">
        <img src={phone} alt="phone mockup" className="block  h-full"/>
      </div>
    </div>
  );
}

export default Mobile;
