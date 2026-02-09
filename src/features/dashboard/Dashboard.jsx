import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import WelcomeSection from "../../components/WelcomeSection";
import NavigationTabs from "../../components/NavigationTabs";
import CarDetailsCard from "../../components/CarDetailsCard";
import QuickActions from "./components/QuickActions";
import { useGetCars } from "../car/useCar";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Dashboard() {
  const { cars, isLoading, error } = useGetCars();
  const navigate = useNavigate();

  function handleRenewLicense(carDetail) {
    navigate("/licenses/renew", { state: { carDetail } });
  }

  function handleGarage() {
    navigate("/garage");
  }

  function handleAddCar() {
    navigate("/add-car");
  }

  const userName = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).name
    : "";

  const sortedCars = React.useMemo(() => {
    if (!cars?.cars) return [];
    const carArray = Object.values(cars.cars);
    return carArray.sort((a, b) => {
      const dateA = new Date(a.expiryDate || a.expiry_date);
      const dateB = new Date(b.expiryDate || b.expiry_date);
      return dateA - dateB;
    });
  }, [cars?.cars]);

  // If there's an error, show it
  if (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600">{error.message || 'Failed to load dashboard data'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#2389E3] text-white rounded-lg hover:bg-[#2389E3]/90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <WelcomeSection userName={userName} />
      <NavigationTabs onGarageClick={handleGarage} activeTab="license" />

      <div className="mb-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : sortedCars.length > 0 ? (
          <div className="mb-8 flex flex-col items-center gap-4 md:flex-row">
            <div className="w-full min-w-0 flex-1">
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView="auto"
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                pagination={{
                  clickable: true,
                  el: ".custom-pagination",
                }}
                className="car-swiper !pb-10"
              >
                {sortedCars?.map((car, index) => (
                  <SwiperSlide
                    key={car.id || index}
                    className="!w-full md:!w-[calc(50%-12px)]"
                  >
                    <div className="w-full text-left">
                      <CarDetailsCard
                        carDetail={car}
                        isRenew={true}
                        onRenewClick={handleRenewLicense}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="custom-pagination !mt-0 flex justify-center" />
            </div>

            <div className="shrink-0">
              <button
                onClick={handleAddCar}
                className="group flex flex-col items-center justify-center gap-2"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white transition group-hover:scale-105 group-hover:shadow-md">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2389E3] text-white">
                    <FaPlus className="text-sm" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center">
              <FaCarAlt className="mb-4 text-5xl text-[#2389E3]/20" />
              <h3 className="mb-2 text-xl font-semibold text-[#05243F]">
                No Cars Found
              </h3>
              <p className="mb-6 text-sm text-[#05243F]/60">
                You haven't added any cars to your garage yet. Add your first
                car to get started!
              </p>
              <button
                onClick={handleAddCar}
                className="flex items-center gap-2 rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
              >
                <FaPlus className="text-sm" />
                Add Your First Car
              </button>
            </div>
          </div>
        )}
      </div>

      <QuickActions />
    </div>
  );
}
