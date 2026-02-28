import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LicenseLayout from "../components/LicenseLayout";
import { useDriverLicensePrices } from "./useDriversLicense";
import { Icon } from "@iconify/react";

const LICENSE_OPTIONS = [
  { id: "new", label: "New Driver's License", description: "First-time driver's license application" },
  { id: "renew", label: "Renew Driver's License", description: "Renew your existing driver's license" },
];

export default function DriversLicense() {
  const navigate = useNavigate();
  const { prices, isLoading, error } = useDriverLicensePrices();

  const priceByType = useMemo(() => {
    const map = {};
    (prices || []).forEach((p) => {
      map[p.license_type] = p.price;
    });
    return map;
  }, [prices]);

  const handleSelect = (licenseType) => {
    const price = priceByType[licenseType];
    if (price == null) return;
    navigate(`/licenses/drivers-license/${licenseType}`, {
      state: { license_type: licenseType, price },
    });
  };

  return (
    <LicenseLayout
      title="Driver's License"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="mx-auto w-full max-w-md px-4 md:px-0">
        {error && (
          <p className="mb-4 text-sm text-red-500">
            {error.message || "Failed to load prices"}
          </p>
        )}
        <div className="grid gap-4">
          {LICENSE_OPTIONS.map((opt) => {
            const price = priceByType[opt.id];
            const disabled = isLoading || price == null;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(opt.id)}
                className="group flex cursor-pointer flex-col rounded-[20px] bg-[#F4F5FC] px-4 py-4 text-left transition-colors hover:bg-[#FFF4DD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <h2 className="mb-2 text-sm font-medium text-[#05243F]">
                  {opt.label}
                </h2>
                <p className="mb-2 text-xs font-normal text-[#05243F]/40">
                  {opt.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#2284DB]">
                    {price != null
                      ? `₦${Number(price).toLocaleString()}`
                      : isLoading
                        ? "Loading..."
                        : "—"}
                  </span>
                  <Icon
                    icon="mdi:arrow-right"
                    className="text-xl text-[#2284DB] transition-transform group-hover:translate-x-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </LicenseLayout>
  );
}
