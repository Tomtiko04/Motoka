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
// import { Pagination } from 'swiper/modules';
import '../testimonials.css'
const testimonials = [
  {
    id: 1,
    name: "David Okoro",
    text: "DriveAssured made renewing my vehicle papers effortless. Highly recommend!",
    img: person2,
    text: "DriveAssured made renewing my vehicle papers effortless. The process was quick and easy, and I highly recommend it to anyone looking for convenience.",
    img: person2,
  },
  {
    id: 2,
    name: "Aisha Bello",
    text: "Renewing my car license used to take days of stress and paperwork. With Motoka, it’s all done online in minutes. Super convenient and reliable.",
    img: person1,
    text: "Renewing my car license used to take days of stress and paperwork. With Motoka, it’s all done online in minutes. Super convenient and reliable for busy people.",
    img: person1,
  },
  {
    id: 3,
    name: "Tunde Oladipo",
    text: "Best experience ever. Everything about my car is just one tap away. Motoka makes managing vehicle documents simple and hassle-free.",
    img: person3,
  },
  {
    id: 4,
    name: "David Okoro",
    text: "DriveAssured made renewing my vehicle papers effortless. The process was quick and easy, and I highly recommend it to anyone looking for convenience.",
    img: person2,
  },
  {
    id: 5,
    name: "Aisha Bello",
    text: "Renewing my car license used to take days of stress and paperwork. With Motoka, it’s all done online in minutes. Super convenient and reliable for busy people.",
    img: person1,
  },
  {
    id: 6,
    name: "Tunde Oladipo",
    text: "Best experience ever. Everything about my car is just one tap away. Motoka makes managing vehicle documents simple and hassle-free.",
    img: person3,
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div className="flex flex-col overflow-hidden bg-[#FFF4DE] py-20 mt-40" id="testimonials">
      <h2 className="mb-20 text-center sm:text-left px-[38px] text-[40px] sm:text-[56px] font-bold text-[#05243F]">
        What Client Says
      </h2>
      <div className="">
        {/* <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={40}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          centeredSlides={true}
          loop={true}
          speed={700}
          className="pb-12"
          initialSlide={1}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        > */}
         <Swiper
        slidesPerView={1}
        spaceBetween={30}
        centeredSlides={true}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
        initialSlide={1}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          // Breakpoints for responsive behavior
        breakpoints={{
            // When window width is >= 640px
            640: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            // When window width is >= 768px
            768: {
                slidesPerView: 2,
                spaceBetween: 30,
            },
            // When window width is >= 1024px
            1024: {
                slidesPerView: 2,
                spaceBetween: 40,
            }
        }}
      >
          {testimonials.map((item, idx) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center justify-center text-center mb-12 w-[500px]" >
                <div className="aspect-square flex items-center justify-center w-80 h-80 mb-5">
                <img
                  src={item.img}
                  alt={item.name}
                  className={`w-50 h-50 rounded-full flex-shrink-0 ${activeIndex === idx ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
                />
                </div>
                {activeIndex === idx && (
                  <div className="mt-6 max-w-full">
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

         {/* <Swiper
        slidesPerView={'auto'}
        centeredSlides={true}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        <SwiperSlide>Slide 1</SwiperSlide>
        <SwiperSlide>Slide 2</SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
        <SwiperSlide>Slide 4</SwiperSlide>
        <SwiperSlide>Slide 5</SwiperSlide>
        <SwiperSlide>Slide 6</SwiperSlide>
        <SwiperSlide>Slide 7</SwiperSlide>
        <SwiperSlide>Slide 8</SwiperSlide>
        <SwiperSlide>Slide 9</SwiperSlide>
        </Swiper> */}
      </div>
    </div>
  );
}
