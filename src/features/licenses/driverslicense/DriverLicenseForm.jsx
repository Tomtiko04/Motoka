import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import LicenseLayout from "../components/LicenseLayout";
import { useDriverLicensePrices } from "./useDriversLicense";
import { getDriverLicenseApplication, upsertDriverLicenseApplication } from "../../../services/apiDriverLicenseApplication";
import { uploadDocument, buildDriverLicenseFormData } from "../../../services/apiDocument";
import { toast } from "react-hot-toast";

const FORM_FIELDS = [
  { name: "full_name",         label: "Full Name",                  type: "text", placeholder: "" },
  { name: "phone",             label: "Phone No.",                  type: "tel",  placeholder: "234xxxxxxx" },
  { name: "address",           label: "Address",                    type: "text", placeholder: "Agbara, Ogun State" },
  { name: "date_of_birth",     label: "Date of Birth",              type: "date", placeholder: "dd/mm/yyyy" },
  { name: "place_of_birth",    label: "Place of Birth",             type: "text", placeholder: "" },
  { name: "home_of_origin",    label: "Home of Origin",             type: "text", placeholder: "" },
  { name: "local_government",  label: "Local Government",           type: "text", placeholder: "" },
  { name: "blood_group",       label: "Blood Group",                type: "text", placeholder: "" },
  { name: "height",            label: "Height",                     type: "text", placeholder: "" },
  { name: "occupation",        label: "Occupation",                 type: "text", placeholder: "" },
  { name: "next_of_kin_name",  label: "Next of Kin Name",           type: "text", placeholder: "" },
  { name: "next_of_kin_phone", label: "Next of Kin's Phone Number", type: "tel",  placeholder: "" },
  { name: "mother_maiden_name",label: "Mother's Maiden Name",       type: "text", placeholder: "" },
];

export default function DriverLicenseForm() {
  const navigate = useNavigate();
  const passportInputRef = useRef(null);
  const [form, setForm] = useState({});
  const [passportPreview, setPassportPreview] = useState(null);
  const [passportFile, setPassportFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { prices } = useDriverLicensePrices();
  // New-license durations from DB
  const newPrices = (prices || []).filter((p) => p.license_type === "new");
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Auto-select first option once prices load
  React.useEffect(() => {
    if (newPrices.length && !selectedDuration) {
      setSelectedDuration(newPrices[0].duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  const selectedPriceRow = newPrices.find((p) => p.duration === selectedDuration);
  const priceNew = selectedPriceRow?.price ?? 0;

  useEffect(() => {
    const load = async () => {
      try {
        const app = await getDriverLicenseApplication("new");
        if (app) {
          const vals = {};
          FORM_FIELDS.forEach((f) => {
            let v = app[f.name];
            if (v != null) {
              if (f.type === "date" && typeof v === "string") v = v.slice(0, 10);
              vals[f.name] = v;
            }
          });
          setForm(vals);
          if (app.passport_photo_url) setPassportPreview(app.passport_photo_url);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePassportSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should not exceed 10MB");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP");
      return;
    }
    setPassportFile(file);
    setPassportPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let passportUrl = passportPreview && passportPreview.startsWith("http") ? passportPreview : null;

    if (passportFile) {
      try {
        const fd = buildDriverLicenseFormData(passportFile, "passport");
        const res = await uploadDocument(fd);
        const doc = res?.data?.document || res?.document;
        if (doc?.file_url) passportUrl = doc.file_url;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to upload passport photo");
        return;
      }
    }

    if (!passportUrl) {
      toast.error("Please upload a passport photograph");
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertDriverLicenseApplication({
        application_type: "new",
        ...form,
        passport_photo_url: passportUrl,
        status: "submitted",
      });
      navigate("/licenses/drivers-license/order-summary", {
        state: {
          license_type: "new",
          duration: selectedDuration,
          price: priceNew,
          formData: { ...form, passport_photo_url: passportUrl },
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LicenseLayout title="Driver's License" subTitle="Loading..." mainContentTitle="">
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" />
        </div>
      </LicenseLayout>
    );
  }

  return (
    <LicenseLayout
      title="Driver's License"
      subTitle="All documents uploaded for approval must be up-to-date and an appropriate photograph must be provided. Upload Passport Photograph."
      mainContentTitle=""
      backPath="/licenses/drivers-license"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Passport upload */}
        <div className="flex items-start gap-4">
          <div
            onClick={() => passportInputRef.current?.click()}
            className="flex h-[120px] w-[120px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#E1E6F4] bg-[#F4F5FC] transition-colors hover:border-[#2284DB] hover:bg-[#EBF4FD]"
          >
            <input
              ref={passportInputRef}
              type="file"
              accept="image/*"
              onChange={handlePassportSelect}
              className="hidden"
            />
            {passportPreview ? (
              <img src={passportPreview} alt="Passport" className="h-full w-full object-cover" />
            ) : (
              <Icon icon="lets-icons:add-round" fontSize={32} color="#2284DB" />
            )}
          </div>
          <div className="flex-1 pt-2">
            <p className="text-sm font-medium text-[#05243F]">Upload Passport Photograph</p>
            <p className="mt-2 text-xl font-bold text-[#2284DB]">
              ₦{Number(priceNew).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Duration selector */}
        {newPrices.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-[#05243F]">License Duration</p>
            <div className="grid grid-cols-3 gap-2">
              {newPrices.map((p) => {
                const label = p.duration === "international" ? "International" : p.duration === "3yr" ? "3 Years" : "5 Years";
                const active = selectedDuration === p.duration;
                return (
                  <button
                    key={p.duration}
                    type="button"
                    onClick={() => setSelectedDuration(p.duration)}
                    className={`flex flex-col items-center rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                      active
                        ? "border-[#2284DB] bg-[#EBF4FD]"
                        : "border-[#E1E6F4] bg-white hover:border-[#2284DB]/40"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${active ? "text-[#2284DB]" : "text-[#05243F]"}`}>
                      {label}
                    </span>
                    <span className={`mt-1 text-xs ${active ? "text-[#2284DB]/80" : "text-[#05243F]/50"}`}>
                      ₦{Number(p.price).toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {FORM_FIELDS.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-sm font-medium text-[#05243F]">{f.label}</label>
              <input
                name={f.name}
                type={f.type}
                value={form[f.name] ?? ""}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-[#E1E6F4] bg-white px-4 py-2.5 text-sm text-[#05243F] placeholder:text-[#697C8C]/60 focus:border-[#2284DB] focus:outline-none focus:ring-1 focus:ring-[#2284DB]"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2284DB] py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1a6bb8] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Confirm and Proceed"}
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </button>
        </form>
      </div>
    </LicenseLayout>
  );
}
