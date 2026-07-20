import { useEffect, useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { Icon } from "@iconify/react";

export default function SelectCarModal({
  open,
  onClose,
  garageCars = [],
  selectedCar,
  onProceed,
}) {
  const [localCar, setLocalCar] = useState(selectedCar || garageCars[0] || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setLocalCar(selectedCar || garageCars[0] || null);
      setDropdownOpen(false);
    }
  }, [open, selectedCar, garageCars]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white px-6 py-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-1 text-[#05243F] hover:bg-[#F4F5FC] cursor-pointer"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-center text-[26px] font-bold text-[#05243F] mb-6">
          Choose a car
        </h2>

        <div className="relative mb-6">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl bg-[#F4F5FC] px-5 py-4 text-left cursor-pointer"
          >
            {localCar ? (
              <span className="text-[15px] font-semibold text-[#05243F]">
                {localCar.vehicle_make} {localCar.vehicle_model}
                {localCar.registration_no ? `   ${localCar.registration_no}` : ""}
              </span>
            ) : (
              <span className="text-[15px] text-[#05243F]/40">
                Select a car from your garage
              </span>
            )}
            <ChevronDown
              size={18}
              className={`shrink-0 text-[#05243F] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-10 max-h-64 overflow-y-auto rounded-2xl border border-[#E1E6F4] bg-white shadow-xl">
              {garageCars.length === 0 ? (
                <p className="px-5 py-4 text-[13px] text-[#697C8C]">
                  No cars in your garage yet.
                </p>
              ) : (
                garageCars.map((car) => {
                  const isActive = car.registration_no === localCar?.registration_no;
                  return (
                    <button
                      key={car.registration_no}
                      onClick={() => {
                        setLocalCar(car);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors cursor-pointer hover:bg-[#F9FAFC] ${
                        isActive ? "bg-[#2389E3]/5" : ""
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
                        isActive ? "bg-[#2389E3] text-white" : "bg-[#F4F5FC] text-[#697C8C]"
                      }`}>
                        <Icon icon="ion:car-sport-sharp" fontSize={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[13px] font-semibold ${isActive ? "text-[#2389E3]" : "text-[#05243F]"}`}>
                          {car.vehicle_make} {car.vehicle_model}
                        </p>
                        <p className="text-[11px] text-[#697C8C]">
                          {car.vehicle_year ? `${car.vehicle_year}` : ""}
                          {car.registration_no ? ` · ${car.registration_no}` : ""}
                        </p>
                      </div>
                      {isActive && <Check size={16} className="shrink-0 text-[#2389E3]" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => onProceed(localCar)}
          disabled={!localCar}
          className="w-full rounded-full bg-[#2389E3] py-4 text-[16px] font-bold text-white transition-colors hover:bg-[#1A7ACF] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Proceed to Ladipo
        </button>
      </div>
    </div>
  );
}
