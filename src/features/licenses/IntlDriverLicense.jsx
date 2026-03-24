import React, { useRef, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { LuUpload } from "react-icons/lu";
import LicenseLayout from "./components/LicenseLayout";
import ActionButton from "./components/ActionButton";
import FormInput from "./components/FormInput";
import { useDriversLicensePaymentOptions } from "./driverslicense/useDriversLicense";
import { upsertInternationalDriversLicenseApplication } from "../../services/apiDriversLicense";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const LICENSE_YEARS = ["1 year", "2 years", "3 years", "4 years"];

export default function InternationalDriversLicense() {
  const navigate = useNavigate();
  const licenseInputRef = useRef(null);
  const passportInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    placeOfBirth: "",
    stateOfOrigin: "",
    localGovernment: "",
    bloodGroup: BLOOD_GROUPS[0],
    height: "",
    occupation: "",
    nextOfKin: "",
    nextOfKinNumber: "",
    motherName: "",
    licenseNumber: "",
    licenseYears: LICENSE_YEARS[0],
    driversLicense: null,
    passportPhoto: null,
  });
  const [noLicense, setNoLicense] = useState(false);
  const [errors, setErrors] = useState({});

  const { isPaymentOptions } = useDriversLicensePaymentOptions();

  // isPaymentOptions is already the flat array returned by getDriversLicensePaymentOptions
  const internationalPrice = useMemo(() => {
    const list = Array.isArray(isPaymentOptions) ? isPaymentOptions : [];
    const intl = list.find(
      (opt) =>
        String(opt.license_type || "").toLowerCase() === "new" &&
        String(opt.duration || "").toLowerCase() === "international",
    );
    return intl ? Number(intl.price) : null;
  }, [isPaymentOptions]);

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }
    setFormData((prev) => ({ ...prev, [fieldName]: file }));
    toast.success("File uploaded successfully");
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number";
    }
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.placeOfBirth) newErrors.placeOfBirth = "Place of birth is required";
    if (!formData.stateOfOrigin) newErrors.stateOfOrigin = "State of origin is required";
    if (!formData.localGovernment) newErrors.localGovernment = "Local government is required";
    if (!formData.height) newErrors.height = "Height is required";
    if (!formData.occupation) newErrors.occupation = "Occupation is required";
    if (!formData.nextOfKin) newErrors.nextOfKin = "Next of Kin is required";
    if (!formData.nextOfKinNumber) newErrors.nextOfKinNumber = "Next of Kin number is required";
    if (!formData.motherName) newErrors.motherName = "Mother name is required";
    if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (noLicense && !validateForm()) return;

    try {
      if (noLicense) {
        await upsertInternationalDriversLicenseApplication(formData);
      }

      const licenseAmount = internationalPrice ?? 0;

      navigate("/licenses/confirm-request", {
        state: {
          type: "drivers_license",
          items: [
            { name: "International Driver's License", amount: licenseAmount },
          ],
          details: {
            license_type: "new",
            duration: "international",
            description: "International driver's license",
            years: null,
          },
          formData,
        },
      });
    } catch (error) {
      console.error("Failed to save international license application:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save your application. Please try again.",
      );
    }
  };

  return (
    <LicenseLayout
      title="International Drivers License"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_170px]">
        {/* Main content */}
        {!noLicense ? (
          <div>
            {/* Hidden file input for existing driver's license */}
            <input
              id="drivers-license-upload"
              type="file"
              accept="image/*,application/pdf"
              ref={licenseInputRef}
              onChange={(e) => handleFileChange(e, "driversLicense")}
              className="hidden"
            />
            <label
              htmlFor="drivers-license-upload"
              className="block cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-12">
                <span>
                  <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                </span>
                <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                  Upload Existing Nigeria <br /> Driver's license
                </p>
                {formData.driversLicense && (
                  <p className="mt-2 text-center text-xs text-[#45A1F2]">
                    {formData.driversLicense.name}
                  </p>
                )}
              </div>
            </label>
            <p className="mt-4 mb-4 text-center text-xs text-[#697B8C]/64">
              Don't have an Existing Drivers' License?
              <br />
              Tap
              <span
                onClick={() => setNoLicense(true)}
                className="ml-1 cursor-pointer text-[#2284DB] underline"
              >
                here
              </span>{" "}
              to fill a form.
            </p>
            <div className="mt-4 flex justify-center sm:mt-5">
              <ActionButton
                className="w-full md:w-[60%]"
                onClick={handleSubmit}
              >
                Confirm and Proceed
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto pr-4">
            {/* Hidden file input for passport photo */}
            <input
              id="passport-photo-upload"
              type="file"
              accept="image/*"
              ref={passportInputRef}
              onChange={(e) => handleFileChange(e, "passportPhoto")}
              className="hidden"
            />
            <label
              htmlFor="passport-photo-upload"
              className="block cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                <span>
                  <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                </span>
                <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                  Upload Passport Photograph
                </p>
                {formData.passportPhoto && (
                  <p className="mt-2 text-center text-xs text-[#45A1F2]">
                    {formData.passportPhoto.name}
                  </p>
                )}
              </div>
            </label>

            <div className="mt-4 space-y-3.5">
              <FormInput
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Ali Johnson"
                error={errors.fullName}
                required
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                error={errors.email}
                required
              />
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="08765432456"
                error={errors.phoneNumber}
                required
              />
              <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Jd Street, Off motoko road."
                error={errors.address}
                required
              />
              <FormInput
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={errors.dateOfBirth}
                placeholder="04-06-2001"
                required
              />
              <FormInput
                label="Place of Birth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                error={errors.placeOfBirth}
                placeholder="Nigeria"
                required
              />
              <FormInput
                label="State of Origin"
                name="stateOfOrigin"
                value={formData.stateOfOrigin}
                onChange={handleInputChange}
                error={errors.stateOfOrigin}
                placeholder="Ogun"
                required
              />
              <FormInput
                label="Local Government"
                name="localGovernment"
                value={formData.localGovernment}
                onChange={handleInputChange}
                error={errors.localGovernment}
                placeholder="Ijebu Ode"
                required
              />
              <div>
                <p className="mb-1 text-sm font-medium text-[#05243F]">
                  Blood Group
                </p>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 text-sm font-normal text-[#05243F] transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none"
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <FormInput
                label="Height (M)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleInputChange}
                error={errors.height}
                placeholder="1.5"
                required
              />
              <FormInput
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                error={errors.occupation}
                placeholder="Software Engineer"
                required
              />
              <FormInput
                label="Next of Kin"
                name="nextOfKin"
                value={formData.nextOfKin}
                onChange={handleInputChange}
                error={errors.nextOfKin}
                placeholder="Tomtiko"
                required
              />
              <FormInput
                label="Next of Kin's Phone Number"
                name="nextOfKinNumber"
                type="tel"
                value={formData.nextOfKinNumber}
                onChange={handleInputChange}
                error={errors.nextOfKinNumber}
                placeholder="08012345678"
                required
              />
              <FormInput
                label="Mother's Maiden Name"
                name="motherName"
                value={formData.motherName}
                onChange={handleInputChange}
                error={errors.motherName}
                placeholder="Adaeze"
                required
              />
              <FormInput
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                error={errors.licenseNumber}
                placeholder="ABC123456789"
                required
              />
              <div>
                <p className="mb-1 text-sm font-medium text-[#05243F]">
                  License Years
                </p>
                <select
                  name="licenseYears"
                  value={formData.licenseYears}
                  onChange={handleInputChange}
                  className="w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 text-sm font-normal text-[#05243F] transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none"
                >
                  {LICENSE_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                <ActionButton
                  onClick={handleSubmit}
                  className="w-full md:w-[60%]"
                >
                  Confirm and Proceed
                </ActionButton>
              </div>
            </div>
          </div>
        )}

        {/* Price column */}
        <div className="flex flex-col items-start md:items-end">
          <p className="mt-1 text-sm font-normal text-[#05243F]">Price:</p>
          <p className="text-xl font-semibold text-[#05243F]">
            {internationalPrice !== null
              ? `₦${Number(internationalPrice).toLocaleString()}`
              : "—"}
          </p>
        </div>
      </div>
    </LicenseLayout>
  );
}
