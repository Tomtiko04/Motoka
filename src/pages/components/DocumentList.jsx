import { useRef, useState, useEffect } from "react";
import good from "../../assets/images/good.svg";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import {
  getCarDocuments,
  uploadDocument,
  buildCarDocumentFormData,
} from "../../services/apiDocument";

function DocumentList({
  selectedDocument,
  setSelectedDocument,
  showsidebar,
  setShowsidebar,
  car,
}) {
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadDocs = async () => {
      if (!car?.slug) {
        setDocuments([]);
        return;
      }
      setIsLoading(true);
      try {
        const docs = await getCarDocuments(car.slug);
        setDocuments(docs);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load documents");
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDocs();
  }, [car?.slug]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !car?.slug) return;

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
      const formData = buildCarDocumentFormData(file, car.slug);
      const res = await uploadDocument(formData);
      const doc = res?.data?.document || res?.document;
      if (doc) {
        setDocuments((prev) => [doc, ...prev]);
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

  const displayDocs = documents.map((doc, idx) => ({
    key: doc.id || `doc-${idx}`,
    title: `Document ${idx + 1}`,
    image: doc.file_url,
    status: doc.status,
  }));

  return (
    <div>
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
                setSelectedDocument(doc.image);
                setShowsidebar(false);
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
                <p className="text-white text-[15px] font-medium">{doc.title}</p>
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

export default DocumentList;