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
      loop
      spaceBetween={10}
      slidesPerView={1}
      className="mb-6 w-full max-w-md text-[#2389E3]"
    >
      {[Slider1, Slider2, Slider3, Slider4].map((image, index) => {
        const content = [
          {
            title: "Take your key and drive anytime",
            desc: "We ensure your car papers are up to date, giving you the peace of mind to drive around.",
          },
          {
            title: "Vetted Vehicle Documents",
            desc: "We have multi level verification process to make sure your documents information is correct and are original.",
          },
          {
            title: "Super Fast Turn Around Time",
            desc: "We process your papers and within 24hrs your papers would be ready for pickup or delivery.",
          },
          {
            title: "Reminder and Auto Renew",
            desc: "You will be notified at intervals on expired vehicle papers and you can also opt in for our auto renewal option.",
          },
        ];

        return (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <img
                src={image}
                alt="Slider"
                className="h-64 w-full rounded-lg object-cover"
              />
              <div className="mt-4 flex flex-col gap-y-2">
                <h2 className="text-lg font-semibold text-[#05243F]">
                  {content[index].title}
                </h2>
                <p className="text-sm text-[#05243F]/60">
                  {content[index].desc}
                </p>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};


export default ImageSlider;
