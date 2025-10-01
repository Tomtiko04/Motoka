import React, { useState, useEffect, useMemo } from "react";
import PagesLayout from "./components/PageLayout";
import DocumentsNav from "../components/DocumentsNav";
import DocumentPage from "./components/DocumentPage";
import DocPreview from "./components/Docpreview";
import CarDetailsCard from "../components/CarDetailsCard";
import { useGetCars } from "../features/car/useCar";
import config from "../config/config";
import LoadingSpinner from "../components/LoadingSpinner";

function CarDocuments() {
  const [selectedDocument, setSelectedDocument] = useState("VehicleLicense");
  const [docType, setDocType] = useState("MyCar");
  const [showsidebar, setShowsidebar] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  const { cars: carsResp, isLoading: loadingCars, error: carsError } = useGetCars();
  const cars = useMemo(() => carsResp?.cars || [], [carsResp]);
  const [selectedCarId, setSelectedCarId] = useState(null);

  useEffect(() => {
    if (cars.length && !selectedCarId) setSelectedCarId(cars[0].id);
  }, [cars, selectedCarId]);

  const selectedCar = useMemo(
    () => cars.find((c) => c.id === selectedCarId) || null,
    [cars, selectedCarId],
  );

  const deriveStatus = (car) => {
    const orders = car?.orders || [];
    const hasCompleted =
      orders.some(
        (o) =>
          o.status === "completed" ||
          (o.order_documents && o.order_documents.length > 0),
      );
    const isProcessing = orders.some(
      (o) => o.status === "pending" || o.status === "in_progress",
    );
    if (hasCompleted) return "completed";
    if (isProcessing) return "processing";
    return "none";
  };

  const selectedCarStatus = deriveStatus(selectedCar);

  const selectedCarDocuments = useMemo(() => {
    if (!selectedCar) return [];
    const docs = [];
    for (const o of selectedCar.orders || []) {
      for (const d of o.order_documents || []) {
        const fileUrl = d.file_path
          ? `https://api.motoka.ng/${d.file_path}`
          : d.url || d.file_url || null;
        docs.push({
          ...d,
          _orderType: o.order_type,
          _orderStatus: o.status,
          _fileUrl: fileUrl,
        });
      }
    }
    return docs;
  }, [selectedCar]);

  const onMyCarClick = () => setDocType("MyCar");
  const onDriverLicenseClick = () => setDocType("DriversLicense");

  const RightPanel = () => {
    if (loadingCars) {
      return (
        <div className="flex h-full w-full items-center justify-center text-sm text-[#05243F]/60">
          Loading your cars and documents...
        </div>
      );
    }
    if (carsError) {
      return (
        <div className="p-4 text-sm text-[#A73957]">
          {carsError?.message || "Failed to fetch cars"}
        </div>
      );
    }
    if (!selectedCar) {
      return (
        <div className="flex h-full w-full items-center justify-center text-sm text-[#05243F]/60">
          Select a car on the left to view document status.
        </div>
      );
    }

    return (
      <div className="flex h-full w-full flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#05243F]/60">Selected Car</div>
            <div className="text-base font-semibold text-[#05243F]">
              {selectedCar.vehicle_make} {selectedCar.vehicle_model} • {selectedCar.registration_no}
            </div>
          </div>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{
              backgroundColor:
                selectedCarStatus === "completed"
                  ? "#E8F5E8"
                  : selectedCarStatus === "processing"
                    ? "#FFEFCE"
                    : "#E5E7EB",
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  selectedCarStatus === "completed"
                    ? "#4CAF50"
                    : selectedCarStatus === "processing"
                      ? "#FDB022"
                      : "#9CA3AF",
              }}
            />
            <span className="text-xs font-medium text-[#05243F]">
              {selectedCarStatus === "completed"
                ? "Completed"
                : selectedCarStatus === "processing"
                  ? "Processing"
                  : "No Document"}
            </span>
          </div>
        </div>

        {selectedCarStatus === "completed" && (
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="mb-2 text-sm font-semibold text-[#05243F]">Documents</div>
            {selectedCarDocuments.length > 0 ? (
              <ul className="space-y-2">
                {selectedCarDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-[#F2F2F2] p-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#05243F]">
                        {doc.document_type || doc.original_filename || `Document ${idx + 1}`}
                      </div>
                      <div className="text-xs text-[#05243F]/60">Type: {doc._orderType}</div>
                    </div>
                    {doc._fileUrl ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-[#2389E3] hover:underline"
                        onClick={() =>
                          setPreviewDoc({
                            url: doc._fileUrl,
                            name: doc.document_type || doc.original_filename || "Document",
                            mime: doc.mime_type || "image/jpeg",
                          })
                        }
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-xs text-[#05243F]/50">No link</span>
                    )}

                    {/* {previewDoc.mime.startsWith("image/") && (
                      <img
                        src={doc._fileUrl}
                        alt={doc.document_type || "Document"}
                        className="mr-3 h-10 w-10 rounded object-cover"
                      />
                    )} */}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-[#05243F]/70">
                Your request is completed, but no document files are attached yet. You will be
                notified once files are available.
              </div>
            )}
          </div>
        )}

        {selectedCarStatus === "processing" && (
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="mb-1 text-sm font-semibold text-[#05243F]">Processing</div>
            <div className="text-sm text-[#05243F]/70">
              Your renewal request is being processed. We'll notify you once the documents are
              ready. You can check back here anytime.
            </div>
          </div>
        )}

        {selectedCarStatus === "none" && (
          <div className="rounded-xl bg-white p-4 shadow">
            <div className="mb-1 text-sm font-semibold text-[#05243F]">No document yet</div>
            <div className="text-sm text-[#05243F]/70">
              There is no active renewal request for this car. Start a renewal from the car
              details page to begin.
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add inside CarDocuments() component
  const handleDirectDownload = async () => {
    if (!previewDoc?.url) return;
    try {
      // Fetch as blob (CORS must be allowed by https://api.motoka.ng)
      const res = await fetch(previewDoc.url, {
        // credentials: 'include', // uncomment if auth cookies are required
      });
      if (!res.ok) throw new Error(`Failed to download: ${res.status}`);
      const blob = await res.blob();

      // Build a safe filename
      const rawName = previewDoc.name || "document";
      const safeName = rawName.replace(/[^a-z0-9._-]+/gi, "_");

      // Create blob URL and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback: open in new tab if blob download fails
      window.open(previewDoc.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="px-0 sm:px-6 lg:px-8 h-full pb-5">
      <PagesLayout
        title="Car Documents"
        subTitle="This is where you find all your vehicle papers e.g Vehicle License, Road worthiness and so on. "
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 rounded-[20px] overflow-hidden relative">
          {/* Left: navigation + car list */}
          <div className="flex-1 px-4 sm:px-8 pt-6 pb-10 bg-[linear-gradient(90deg,_rgba(255,255,255,0)_25.17%,_rgba(115,115,115,0.1)_128.52%)]  overflow-hidden h-full w-full absolute z-9 sm:relative">
            <DocumentsNav
              setDocType={setDocType}
              docType={docType}
              onMyCarClick={onMyCarClick}
              onDriverLicenseClick={onDriverLicenseClick}
            />
            {/* <DocumentPage
              selectedDocument={selectedDocument}
              setSelectedDocument={setSelectedDocument}
              docType={docType}
              activeTab={docType}
              showsidebar={showsidebar}
              setShowsidebar={setShowsidebar}
            /> */}

            {/* Cars list rendered via CarDetailsCard */}
            <div className="space-y-3">
              {loadingCars && (
                <div className="text-sm text-[#05243F]/60"><LoadingSpinner /></div>
              )}
              {carsError && (
                <div className="text-sm text-[#A73957]">
                  {carsError?.message || "Failed to fetch cars"}
                </div>
              )}
              {!loadingCars && !carsError && cars.length === 0 && (
                <div className="text-sm text-[#05243F]/60">No cars found.</div>
              )}
              {cars.map((car) => (
                <div key={car.id}>
                  <CarDetailsCard
                    carDetail={car}
                    isRenew={false}
                    onSelect={(c) => {
                      setSelectedCarId(c.id);
                      setShowsidebar(false);
                    }}
                    onRenewClick={() => { }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: selected car documents */}
          <div
            className={`flex-1 px-4 sm:px-4 bg-[#F9FAFC] pt-6 pb-6 ${showsidebar
              ? "w-0 overflow-hidden relative -z-10"
              : "w-full z-300 flex overflow-hidden"
              } sm:z-10  sm:w-full`}
          >
            <RightPanel />
            {previewDoc && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
                aria-modal="true"
                role="dialog"
              >
                <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[#F2F2F2] px-4 py-3 sm:px-6">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#05243F]">
                        {previewDoc.name}
                      </div>
                      <div className="truncate text-xs text-[#05243F]/60">
                        {previewDoc.mime}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Download */}
                      {/* <a
                        href={previewDoc.url}
                        download={previewDoc.name.replace(/\s+/g, "_")}
                        className="rounded-full bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b6dbc]"
                      >
                        Download
                      </a> */}
                      <button
                        type="button"
                        onClick={handleDirectDownload}
                        className="rounded-full bg-[#2389E3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b6dbc]"
                      >
                        Download
                      </button>
                      {/* Close */}
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(null)}
                        className="rounded-full border border-[#F2F2F2] px-4 py-2 text-sm font-semibold text-[#05243F] hover:bg-[#F9FAFC]"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="max-h-[75vh] overflow-auto bg-[#F9FAFC] p-4 sm:p-6">
                    {/* If it’s an image, preview as <img>. For other types (pdf), you can use <iframe>. */}
                    {previewDoc.mime.startsWith("image/") ? (
                      <img
                        src={previewDoc.url}
                        alt={previewDoc.name}
                        className="mx-auto max-h-[70vh] w-auto rounded-lg object-contain"
                      />
                    ) : (
                      <iframe
                        title={previewDoc.name}
                        src={previewDoc.url}
                        className="h-[70vh] w-full rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PagesLayout>
    </div>
  );
}

export default CarDocuments;