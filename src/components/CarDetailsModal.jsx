import { Icon } from "@iconify/react";
import React from "react";
import useModalStore from "../store/modalStore";

const DetailItem = ({ label, value }) => (
  <div className="grid grid-cols-2 items-center py-3 border-b border-gray-200 last:border-b-0">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-gray-800 font-semibold text-sm text-right">{value}</p>
  </div>
);

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
      className="fixed inset-0 z-100 flex items-center justify-center bg-[#181B1E]/80 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[20px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#DCEFFF] p-6">
          <div className="flex items-center gap-3">
            <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
            <h2 className="text-lg font-bold text-[#05243F]">
              {carDetail.vehicle_make} {carDetail.vehicle_model}
            </h2>
          </div>
          <button
            onClick={hideModal}
            className="rounded-full bg-[#DB8888] p-.7 text-[#fff] hover:bg-red-400"
          >
            <Icon icon="carbon:close" className="text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col p-6">
          <DetailItem
            label="Registration No"
            value={carDetail.registration_no}
          />
          <DetailItem label="Owner" value={carDetail.name_of_owner} />
          <DetailItem label="Chassis No" value={carDetail.chasis_no} />
          <DetailItem label="Engine No" value={carDetail.engine_no} />
          <DetailItem label="Vehicle Color" value={carDetail.vehicle_color} />
          <DetailItem label="Vehicle Year" value={carDetail.vehicle_year} />
          <DetailItem
            label="Date Issued"
            value={new Date(carDetail.date_issued).toLocaleDateString()}
          />
          <DetailItem
            label="Expiry Date"
            value={new Date(carDetail.expiry_date).toLocaleDateString()}
          />
        </div>
      </div>
    </div>
  );
}
