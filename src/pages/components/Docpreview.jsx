import Licensesample2 from "../../assets/images/6fe45ed589cd8efebdda471557ad5d41b9a94c27.png";
import { useState } from "react";
import drivers from "../../assets/images/license-sample.png";
import { Icon } from "@iconify/react";

const driversLicense = drivers;

function DocPreview({ selectedDocument, docType, setShowsidebar, car }) {
  const [aspect, setAspect] = useState("portrait");

  const handleLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    setAspect(w > h ? "landscape" : "portrait");
  };

  const Normal = () => {
    setAspect("portrait");
  };

  // Determine image and metadata
  const imageSrc = selectedDocument || (docType === "MyCar" ? Licensesample2 : driversLicense);
  const docTitle = docType === "MyCar" ? "Vehicle Document" : "Driver's License";
  const expiryDate = car?.expiry_date || car?.expiryDate || "";

  const formattedExpiry = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "Not available";

  return (
    <div className="flex flex-col items-center h-full min-h-150">
      <div className="flex justify-start w-full py-2 sm:hidden">
        <Icon
          icon="uil:align-left"
          fontSize={24}
          color="#05243F"
          className="cursor-pointer"
          onClick={() => setShowsidebar(true)}
        />
      </div>
      <div className="flex justify-between w-full h-fit">
        <p className="py-2 text-sm font-semibold">{docTitle}</p>
        <p className="py-2 text-red-600 text-sm font-light">
          Expires on {formattedExpiry}
        </p>
      </div>
      <div className="w-full px-16 py-4 flex flex-1 h-64 items-center justify-center overflow-hidden">
        {selectedDocument ? (
          <img
            src={imageSrc}
            alt={docTitle}
            onLoad={docType === "MyCar" ? handleLoad : Normal}
            className={`shadow-2xl rounded-[7px] max-h-full max-w-full object-contain ${
              aspect === "landscape" ? "rotate-90 scale-125" : ""
            }`}
            style={{
              transition: "transform 0.3s ease",
            }}
          />
        ) : (
          <div className="flex flex-col items-center text-[#05243F]/40 text-sm italic">
             <Icon icon="solar:document-bold-duotone" width="64" className="mb-2 opacity-20" />
             Select a document to preview
          </div>
        )}
      </div>
      <div className="flex justify-between w-full max-h-full px-2 pt-4 pb-0 h-fit">
        <button disabled={!selectedDocument} className="rounded-full px-6 py-3 bg-[#697B8C4A] text-sm text-[#697C8C] disabled:opacity-30">
          Share
        </button>
        <button disabled={!selectedDocument} className="rounded-full px-6 py-3 bg-[#2284DB] text-sm text-[#ffffff] hover:bg-[#1b6dbd] disabled:opacity-30">
          Download
        </button>
      </div>
    </div>
  );
}

export default DocPreview;