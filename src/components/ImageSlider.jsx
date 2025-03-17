import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";

import Slider1 from "../assets/images/Slider-1.png";
import Slider2 from "../assets/images/Slider-2.png";
import Slider3 from "../assets/images/Slider-3.png";
import Slider4 from "../assets/images/Slider-4.png";

const ImageSlider = () => {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={true}
      spaceBetween={10}
      slidesPerView={1}
      className="mb-6 w-full max-w-md rounded-lg text-[#2389E3]"
    >
      <SwiperSlide>
        <div className="mb-4 hidden flex-col items-center justify-center p-12 text-center md:flex md:w-[100%]">
          <img
            src={Slider1}
            alt="Car Key"
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="gax-y-3 mt-[.5em] flex flex-col">
            <h2 className="mb-2 text-xl font-semibold text-[#05243F]">
              Take your key and drive anytime
            </h2>
            <p className="text-sm text-[#05243F]/40">
              We ensure your car papers are up to date, giving you the peace of
              mind to drive around.
            </p>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="mb-4 hidden flex-col items-center justify-center p-12 text-center md:flex md:w-[100%]">
          <img
            src={Slider2}
            alt="Car Key"
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="gax-y-3 mt-[.5em] flex flex-col">
            <h2 className="mb-2 text-xl font-semibold text-[#05243F]">
              Vetted Vehicle Documents
            </h2>
            <p className="text-sm text-[#05243F]/40">
              We have multi level verification process to make sure your
              documents information is correct and are original.
            </p>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="mb-4 hidden flex-col items-center justify-center p-12 text-center md:flex md:w-[100%]">
          <img
            src={Slider3}
            alt="Car Key"
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="gax-y-3 mt-[.5em] flex flex-col">
            <h2 className="mb-2 text-xl font-semibold text-[#05243F]">
              Supper Fast Turn Around Time
            </h2>
            <p className="text-sm text-[#05243F]/40">
              We Process your papers and within 24hrs your papers would be ready
              for pickup or delivery.
            </p>
          </div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="mb-4 hidden flex-col items-center justify-center p-12 text-center md:flex md:w-[100%]">
          <img
            src={Slider4}
            alt="Car Key"
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="gax-y-3 mt-[.5em] flex flex-col">
            <h2 className="mb-2 text-xl font-semibold text-[#05243F]">
              Reminder and Auto Renew
            </h2>
            <p className="text-sm text-[#05243F]/40">
              You will be notified at intervals on expired vehicle papers and
              you can also opt in for our auto renewal option
            </p>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default ImageSlider;
