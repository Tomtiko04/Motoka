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
import '../testimonials.css'
const testimonials = [
  {
    id: 1,
    name: "David Okoro",
    img: person2,
    text: "DriveAssured made renewing my vehicle papers effortless. The process was quick and easy, and I highly recommend it to anyone looking for convenience."
  },
  {
    id: 2,
    name: "Aisha Bello",
    img: person1,
    text: "Renewing my car license used to take days of stress and paperwork. With Motoka, it’s all done online in minutes. Super convenient and reliable for busy people.",
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
    <div className="flex flex-col overflow-hidden bg-gradient-to-b from-[#FFF4DE] to-[#FFFFFF] py-20 " id="testimonials">
      <h2 className="mb-20 text-center px-[38px] text-[36px] sm:text-[48px] font-bold text-[#05243F]">
        What Client says
      </h2>
      <div className="">
         <Swiper
        slidesPerView={1}
        spaceBetween={20}
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
                slidesPerView: 4,
                spaceBetween: 30,
            },
            // When window width is >= 1024px
            1024: {
                slidesPerView: 4,
                spaceBetween: 40,
            }
        }}
      >
          {testimonials.map((item, idx) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center justify-center text-center mb-0 w-[400px]" >
                <div className="aspect-square flex items-center justify-center w-70 h-70 mb-5">
                <img
                  src={item.img}
                  alt={item.name}
                  className={`w-30 h-30 rounded-full flex-shrink-0 ${activeIndex === idx ? 'opacity-100' : 'opacity-30 scale-85'} transition-opacity duration-300`}
                />
                </div>
                {activeIndex === idx && (
                  <div className="mt-6 relative h-[200px] sm:h-[185px] flex flex-col items-center w-full">
                    <div className=" absolute w-full sm:w-lg">
                    <p className="mb-6 text-lg text-gray-700 px-2">
                      {item.text}
                    </p>
                    <p className="font-normal text-[#05203DB2] text-sm ">
                       {item.name}
                    </p>
                    </div>
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
