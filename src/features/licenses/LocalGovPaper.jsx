import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { LuUpload } from "react-icons/lu";
import LicenseLayout from "./components/LicenseLayout";
import ActionButton from "./components/ActionButton";

export default function LocalGovPaper() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    vehiclelicense: null,
    affidavit: null,
  });
  const handleFileUpload = (e, type) => {
    e.preventDefault();
    const input =
      type === "vehiclelicense"
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

  function handleSubmit(){
    console.log("submit");
  }
  return (
    <LicenseLayout
      title="Local Gov. Papers"
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
          <div className="mt-4 flex justify-center sm:mt-5">
            <ActionButton onClick={handleSubmit} className="w-full md:w-[60%]">
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
