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

// Helper function to determine status based on backend expiry_status
const getExpiryStatusStyle = (expiryStatus) => {
  if (!expiryStatus || !expiryStatus.status) {
    return { 
      bgColor: "#E8F5E8", 
      dotColor: "#4CAF50",
      message: "No reminder available" 
    };
  }

  // Support both new shape ({ status, label, days_remaining }) and
  // legacy backend shape ({ status, message, days_left }).
  const { status, label, days_remaining, message } = expiryStatus;
  const effectiveDays =
    typeof days_remaining === "number" ? days_remaining : expiryStatus.days_left;
  const effectiveLabel = label || message;

  // Map backend status to UI colors
  if (status === "overdue") {
    return { 
      bgColor: "#FFE8E8", 
      dotColor: "#DB8888",
      message: effectiveLabel || "Overdue"
    };
  } else if (status === "reminder") {
    // Show red/danger for 0-3 days, warning for 4-30 days
    if (typeof effectiveDays === "number" && effectiveDays <= 3) {
      return { 
        bgColor: "#FFE8E8", 
        dotColor: "#DB8888",
        message:
          effectiveLabel ||
          `${effectiveDays} day${effectiveDays === 1 ? "" : "s"} remaining`
      };
    }
    return { 
      bgColor: "#FFEFCE", 
      dotColor: "#FDB022",
      message:
        effectiveLabel ||
        (typeof effectiveDays === "number"
          ? `${effectiveDays} days remaining`
          : "Reminder active")
    };
  } else {
    // status === "no_reminder"
    return { 
      bgColor: "#E8F5E8", 
      dotColor: "#4CAF50",
      message: effectiveLabel || "No reminder available"
    };
  }
};

export default function CarDetailsCard({
  onRenewClick,
  carDetail,
  isRenew,
  onSelect,
}) {
  // const [carLogo, setCarLogo] = useState(MercedesLogo);
  const { showModal } = useModalStore();

  const handleSelect = () => {
    if (onSelect) onSelect(carDetail);
  };

  const handleRenewClick = () => {
    onRenewClick(carDetail);
  };

  // Load car logo
  // useEffect(() => {
  //   const loadCarLogo = async () => {
  //     try {
  //       const carMake = carDetail?.vehicle_make?.toLowerCase() || "";
  //       if (carMake) {
  //         const logoUrl = `https://www.carlogos.org/car-logos/${carMake}-logo.png`;
  //         const response = await fetch(logoUrl, { method: "HEAD" });
  //         if (response.ok) {
  //           setCarLogo(logoUrl);
  //         } else {
  //           setCarLogo(defaultLogo);
  //         }
  //       }
  //     } catch {
  //       setCarLogo(defaultLogo);
  //     }
  //   };
  //   loadCarLogo();
  // }, [carDetail?.vehicle_make]);

  // Use expiry_status from backend (new format), with graceful fallback to legacy "reminder"
  const expiryStatusData = carDetail?.expiry_status || carDetail?.reminder;
  const statusStyle = getExpiryStatusStyle(expiryStatusData);
  
  // Extract data from expiry_status
  const reminderMessage = statusStyle.message;
  const daysRemaining = expiryStatusData?.days_remaining;
  const expiryStatus = expiryStatusData?.status; // "reminder", "overdue", or "no_reminder"

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

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 md:w-auto"
          style={{ backgroundColor: statusStyle.bgColor }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: statusStyle.dotColor }}
          ></span>
          <span className="text-sm font-medium text-[#05243F]">
            {reminderMessage}
          </span>
        </div>
        {isRenew && (
          <button
            className="w-full cursor-pointer rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90 md:w-auto"
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
