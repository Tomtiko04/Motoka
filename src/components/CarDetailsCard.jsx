import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import MercedesLogo from "../assets/images/mercedes-logo.png";
import useModalStore from "../store/modalStore";

const defaultLogo = MercedesLogo;

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to determine status based on reminder message
const getReminderStatus = (message) => {
  if (!message)
    return { type: "warning", bgColor: "#FFEFCE", dotColor: "#FDB022" };

  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("expired") ||
    lowerMessage.includes("expiered") ||
    lowerMessage.includes("0 day") ||
    lowerMessage.includes("overdue")
  ) {
    return { type: "danger", bgColor: "#FFE8E8", dotColor: "#DB8888" };
  } else if (
    lowerMessage.includes("1 day") ||
    lowerMessage.includes("2 day") ||
    lowerMessage.includes("3 day")
  ) {
    return { type: "warning", bgColor: "#FFEFCE", dotColor: "#FDB022" };
  } else {
    return { type: "normal", bgColor: "#E8F5E8", dotColor: "#4CAF50" };
  }
};

export default function CarDetailsCard({
  onRenewClick,
  carDetail,
  isRenew,
  onSelect,
}) {
  const [carLogo, setCarLogo] = useState(MercedesLogo);
  const { showModal } = useModalStore();

  const handleSelect = () => {
    if (onSelect) onSelect(carDetail);
  };

  const handleRenewClick = () => {
    onRenewClick(carDetail);
  };

  // Load car logo
  useEffect(() => {
    const loadCarLogo = async () => {
      try {
        const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
        if (carMake) {
          const logoUrl = `https://www.carlogos.org/car-logos/${carMake}-logo.png`;
          const response = await fetch(logoUrl, { method: "HEAD" });
          if (response.ok) {
            setCarLogo(logoUrl);
          } else {
            setCarLogo(defaultLogo);
          }
        }
      } catch {
        setCarLogo(defaultLogo);
      }
    };
    loadCarLogo();
  }, [carDetail?.vehicle_make]);

  // Use reminder data directly from carDetail (already embedded by backend)
  const reminderMessage =
    carDetail?.reminder?.message || "No reminder available";
  const reminderStatus = getReminderStatus(reminderMessage);

  // Get additional reminder properties from backend
  const daysLeft = carDetail?.reminder?.days_left;
  const reminderStatusType = carDetail?.reminder?.status;
  const isUrgent = carDetail?.reminder?.is_urgent;
  const isExpired = carDetail?.reminder?.is_expired;
  const expiresToday = carDetail?.reminder?.expires_today;

  return (
    <div
      className="cursor-pointer rounded-2xl bg-white px-4 py-5"
      onClick={handleSelect}
      role="button"
    >
      <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">Car Model</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div>
              <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
            </div>
            <h3
              className="cursor-pointer text-xl font-semibold text-[#05243F]"
              role="button"
              onClick={() => showModal(true, carDetail)}
            >
              {carDetail?.vehicle_model || "-"}
            </h3>
          </div>
          <div>
            {/* <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" /> */}
            {/* <img
              src={carLogo}
              loading="lazy"
              alt={carDetail?.vehicle_make || "Car"}
              className="h-6 w-6 object-contain"
              onError={() => setCarLogo(MercedesLogo)}
            /> */}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Plate No:</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.plate_number || carDetail?.registration_no || "-"}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Exp. Date</div>
          <div className="text-base font-semibold text-nowrap text-[#05243F]">
            {formatDate(carDetail?.expiry_date)}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-nowrap text-[#05243F]/60">Car Type</div>
          <div className="text-base font-semibold text-nowrap text-[#05243F]">
            {carDetail?.vehicle_make || "-"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ backgroundColor: reminderStatus.bgColor }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: reminderStatus.dotColor }}
          ></span>
          <span className="text-sm font-medium text-[#05243F]">
            {reminderMessage}
          </span>
        </div>
        {isRenew && (
          <button
            className="cursor-pointer rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
            onClick={(e) => {
              e.stopPropagation();
              handleRenewClick();
            }}
          >
            Renew Now
          </button>
        )}
      </div>

      {/* Enhanced Reminder Display - Using Backend Data */}
      {/* {daysLeft !== null && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-[#05243F]/60">
            Expiry Status
          </div>
          <div className={`text-sm font-semibold ${
            isExpired ? 'text-red-600' :
            expiresToday ? 'text-orange-600' :
            isUrgent ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {(() => {
              if (isExpired) return `${Math.abs(daysLeft)} days overdue`;
              if (expiresToday) return 'Expires today';
              if (daysLeft === 1) return '1 day left';
              return `${daysLeft} days left`;
            })()}
          </div>
        </div>
      )} */}

      {/* {isModal && (
        <CarDetailsModal
          isOpen={isModal}
          carDetail={carDetail}
          onClose={() => setIsModal(false)}
        />
      )} */}
    </div>
  );
}
