import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LicenseLayout from "../components/LicenseLayout";
import { useDriverLicensePrices } from "./useDriversLicense";
import { Icon } from "@iconify/react";

const LICENSE_OPTIONS = [
  { id: "new",   label: "New Driver's License",  description: "First-time driver's license application" },
  { id: "renew", label: "Renew Driver's License", description: "Renew your existing driver's license" },
];

export default function DriversLicense() {
  const navigate = useNavigate();
  const { prices, isLoading, error } = useDriverLicensePrices();

  // Build per-type data: { new: [{duration, price}, ...], renew: [...] }
  const pricesByType = useMemo(() => {
    const map = { new: [], renew: [] };
    (prices || []).forEach((p) => {
      if (map[p.license_type]) map[p.license_type].push(p);
    });
    return map;
  }, [prices]);

  const minPrice = (type) => {
    const rows = pricesByType[type] || [];
    if (!rows.length) return null;
    return Math.min(...rows.map((r) => r.price));
  };

  const handleSelect = (licenseType) => {
    const rows = pricesByType[licenseType];
    if (!rows || rows.length === 0) return;
    // Navigate – duration selected on the form/renew page
    navigate(`/licenses/drivers-license/${licenseType}`);
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
            const from = minPrice(opt.id);
            const disabled = isLoading || from == null;
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
                    {from != null
                      ? `from ₦${Number(from).toLocaleString()}`
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
