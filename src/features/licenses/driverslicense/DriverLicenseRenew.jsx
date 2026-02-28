import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import LicenseLayout from "../components/LicenseLayout";
import { useDriverLicensePrices } from "./useDriversLicense";
import { getDriverLicenseApplication, upsertDriverLicenseApplication } from "../../../services/apiDriverLicenseApplication";
import { getDriverLicenseDocuments } from "../../../services/apiDocument";
import { uploadDocument, buildDriverLicenseFormData } from "../../../services/apiDocument";
import { toast } from "react-hot-toast";

const LICENSE_SAMPLE_IMG = "https://via.placeholder.com/200x120?text=License+Example";

export default function DriverLicenseRenew() {
  const navigate = useNavigate();
  const licenseInputRef = useRef(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dateOfExpiry, setDateOfExpiry] = useState("");
  const [licenseDocUrl, setLicenseDocUrl] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [existingDocs, setExistingDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { prices } = useDriverLicensePrices();
  const priceRenew = prices?.find((p) => p.license_type === "renew")?.price ?? 0;

  const isExpired = dateOfExpiry ? new Date(dateOfExpiry) < new Date() : false;

  useEffect(() => {
    const load = async () => {
      try {
        const [app, docs] = await Promise.all([
          getDriverLicenseApplication("renew"),
          getDriverLicenseDocuments(),
        ]);
        if (app) {
          setLicenseNumber(app.license_number ?? "");
          const fmt = (d) => (d ? String(d).slice(0, 10) : "");
          setDateOfBirth(fmt(app.date_of_birth));
          setDateOfExpiry(fmt(app.date_of_expiry));
          setLicenseDocUrl(app.license_document_url);
        }
        setExistingDocs(docs || []);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleLicenseFileSelect = async (e) => {
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

  const handleConfirmAndProceed = async () => {
    let docUrl = licenseDocUrl;
    if (licenseFile) {
      setIsSubmitting(true);
      try {
        const fd = buildDriverLicenseFormData(licenseFile);
        const res = await uploadDocument(fd);
        const doc = res?.data?.document || res?.document;
        if (doc?.file_url) docUrl = doc.file_url;
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to upload license");
        setIsSubmitting(false);
        return;
      }
    }

    if (!licenseNumber || !dateOfBirth || !dateOfExpiry) {
      toast.error("Please fill License Number, Date of Birth, and Date of Expiry");
      setIsSubmitting(false);
      return;
    }

    try {
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
          price: priceRenew,
          licenseNumber,
          dateOfBirth,
          dateOfExpiry,
          licenseDocumentUrl: docUrl,
        },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
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
      subTitle={
        isExpired
          ? "Your Driver's License has expired. To continue using the service, you must re-apply. Re-upload your driver's license now!"
          : "All licenses are issued by government, we will only do legal stuff that helps you with documents."
      }
      mainContentTitle=""
      backPath="/licenses/drivers-license"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {isExpired && (
          <div className="rounded-xl bg-amber-50 px-4 py-3">
            <span className="inline-block rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold text-white">
              Expired
            </span>
          </div>
        )}

        {/* License details (Figma Licenses screen) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-[#E1E6F4] bg-white px-4 py-3">
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="12345678"
              className="flex-1 bg-transparent text-sm text-[#05243F] placeholder:text-[#697C8C]/60 focus:outline-none"
            />
            <span className="ml-2 text-sm font-semibold text-[#2284DB]">
              ₦{Number(priceRenew).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#E1E6F4] bg-white px-4 py-3">
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#05243F] focus:outline-none"
            />
            <span className="ml-2 text-sm font-semibold text-[#2284DB]">
              ₦{Number(priceRenew).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#E1E6F4] bg-white px-4 py-3">
            <input
              type="date"
              value={dateOfExpiry}
              onChange={(e) => setDateOfExpiry(e.target.value)}
              className="flex-1 bg-transparent text-sm text-[#05243F] focus:outline-none"
            />
            <span className="ml-2 text-sm font-semibold text-[#2284DB]">
              ₦{Number(priceRenew).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Upload Driver's License (Figma expired + upload) */}
        <div className="grid grid-cols-2 gap-4">
          {existingDocs.length > 0 && (
            <div className="rounded-[17px] overflow-hidden h-[111px] relative border-2 border-[#E1E6F4]">
              <img
                src={existingDocs[0]?.file_url}
                alt="License"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[#05243F]/60 flex items-center justify-center">
                {isExpired && (
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    Expired
                  </span>
                )}
              </div>
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
            <p className="mt-1 text-sm font-semibold text-[#05243F]">Upload Driver's License</p>
          </div>
        </div>

        {/* Example */}
        <div className="rounded-xl border border-[#E1E6F4] bg-white p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#05243F]/50">Example</p>
          <img
            src={LICENSE_SAMPLE_IMG}
            alt="License example"
            className="h-24 w-auto rounded-lg object-contain"
          />
        </div>

        <button
          onClick={handleConfirmAndProceed}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2284DB] py-4 text-base font-semibold text-white shadow-md transition-all hover:bg-[#1a6bb8] disabled:opacity-60"
        >
          {isSubmitting ? "Uploading..." : "Confirm and Proceed"}
          <Icon icon="mdi:arrow-right" className="text-lg" />
        </button>
      </div>
    </LicenseLayout>
  );
}
