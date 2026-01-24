import Licensesample2 from "../../assets/images/6fe45ed589cd8efebdda471557ad5d41b9a94c27.png";
import { useState } from "react";
import drivers from "../../assets/images/license-sample.png";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";

const driversLicense = drivers;

function DocPreview({ selectedDocument, docType, setShowsidebar, car }) {
  const [aspect, setAspect] = useState("portrait");
  const [isSharing, setIsSharing] = useState(false);

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

  const handleDownload = async () => {
    if (!selectedDocument) return;

    try {
      const fileName = `${docTitle}_${car?.plate_number || "Document"}.png`;
      
      // If it's a base64 string
      if (selectedDocument.startsWith('data:')) {
        const link = document.createElement("a");
        link.href = selectedDocument;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started");
      } else {
        // If it's a URL, we try to fetch it as a blob to bypass some browser restrictions
        const response = await fetch(selectedDocument);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Download started");
      }
    } catch (error) {
      console.error("Download failed", error);
      toast.error("Fixed cross-origin restrictions: Opening in new tab instead");
      window.open(selectedDocument, '_blank');
    }
  };

  const handleShare = async () => {
    if (!selectedDocument) return;

    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title: `Motoka - ${docTitle}`,
          text: `Check out this document for ${car?.plate_number || "my vehicle"}.`,
          url: selectedDocument.startsWith('data:') ? undefined : selectedDocument,
        });
        toast.success("Shared successfully");
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Sharing failed");
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback: Copy to clipboard if it's a URL
      if (!selectedDocument.startsWith('data:')) {
        try {
          await navigator.clipboard.writeText(selectedDocument);
          toast.success("Link copied to clipboard");
        } catch (err) {
          toast.error("Could not copy link");
        }
      } else {
        toast.error("Sharing not supported on this browser");
      }
    }
  };

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
        <button 
          onClick={handleShare}
          disabled={!selectedDocument || isSharing} 
          className="group flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-[#697B8C4A] text-sm text-[#697C8C] disabled:opacity-30 transition-all hover:bg-[#697B8C]/10"
        >
          <Icon icon="solar:share-bold" width="18" />
          <span>Share</span>
        </button>
        <button 
          onClick={handleDownload}
          disabled={!selectedDocument} 
          className="group flex items-center justify-center gap-2 rounded-full px-6 py-3 bg-[#2284DB] text-sm text-[#ffffff] hover:bg-[#1b6dbd] disabled:opacity-30 transition-all shadow-md active:scale-95"
        >
          <Icon icon="solar:download-bold" width="18" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}

export default DocPreview;