"use client";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import person1 from "../../assets/images/landing/Ellipse 58.png";
import person2 from "../../assets/images/landing/Ellipse 57.png";
import person3 from "../../assets/images/landing/Ellipse 59.png";
const testimonials = [
  {
    id: 1,
    name: "David Okoro",
    text: "DriveAssured made renewing my vehicle papers effortless. Highly recommend!",
    img: person1,
  },
  {
    id: 2,
    name: "Aisha Bello",
    text: "Renewing my car license used to take days of stress and paperwork. With Motoka, it’s all done online in minutes. Super convenient and reliable.",
    img: person2,
  },
  {
    id: 3,
    name: "Tunde Oladipo",
    text: "Best experience ever. Everything about my car is just one tap away.",
    img: person3,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div className="flex flex-col overflow-hidden bg-[#FFF4DE] px-10 py-20 mt-40" id="testimonials">
      <h2 className="mb-10 text-center text-[56px] font-bold text-[#05243F]">
        What Client Says
      </h2>
      <div className="mx-auto w-full max-w-7xl">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={40}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          centeredSlides={true}
          loop={true}
          speed={700}
          className="pb-12"
          initialSlide={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {testimonials.map((item, idx) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center justify-center text-center mb-12">
                <div className="aspect-square">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-100 h-100 rounded-full flex-shrink-0"
                />
                </div>
                {activeIndex === idx && (
                  <div className="mt-6 max-w-md">
                    <p className="mb-3 text-lg text-gray-700 italic">
                      “{item.text}”
                    </p>
                    <p className="font-semibold text-[#05203D]">
                      — {item.name}
                    </p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
