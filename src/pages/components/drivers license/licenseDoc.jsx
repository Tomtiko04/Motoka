import { useRef, useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import good from "../../../assets/images/good.svg";
import { toast } from "react-hot-toast";
import {
  getDriverLicenseDocuments,
  uploadDocument,
  buildDriverLicenseFormData,
} from "../../../services/apiDocument";

function LicenseDoc({
  selectedDocument,
  setSelectedDocument,
  showsidebar,
  setShowsidebar,
}) {
  const fileInputRef = useRef(null);
  const [licenseDocs, setLicenseDocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadDocs = async () => {
      setIsLoading(true);
      try {
        const docs = await getDriverLicenseDocuments();
        setLicenseDocs(docs);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load documents");
        setLicenseDocs([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocs();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size should not exceed 10MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Allowed: JPEG, PNG, WebP, PDF");
      return;
    }

    setIsUploading(true);
    try {
      const formData = buildDriverLicenseFormData(file);
      const res = await uploadDocument(formData);
      const doc = res?.data?.document || res?.document;
      if (doc) {
        setLicenseDocs((prev) => [doc, ...prev]);
        toast.success("Document uploaded. Awaiting admin approval.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const displayDocs = licenseDocs.map((doc, idx) => ({
    key: doc.id || `license-doc-${idx}`,
    title: "Driver's License",
    image: doc.file_url,
    status: doc.status || "pending",
  }));

  return (
    <div>
      <div className="w-full flex items-end mb-4">
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

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {displayDocs.map((doc) => (
            <div
              onClick={() => {
                setSelectedDocument?.(doc.image);
                setShowsidebar?.(false);
              }}
              className={`rounded-[17px] relative overflow-hidden h-[111px] flex items-center transition-all cursor-pointer ${
                selectedDocument === doc.image ? "border-[#EBB850] border-2" : ""
              }`}
              key={doc.key}
            >
              <img
                src={doc.image}
                alt={doc.title}
                className="absolute top-0 left-0 h-full w-full object-cover"
              />
              <div className="relative bg-[#05243F]/60 h-full w-full z-10 p-4 flex flex-col justify-between">
                <div className="w-[25px]">
                  {doc.status === "approved" ? (
                    <img src={good} alt="approved" className="object-contain" />
                  ) : doc.status === "rejected" ? (
                    <Icon icon="mdi:close-circle-outline" className="text-red-400 text-xl" />
                  ) : (
                    <Icon icon="mdi:clock-outline" className="text-amber-400 text-xl" title="Pending approval" />
                  )}
                </div>
                <p className="text-white text-[16px] font-medium">{doc.title}</p>
                {doc.status !== "approved" && (
                  <span className="text-[10px] text-white/80 capitalize">{doc.status}</span>
                )}
              </div>
            </div>
          ))}

          <div
            onClick={isUploading ? undefined : triggerUpload}
            className={`bg-[#eaecf3] rounded-[17px] relative overflow-hidden h-[111px] flex items-center transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-[#e2e4ed]"
            }`}
          >
            <div className="relative h-full w-full z-10 p-4 flex flex-col justify-between">
              <div className="w-[30px] h-[30px] flex items-center justify-center bg-[#D2E2F0] rounded-[10px]">
                {isUploading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" />
                ) : (
                  <Icon icon="lets-icons:add-round" fontSize={24} color="#2284DB" />
                )}
              </div>
              <p className="text-[#05243F] text-[16px] font-semibold">
                {isUploading ? "Uploading..." : "Add Documents"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LicenseDoc;
