import { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import good from "../../../assets/images/good.svg";
import { docStorage } from "../../../utils/docStorage";

function LicenseDoc() {
  const fileInputRef = useRef(null);
  const [licenseDocs, setLicenseDocs] = useState([]);

  // Load from IndexedDB
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const saved = await docStorage.get("drivers_license_docs");
        if (saved) {
          setLicenseDocs(saved);
        }
      } catch (error) {
        console.error("Failed to load licenses from IndexedDB", error);
      }
    };
    loadDocs();
  }, []);

  // Sync to IndexedDB whenever licenseDocs changes
  useEffect(() => {
    const saveDocs = async () => {
      if (licenseDocs.length > 0) {
        try {
          await docStorage.set("drivers_license_docs", licenseDocs);
        } catch (error) {
          console.error("Failed to save licenses to IndexedDB", error);
        }
      }
    };
    saveDocs();
  }, [licenseDocs]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64File = await toBase64(file);
      setLicenseDocs((prev) => [...prev, base64File]);
    } catch (error) {
      console.error("Error processing license file", error);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="w-full flex items-end">
        <label
          htmlFor="year"
          className="block mb-2 text-sm font-medium text-gray-600 w-full"
        >
          Documents
        </label>
        <select
          name="year"
          className="h-fit text-gray-600 font-semibold text-sm rounded-lg block w-fit py-2.5 px-0 focus:outline-none bg-transparent cursor-pointer"
        >
          <option selected value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-4">
        {licenseDocs.map((img, idx) => (
          <div
            key={`license-${idx}`}
            className="rounded-[17px] relative overflow-hidden flex items-center h-[111px]"
          >
            <img
              src={img}
              alt="Drivers License"
              className="absolute top-0 left-0 h-full w-full object-cover"
            />
            <div className="relative bg-[#05243F]/60 h-full w-full z-10 p-4 flex flex-col justify-between">
              <div className="w-[25px]">
                <img src={good} alt="status" className="object-contain" />
              </div>
              <p className="text-white text-[16px] font-medium">Driver's License</p>
            </div>
          </div>
        ))}

        <div
          onClick={triggerUpload}
          className="bg-[#eaecf3] cursor-pointer rounded-[17px] relative overflow-hidden h-[111px] flex items-center hover:bg-[#e2e4ed] transition-colors"
        >
          <div className="relative h-full w-full z-10 p-4 flex flex-col justify-between">
            <div className="w-[30px] h-[30px] flex items-center justify-center bg-[#D2E2F0] rounded-[10px]">
              <Icon icon="lets-icons:add-round" fontSize={24} color="#2284DB" />
            </div>
            <p className="text-[#05243F] text-[16px] font-semibold">
              Add Documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseDoc;