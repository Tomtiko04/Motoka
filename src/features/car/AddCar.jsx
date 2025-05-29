import React, { useState, useEffect, useMemo } from "react";
import { BsStars } from "react-icons/bs";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAddCar } from "./useCar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "../../services/apiClient";
import PropTypes from "prop-types";

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  name,
  filterKey,
  allowCustom = true,
  disabled = false,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option[filterKey].toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, filterKey]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option[filterKey] } });
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    if (allowCustom) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#05243F]"
      >
        {label}
        <span className="ml-0.5 text-[#A73957B0]">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
              : value
                ? "border-2 border-green-500"
                : ""
          }`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
          </div>
        )}
        {!isLoading && !error && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        {isOpen && filteredOptions.length > 0 && (
          <div className="ring-opacity-5 absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer px-4 py-2 text-sm text-[#05243F] hover:bg-[#F4F5FC]"
                onClick={() => handleSelect(option)}
              >
                {option[filterKey]}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#A73957B0]">
          {error}
        </p>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    [PropTypes.string]: PropTypes.string
  })).isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  filterKey: PropTypes.string.isRequired,
  allowCustom: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool
};

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

  const [carTypes, setCarTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addCar, isAdding } = useAddCar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarTypes = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get("/car-types");
        if (data.success) {
          setCarTypes(data.data);
        } else {
          toast.error("Failed to load car data. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching car types:", error);
        toast.error("Failed to load car data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarTypes();
  }, []);

  const uniqueMakes = useMemo(() => 
    [...new Set(carTypes.map((car) => car.make))].map(
      (make) => ({ id: make, make }),
    ),
    [carTypes]
  );

  const uniqueModels = useMemo(() => 
    carTypes
      .filter((car) => car.make === formData.vehicleMake)
      .map((car) => ({ id: car.id, model: car.model })),
    [carTypes, formData.vehicleMake]
  );

  const uniqueYears = useMemo(() => 
    [...new Set(carTypes.map((car) => car.year))].map(
      (year) => ({ id: year, year }),
    ),
    [carTypes]
  );

  const uniqueColors = useMemo(() => [
    { id: 1, color: "Black" },
    { id: 2, color: "White" },
    { id: 3, color: "Silver" },
    { id: 4, color: "Gray" },
    { id: 5, color: "Red" },
    { id: 6, color: "Blue" },
    { id: 7, color: "Green" },
    { id: 8, color: "Brown" },
    { id: 9, color: "Beige" },
    { id: 10, color: "Gold" },
  ], []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "vehicleMake" && {
        vehicleModel: "",
        vehicleYear: "",
      }),
    }));
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
        { name: "expiryDate", label: "Expiry Date" },
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
      } else if (year < 1886) {
        // First automobile was invented in 1886
        newErrors.vehicleYear = "Please enter a valid year";
      }
    }

    if (
      formData.phoneNo &&
      !/^\d{10,12}$/.test(formData.phoneNo.replace(/\D/g, ""))
    ) {
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

      if (
        formData.registrationNo &&
        !/^[A-Z0-9]{3,8}$/.test(formData.registrationNo)
      ) {
        newErrors.registrationNo = "Please enter a valid registration number";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const loadingToast = toast.loading("Registering car...");
      addCar(formData, {
        onSuccess: () => {
          toast.dismiss(loadingToast);
          navigate("/");
        },
        onError: () => {
          toast.dismiss(loadingToast);
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        submit: "Failed to submit form. Please try again.",
      });
    }
  };

  const handleRegistrationTypeChange = (isRegistered) => {
    setFormData((prev) => ({
      ...prev,
      isRegistered,
    }));
    setErrors({});
  };

  const renderDateField = (name, label) => (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#05243F]"
      >
        {label}
        <span className="ml-0.5 text-[#A73957B0]">*</span>
      </label>
      <div className="relative">
        <div className="w-full">
          <DatePicker
            id={name}
            name={name}
            selected={formData[name] ? new Date(formData[name]) : null}
            onChange={(date) => {
              const formattedDate = date.toISOString().split('T')[0];
              handleChange({ 
                target: { 
                  name, 
                  value: formattedDate
                } 
              });
            }}
            dateFormat="dd/MM/yyyy"
            className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none ${
              errors[name]
                ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
                : formData[name]
                  ? "border-2 border-green-500"
                  : ""
            }`}
            placeholderText={`Select ${label.toLowerCase()}`}
            maxDate={name === "dateIssued" ? new Date() : undefined}
            minDate={
              name === "expiryDate"
                ? formData.dateIssued
                  ? new Date(formData.dateIssued)
                  : new Date()
                : undefined
            }
            wrapperClassName="w-full"
          />
        </div>
        {!errors[name] && formData[name] && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#A73957B0]">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const renderField = (name, label, placeholder, type = "text") => (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#05243F]"
      >
        {label}
        <span className="ml-0.5 text-[#A73957B0]">*</span>
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none ${
            errors[name]
              ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
              : formData[name]?.trim()
                ? "border-2 border-green-500"
                : ""
          }`}
        />
        {errors[name] && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-[#A73957B0]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        {!errors[name] && formData[name]?.trim() && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="h-5 w-5 text-green-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {errors[name] && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#A73957B0]">
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
                <SearchableSelect
                  label="Vehicle Make"
                  name="vehicleMake"
                  value={formData.vehicleMake}
                  onChange={handleChange}
                  options={uniqueMakes}
                  placeholder="Select vehicle make"
                  error={errors.vehicleMake}
                  filterKey="make"
                  isLoading={isLoading}
                />
                <SearchableSelect
                  label="Vehicle Model"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  options={uniqueModels}
                  placeholder="Select vehicle model"
                  error={errors.vehicleModel}
                  filterKey="model"
                  disabled={!formData.vehicleMake}
                  isLoading={isLoading}
                />
                <SearchableSelect
                  label="Vehicle Year"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleChange}
                  options={uniqueYears}
                  placeholder="Select vehicle year"
                  error={errors.vehicleYear}
                  filterKey="year"
                  isLoading={isLoading}
                />
                <SearchableSelect
                  label="Vehicle Color"
                  name="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={handleChange}
                  options={uniqueColors}
                  placeholder="Select vehicle color"
                  error={errors.vehicleColor}
                  filterKey="color"
                />
                {renderField("chassisNo", "Chassis Number", "123489645432")}
                {renderField("engineNo", "Engine Number", "4567890")}

                {formData.isRegistered && (
                  <>
                    {renderField(
                      "registrationNo",
                      "Registration Number",
                      "LSD2345",
                    )}
                    {renderDateField("dateIssued", "Date Issued")}
                    {renderDateField("expiryDate", "Expiry Date")}
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Fixed Footer Section */}
          <div className="sticky bottom-0 mt-4 flex justify-center rounded-b-[20px] bg-white p-6 pt-4 sm:p-8 sm:pt-4">
            {errors.submit && (
              <p className="mb-4 text-center text-sm text-[#A73957B0]">
                {errors.submit}
              </p>
            )}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isAdding}
              className={`rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] active:scale-95 ${
                isAdding ? "cursor-not-allowed opacity-70" : ""
              }`}
            >
              {isAdding ? "Processing..." : "Confirm and Proceed"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
