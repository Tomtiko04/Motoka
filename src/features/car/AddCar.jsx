import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAddCar } from "./useCar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "../../services/apiClient";
import PropTypes from "prop-types";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BsStars } from "react-icons/bs";

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
          className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
              : value
                ? "border-2 border-green-500"
                : ""
          }`}
        />
        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2389E3] border-t-transparent" />
          </div>
        )}
        {!isLoading && value && (
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
      {/* Might remove TODO */}
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

const registeredSchema = yup.object().shape({
  ownerName: yup.string().required("Name of Owner is required"),
  address: yup.string().required("Address is required"),
  vehicleMake: yup.string().required("Vehicle Make is required"),
  vehicleModel: yup.string().required("Vehicle Model is required"),
  chassisNo: yup.string().required("Chassis Number is required"),
  engineNo: yup.string().required("Engine Number is required"),
  vehicleYear: yup
    .string()
    .required("Vehicle Year is required")
    .matches(/^\d{4}$/, "Please enter a valid year (YYYY)"),
  vehicleColor: yup.string().required("Vehicle Color is required"),
  registrationNo: yup
    .string()
    .required("Registration Number is required")
    .matches(/^[A-Za-z0-9]{3,8}$/, "Please enter a valid registration number (3-8 alphanumeric characters)"),
  dateIssued: yup.string().required("Date Issued is required"),
  expiryDate: yup.string().required("Expiry Date is required"),
});

const unregisteredSchema = yup.object().shape({
  ownerName: yup.string().required("Name of Owner is required"),
  address: yup.string().required("Address is required"),
  vehicleMake: yup.string().required("Vehicle Make is required"),
  vehicleModel: yup.string().required("Vehicle Model is required"),
  chassisNo: yup.string().required("Chassis Number is required"),
  engineNo: yup.string().required("Engine Number is required"),
  vehicleYear: yup
    .string()
    .required("Vehicle Year is required")
    .matches(/^\d{4}$/, "Please enter a valid year (YYYY)"),
  vehicleColor: yup.string().required("Vehicle Color is required"),
  phoneNo: yup
    .string()
    .required("Phone Number is required")
    .matches(/^(0\d{10}|(\+234|234)\d{10})$/, "Enter a valid Nigerian phone number"),
});

const defaultRegistered = {
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
};
const defaultUnregistered = {
  ownerName: "",
  address: "",
  vehicleMake: "",
  vehicleModel: "",
  chassisNo: "",
  engineNo: "",
  vehicleYear: "",
  vehicleColor: "",
  phoneNo: "",
};

export default function AddCar() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [carTypes, setCarTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addCar, isAdding } = useAddCar();
  const navigate = useNavigate();

  // Choose schema and default values based on car type
  const schema = isRegistered ? registeredSchema : unregisteredSchema;
  const defaultValues = isRegistered ? defaultRegistered : defaultUnregistered;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: "onChange",
  });

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

  // Reset form when toggling car type
  useEffect(() => {
    reset(defaultValues);
  }, [isRegistered]);

  const uniqueMakes = useMemo(
    () =>
      [...new Set(carTypes.map((car) => car.make))].map((make) => ({
        id: make,
        make,
      })),
    [carTypes],
  );

  const uniqueModels = useMemo(
    () =>
      carTypes
        .filter(
          (car) =>
            car.make ===
            (isRegistered
              ? defaultRegistered.vehicleMake
              : defaultUnregistered.vehicleMake),
        )
        .map((car) => ({ id: car.id, model: car.model })),
    [carTypes, isRegistered],
  );

  const uniqueYears = useMemo(
    () =>
      [...new Set(carTypes.map((car) => car.year))].map((year) => ({
        id: year,
        year,
      })),
    [carTypes],
  );

  const uniqueColors = useMemo(
    () => [
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
    ],
    [],
  );

  const onSubmit = async (data) => {
    try {
      const loadingToast = toast.loading("Registering car...");
      addCar(
        { ...data, isRegistered },
        {
          onSuccess: () => {
            toast.dismiss(loadingToast);
            navigate("/");
          },
          onError: () => {
            toast.dismiss(loadingToast);
          },
        },
      );
    } catch {
      toast.error("Failed to submit form. Please try again.");
    }
  };

  const handleRegistrationTypeChange = (reg) => {
    setIsRegistered(reg);
  };

  // Render field helpers
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
          {...register(name)}
          placeholder={placeholder}
          className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none ${
            errors[name]
              ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
              : name?.trim()
                ? "border-2 border-green-500"
                : ""
          }`}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#A73957B0]">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  // Date field with react-datepicker
  const renderDateField = (name, label) => (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-[#05243F]"
      >
        {label}
        <span className="ml-0.5 text-[#A73957B0]">*</span>
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <DatePicker
            id={name}
            selected={field.value ? new Date(field.value) : null}
            onChange={(date) =>
              field.onChange(date ? date.toISOString().split("T")[0] : "")
            }
            dateFormat="dd/MM/yyyy"
            className={`block w-full rounded-lg bg-[#F4F5FC] px-4 py-3 text-sm text-[#05243F] transition-all duration-200 placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none ${
              errors[name]
                ? "border-2 border-[#A73957B0] focus:border-[#A73957B0]"
                : name
                  ? "border-2 border-green-500"
                  : ""
            }`}
            placeholderText={`Select ${label.toLowerCase()}`}
            maxDate={name === "dateIssued" ? new Date() : undefined}
            minDate={
              name === "expiryDate"
                ? control._formValues.dateIssued
                  ? new Date(control._formValues.dateIssued)
                  : new Date()
                : undefined
            }
            wrapperClassName="w-full"
          />
        )}
      />
      {errors[name] && (
        <p className="mt-1 flex items-center gap-1 text-sm text-[#A73957B0]">
          {errors[name].message}
        </p>
      )}
    </div>
  );

  // Auto-fill function to populate form with sample data
  const handleAutoFill = () => {
    const sampleNames = [
      "John Doe",
      "Sarah Johnson",
      "Michael Brown",
      "Emily Davis",
      "David Wilson",
    ];
    const sampleAddresses = [
      "123 Main Street, Lagos, Nigeria",
      "456 Victoria Island, Lagos, Nigeria",
      "789 Ikeja, Lagos, Nigeria",
      "321 Lekki Phase 1, Lagos, Nigeria",
      "654 Surulere, Lagos, Nigeria",
    ];
    const sampleColors = ["Black", "White", "Silver", "Gray", "Red", "Blue"];
    const samplePhoneNumbers = [
      "08012345678",
      "08123456789",
      "07012345678",
      "09012345678",
    ];

    const randomName =
      sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomAddress =
      sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
    const randomColor =
      sampleColors[Math.floor(Math.random() * sampleColors.length)];
    const randomPhone =
      samplePhoneNumbers[Math.floor(Math.random() * samplePhoneNumbers.length)];

    const isRegistered = Math.random() > 0.3;

    let randomIssueDate, randomExpiryDate;
    if (isRegistered) {
      const today = new Date();
      randomIssueDate = new Date(
        today.getFullYear() - Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      );
      randomExpiryDate = new Date(
        randomIssueDate.getFullYear() + 5,
        randomIssueDate.getMonth(),
        randomIssueDate.getDate(),
      );
    }

    let selectedMake = "Toyota";
    let selectedModel = "Camry";
    let selectedYear = "2020";

    if (carTypes.length > 0) {
      const randomCar = carTypes[Math.floor(Math.random() * carTypes.length)];
      selectedMake = randomCar.make;
      selectedModel = randomCar.model;
      selectedYear = randomCar.year;
    }

    const registrationNumber = `LSD${Math.floor(Math.random() * 9000) + 1000}`;
    const chassisNumber = `JTDKN3DU0E${Math.floor(Math.random() * 9000000) + 1000000}`;
    const engineNumber = `2AR-FE${Math.floor(Math.random() * 900000) + 100000}`;

    const sampleData = {
      ownerName: randomName,
      address: randomAddress,
      vehicleMake: selectedMake,
      vehicleModel: selectedModel,
      registrationNo: isRegistered ? registrationNumber : "",
      chassisNo: chassisNumber,
      engineNo: engineNumber,
      vehicleYear: selectedYear,
      vehicleColor: randomColor,
      dateIssued: isRegistered
        ? randomIssueDate.toISOString().split("T")[0]
        : "",
      expiryDate: isRegistered
        ? randomExpiryDate.toISOString().split("T")[0]
        : "",
      isRegistered: isRegistered,
      phoneNo: isRegistered ? "" : randomPhone,
    };

    setFormData(sampleData);

    setErrors({});

    toast.success(
      `Form auto-filled with ${isRegistered ? "registered" : "unregistered"} car data!`,
    );
  };

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
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="flex items-center justify-between gap-x-2 rounded-[20px] bg-white px-3 py-1.5 font-semibold text-[#EBB950] shadow-[0_2px_8px_0_rgba(235,184,80,0.32)] transition-colors duration-200 hover:bg-[#FFF4DD]"
                >
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
                  isRegistered
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
                  !isRegistered
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
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mr-4 space-y-4"
              >
                {renderField("ownerName", "Name of Owner", "Ali Johnson")}
                {!isRegistered &&
                  renderField("phoneNo", "Phone Number", "08012345678")}
                {renderField(
                  "address",
                  "Address",
                  "Jd Street, Off motoka road.",
                )}
                {/* Vehicle Make */}
                <Controller
                  control={control}
                  name="vehicleMake"
                  render={({ field }) => (
                    <SearchableSelect
                      label="Vehicle Make"
                      name="vehicleMake"
                      value={field.value}
                      onChange={field.onChange}
                      options={uniqueMakes}
                      placeholder="Select vehicle make"
                      error={errors.vehicleMake?.message}
                      filterKey="make"
                      isLoading={isLoading}
                    />
                  )}
                />
                {/* Vehicle Model */}
                <Controller
                  control={control}
                  name="vehicleModel"
                  render={({ field }) => (
                    <SearchableSelect
                      label="Vehicle Model"
                      name="vehicleModel"
                      value={field.value}
                      onChange={field.onChange}
                      options={uniqueModels}
                      placeholder="Select vehicle model"
                      error={errors.vehicleModel?.message}
                      filterKey="model"
                      disabled={!control._formValues.vehicleMake}
                      isLoading={isLoading}
                    />
                  )}
                />
                {/* Vehicle Year */}
                <Controller
                  control={control}
                  name="vehicleYear"
                  render={({ field }) => (
                    <SearchableSelect
                      label="Vehicle Year"
                      name="vehicleYear"
                      value={field.value}
                      onChange={field.onChange}
                      options={uniqueYears}
                      placeholder="Select vehicle year"
                      error={errors.vehicleYear?.message}
                      filterKey="year"
                      isLoading={isLoading}
                    />
                  )}
                />
                {/* Vehicle Color */}
                <Controller
                  control={control}
                  name="vehicleColor"
                  render={({ field }) => (
                    <SearchableSelect
                      label="Vehicle Color"
                      name="vehicleColor"
                      value={field.value}
                      onChange={field.onChange}
                      options={uniqueColors}
                      placeholder="Select vehicle color"
                      error={errors.vehicleColor?.message}
                      filterKey="color"
                    />
                  )}
                />
                {renderField("chassisNo", "Chassis Number", "123489645432")}
                {renderField("engineNo", "Engine Number", "4567890")}
                {isRegistered && (
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
                <div className="sticky bottom-0 mt-4 flex justify-center rounded-b-[20px] bg-white p-6 pt-4 sm:p-8 sm:pt-4">
                  <button
                    type="submit"
                    disabled={isAdding}
                    className={`rounded-3xl bg-[#2389E3] px-4 py-2 text-base font-semibold text-white transition-all duration-300 hover:bg-[#FFF4DD] hover:text-[#05243F] active:scale-95 ${
                      isAdding ? "cursor-not-allowed opacity-70" : ""
                    }`}
                  >
                    {isAdding ? "Processing..." : "Confirm and Proceed"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}