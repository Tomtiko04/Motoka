import { Icon } from "@iconify/react";
import React from "react";
import useModalStore from "../store/modalStore";

export default function CarDetailsModal() {
    const { isOpen, onConfirm, hideModal, carDetail } = useModalStore();
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      hideModal();
    }
  };

  if (!isOpen) return null;

  console.log(carDetail);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#181B1E]/80"
      onClick={handleOverlayClick}
    >
      <div
        className="w-[485px] overflow-hidden rounded-[20px] bg-white shadow-2xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 bg-[#DCEFFF] py-6">
          <Icon
            icon="ion:car-sport-sharp"
            fontSize={30}
            color="#2389E3" 
          />
          <h2 className="text-2xl font-bold text-[#05243F]">
            {carDetail.vehicle_make}
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col px-8 pb-8">
            
        </div>
      </div>
    </div>
  );
}
