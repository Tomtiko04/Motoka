import { useState } from "react";
import toast from "react-hot-toast";
import RenewModal from "../Landing/components/RenewModal";

function formatPlateNumber(value) {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}`;
}

export default function PlateRenewCta({ variant = "card" }) {
  const [plateNumber, setPlateNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRenewClick = () => {
    if (plateNumber.trim() === "") {
      toast.error("Please enter your plate number");
      return;
    }
    setIsModalOpen(true);
  };

  const input = (
    <input
      type="text"
      placeholder="Enter plate number to renew licence"
      name="plateNo"
      value={plateNumber}
      onChange={(e) => setPlateNumber(formatPlateNumber(e.target.value))}
      className={
        variant === "hero"
          ? "relative z-10 h-full flex-1 bg-transparent py-2 px-2 ps-4 font-normal outline-none placeholder:text-[#05243F66] sm:ps-10"
          : "h-12 w-full rounded-[10px] bg-white px-4 text-[#05243F] outline-none ring-1 ring-[#05243F]/10 placeholder:text-[#05243F66] focus:ring-[#2389E3] sm:flex-1"
      }
    />
  );

  const button = (
    <button
      type="button"
      onClick={handleRenewClick}
      className={
        variant === "hero"
          ? "relative z-20 cursor-pointer text-nowrap rounded-[10px] bg-[#EBB850] px-5 py-3 font-semibold text-[#05243F] sm:px-6 sm:py-4"
          : "h-12 w-full rounded-[10px] bg-[#EBB850] px-6 font-semibold text-[#05243F] sm:w-auto"
      }
    >
      Renew now
    </button>
  );

  return (
    <>
      {variant === "hero" ? (
        <>
          <div className="mt-10 hidden w-full max-w-[700px] items-center rounded-[10px] bg-white text-base font-semibold text-black sm:flex sm:text-xl">
            {input}
            {button}
          </div>
          <div className="mt-10 flex w-full max-w-[700px] flex-col items-center text-base font-semibold text-black sm:hidden">
            <input
              type="text"
              placeholder="Enter plate number to renew licence"
              name="plateNo"
              value={plateNumber}
              onChange={(e) => setPlateNumber(formatPlateNumber(e.target.value))}
              className="relative z-10 mb-3 h-full w-full rounded-[10px] bg-white px-2 py-3 ps-4 font-normal outline-none placeholder:text-[#05243F66]"
            />
            <button
              type="button"
              onClick={handleRenewClick}
              className="w-full text-nowrap rounded-[10px] bg-[#EBB850] px-5 py-3 font-semibold text-[#05243F]"
            >
              Renew now
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {input}
          {button}
        </div>
      )}
      <RenewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialPlateNumber={plateNumber}
      />
    </>
  );
}
