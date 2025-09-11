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

// Helper function to derive status and colors from backend reminder
const deriveReminderStyle = (reminder) => {
  // Default colors
  const styles = {
    danger: { bgColor: "#FFE8E8", dotColor: "#DB8888" },
    warning: { bgColor: "#FFEFCE", dotColor: "#FDB022" },
    success: { bgColor: "#E8F5E8", dotColor: "#4CAF50" },
    info: { bgColor: "#E6F4FF", dotColor: "#2389E3" },
  };

  if (!reminder) return { ...styles.warning, type: "warning", message: "No reminder available" };

  const message = reminder.message || reminder.text || "";
  const rawStatus = (reminder.status || reminder.level || "").toString().toLowerCase();

  // If backend provides a status/level, map directly
  if (rawStatus.includes("danger") || rawStatus.includes("expired") || rawStatus.includes("critical")) {
    return { ...styles.danger, type: "danger", message: message || "Expired" };
  }
  if (rawStatus.includes("warn") || rawStatus.includes("pending") || rawStatus.includes("soon")) {
    return { ...styles.warning, type: "warning", message: message || "Due soon" };
  }
  if (rawStatus.includes("success") || rawStatus.includes("ok") || rawStatus.includes("active")) {
    return { ...styles.success, type: "success", message: message || "Active" };
  }
  if (rawStatus.includes("info")) {
    return { ...styles.info, type: "info", message: message || "Info" };
  }

  // Fallback to message heuristics
  const lowerMessage = (message || "").toLowerCase();
  if (lowerMessage.includes("expired") || lowerMessage.includes("expiered") || lowerMessage.includes("0 day")) {
    return { ...styles.danger, type: "danger", message };
  }
  if (/(1|2|3)\s*day/.test(lowerMessage) || lowerMessage.includes("due soon")) {
    return { ...styles.warning, type: "warning", message };
  }
  return { ...styles.success, type: "success", message: message || "Up to date" };
};

export default function CarDetailsCard({ 
  onRenewClick, 
  carDetail, 
  isRenew, 
  reminderObj // legacy: an object possibly with { reminder: { message, status } }
}) {
  const [carLogo, setCarLogo] = useState(MercedesLogo);
  const { showModal } = useModalStore();

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

  // Prefer reminder from carDetail (from GET car endpoint), fallback to prop reminderObj
  const backendReminder = carDetail?.reminder || reminderObj?.reminder || reminderObj;
  const { message: reminderMessage, bgColor, dotColor } = deriveReminderStyle(backendReminder);

  return (
    <div className="rounded-2xl bg-white px-4 py-5">
      <div className="mb-6">
        <div className="text-sm font-light text-[#05243F]/60">Car Model</div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="">
              <img
                src={carLogo}
                loading="lazy"
                alt={carDetail?.vehicle_make || "Car"}
                className="h-6 w-6 object-contain"
                onError={() => setCarLogo(MercedesLogo)}
              />
            </div>
            <h3
              className="text-xl font-semibold text-[#05243F] cursor-pointer"
              role="button"
              onClick={() => showModal(true, carDetail)}
            >
              {carDetail?.vehicle_model || "-"}
            </h3>
          </div>
          <div>
            <Icon icon="ion:car-sport-sharp" fontSize={30} color="#2389E3" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <div>
          <div className="text-sm text-[#05243F]/60">Plate No:</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.plate_number || carDetail?.registration_no || "-"}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Exp. Date</div>
          <div className="text-base font-semibold text-[#05243F]">
            {formatDate(carDetail?.expiry_date)}
          </div>
        </div>
        <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
        <div>
          <div className="text-sm text-[#05243F]/60">Car Type</div>
          <div className="text-base font-semibold text-[#05243F]">
            {carDetail?.vehicle_make || "-"}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5"
          style={{ backgroundColor: bgColor }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: dotColor }}
          ></span>
          <span className="text-sm font-medium text-[#05243F]">
            {reminderMessage}
          </span>
        </div>
        {isRenew && (
          <button
            onClick={handleRenewClick}
            className="cursor-pointer rounded-full bg-[#2389E3] px-6 py-2 text-sm font-semibold text-white hover:bg-[#2389E3]/90"
            style={{ pointerEvents: "auto" }}
          >
            Renew Now
          </button>
        )}
      </div>

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
