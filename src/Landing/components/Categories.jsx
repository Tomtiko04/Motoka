import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import category1 from "../../assets/images/landing/Group 1171279801.svg";
import category3 from "../../assets/images/landing/Group 1171279802 (1).svg";
import category4 from "../../assets/images/landing/Group 1171279802 (2).svg";
import category5 from "../../assets/images/landing/Group 1171279802 (3).svg";
import category6 from "../../assets/images/landing/Group 1171279802 (4).svg";
import category2 from "../../assets/images/landing/Group 1171279802.svg";
import { Icon } from "@iconify/react";
function Categories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(0);
  const sliderRef = useRef(null);

  //   useEffect(() => {
  //     if (sliderRef.current) {
  //       const firstCard = sliderRef.current.querySelector("div");
  //         if (firstCard) {
  //             const style = window.getComputedStyle(firstCard);
  //             const width = firstCard.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  //             setCardWidth(width);
  //         }
  //     }
  //   }, [sliderRef]);

  // Sample category data
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
        <h1 className="mt-10 text-[40px] sm:text-[56px] max-w-[1003px] font-bold text-[#05243F] px-6 sm:px-10 ">We ensure you <span className="text-[#2389E3]">Drive Assured</span> through our Services</h1>
      <div
        className=" w-full overflow-hidden select-none "
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Header navigation */}
        <div className="max-w-8xl mt-8 flex w-full text-nowrap  overflow-auto justify-between px-6 sm:px-10 customscroll pb-5">
          {CategoryData.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`me-2 rounded-[17px] px-6 py-4 text-base font-bold text-[#05243F] transition-all ${
                index === activeIndex ? "bg-[#F2F2F2]" : ""
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Slider container */}
        <div className="relative mt-10 hidden sm:block mb-20">
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
                className="w-[484px] flex-shrink-0 px-4 sm:w-[484px]"
              >
                <motion.div
                  className={`relative h-full rounded-[20px] p-10 pt-12 shadow-md transition-transform duration-300 ${item.id === 4 ? "text-white" : "text-[#05243F]"}`}
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

        <div className="relative mt-10 block sm:hidden">
          <motion.div
            ref={sliderRef}
            className="flex cursor-grab px-0 active:cursor-grabbing"
            drag="x"
            dragConstraints={{
              left: -((CategoryData.length - 1) * 384),
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
            animate={{ x: `-${activeIndex * 384}px` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              width: `${CategoryData.length * 384}px`,
              // width: "555.146484375",
            }}
          >
            {CategoryData.map((item, i) => (
              <motion.div
                key={item.id}
                className="w-[384px] flex-shrink-0 px-4"
              >
                <motion.div
                  className={`h-full rounded-[20px] p-10 shadow-md transition-transform duration-300 ${item.id === 4 ? "text-white" : "text-[#05243F]"} ${
                    i === activeIndex ? "scale-105" : "scale-95 opacity-80"
                  }`}
                  style={{ backgroundColor: item.bgColor }}
                >
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

        {/* <div className="relative mt-10 overflow-hidden">
  <motion.div
    ref={sliderRef}
    className="flex cursor-grab px-6 sm:px-10 active:cursor-grabbing"
    drag="x"
    dragConstraints={{
      left: -((CategoryData.length - 1) * (window.innerWidth < 640 ? 320 : window.innerWidth < 1024 ? 420 : 484)),
      right: 0,
    }}
    onDragEnd={(e, info) => {
      const direction = info.offset.x < 0 ? 1 : -1;
      if (Math.abs(info.offset.x) > 50) {
        setActiveIndex(
          (prev) => (prev + direction + CategoryData.length) % CategoryData.length
        );
      }
    }}
    animate={{
      x: `-${
        activeIndex *
        (window.innerWidth < 640 ? 320 : window.innerWidth < 1024 ? 420 : 484)
      }px`,
    }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    style={{
      width: `${
        CategoryData.length *
        (window.innerWidth < 640 ? 320 : window.innerWidth < 1024 ? 420 : 484)
      }px`,
    }}
  >
    {CategoryData.map((item, i) => (
      <motion.div
        key={item.id}
        className="flex-shrink-0 w-[300px] sm:w-[420px] lg:w-[484px] px-3"
      >
        <motion.div
          className={`h-full rounded-[20px] p-6 sm:p-8 lg:p-10 shadow-md transition-transform duration-300 ${
            item.id === 4 ? "text-white" : "text-[#05243F]"
          } ${i === activeIndex ? "scale-105" : "scale-95 opacity-80"}`}
          style={{ backgroundColor: item.bgColor }}
        >
          <h2 className="max-w-[334px] text-2xl sm:text-3xl lg:text-4xl font-bold">
            {item.title.split(" ")[0]} <br />
            {item.title.split(" ").slice(1).join(" ")}
          </h2>
          <p
            className={`mt-4 text-sm sm:text-base lg:text-lg ${
              item.id === 4 ? "text-white" : "text-[#05203DB2]"
            }`}
          >
            {item.description}
          </p>

          <img
            src={item.image}
            alt={item.title}
            className="my-6 mt-10 w-full object-contain"
          />
          <div className="text-center">
            <button className="mt-4 sm:mt-6 rounded-[15px] bg-[#05243F] px-5 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-bold text-white text-center">
              Get Started
            </button>
          </div>
        </motion.div>
      </motion.div>
    ))}
  </motion.div>
</div> */}

        {/* Slider container */}
        {/* <div className="relative mt-10 overflow-hidden">
  <motion.div
    ref={sliderRef}
    className="flex cursor-grab px-10 active:cursor-grabbing"
    drag="x"
    dragConstraints={{
      left: -((CategoryData.length - 1) * 420), // card width (400) + margin
      right: 0,
    }}
    onDragEnd={(e, info) => {
      const direction = info.offset.x < 0 ? 1 : -1;
      if (Math.abs(info.offset.x) > 50) {
        setActiveIndex(
          (prev) => (prev + direction + CategoryData.length) % CategoryData.length
        );
      }
    }}
    animate={{ x: `-${activeIndex * 420}px` }} // move by pixel width
    transition={{ duration: 0.6, ease: "easeInOut" }}
    style={{
      width: `${CategoryData.length * 420}px`, // total slider width
    }}
  >
    {CategoryData.map((item, i) => (
      <motion.div
        key={item.id}
        className="flex-shrink-0 w-[400px] px-2"
      >
        <motion.div
          className={`h-full rounded-[20px] p-10 shadow-md transition-transform duration-300 ${
            item.id === 4 ? "text-white" : "text-[#05243F]"
          } ${i === activeIndex ? "scale-105" : "scale-95 opacity-80"}`}
          style={{ backgroundColor: item.bgColor }}
        >
          <h2 className="max-w-[334px] text-4xl font-bold">
            {item.title.split(" ")[0]} <br />
            {item.title.split(" ").slice(1).join(" ")}
          </h2>
          <p
            className={`mt-4 text-lg ${
              item.id === 4 ? "text-white" : "text-[#05203DB2]"
            }`}
          >
            {item.description}
          </p>

          <img
            src={item.image}
            alt={item.title}
            className="my-6 mt-12 w-full object-contain"
          />
          <div className="text-center">
            <button className="mt-6 rounded-[15px] bg-[#05243F] px-6 py-3 text-lg font-bold text-white text-center">
              Get Started
            </button>
          </div>
        </motion.div>
      </motion.div>
    ))}
  </motion.div>
</div> */}
      </div>
    </div>
  );
}

export default Categories;
