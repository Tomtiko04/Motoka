import backgroundImage from "../../assets/images/landing/c0bb38f1602a93204edb1493abb9006cc831b8e9.jpg";
function CtaSection() {
  return (

    <div className="-mt-[0] px-6 sm:px-20 bg-linear-180 from-50% to-50%  from-[#FFF4DE] to-transparent">
    <div
      className="relative bg-cover bg-center h-fit sm:h-[544px] rounded-[20px] overflow-hidden mb-20"
    >
      <div
        className="absolute inset-0 h-full w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>
      <div className="absolute inset-0 bg-[#2389E352]"></div>
      <div  className="relative z-10 flex flex-col sm:flex-row h-full sm:items-end justify-end sm:justify-between py-15 pb-8 sm:pb-25 gap-3 px-8 sm:px-10 lg:px-20">
        <h2 className="text-[40px] sm:text-[56px] font-bold text-white leading-10 sm:leading-18">
          Join 10K+ Car Owners <br/> that drive assured.
        </h2>
        <button className="mt-4 text-lg rounded-[15px] bg-[#EBB850] px-8 py-4 text-[#05243F] transition hover:bg-[#edb138] font-[600]">
          Signup Now
        </button>
      </div>
    </div>
    </div>
  );
}

export default CtaSection;
