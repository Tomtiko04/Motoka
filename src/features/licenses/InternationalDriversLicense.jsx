import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuUpload } from "react-icons/lu";
import LicenseLayout from "./components/LicenseLayout";
import ActionButton from "./components/ActionButton";
import { Link } from "react-router-dom";

export default function InternationalDriversLicense() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    driversLicense: null,
  });

  const handleFileUpload = (e) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, driversLicense: file }));
    }
  };

  return (
    <LicenseLayout
      title="International Drivers License"
      subTitle="All licenses are issued by government, we are only an agent that helps you with the process."
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[170px_1fr_170px]">
        {/* Side 1 */}
        <div></div>
        {/* side 2 */}
        <div>
          <label
            htmlFor="passport-upload"
            className="block cursor-pointer"
            onClick={(e) => handleFileUpload(e, "vehiclelicense")}
          >
            <div className="flex flex-col items-center justify-center rounded-[20px] bg-[#F4F5FC] p-12">
              <input
                id="passport-upload"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e, "vehiclelicense")}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
              />
              <span>
                <LuUpload className="text-3xl font-semibold text-[#45A1F2]" />
              </span>
              <p className="mt-2 text-center text-sm font-semibold text-[#05243F]">
                Upload Vehicle Licenses
              </p>
              {formData.vehiclelicense && (
                <p className="mt-2 text-center text-xs text-[#45A1F2]">
                  {formData.vehiclelicense.name}
                </p>
              )}
            </div>
          </label>
          <div>
            <p className="mt-4 mb-4 text-center text-xs text-[#697B8C]/64">
              Don't have an Existing Drivers' License?
              <br />
              Tap
              <Link to="" className="text-[#2284DB] underline ml-1">
                here
              </Link>{" "}
              to fill a form.
            </p>
          </div>
          <div className="mt-4 flex justify-center sm:mt-5">
            <ActionButton className="w-full md:w-[60%]">
              Confirm and Proceed
            </ActionButton>
          </div>
        </div>
        {/* side 3 */}
        <div className="flex flex-col">
          <p className="mt-1 text-sm font-normal text-[#05243F]">Price:</p>
          <p className="text-xl font-semibold text-[#05243F]">₦30,000</p>
        </div>
      </div>
    </LicenseLayout>
  );
}
