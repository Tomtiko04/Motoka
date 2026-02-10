import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/landing/c0bb38f1602a93204edb1493abb9006cc831b8e9.jpg";
function CtaSection() {
  const navigate = useNavigate();
  return (
    <div className="-mt-[0] bg-[#ffffff] px-6 sm:px-20">
      <div className="relative mb-20 h-[500px] overflow-hidden rounded-[20px] bg-cover bg-center sm:h-[544px]">
        <div
          className="absolute inset-0 h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        ></div>
        <div className="absolute inset-0 bg-[#2389E352]"></div>
        <div className="relative z-10 flex h-full flex-col justify-end gap-3 px-8 py-15 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pb-25 lg:px-20">
          <h2 className="text-[40px] leading-10 font-bold text-white sm:text-[56px] sm:leading-18">
            Join 10K+ Car Owners <br /> that drive assured.
          </h2>
          <button
            className="mt-4 rounded-[15px] bg-[#EBB850] px-8 py-4 text-lg font-[600] text-[#05243F] transition hover:bg-[#edb138]"
            onClick={() => navigate("/auth/signup")}
          >
            Signup Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default CtaSection;
