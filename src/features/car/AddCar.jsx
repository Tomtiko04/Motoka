import React, { useState } from "react";
import { BsStars } from "react-icons/bs";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

export default function AddCar() {
  const [formData, setFormData] = useState({
    ownerName: "",
    address: "",
    vehicleMake: "",
    vehicleModel: "",
    registrationNo: "",
    chassisNo: "",
    engineNo: "",
    vehicleYear: "",
    vehicleColor: "",
    dateIssued: "",
    expiryDate: "",
    isRegistered: true,
    phoneNo: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      { name: "ownerName", label: "Name of Owner" },
      { name: "address", label: "Address" },
      { name: "vehicleMake", label: "Vehicle Make" },
      { name: "vehicleModel", label: "Vehicle Model" },
      { name: "chassisNo", label: "Chassis Number" },
      { name: "engineNo", label: "Engine Number" },
      { name: "vehicleYear", label: "Vehicle Year" },
      { name: "vehicleColor", label: "Vehicle Color" },
    ];

    // Add conditional required fields based on registration status
    if (formData.isRegistered) {
      requiredFields.push(
        { name: "registrationNo", label: "Registration Number" },
        { name: "dateIssued", label: "Date Issued" },
        { name: "expiryDate", label: "Expiry Date" }
      );
    } else {
      requiredFields.push({ name: "phoneNo", label: "Phone Number" });
    }

    // Check required fields
    requiredFields.forEach(({ name, label }) => {
      if (!formData[name]?.trim()) {
        newErrors[name] = `${label} is required`;
      }
    });

    // Additional validation rules
    if (formData.vehicleYear && !/^\d{4}$/.test(formData.vehicleYear)) {
      newErrors.vehicleYear = "Please enter a valid year (YYYY)";
    } else if (formData.vehicleYear) {
      const year = parseInt(formData.vehicleYear);
      const currentYear = new Date().getFullYear();
      if (year > currentYear) {
        newErrors.vehicleYear = "Year cannot be in the future";
      } else if (year < 1886) { // First automobile was invented in 1886
        newErrors.vehicleYear = "Please enter a valid year";
      }
    }

    if (formData.phoneNo && !/^\d{10,12}$/.test(formData.phoneNo.replace(/\D/g, ""))) {
      newErrors.phoneNo = "Please enter a valid phone number (10-12 digits)";
    }

    if (formData.isRegistered) {
      const today = new Date();
      const dateIssued = new Date(formData.dateIssued);
      const expiryDate = new Date(formData.expiryDate);

      if (dateIssued > today) {
        newErrors.dateIssued = "Issue date cannot be in the future";
      }

      if (expiryDate <= dateIssued) {
        newErrors.expiryDate = "Expiry date must be after issue date";
      }

      if (formData.registrationNo && !/^[A-Z0-9]{3,8}$/.test(formData.registrationNo)) {
        newErrors.registrationNo = "Please enter a valid registration number";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Submit form data to backend
      console.log("Form submitted:", formData);
      navigate("/")
      // Reset form after successful submission
      // setFormData({ ...initialFormState });
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        submit: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegistrationTypeChange = (isRegistered) => {
    setFormData((prev) => ({
      ...prev,
      isRegistered,
    }));
    // Clear errors when switching registration type
    setErrors({});
  };

  const renderField = (name, label, placeholder, type = "text") => (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#05243F]"
      >
        {label}
        <span className="text-[#A73957B0] ml-0.5">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none transition-all duration-200 ${
            errors[name] 
              ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]" 
              : formData[name]?.trim() 
                ? "border-2 border-green-500" 
                : ""
          }`}
        />
        {errors[name] && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-[#A73957B0]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {!errors[name] && formData[name]?.trim() && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-[#A73957B0] flex items-center gap-1">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <Header />
      <br />
      <div className="flex min-h-[calc(100vh-80px)] items-start justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-[476px] rounded-[20px] bg-white shadow-lg">
          {/* Fixed Header Section */}
          <div className="sticky top-0 z-10 rounded-t-[20px] bg-white p-6 pb-0 sm:p-8 sm:pb-0">
            <div className="mt-2 mb-7">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium text-[#05243F]">Add Car</h2>
                <button className="flex items-center justify-between gap-x-2 rounded-[20px] bg-white px-3 py-1.5 font-semibold text-[#EBB950] shadow-[0_2px_8px_0_rgba(235,184,80,0.32)]">
                  <BsStars />
                  <span className="text-base font-semibold">Auto Fill</span>
                </button>
              </div>
              <p className="mt-1 text-sm text-[#05243F]/40">
                Please ensure you provide accurate details.
              </p>
            </div>

            {/* Registration Type Toggle */}
            <div className="mb-6 flex gap-4">
              <button
                type="button"
                onClick={() => handleRegistrationTypeChange(true)}
                className={`rounded-[26px] border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.isRegistered
                    ? "border-[#2389E3] text-[#05243F]"
                    : "border-[#F4F5FC] text-[#697C8C]"
                }`}
              >
                Registered Car
              </button>
              <button
                type="button"
                onClick={() => handleRegistrationTypeChange(false)}
                className={`rounded-[26px] border px-4 py-2 text-sm font-medium transition-colors ${
                  !formData.isRegistered
                    ? "border-[#2389E3] text-[#05243F]"
                    : "border-[#F4F5FC] text-[#697C8C]"
                }`}
              >
                Unregistered Car
              </button>
            </div>
          </div>

          {/* Scrollable Form Section */}
          <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#EAB750] hover:scrollbar-thumb-[#EAB750] max-h-[calc(100vh-380px)] overflow-y-auto px-6 sm:px-8">
            <div className="py-2">
              <form onSubmit={handleSubmit} className="mr-4 space-y-4">
                {renderField("ownerName", "Name of Owner", "Ali Johnson")}
                {!formData.isRegistered &&
                  renderField("phoneNo", "Phone Number", "087654323456")}
                {renderField(
                  "address",
                  "Address",
                  "Jd Street, Off motoka road.",
                )}
                {renderField("vehicleMake", "Vehicle Make", "Mercedes Benz")}
                {renderField("vehicleModel", "Vehicle Model", "c300")}
                {renderField("chassisNo", "Chassis Number", "123489645432")}
                {renderField("engineNo", "Engine Number", "4567890")}
                {renderField("vehicleYear", "Vehicle Year", "2013")}
                {renderField("vehicleColor", "Vehicle Color", "Black")}

                {formData.isRegistered && (
                  <>
                    {renderField(
                      "registrationNo",
                      "Registration Number",
                      "LSD2345",
                    )}
                    {renderField(
                      "dateIssued",
                      "Date Issued",
                      "00/00/00",
                      "date",
                    )}
                    {renderField(
                      "expiryDate",
                      "Expiry Date",
                      "00/00/00",
                      "date",
                    )}
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Fixed Footer Section */}
          <div className="sticky bottom-0 mt-4 flex justify-center rounded-b-[20px] bg-white p-6 pt-4 sm:p-8 sm:pt-4">
            {errors.submit && (
              <p className="mb-4 text-center text-sm text-[#A73957B0]">{errors.submit}</p>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#A73957] focus:ring-2 focus:ring-[#2389E3] focus:ring-offset-2 focus:outline-none active:scale-95 ${
                isSubmitting ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {isSubmitting ? "Processing..." : "Confirm and Proceed"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
