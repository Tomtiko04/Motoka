import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import LicenseLayout from "../components/LicenseLayout";
import FormInput from "../components/FormInput";
import { useDriverLicensePrices } from "./useDriversLicense";
import {
  getDriverLicenseApplication,
  upsertDriverLicenseApplication,
} from "../../../services/apiDriverLicenseApplication";
import {
  uploadDocument,
  buildDriverLicenseFormData,
  getDriverLicenseDocuments,
} from "../../../services/apiDocument";
import { toast } from "react-hot-toast";

const NEW_FIELDS = [
  { name: "full_name",          label: "Full Name",                  type: "text", placeholder: "" },
  { name: "phone",              label: "Phone No.",                  type: "tel",  placeholder: "234xxxxxxx" },
  { name: "address",            label: "Address",                    type: "text", placeholder: "Agbara, Ogun State" },
  { name: "date_of_birth",      label: "Date of Birth",              type: "date", placeholder: "" },
  { name: "place_of_birth",     label: "Place of Birth",             type: "text", placeholder: "" },
  { name: "home_of_origin",     label: "Home of Origin",             type: "text", placeholder: "" },
  { name: "local_government",   label: "Local Government",           type: "text", placeholder: "" },
  { name: "blood_group",        label: "Blood Group",                type: "text", placeholder: "" },
  { name: "height",             label: "Height",                     type: "text", placeholder: "" },
  { name: "occupation",         label: "Occupation",                 type: "text", placeholder: "" },
  { name: "next_of_kin_name",   label: "Next of Kin Name",           type: "text", placeholder: "" },
  { name: "next_of_kin_phone",  label: "Next of Kin's Phone Number", type: "tel",  placeholder: "" },
  { name: "mother_maiden_name", label: "Mother's Maiden Name",       type: "text", placeholder: "" },
];

export default function DriversLicense() {
  const navigate = useNavigate();
  const passportInputRef = useRef(null);
  const licenseInputRef = useRef(null);

  const [licenseType, setLicenseType] = useState("new");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New license state
  const [newForm, setNewForm] = useState({});
  const [passportFile, setPassportFile] = useState(null);
  const [passportPreview, setPassportPreview] = useState(null);
  const [selectedNewDuration, setSelectedNewDuration] = useState(null);

  // Renew license state
  const [licenseNumber, setLicenseNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfExpiry, setDateOfExpiry] = useState("");
  const [licenseFile, setLicenseFile] = useState(null);
  const [licenseDocUrl, setLicenseDocUrl] = useState(null);
  const [existingDocs, setExistingDocs] = useState([]);
  const [selectedRenewDuration, setSelectedRenewDuration] = useState(null);

  const { prices } = useDriverLicensePrices();
  const newPrices = (prices || []).filter((p) => p.license_type === "new");
  const renewPrices = (prices || []).filter((p) => p.license_type === "renew");

  useEffect(() => {
    if (newPrices.length && !selectedNewDuration) {
      setSelectedNewDuration(newPrices[0].duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  useEffect(() => {
    if (renewPrices.length && !selectedRenewDuration) {
      setSelectedRenewDuration(renewPrices[0].duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices]);

  const selectedNewPriceRow = newPrices.find((p) => p.duration === selectedNewDuration);
  const priceNew = selectedNewPriceRow?.price ?? 0;

  const selectedRenewPriceRow = renewPrices.find((p) => p.duration === selectedRenewDuration);
  const priceRenew = selectedRenewPriceRow?.price ?? 0;

  const currentPrice = licenseType === "new" ? priceNew : priceRenew;

  useEffect(() => {
    const load = async () => {
      try {
        const [newApp, renewApp, docs] = await Promise.all([
          getDriverLicenseApplication("new").catch(() => null),
          getDriverLicenseApplication("renew").catch(() => null),
          getDriverLicenseDocuments().catch(() => []),
        ]);

        if (newApp) {
          const vals = {};
          NEW_FIELDS.forEach((f) => {
            let v = newApp[f.name];
            if (v != null) {
              if (f.type === "date" && typeof v === "string") v = v.slice(0, 10);
              vals[f.name] = v;
            }
          });
          setNewForm(vals);
          if (newApp.passport_photo_url) setPassportPreview(newApp.passport_photo_url);
        }

        if (renewApp) {
          setLicenseNumber(renewApp.license_number ?? "");
          const fmt = (d) => (d ? String(d).slice(0, 10) : "");
          setDateOfBirth(fmt(renewApp.date_of_birth));
          setDateOfExpiry(fmt(renewApp.date_of_expiry));
          setLicenseDocUrl(renewApp.license_document_url);
        }

        setExistingDocs(docs || []);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleNewFieldChange = (e) => {
    const { name, value } = e.target;
    setNewForm((prev) => ({ ...prev, [name]: value }));
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

  const handleLicenseFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should not exceed 10MB");
      return;
    }
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, PDF");
      return;
    }
    setLicenseFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (licenseType === "new") {
        let passportUrl =
          passportPreview && passportPreview.startsWith("http") ? passportPreview : null;

        if (passportFile) {
          const fd = buildDriverLicenseFormData(passportFile, "passport");
          const res = await uploadDocument(fd);
          const doc = res?.data?.document || res?.document;
          if (doc?.file_url) passportUrl = doc.file_url;
        }

        if (!passportUrl) {
          toast.error("Please upload a passport photograph");
          return;
        }

        await upsertDriverLicenseApplication({
          application_type: "new",
          ...newForm,
          passport_photo_url: passportUrl,
          status: "submitted",
        });

        navigate("/licenses/drivers-license/order-summary", {
          state: {
            license_type: "new",
            duration: selectedNewDuration,
            price: priceNew,
            formData: { ...newForm, passport_photo_url: passportUrl },
          },
        });
      } else {
        let docUrl = licenseDocUrl;

        if (licenseFile) {
          const fd = buildDriverLicenseFormData(licenseFile);
          const res = await uploadDocument(fd);
          const doc = res?.data?.document || res?.document;
          if (doc?.file_url) docUrl = doc.file_url;
        }

        if (!licenseNumber || !dateOfBirth || !dateOfExpiry) {
          toast.error("Please fill License Number, Date of Birth, and Date of Expiry");
          return;
        }

        await upsertDriverLicenseApplication({
          application_type: "renew",
          license_number: licenseNumber,
          date_of_birth: dateOfBirth,
          date_of_expiry: dateOfExpiry,
          license_document_url: docUrl,
          status: "submitted",
        });

        navigate("/licenses/drivers-license/order-summary", {
          state: {
            license_type: "renew",
            duration: selectedRenewDuration,
            price: priceRenew,
            licenseNumber,
            dateOfBirth,
            dateOfExpiry,
            licenseDocumentUrl: docUrl,
          },
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationLabel = (d) =>
    d === "international" ? "International" : d === "3yr" ? "3 Years" : "5 Years";

  if (isLoading) {
    return (
      <LicenseLayout title="Driver's License" subTitle="Loading...">
        <div className="flex justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" />
        </div>
      </LicenseLayout>
    );
  }

  return (
    <LicenseLayout
      title="Driver's License"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-8 md:grid-cols-[170px_1fr_120px]"
      >
        {/* Left: type selector */}
        <div>
          <p className="mb-5 text-sm font-normal text-[#05243F]/40">
            Please pick the type of Driver's License we can help you with.
          </p>
          <div className="flex w-[140px] flex-row gap-2 md:flex-col">
            <button
              type="button"
              onClick={() => setLicenseType("new")}
              className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
                licenseType === "new"
                  ? "border-2 border-[#2389E3] text-[#05243F]"
                  : "border-2 border-[#F4F5FC] text-[#05243F]/40"
              }`}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setLicenseType("renew")}
              className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
                licenseType === "renew"
                  ? "border-2 border-[#2389E3] text-[#05243F]"
                  : "border-2 border-[#F4F5FC] text-[#05243F]/40"
              }`}
            >
              Renew
            </button>
          </div>
        </div>

        {/* Center: form fields */}
        <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-300px)] overflow-y-auto pr-4">
          {licenseType === "new" ? (
            <div className="space-y-4">
              {/* Passport upload */}
              <div>
                <p className="mb-1 text-sm font-medium text-[#05243F]">
                  Passport Photograph
                </p>
                <div
                  onClick={() => passportInputRef.current?.click()}
                  className="flex h-[120px] w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#E1E6F4] bg-[#F4F5FC] transition-colors hover:border-[#2284DB] hover:bg-[#EBF4FD]"
                >
                  <input
                    ref={passportInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePassportSelect}
                    className="hidden"
                  />
                  {passportPreview ? (
                    <img
                      src={passportPreview}
                      alt="Passport"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon icon="lets-icons:add-round" fontSize={32} color="#2284DB" />
                  )}
                </div>
              </div>

              {/* Duration */}
              {newPrices.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-[#05243F]">License Duration</p>
                  <div className="grid grid-cols-3 gap-2">
                    {newPrices.map((p) => {
                      const active = selectedNewDuration === p.duration;
                      return (
                        <button
                          key={p.duration}
                          type="button"
                          onClick={() => setSelectedNewDuration(p.duration)}
                          className={`flex flex-col items-center rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                            active
                              ? "border-[#2284DB] bg-[#EBF4FD]"
                              : "border-[#E1E6F4] bg-white hover:border-[#2284DB]/40"
                          }`}
                        >
                          <span className={`text-sm font-semibold ${active ? "text-[#2284DB]" : "text-[#05243F]"}`}>
                            {durationLabel(p.duration)}
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

              {/* Form fields */}
              {NEW_FIELDS.map((f) => (
                <FormInput
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type={f.type}
                  value={newForm[f.name] ?? ""}
                  onChange={handleNewFieldChange}
                  placeholder={f.placeholder}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* License number */}
              <FormInput
                label="License Number"
                name="licenseNumber"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="12345678"
              />

              {/* Date of Birth */}
              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />

              {/* Date of Expiry */}
              <FormInput
                label="Date of Expiry"
                name="dateOfExpiry"
                type="date"
                value={dateOfExpiry}
                onChange={(e) => setDateOfExpiry(e.target.value)}
              />

              {/* Upload license document */}
              <div>
                <p className="mb-1 text-sm font-medium text-[#05243F]">Driver's License Document</p>
                <div className="grid grid-cols-2 gap-4">
                  {existingDocs.length > 0 && (
                    <div className="relative h-[111px] overflow-hidden rounded-[17px] border-2 border-[#E1E6F4]">
                      <img
                        src={existingDocs[0]?.file_url}
                        alt="License"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    onClick={() => licenseInputRef.current?.click()}
                    className="flex h-[111px] cursor-pointer flex-col items-center justify-center rounded-[17px] border-2 border-dashed border-[#E1E6F4] bg-[#F4F5FC] transition-colors hover:border-[#2284DB] hover:bg-[#EBF4FD]"
                  >
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleLicenseFileSelect}
                      className="hidden"
                    />
                    <Icon icon="lets-icons:add-round" fontSize={28} color="#2284DB" />
                    <p className="mt-1 text-sm font-semibold text-[#05243F]">
                      {licenseFile ? licenseFile.name : "Upload Driver's License"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Renewal duration */}
              {renewPrices.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-[#05243F]">Renewal Duration</p>
                  <div className="grid grid-cols-2 gap-3">
                    {renewPrices.map((p) => {
                      const active = selectedRenewDuration === p.duration;
                      return (
                        <button
                          key={p.duration}
                          type="button"
                          onClick={() => setSelectedRenewDuration(p.duration)}
                          className={`flex flex-col items-center rounded-xl border-2 px-3 py-3 text-center transition-colors ${
                            active
                              ? "border-[#2284DB] bg-[#EBF4FD]"
                              : "border-[#E1E6F4] bg-white hover:border-[#2284DB]/40"
                          }`}
                        >
                          <span className={`text-sm font-semibold ${active ? "text-[#2284DB]" : "text-[#05243F]"}`}>
                            {durationLabel(p.duration)}
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
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#2284DB] py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1a6bb8] disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Confirm and Proceed"}
            <Icon icon="mdi:arrow-right" className="text-lg" />
          </button>
        </div>

        {/* Right: price */}
        <div className="hidden md:block">
          <p className="text-sm text-[#05243F]/50">Price:</p>
          <p className="mt-1 text-xl font-bold text-[#05243F]">
            ₦{Number(currentPrice).toLocaleString()}
          </p>
        </div>
      </form>
    </LicenseLayout>
  );
}
