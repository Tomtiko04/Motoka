import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import LicenseLayout from "../components/LicenseLayout";
import FormInput from "../components/FormInput";
import ActionButton from "../components/ActionButton";
import { LuUpload } from "react-icons/lu";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import LicenseSample from "../../../assets/images/license-sample.png";
import { useCreateDriverLicense } from "../useLicense";

export default function DriversLicense() {
  const fileInputRef = useRef(null);
  const affidavitInputRef = useRef(null);
  const navigate = useNavigate();
  const [licenseType, setLicenseType] = useState("New");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [renewType, setRenewType] = useState("Expired");
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    placeOfBirth: "",
    stateOfOrigin: "",
    localGovernment: "",
    bloodGroup: "O+",
    height: "",
    occupation: "",
    nextOfKin: "",
    nextOfKinPhone: "",
    motherMaidenName: "",
    licenseYear: null,
    passportPhoto: null,
    affidavit: null,
  });
  const [errors, setErrors] = useState({});

  const { createLicense, isCreating } = useCreateDriverLicense();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e, type) => {
    e.preventDefault();
    const input =
      type === "passportPhoto"
        ? fileInputRef.current
        : affidavitInputRef.current;

    if (input) {
      input.click();
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
      toast.success("File uploaded successfully");
    }
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
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.placeOfBirth)
      newErrors.placeOfBirth = "Place of birth is required";
    if (!formData.stateOfOrigin)
      newErrors.stateOfOrigin = "State of origin is required";
    if (!formData.localGovernment)
      newErrors.localGovernment = "Local government is required";
    if (!formData.height) newErrors.height = "Height is required";
    if (!formData.occupation) newErrors.occupation = "Occupation is required";
    if (!formData.nextOfKin) newErrors.nextOfKin = "Next of Kin is required";
    if (!formData.nextOfKinPhone)
      newErrors.nextOfKinPhone = "Next of Kin phone number is required";
    if (!formData.motherMaidenName)
      newErrors.motherMaidenName = "Mother's maiden name is required";
    
    // Check for passport photograph requirement
    if (!formData.passportPhoto) {
      newErrors.passportPhoto = "Passport photograph is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const payload = {
      license_type: licenseType.toLowerCase(),
      full_name: formData.fullName,
      phone_number: formData.phoneNumber,
      address: formData.address,
      date_of_birth: formData.dateOfBirth,
      place_of_birth: formData.placeOfBirth,
      state_of_origin: formData.stateOfOrigin,
      local_government: formData.localGovernment,
      blood_group: formData.bloodGroup,
      height: formData.height,
      occupation: formData.occupation,
      next_of_kin: formData.nextOfKin,
      next_of_kin_phone: formData.nextOfKinPhone,
      mother_maiden_name: formData.motherMaidenName,
      license_year: formData.licenseYear,
      passport_photograph: formData.passportPhoto,
    };

    try {
      await createLicense(payload, {
        onSuccess: () => {
          const amount = formData.licenseYear * 30000;
          navigate("/licenses/confirm-request", {
            state: {
              type: "license",
              items: [
                {
                  name: `${licenseType} Driver's License${licenseType === "Renew" && renewType ? ` (${renewType})` : ""}`,
                  amount,
                  years: formData.licenseYear,
                  ...formData,
                },
              ],
              details: {
                licenseType,
                renewType: licenseType === "Renew" ? renewType : null,
                description: "This is for your Driver's License",
                years: formData.licenseYear,
                ...formData,
              },
            },
          });
        },
      });
    } catch (error) {
      console.error("License creation failed:", error);
    }
  };

  return (
    <LicenseLayout
      title="Driver's License"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="mx-auto w-full max-w-3xl px-4 md:px-0">
        <form
          className="grid grid-cols-1 gap-8 md:grid-cols-[170px_1fr_120px]"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* License Type Selection */}
          <div>
            <p className="mb-5 text-sm font-normal text-[#05243F]/40">
              Please pick the type of driver's license we can help you with.
            </p>
            <div className="flex w-[140px] flex-row gap-2 md:flex-col">
              <button
                type="button"
                onClick={() => setLicenseType("New")}
                className={`w-full rounded-[26px] px-6 py-2 text-left text-sm font-semibold ${
                  licenseType === "New"
                    ? "border-2 border-[#2389E3] text-[#05243F]"
                    : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                }`}
              >
                New
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex w-full items-center justify-between gap-2 rounded-[26px] py-2 pr-3 pl-6 text-sm font-semibold ${
                    licenseType === "Renew"
                      ? "border-2 border-[#2389E3] text-[#05243F]"
                      : "border-2 border-[#F4F5FC] text-[#05243F]/40"
                  } ${isDropdownOpen && "border-2 border-[#F4F5FC] text-[#05243F]/40"}`}
                >
                  {licenseType === "Renew" ? renewType : "Renew"}
                  {isDropdownOpen ? (
                    <IoIosArrowUp className="text-lg text-[#697B8C]/29" />
                  ) : (
                    <IoIosArrowDown
                      className={`text-lg text-[#697B8C]/29 ${licenseType === "Renew" && "text-[#05243F]"}`}
                    />
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-fit rounded-[26px] border-2 border-[#2389E3] bg-white py-1 shadow-sm sm:w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("Renew");
                        setRenewType("Expired");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Expired
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseType("Renew");
                        setRenewType("Lost/Damaged");
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-semibold text-[#05243F]/40 hover:rounded-[26px] hover:text-[#2389E3]"
                    >
                      Lost/Damaged
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="scrollbar-thin scrollbar-track-[#F5F6FA] scrollbar-thumb-[#2389E3] hover:scrollbar-thumb-[#2389E3]/80 scrollbar-thumb-rounded-full h-[calc(100vh-240px)] overflow-y-auto pr-4">
            {/* Upload Section */}
            {(licenseType === "New" ||
              (licenseType === "Renew" && renewType === "Expired")) && (
              <div>
                <label
                  htmlFor="passport-upload"
                  className="block cursor-pointer"
                  onClick={(e) => handleFileUpload(e, "passportPhoto")}
                >
                  <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-8">
                    <input
                      id="passport-upload"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e, "passportPhoto")}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                    />
                    <span>
                      <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
                    </span>
                    <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                      {formData.passportPhoto
                        ? formData.passportPhoto.name
                        : licenseType === "New"
                          ? "Upload Passport Photograph"
                          : "Upload Expired Driver's License"}
                    </p>
                  </div>
                </label>
                {errors.passportPhoto && (
                  <p className="mt-1 text-sm text-red-500">{errors.passportPhoto}</p>
                )}
              </div>
            )}

            {/* New License Form */}
            {licenseType === "New" && (
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
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <FormInput
                  label="Height (M)"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleInputChange}
                  error={errors.height}
                  placeholder="1.5m"
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
                  name="nextOfKinPhone"
                  type="tel"
                  value={formData.nextOfKinPhone}
                  onChange={handleInputChange}
                  error={errors.nextOfKinPhone}
                  placeholder="Tomtiko"
                  required
                />
                <FormInput
                  label="Mother's Maiden Name"
                  name="motherMaidenName"
                  value={formData.motherMaidenName}
                  onChange={handleInputChange}
                  error={errors.motherMaidenName}
                  placeholder="Tomtiko"
                  required
                />
                <div>
                  <p className="mb-1 text-sm font-medium text-[#05243F]">
                    License Years
                  </p>
                  <select
                    name="licenseYear"
                    value={formData.licenseYear}
                    onChange={handleInputChange}
                    className="w-full rounded-[10px] bg-[#F4F5FC] px-4 py-3 text-sm font-normal text-[#05243F] transition-colors duration-300 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] focus:outline-none"
                  >
                    <option value={1}>1 year</option>
                    <option value={2}>2 years</option>
                    <option value={3}>3 years</option>
                    <option value={4}>4 years</option>
                    <option value={5}>5 years</option>
                  </select>
                </div>
                <div className="sticky bottom-0 mt-4 flex justify-center bg-white sm:mt-5">
                  <ActionButton
                    onClick={handleSubmit}
                    className="w-full md:w-[60%]"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating License..." : "Confirm and Proceed"}
                  </ActionButton>
                </div>
              </div>
            )}

            {/* Sample License Section */}
            {licenseType === "Renew" && renewType === "Expired" && (
              <div>
                <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-[17px] bg-[#F7F6F5] px-5 py-4 md:flex-row">
                  <p className="text-base font-medium text-[#05243F]">Sample</p>
                  <div className="w-[200px]">
                    <img src={LicenseSample} alt="License Sample" />
                  </div>
                </div>
                <div className="sticky bottom-0 mt-4 flex justify-center sm:mt-5">
                  <ActionButton
                    onClick={handleSubmit}
                    className="w-full md:w-[60%]"
                  >
                    Confirm and Proceed
                  </ActionButton>
                </div>
              </div>
            )}

            {/* Lost/Damaged License Form */}
            {licenseType === "Renew" && renewType === "Lost/Damaged" && (
              <div className="space-y-4">
                <FormInput
                  label="License Number"
                  name="licenseNumber"
                  value={formData.licenseNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Enter your license number"
                  error={errors.licenseNumber}
                  required
                />
                <FormInput
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  error={errors.dateOfBirth}
                  required
                />
                <div className="sticky bottom-0 mt-4 flex justify-center sm:mt-5">
                  <ActionButton
                    onClick={handleSubmit}
                    className="w-full md:w-[60%]"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating License..." : "Confirm and Proceed"}
                  </ActionButton>
                </div>
              </div>
            )}
          </div>

          {/* Grid line 3 */}
          <div className="flex flex-col">
            <p className="mt-1 text-sm font-normal text-[#05243F]">Price:</p>
            <p className="text-xl font-semibold text-[#05243F]">₦30,000</p>
          </div>
        </form>
      </div>
    </LicenseLayout>
  );
}
