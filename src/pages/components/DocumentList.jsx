import { useRef, useState, useEffect } from "react";
import good from "../../assets/images/good.svg";
import { Icon } from "@iconify/react";

function DocumentList({
  selectedDocument,
  setSelectedDocument,
  showsidebar,
  setShowsidebar,
  car,
}) {
  const fileInputRef = useRef(null);
  const [localDocs, setLocalDocs] = useState([]);

  // Load from local storage for current car
  useEffect(() => {
    if (car?.slug) {
      const saved = localStorage.getItem(`docs_${car.slug}`);
      if (saved) {
        setLocalDocs(JSON.parse(saved));
      } else {
        setLocalDocs([]);
      }
    }
  }, [car?.slug]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !car?.slug) return;

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64File = await toBase64(file);
      const newDocs = [...localDocs, base64File];
      setLocalDocs(newDocs);
      localStorage.setItem(`docs_${car.slug}`, JSON.stringify(newDocs));
    } catch (error) {
      console.error("Error saving to local storage", error);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Combine API docs with local storage docs
  const apiDocs = car?.document_images || [];
  const allDocs = [...apiDocs, ...localDocs];

  const displayDocs = allDocs.map((img, idx) => ({
    key: `doc-${idx}`,
    title: `Document ${idx + 1}`,
    image: img,
    status: good,
  }));

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <div className="grid grid-cols-2 gap-5">
        {displayDocs.map((doc) => (
          <div
            onClick={() => {
              setSelectedDocument(doc.image);
              setShowsidebar(false);
            }}
            className={`rounded-[17px] relative overflow-hidden h-[111px] flex items-center transition-all ${
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
                <img src={doc.status} alt="status" className="object-contain" />
              </div>
              <p className="text-white text-[15px] font-medium">{doc.title}</p>
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

export default DocumentList;