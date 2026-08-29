import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion } from "framer-motion";
import SearchableSelect from "../shared/SearchableSelect";
import { formatCurrency } from "../../utils/formatCurrency";
import { useGetState, useGetLocalGovernment } from "../../features/licenses/useRenew";
import { useDeliveryQuote } from "../../hooks/useDeliveryQuote";

function formatPhoneDisplay(raw) {
  const digits = (raw || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
}

/**
 * Shared Request Delivery block for plate / driver-license summaries.
 */
export default function DeliveryRequest({
  purpose,
  selectedItems = [],
  onChange,
}) {
  const [wantsDelivery, setWantsDelivery] = useState(false);
  const [form, setForm] = useState({
    address: "",
    state: "",
    stateName: "",
    lga: "",
    contact: "",
  });
  const [lgaOptions, setLgaOptions] = useState([]);

  const { data: stateRes } = useGetState();
  const states = Array.isArray(stateRes?.data) ? stateRes.data : Array.isArray(stateRes) ? stateRes : [];
  const { mutate: fetchLGAs, data: lgaData } = useGetLocalGovernment();

  useEffect(() => {
    if (lgaData?.data) setLgaOptions(lgaData.data);
  }, [lgaData]);

  const { feeKobo, loading, error } = useDeliveryQuote({
    enabled: wantsDelivery,
    state: form.state,
    lga: form.lga,
    purpose,
    selectedItems,
  });

  useEffect(() => {
    onChange?.({
      wantsDelivery,
      details: {
        address: form.address,
        state: form.state,
        lga: form.lga,
        contact: form.contact,
        fee: feeKobo,
      },
      quoteError: error,
      quoting: loading,
    });
  }, [wantsDelivery, form.address, form.state, form.lga, form.contact, feeKobo, error, loading, onChange]);

  const handleWantsDelivery = (checked) => {
    setWantsDelivery(checked);
    onChange?.({
      wantsDelivery: checked,
      details: {
        address: checked ? form.address : "",
        state: checked ? form.state : "",
        lga: checked ? form.lga : "",
        contact: checked ? form.contact : "",
        fee: checked ? feeKobo : 0,
      },
      quoteError: checked ? error : "",
      quoting: checked ? loading : false,
    });
  };

  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;
    const selectedState = states.find((s) => s.state_name === selectedStateName || s.name === selectedStateName);
    setForm((prev) => ({
      ...prev,
      state: selectedState?.code || "",
      stateName: selectedStateName,
      lga: "",
    }));
    setLgaOptions([]);
    if (selectedState?.code) fetchLGAs(selectedState.code);
  };

  return (
    <div className="mb-6 rounded-[20px] border border-[#E1E5EE] bg-white p-6 shadow-sm">
      <label className="group flex w-full cursor-pointer items-center gap-3 rounded-full bg-[#F4F5FC] px-6 py-3 transition-all hover:bg-[#FFF4DD]/50">
        <input
          type="checkbox"
          checked={wantsDelivery}
          onChange={(e) => handleWantsDelivery(e.target.checked)}
          className="sr-only"
        />
        <Icon
          icon={wantsDelivery ? "solar:check-square-bold" : "mynaui:square"}
          fontSize={24}
          color={wantsDelivery ? "#2389E3" : "#9CA3AF"}
        />
        <Icon icon="solar:delivery-bold" fontSize={20} className="text-[#697C8C]" />
        <span className="text-sm font-medium text-[#05243F]">Request Delivery</span>
      </label>

      <AnimatePresence>
        {wantsDelivery && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-4 space-y-4"
          >
            <div>
              <div className="text-sm font-medium text-[#05243F]">
                Delivery Address <span className="text-red-500">*</span>
              </div>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="mt-3 w-full rounded-[10px] border border-[#E1E5EE] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none transition-colors placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:border-[#2389E3] focus:bg-[#FFF4DD]"
                placeholder="Enter delivery address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect
                label={<>State <span className="text-red-500">*</span></>}
                name="state"
                value={form.stateName}
                onChange={handleStateChange}
                options={states.map((s) => ({ id: s.code, name: s.state_name || s.name }))}
                placeholder="Select state"
                filterKey="name"
              />
              <SearchableSelect
                label={<>Local Government <span className="text-red-500">*</span></>}
                name="lga"
                value={form.lga}
                onChange={(e) => setForm((p) => ({ ...p, lga: e.target.value }))}
                options={lgaOptions.map((lg) => ({
                  id: lg.lga_name || lg.name,
                  name: lg.lga_name || lg.name,
                }))}
                placeholder="Select LG"
                filterKey="name"
                disabled={!form.state}
              />
            </div>
            <div>
              <div className="text-sm font-medium text-[#05243F]">Delivery Fee</div>
              <input
                readOnly
                value={
                  loading
                    ? "Calculating…"
                    : error
                      ? error
                      : form.state && form.lga
                        ? formatCurrency(feeKobo / 100)
                        : "Select state and LGA"
                }
                className="mt-3 w-full rounded-[10px] border border-[#E1E5EE] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none"
              />
            </div>
            <div>
              <div className="text-sm font-medium text-[#05243F] mb-3">
                Delivery Contact <span className="text-red-500">*</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={14}
                value={formatPhoneDisplay(form.contact)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contact: e.target.value.replace(/\D/g, "").slice(0, 11) }))
                }
                className="w-full rounded-[10px] border border-[#E1E5EE] bg-[#F4F5FC] p-4 text-sm text-[#05243F] outline-none transition-colors placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:border-[#2389E3] focus:bg-[#FFF4DD]"
                placeholder="080 1234 5678"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
