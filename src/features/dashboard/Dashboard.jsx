import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { api } from "../../services/apiClient";
import { getReminder } from "../../services/apiReminder";
import { useReminders } from '../../context/ReminderContext';

import "swiper/css";
import "swiper/css/pagination";

import WelcomeSection from "../../components/WelcomeSection";
import NavigationTabs from "../../components/NavigationTabs";
import CarDetailsCard from "../../components/CarDetailsCard";
import AddCarCard from "../../components/AddCarCard";
import QuickActions from "./components/QuickActions";
import { useGetCars } from "../car/useCar";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Dashboard() {
  const { cars, isLoading } = useGetCars();
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

  // Use reminders from context
  const { reminders, loading: reminderLoading } = useReminders();

  const sortedCars = React.useMemo(() => {
    if (!Array.isArray(cars?.cars)) return [];
    return [...cars.cars].sort((a, b) => {
      const dateA = new Date(a.expiryDate || a.expiry_date);
      const dateB = new Date(b.expiryDate || b.expiry_date);
      return dateA - dateB;
    });
  }, [cars?.cars]);

  // Helper function to find matching reminder for a car
  const getCarReminder = (carId) => {
    if (!reminders || reminders.length === 0) return null;
    return reminders.find(reminder => String(reminder.car_id) === String(carId));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <WelcomeSection userName={userName} />
      <NavigationTabs onGarageClick={handleGarage} activeTab="license" />

      <div className="mb-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center ">
            <LoadingSpinner />
          </div>
        ) : Array.isArray(cars?.cars) && cars.cars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
            <div>
              <Swiper
                modules={[Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                // className="!pb-12 h-full"
              >
                {sortedCars.map((car, index) => {
                  const carReminder = getCarReminder(car.id);
                  
                  return (
                    <SwiperSlide key={car.id || index}>
                      <div>
                        <CarDetailsCard
                          carDetail={car}
                          isRenew={true}
                          onRenewClick={handleRenewLicense}
                          reminderObj={carReminder}
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
            <div>
              <AddCarCard onAddCarClick={handleAddCar} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex h-64 items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-500">
              <div>
                <FaCarAlt className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-lg font-medium">No cars found</p>
                <p className="mt-1 text-sm">Add your first car to get started</p>
              </div>
            </div>
            <div>
              <AddCarCard onAddCarClick={handleAddCar} />
            </div>
          </div>
        )}
      </div>

      <QuickActions />
    </div>
  );
}