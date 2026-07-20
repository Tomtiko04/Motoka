import Licensesample2 from "../../assets/images/6fe45ed589cd8efebdda471557ad5d41b9a94c27.png";
import { useState, useEffect } from "react";
import drivers from "../../assets/images/license-sample.png";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";

const driversLicense = drivers;

function DocPreview({ selectedDocument, docType, setShowsidebar, car }) {
  const [aspect, setAspect] = useState("portrait");
  const [isSharing, setIsSharing] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const isPdfDocument = !!selectedDocument && (
    selectedDocument.startsWith?.('data:application/pdf') ||
    (typeof selectedDocument === 'string' && selectedDocument.toLowerCase().endsWith('.pdf'))
  );

  const formattedExpiry = expiryDate 
    ? new Date(expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "Not available";

  const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

  const getBlobFromDataUrl = async (dataUrl) => {
    const [header, base64Data] = dataUrl.split(',');
    const mime = header.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
    const binary = atob(base64Data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i);
    }
    return new Blob([array], { type: mime });
  };

  const getFileFromDocument = async () => {
    if (!selectedDocument) return null;

    try {
      if (isDataUrl(selectedDocument)) {
        const blob = await getBlobFromDataUrl(selectedDocument);
        const extension = blob.type.split('/')[1] || 'png';
        return new File([blob], `${docTitle}.${extension}`, { type: blob.type });
      }

      const response = await fetch(selectedDocument);
      const blob = await response.blob();
      const urlParts = selectedDocument.split('?')[0].split('/');
      const filename = urlParts[urlParts.length - 1] || `${docTitle}.png`;
      return new File([blob], filename, { type: blob.type || 'application/octet-stream' });
    } catch (err) {
      console.warn('Could not fetch document file for sharing', err);
      return null;
    }
  };

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

    const file = await getFileFromDocument();
    const shareText = `Check out this document for ${car?.plate_number || "my vehicle"}.`;

    if (navigator.share) {
      setIsSharing(true);
      try {
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Motoka - ${docTitle}`,
            text: shareText,
            files: [file],
          });
        } else {
          await navigator.share({
            title: `Motoka - ${docTitle}`,
            text: shareText,
            url: isDataUrl(selectedDocument) ? undefined : selectedDocument,
          });
        }
        toast.success("Shared successfully");
      } catch (error) {
        if (error.name !== "AbortError") {
          toast.error("Sharing failed");
          console.error(error);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      // Fallback: Copy to clipboard if it's a URL
      if (!isDataUrl(selectedDocument)) {
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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
        {/* <p className="py-2 text-red-600 text-sm font-light">
          Expires on {formattedExpiry}
        </p> */}
      </div>
      <div className="w-full px-4 sm:px-8 py-4 flex-1 flex items-center justify-center overflow-hidden min-h-[220px] lg:min-h-[64vh]">
        {selectedDocument ? (
          isPdfDocument ? (
            <object
              data={imageSrc}
              type="application/pdf"
              className="w-full h-full max-h-[72vh] rounded-xl border border-slate-200"
              aria-label={docTitle}
            >
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500">
                <Icon icon="mdi:file-pdf-box" width="56" className="text-slate-400" />
                <p>PDF preview is not available in this browser.</p>
                <a href={imageSrc} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Open PDF in a new tab
                </a>
              </div>
            </object>
          ) : (
            <img
              src={imageSrc}
              alt={docTitle}
              onLoad={docType === "MyCar" ? handleLoad : Normal}
              className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-md cursor-pointer"
              style={{ transition: "transform 0.3s ease" }}
              onClick={() => setShowModal(true)}
            />
          )
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
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="relative w-full max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 z-20 rounded-full bg-white/90 p-2 text-slate-700 shadow"
              aria-label="Close preview"
            >
              <Icon icon="mdi:close" width={20} />
            </button>
            {!isPdfDocument ? (
              <img
                src={imageSrc}
                alt={docTitle}
                className="w-full h-full max-h-[95vh] object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <object
                data={imageSrc}
                type="application/pdf"
                className="w-full h-full max-h-[95vh] rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
                  <Icon icon="mdi:file-pdf-box" width="56" className="text-slate-400" />
                  <p>PDF preview is not available in this browser.</p>
                  <a href={imageSrc} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    Open PDF in a new tab
                  </a>
                </div>
              </object>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocPreview;