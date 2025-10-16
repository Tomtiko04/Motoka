import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import category1 from "../../assets/images/landing/Group 1171279801.svg";
import category3 from "../../assets/images/landing/Group 1171279802 (1).svg";
import category4 from "../../assets/images/landing/Group 1171279802 (2).svg";
import category5 from "../../assets/images/landing/Group 1171279802 (3).svg";
import category6 from "../../assets/images/landing/Group 1171279802 (4).svg";
import category2 from "../../assets/images/landing/Group 1171279802.svg";
import { Icon } from "@iconify/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { useNavigate } from "react-router-dom";
// import { Autoplay, Navigation, Pagination, Scrollbar } from "swiper";
function Categories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const sliderRef = useRef(null);
  const navigate=useNavigate()
  const CategoryData = [
    {
      id: 1,
      title: "License Auto Renewal",
      description:
        "Through Motoka, users can easily renew their licenses online, ensuring continued compliance with safety, tax, and regulatory requirements without the hassle of manual processing",
      image: category1,
      iconName: "mdi:auto-fix",
      bgColor: "#39F3A9",
    },
    {
      id: 2,
      title: "License Auto Reminder",
      description:
        "Motoka automatically tracks expiration dates and sends timely notifications, ensuring you renew your license on time and avoid penalties or lapses in legal compliance.",
      image: category2,
      iconName: "icon-park-solid:alarm-clock",
      bgColor: "#FFCC63",
    },
    {
      id: 3,
      title: "Vehicle Maintenance",
      description:
        "Motoka includes checking vital components, changing fluids, and addressing mechanical issues to keep your vehicle in top condition and compliant with safety standards",
      image: category3,
      iconName: "ix:maintenance-filled",
      bgColor: "#E2E2E2",
    },
    {
      id: 4,
      title: "Ladipo Car parts Market",
      description:
        "Through Motoka, users can conveniently explore verified vendors, compare options, and purchase quality parts that meet safety and performance standards.",
      image: category4,
      iconName: "mynaui:cart-solid",
      bgColor: "#2287E0",
    },
    {
      id: 5,
      title: "Mo' Motoka Bot",
      description:
        "Your smart assistant for everything Motoka. From renewing licenses to scheduling maintenance, Mo’ Motoka Bot makes it easy to handle your car tasks anytime, anywhere",
      image: category5,
      iconName: "mynaui:sparkles-solid",
      bgColor: "#FFCC63",
    },
    {
      id: 6,
      title: "Traffic Education",
      description:
        "With Motoka, you’ll gain an understanding of traffic signs, road markings, driving laws, and best practices that promote safety for all road users.",
      image: category6,
      iconName: "entypo:traffic-cone",
      bgColor: "#E2E2E2",
    },
  ];

  // 🔁 Auto scroll every 4 seconds
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CategoryData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [paused]);

  // 🔄 Helper to calculate translate position (33.33% for 3 cards)
  //   const getTranslateX = () => `-${activeIndex * 33.33}%`;
  // const cardWidth=484; // Adjust based on actual card width including margin

  return (
    <div id="services">
      <h1 className="mt-10 max-w-[1003px] px-6 text-[40px] font-bold text-[#05243F] sm:px-10 sm:text-[56px]">
        We ensure you <span className="text-[#2389E3]">Drive Assured</span>{" "}
        through our Services
      </h1>
      <div
        className="w-full overflow-hidden select-none"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Header navigation */}
        <div className="hidden max-w-8xl customscroll mt-8 sm:flex w-full justify-between overflow-auto px-6 pb-5 text-nowrap sm:px-10">
          {CategoryData.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`me-1 rounded-[17px] px-4 py-4 text-base font-bold text-[#05243F] transition-all ${
                index === activeIndex ? "bg-[#F2F2F2] font-bold" : "font-medium"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Slider container */}
        {/* Desktop & Tablet View */}
        <div className="relative mt-10 mb-20 hidden sm:block">
          <motion.div
            ref={sliderRef}
            className="flex cursor-grab px-10 active:cursor-grabbing"
            drag="x"
            dragConstraints={{
              left: -((CategoryData.length - 1) * 484),
              right: 0,
            }}
            onDragEnd={(e, info) => {
              const direction = info.offset.x < 0 ? 1 : -1;
              if (Math.abs(info.offset.x) > 50) {
                setActiveIndex(
                  (prev) =>
                    (prev + direction + CategoryData.length) %
                    CategoryData.length,
                );
              }
            }}
            animate={{ x: `-${activeIndex * 484}px` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              width: `${CategoryData.length * 484}px`,
              // width: "555.146484375",
            }}
          >
            {CategoryData.map((item, i) => (
              <motion.div
                key={item.id}
                className="w-[484px] flex-shrink-0 px-[10px] sm:w-[484px]"
              >
                <motion.div
                  className={`relative h-full rounded-[20px] p-10 pt-12 shadow-md transition-transform duration-300 ${item.id === 4 ? "text-white" : "text-[#05243F]"} ${activeIndex+1===item.id ? "scale-100" : "scale-96 opacity-80"}`}
                  style={{ backgroundColor: item.bgColor }}
                >
                  <div className="absolute top-8 right-8 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#45A1F2]">
                    <Icon
                      icon={item.iconName}
                      className="z-10 h-[39px] w-[39px] text-white"
                    />
                  </div>
                  <h2 className="max-w-[334px] text-4xl font-bold">
                    {item.title.split(" ")[0]} <br />
                    {item.title.split(" ").slice(1).join(" ")}
                  </h2>
                  <p
                    className={`mt-4 text-lg ${item.id === 4 ? "text-white" : "text-[#05203DB2]"}`}
                  >
                    {item.description}
                  </p>

                  <img
                    src={item.image}
                    alt={item.title}
                    className="my-6 mt-12 w-full object-contain"
                  />
                  <div className="text-center">
                    <button className="mt-6 rounded-[15px] bg-[#05243F] px-6 py-3 text-center text-lg font-bold text-white">
                      Get Started
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        {/* Mobile View */}
        <div className="relative mt-10 block sm:hidden text-left">
          <Swiper
            spaceBetween={16}
            slidesPerView={1}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            onSwiper={(swiper) => setActiveIndex(swiper.activeIndex)}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={true}
            className="px-4"
          >
            {CategoryData.map((item, i) => (
              <SwiperSlide key={item.id}>
                <div
                  className={`h-full rounded-[20px] p-10 shadow-md text-left transition-transform duration-300 ${item.id === 4 ? "text-white" : "text-[#05243F]"} ${
                    i === activeIndex ? "scale-95" : "scale-93 opacity-100"
                  }`}
                  style={{ backgroundColor: item.bgColor }}
                >
                  <div className="absolute top-4 right-4 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#45A1F2]">
                    <Icon
                      icon={item.iconName}
                      className="z-10 h-[36px] w-[36px] text-white"
                    />
                  </div>
                  <h2 className="max-w-[334px] text-4xl font-bold">
                    {item.title.split(" ")[0]} <br />
                    {item.title.split(" ").slice(1).join(" ")}
                  </h2>
                  <p
                    className={`mt-4 text-lg ${item.id === 4 ? "text-white" : "text-[#05203DB2]"}`}
                  >
                    {item.description}
                  </p>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="my-6 mt-12 w-full object-contain"
                  />
                  <div className="text-center">
                    <button className="mt-6 rounded-[15px] bg-[#05243F] px-6 py-3 text-center text-lg font-bold text-white" onClick={()=>navigate("/auth/signup")}>
                      Get Started
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      
      </div>
    </div>
  );
}

export default Categories;
