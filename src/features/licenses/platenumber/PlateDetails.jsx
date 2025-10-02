import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaCarAlt, FaPlus } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import LicenseLayout from "../components/LicenseLayout";
import FormInput from "../components/FormInput";
import ActionButton from "../components/ActionButton";
import MercedesLogo from "../../../assets/images/mercedes-logo.png";

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
    passportPhoto: null,
    affidavit: null,
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  useEffect(() => {
    function getReprint() {
      if (licenseType === "reprint") {
        setReprintType("Cooperate");
      }
    }
    getReprint();
  }, [licenseType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting for: ${type}`, formData);
    // Handle submission
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
        <form
          className="grid grid-cols-1 gap-8 md:grid-cols-[170px_1fr_120px]"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* License Type Selection */}
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto">
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
                  onClick={() => {
                    setDealerDropdownOpen(!dealerDropdownOpen);
                    // handleLicenseTypeChange("Dealership");
                  }}
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
                    <IoIosArrowDown className={`text-lg text-[#697B8C]/29`} />
                  )}
                </button>

                {dealerDropdownOpen && (
                  <div className="absolute left-0 z-100 mt-1 w-fit rounded-[26px] border-2 border-[#2389E3] bg-white py-1 shadow-sm sm:w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("Dealership");
                        setDealerShipType("Cooperate");
                        // handleLicenseTypeChange("Dealership");
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
                        // handleLicenseTypeChange("Dealership");
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
                  onClick={() => {
                    setReprintDropdownOpen(!reprintDropdownOpen);
                    // handleLicenseTypeChange("reprint");
                  }}
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
                    <IoIosArrowDown className={`text-lg text-[#697B8C]/29`} />
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

          {/* 2 */}
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto pr-4">
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
                    label="Chassis Number"
                    name="chassisNumber"
                    value={formData.chassisNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your chassis number"
                    error={errors.chassisNumber}
                    required
                  />
                  <FormInput
                    label="Engine Number"
                    name="engineNumber"
                    value={formData.engineNumber || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your chassis number"
                    error={errors.engineNumber}
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
                    label="Color"
                    name="color"
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="Black"
                    error={errors.color}
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
                    required
                  />
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                    >
                      Confirm and Proceed
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
                  label="Chassis Number"
                  name="chassisNumber"
                  value={formData.chassisNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your chassis number"
                  error={errors.chassisNumber}
                  required
                />
                <FormInput
                  label="Engine Number"
                  name="engineNumber"
                  value={formData.engineNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your chassis number"
                  error={errors.engineNumber}
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
                  label="Color"
                  name="color"
                  type="text"
                  value={formData.color}
                  onChange={handleInputChange}
                  placeholder="Black"
                  error={errors.color}
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
                  required
                />
                <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                  <ActionButton
                    onClick={handleSubmit}
                    className="w-full md:w-[60%]"
                  >
                    Confirm and Proceed
                  </ActionButton>
                </div>
              </div>
            )}

            {licenseType === "Dealership" &&
              type === "new-plate-number" &&
              dealerShipType === "Cooperate" && (
                <div className="flex flex-col gap-y-3">
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload CAC
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Letterhead
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Means of Identification
                      </p>
                    </div>
                  </label>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                    >
                      Confirm and Proceed
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "Dealership" &&
              type === "new-plate-number" &&
              dealerShipType === "Business" && (
                <div className="flex flex-col gap-y-3">
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload CAC
                      </p>
                    </div>
                  </label>{" "}
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Business Certificate
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Means of Identification
                      </p>
                    </div>
                  </label>
                  <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                    <ActionButton
                      onClick={handleSubmit}
                      className="w-full md:w-[60%]"
                    >
                      Confirm and Proceed
                    </ActionButton>
                  </div>
                </div>
              )}
            {licenseType === "reprint" &&
              reprintType === "Cooperate" &&
              type === "reprint" && (
                <div>
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Vehicle Licenses
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
                          <div className="">
                            <img
                              src={MercedesLogo}
                              alt="Mercedes"
                              className="h-6 w-6"
                            />
                          </div>
                          <h3 className="text-2xl font-semibold text-[#05243F]">
                            Mercedes Benz
                          </h3>
                        </div>
                        <div>
                          <FaCarAlt className="text-3xl text-[#2389E3]" />
                        </div>
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
                    >
                      Confirm and Proceed
                    </ActionButton>
                  </div>
                </div>
              )}

            {licenseType === "reprint" &&
              reprintType === "Business" &&
              type === "reprint" && (
                <div>
                  <label
                    htmlFor="passport-upload"
                    className="block cursor-pointer"
                    // onClick={(e) => handleFileUpload(e, "passportPhoto")}
                  >
                    <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                      <input
                        id="passport-upload"
                        type="file"
                        accept="image/*"
                        // ref={fileInputRef}
                        // onChange={(e) => handleFileChange(e, "passportPhoto")}
                        // onClick={(e) => e.stopPropagation()}
                        className="hidden"
                      />
                      <span>
                        <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                      </span>
                      <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                        Upload Vehicle Licenses (Business)
                      </p>
                    </div>
                  </label>
                  <p>Car in your garage?</p>
                </div>
              )}
          </div>

          {/* 3 */}
          <div className="flex flex-col">
            <p className="mt-1 text-sm font-normal text-[#05243F]">Price:</p>
            <p className="text-xl font-semibold text-[#05243F]">₦30,000</p>
          </div>
        </form>
      </div>
    </LicenseLayout>
  );
}
