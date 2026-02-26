import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaCarAlt, FaCheck } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import LicenseLayout from "../components/LicenseLayout";
import FormInput from "../components/FormInput";
import ActionButton from "../components/ActionButton";
import MercedesLogo from "../../../assets/images/mercedes-logo.png";
import { useGetCars, usePlateNumberPrices } from "../../car/useCar";
import { applyPlateNumber } from "../../../services/apiCar";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function PlateDetails() {
  const { type } = useParams();
  const navigate = useNavigate();
  const dropdownRefDealer = useRef(null);
  const dropdownRefReprint = useRef(null);
  const [licenseType, setLicenseType] = useState(type);
  const [dealerDropdownOpen, setDealerDropdownOpen] = useState(false);
  const [reprintDropdownOpen, setReprintDropdownOpen] = useState(false);
  const [dealerShipType, setDealerShipType] = useState("Dealership");
  const [reprintType, setReprintType] = useState("Reprint");
  const [selectedCarSlug, setSelectedCarSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState({
    cac_document: null,
    letterhead: null,
    means_of_identification: null,
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    placeOfBirth: "",
    stateOfOrigin: "",
    localGovernment: "",
    height: "",
    occupation: "",
    nextOfKin: "",
    nextOfKinNumber: "",
    motherName: "",
    licenseNumber: "",
    preferredNameNumber: "",
    chassisNumber: "",
    engineNumber: "",
    color: "",
    carmake: "",
    cartype: "",
    passportPhoto: null,
    affidavit: null,
  });
  const [errors, _setErrors] = useState({});

  const [carSelectorOpen, setCarSelectorOpen] = useState(false);
  const dropdownRefCar = useRef(null);
  const { cars, isLoading: isLoadingCars } = useGetCars();
  const { getPrice, isLoading: isLoadingPrices } = usePlateNumberPrices();

  const carList = cars?.cars || cars || [];
  const selectedCar = carList.find((c) => c.slug === selectedCarSlug) || null;

  // Derive the current price based on active plate type / sub-type
  const currentPrice = (() => {
    if (licenseType === "new-plate-number") return getPrice("Normal");
    if (licenseType === "Customized") return getPrice("Customized");
    if (licenseType === "Dealership") return getPrice("Dealership", dealerShipType);
    if (licenseType === "reprint") return getPrice("Reprint");
    return null;
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleLicenseTypeChange = (selectedType) => {
    if (selectedType === "reprint") {
      navigate("/licenses/plate-number/reprint");
    } else {
      navigate("/licenses/plate-number/new-plate-number");
    }
    setLicenseType(selectedType);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefCar.current &&
        !dropdownRefCar.current.contains(event.target)
      ) {
        setCarSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefDealer.current &&
        !dropdownRefDealer.current.contains(event.target)
      ) {
        setDealerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRefReprint.current &&
        !dropdownRefReprint.current.contains(event.target)
      ) {
        setReprintDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-fill form fields when a car is selected from the garage
  useEffect(() => {
    if (!selectedCar) return;
    setFormData((prev) => ({
      ...prev,
      fullName: selectedCar.name_of_owner || "",
      phoneNumber: selectedCar.phone_number || "",
      address: selectedCar.address || "",
      chassisNumber: selectedCar.chasis_no || "",
      engineNumber: selectedCar.engine_no || "",
      color: selectedCar.vehicle_color || "",
      carmake: selectedCar.vehicle_make || "",
      cartype: selectedCar.vehicle_model || "",
    }));
  }, [selectedCarSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (licenseType === "reprint") {
      setReprintType("Cooperate");
    }
  }, [licenseType]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!selectedCarSlug) {
      toast.error("Please select a car from your garage");
      return;
    }

    // Map frontend licenseType to backend type value
    const plateTypeMap = {
      "new-plate-number": "Normal",
      Customized: "Customized",
      Dealership: "Dealership",
    };
    const backendType = plateTypeMap[licenseType] || "Normal";

    setIsSubmitting(true);
    try {
      let payload;

      if (backendType === "Dealership") {
        // Use FormData for file uploads
        payload = new FormData();
        payload.append("type", backendType);
        if (dealerShipType && dealerShipType !== "Dealership") {
          payload.append("business_type", dealerShipType);
        }
        if (files.cac_document)
          payload.append("cac_document", files.cac_document);
        if (files.letterhead) payload.append("letterhead", files.letterhead);
        if (files.means_of_identification)
          payload.append(
            "means_of_identification",
            files.means_of_identification,
          );
      } else if (backendType === "Customized") {
        if (!formData.preferredNameNumber) {
          toast.error("Preferred name is required for customized plates");
          setIsSubmitting(false);
          return;
        }
        payload = {
          type: backendType,
          preferred_name: formData.preferredNameNumber,
        };
      } else {
        payload = { type: backendType };
      }

      await applyPlateNumber(selectedCarSlug, payload);
      toast.success("Application submitted! Review your order.");
      navigate("/licenses/plate-number/order-summary", {
        state: {
          carSlug: selectedCarSlug,
          car: selectedCar,
          licenseType,
          plateTypeName: backendType,
          subType:
            backendType === "Dealership" &&
            dealerShipType !== "Dealership"
              ? dealerShipType
              : null,
          price: currentPrice,
        },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const info = useMemo(() => {
    if (type === "new-plate-number") {
      return {
        title: "New Plate Number",
        subTitle:
          "All licenses are issued by government, we are only an agent that helps you with the process.",
      };
    } else if (type === "reprint") {
      return {
        title: "Reprint Plate Number",
        subTitle:
          "All licenses are issued by government, we are only an agent that helps you with the process.",
      };
    } else {
      return {
        title: "Plate Request",
        subTitle: "Fill in the details below to proceed.",
      };
    }
  }, [type]);

  return (
    <LicenseLayout title={info.title} subTitle={info.subTitle}>
      <div className="mx-auto w-full max-w-3xl px-4 md:px-0">
        {/* Car Selector */}
        <div className="relative mb-6" ref={dropdownRefCar}>
          <label className="mb-2 block text-sm font-medium text-[#05243F]">
            Select Car from Garage <span className="text-red-500">*</span>
          </label>

          {/* Trigger button */}
          <button
            type="button"
            onClick={() => !isLoadingCars && setCarSelectorOpen((o) => !o)}
            className={`flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left shadow-sm transition-colors ${
              carSelectorOpen
                ? "border-[#2389E3]"
                : "border-[#E1E5EE] hover:border-[#2389E3]/50"
            } ${isLoadingCars ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
          >
            {isLoadingCars ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5FC]">
                  <Icon
                    icon="ion:car-sport-sharp"
                    fontSize={18}
                    className="text-[#05243F]/30"
                  />
                </div>
                <span className="text-sm text-[#05243F]/40">
                  Loading cars…
                </span>
              </div>
            ) : selectedCar ? (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EBF4FD]">
                  <Icon
                    icon="ion:car-sport-sharp"
                    fontSize={18}
                    color="#2389E3"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#05243F]">
                    {selectedCar.vehicle_make} {selectedCar.vehicle_model}
                  </p>
                  <p className="truncate text-xs text-[#05243F]/50">
                    {selectedCar.plate_number ||
                      selectedCar.registration_no ||
                      "No plate"}{" "}
                    · Exp {formatDate(selectedCar.expiry_date)}
                  </p>
                </div>
                <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2389E3]">
                  <FaCheck className="text-[9px] text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F5FC]">
                  <Icon
                    icon="ion:car-sport-sharp"
                    fontSize={18}
                    className="text-[#05243F]/30"
                  />
                </div>
                <span className="text-sm text-[#05243F]/40">
                  Choose a car from your garage
                </span>
              </div>
            )}
            <div className="ml-3 shrink-0 text-[#05243F]/40">
              {carSelectorOpen ? (
                <IoIosArrowUp className="text-lg" />
              ) : (
                <IoIosArrowDown className="text-lg" />
              )}
            </div>
          </button>

          {/* Dropdown panel */}
          {carSelectorOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[#E1E5EE] bg-white shadow-lg">
              {carList.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                  <FaCarAlt className="mb-2 text-3xl text-[#2389E3]/20" />
                  <p className="text-sm font-medium text-[#05243F]">
                    No cars in your garage
                  </p>
                  <p className="mt-1 text-xs text-[#05243F]/50">
                    Add a car first before applying for a plate number.
                  </p>
                </div>
              ) : (
                carList.map((car, idx) => {
                  const isSelected = car.slug === selectedCarSlug;
                  return (
                    <button
                      key={car.slug}
                      type="button"
                      onClick={() => {
                        setSelectedCarSlug(car.slug);
                        setCarSelectorOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? "bg-[#EBF4FD]"
                          : "hover:bg-[#F4F5FC]"
                      } ${idx !== 0 ? "border-t border-[#F4F5FC]" : ""}`}
                    >
                      {/* Car icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          isSelected ? "bg-[#2389E3]" : "bg-[#F4F5FC]"
                        }`}
                      >
                        <Icon
                          icon="ion:car-sport-sharp"
                          fontSize={18}
                          color={isSelected ? "#ffffff" : "#2389E3"}
                        />
                      </div>

                      {/* Car info */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={`truncate text-sm font-semibold ${
                            isSelected ? "text-[#2389E3]" : "text-[#05243F]"
                          }`}
                        >
                          {car.vehicle_make} {car.vehicle_model}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-[#05243F]/50">
                          <span>
                            {car.plate_number ||
                              car.registration_no ||
                              "No plate"}
                          </span>
                          <span className="h-3 w-[1px] bg-[#E1E5EE]" />
                          <span>Exp {formatDate(car.expiry_date)}</span>
                          {car.vehicle_year && (
                            <>
                              <span className="h-3 w-[1px] bg-[#E1E5EE]" />
                              <span>{car.vehicle_year}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Selected tick */}
                      {isSelected && (
                        <div className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2389E3]">
                          <FaCheck className="text-[9px] text-white" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <form
          className="grid grid-cols-1 gap-8 md:grid-cols-[170px_1fr_120px]"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* License Type Selection */}
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-300px)] overflow-y-auto">
            <p className="mb-5 text-sm font-normal text-[#05243F]/40">
              Please Pick the type of Plate Number we can help you with.
            </p>
            <div className="flex w-[140px] flex-row gap-2 md:flex-col">
              <button
                type="button"
                onClick={() => {
                  setLicenseType("new-plate-number");
                  handleLicenseTypeChange("new-plate-number");
                }}
                className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
                  licenseType === "new-plate-number"
                    ? "border-2 border-[#2389E3] text-[#05243F]"
                    : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                }`}
              >
                Ordinary
              </button>

              <button
                type="button"
                onClick={() => {
                  setLicenseType("Customized");
                  handleLicenseTypeChange("Customized");
                }}
                className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
                  licenseType === "Customized"
                    ? "border-2 border-[#2389E3] text-[#05243F]"
                    : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                }`}
              >
                Customized
              </button>

              <div className="relative" ref={dropdownRefDealer}>
                <button
                  type="button"
                  onClick={() => setDealerDropdownOpen(!dealerDropdownOpen)}
                  className={`flex w-full items-center justify-between gap-2 rounded-[26px] py-2 pr-3 pl-6 text-sm font-semibold ${
                    licenseType === "Dealership"
                      ? "border-2 border-[#2389E3] text-[#05243F]"
                      : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                  } ${dealerDropdownOpen && "border-2 border-[#F4F5FC] text-[#05243F]/40"}`}
                >
                  {licenseType === "Dealership" ? dealerShipType : "Dealership"}
                  {dealerDropdownOpen ? (
                    <IoIosArrowUp className="text-lg text-[#697B8C]/29" />
                  ) : (
                    <IoIosArrowDown className="text-lg text-[#697B8C]/29" />
                  )}
                </button>

                {dealerDropdownOpen && (
                  <div className="absolute left-0 z-100 mt-1 w-fit rounded-[26px] border-2 border-[#2389E3] bg-white py-1 shadow-sm sm:w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("Dealership");
                        setDealerShipType("Cooperate");
                        setDealerDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Cooperate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("Dealership");
                        setDealerShipType("Business");
                        setDealerDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Business
                    </button>
                  </div>
                )}
              </div>

              <div className="relative" ref={dropdownRefReprint}>
                <button
                  type="button"
                  onClick={() => setReprintDropdownOpen(!reprintDropdownOpen)}
                  className={`flex w-full items-center justify-between gap-2 rounded-[26px] py-2 pr-3 pl-6 text-sm font-semibold ${
                    licenseType === "reprint"
                      ? "border-2 border-[#2389E3] text-[#05243F]"
                      : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                  } ${reprintDropdownOpen && "border-2 border-[#F4F5FC] text-[#05243F]/40"}`}
                >
                  {licenseType === "reprint" ? reprintType : "Reprint"}
                  {reprintDropdownOpen ? (
                    <IoIosArrowUp className="text-lg text-[#697B8C]/29" />
                  ) : (
                    <IoIosArrowDown className="text-lg text-[#697B8C]/29" />
                  )}
                </button>

                {reprintDropdownOpen && (
                  <div className="absolute left-0 z-100 mt-1 w-fit rounded-[26px] border-2 border-[#2389E3] bg-white py-1 shadow-sm sm:w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("reprint");
                        setReprintType("Cooperate");
                        handleLicenseTypeChange("reprint");
                        setReprintDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Cooperate
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("reprint");
                        setReprintType("Business");
                        handleLicenseTypeChange("reprint");
                        setReprintDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Business
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-300px)] overflow-y-auto pr-4">
            {licenseType === "new-plate-number" &&
              type === "new-plate-number" && (
                <div className="mt-4 space-y-3.5">
                  <FormInput
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ali Johnson"
                    error={errors.fullName}
                    autoFilled={!!selectedCar && !!selectedCar.name_of_owner}
                    required
                  />
                  <FormInput
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Jd Street, Off motoko road."
                    error={errors.address}
                    autoFilled={!!selectedCar && !!selectedCar.address}
                    required
                  />
                  <FormInput
                    label="Chassis Number"
                    name="chassisNumber"
                    value={formData.chassisNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your chassis number"
                    error={errors.chassisNumber}
                    autoFilled={!!selectedCar && !!selectedCar.chasis_no}
                    required
                  />
                  <FormInput
                    label="Engine Number"
                    name="engineNumber"
                    value={formData.engineNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your engine number"
                    error={errors.engineNumber}
                    autoFilled={!!selectedCar && !!selectedCar.engine_no}
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
                    autoFilled={!!selectedCar && !!selectedCar.phone_number}
                    required
                  />
                  <FormInput
                    label="Color"
                    name="color"
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Black"
                    error={errors.color}
                    autoFilled={!!selectedCar && !!selectedCar.vehicle_color}
                    required
                  />
                  <FormInput
                    label="Car Make"
                    name="carmake"
                    type="text"
                    value={formData.carmake}
                    onChange={handleInputChange}
                    placeholder="Lexus"
                    error={errors.carmake}
                    autoFilled={!!selectedCar && !!selectedCar.vehicle_make}
                    required
                  />
                  <FormInput
                    label="Car Type"
                    name="cartype"
                    type="text"
                    value={formData.cartype}
                    onChange={handleInputChange}
                    placeholder="R 330"
                    error={errors.cartype}
                    autoFilled={!!selectedCar && !!selectedCar.vehicle_model}
                    required
                  />
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "Customized" && type === "new-plate-number" && (
              <div className="mt-4 space-y-3.5">
                <FormInput
                  label="Preferred Name/Number"
                  name="preferredNameNumber"
                  value={formData.preferredNameNumber}
                  onChange={handleInputChange}
                  placeholder="Jagaban"
                  error={errors.preferredNameNumber}
                  required
                />
                <FormInput
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Ali Johnson"
                  error={errors.fullName}
                  autoFilled={!!selectedCar && !!selectedCar.name_of_owner}
                  required
                />
                <FormInput
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Jd Street, Off motoko road."
                  error={errors.address}
                  autoFilled={!!selectedCar && !!selectedCar.address}
                  required
                />
                <FormInput
                  label="Chassis Number"
                  name="chassisNumber"
                  value={formData.chassisNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your chassis number"
                  error={errors.chassisNumber}
                  autoFilled={!!selectedCar && !!selectedCar.chasis_no}
                  required
                />
                <FormInput
                  label="Engine Number"
                  name="engineNumber"
                  value={formData.engineNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your engine number"
                  error={errors.engineNumber}
                  autoFilled={!!selectedCar && !!selectedCar.engine_no}
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
                  autoFilled={!!selectedCar && !!selectedCar.phone_number}
                  required
                />
                <FormInput
                  label="Color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Black"
                  error={errors.color}
                  autoFilled={!!selectedCar && !!selectedCar.vehicle_color}
                  required
                />
                <FormInput
                  label="Car Make"
                  name="carmake"
                  type="text"
                  value={formData.carmake}
                  onChange={handleInputChange}
                  placeholder="Lexus"
                  error={errors.carmake}
                  autoFilled={!!selectedCar && !!selectedCar.vehicle_make}
                  required
                />
                <FormInput
                  label="Car Type"
                  name="cartype"
                  type="text"
                  value={formData.cartype}
                  onChange={handleInputChange}
                  placeholder="R 330"
                  error={errors.cartype}
                  autoFilled={!!selectedCar && !!selectedCar.vehicle_model}
                  required
                />
                <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                  <ActionButton
                    onClick={handleSubmit}
                    className="w-full md:w-[60%]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                  </ActionButton>
                </div>
              </div>
            )}

            {licenseType === "Dealership" &&
              type === "new-plate-number" &&
              dealerShipType === "Cooperate" && (
                <div className="flex flex-col gap-y-3">
                  <label htmlFor="cac-upload" className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="cac-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "cac_document")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.cac_document
                          ? files.cac_document.name
                          : "Upload CAC"}
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="letterhead-upload"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="letterhead-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "letterhead")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.letterhead
                          ? files.letterhead.name
                          : "Upload Letterhead"}
                      </p>
                    </div>
                  </label>
                  <label htmlFor="id-upload" className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="id-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange(e, "means_of_identification")
                        }
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.means_of_identification
                          ? files.means_of_identification.name
                          : "Upload Means of Identification"}
                      </p>
                    </div>
                  </label>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "Dealership" &&
              type === "new-plate-number" &&
              dealerShipType === "Business" && (
                <div className="flex flex-col gap-y-3">
                  <label
                    htmlFor="cac-upload-biz"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="cac-upload-biz"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "cac_document")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.cac_document
                          ? files.cac_document.name
                          : "Upload CAC"}
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="biz-cert-upload"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="biz-cert-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, "letterhead")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.letterhead
                          ? files.letterhead.name
                          : "Upload Business Certificate"}
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="id-upload-biz"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="id-upload-biz"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileChange(e, "means_of_identification")
                        }
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.means_of_identification
                          ? files.means_of_identification.name
                          : "Upload Means of Identification"}
                      </p>
                    </div>
                  </label>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "reprint" &&
              reprintType === "Cooperate" &&
              type === "reprint" && (
                <div>
                  <label
                    htmlFor="reprint-upload"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="reprint-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cac_document")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.cac_document
                          ? files.cac_document.name
                          : "Upload Vehicle Licenses"}
                      </p>
                    </div>
                  </label>
                  <div className="text-center">
                    <p className="mt-4 mb-4 text-sm font-medium text-[#05243F]/40">
                      Car in your garage?
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-[#F4F5FC] px-4 py-5">
                    <div className="mb-4">
                      <div className="text-sm font-light text-[#05243F]/60">
                        Car Model
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={MercedesLogo}
                            alt="Mercedes"
                            className="h-6 w-6"
                          />
                          <h3 className="text-2xl font-semibold text-[#05243F]">
                            Mercedes Benz
                          </h3>
                        </div>
                        <FaCarAlt className="text-3xl text-[#2389E3]" />
                      </div>
                    </div>
                    <div className="mb-2 flex items-center">
                      <div>
                        <div className="text-sm text-[#05243F]/60">
                          Plate No:
                        </div>
                        <div className="text-base font-semibold text-[#05243F]">
                          LSD1234
                        </div>
                      </div>
                      <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
                      <div>
                        <div className="text-sm text-[#05243F]/60">
                          Exp. Date
                        </div>
                        <div className="text-base font-semibold text-[#05243F]">
                          04-05-25
                        </div>
                      </div>
                      <div className="mx-6 h-8 w-[1px] bg-[#E1E5EE]"></div>
                      <div>
                        <div className="text-sm text-[#05243F]/60">
                          Car Type
                        </div>
                        <div className="text-base font-semibold text-[#05243F]">
                          Saloon
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "reprint" &&
              reprintType === "Business" &&
              type === "reprint" && (
                <div>
                  <label
                    htmlFor="reprint-biz-upload"
                    className="block cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="reprint-biz-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "cac_document")}
                        className="hidden"
                      />
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        {files.cac_document
                          ? files.cac_document.name
                          : "Upload Vehicle Licenses (Business)"}
                      </p>
                    </div>
                  </label>
                  <p className="mt-3 text-sm text-[#05243F]/60">
                    Car in your garage?
                  </p>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Confirm and Proceed"}
                    </ActionButton>
                  </div>
                </div>
              )}
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <p className="mt-1 text-sm font-normal text-[#05243F]/60">Price:</p>
            {isLoadingPrices ? (
              <div className="mt-1 h-5 w-16 animate-pulse rounded bg-[#E1E5EE]" />
            ) : currentPrice !== null ? (
              <p className="text-xl font-semibold text-[#05243F]">
                ₦{currentPrice.toLocaleString("en-NG")}
              </p>
            ) : (
              <p className="text-sm text-[#05243F]/40">—</p>
            )}
          </div>
        </form>
      </div>
    </LicenseLayout>
  );
}
