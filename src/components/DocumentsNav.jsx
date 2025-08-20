function DocumentsNav({
  activeTab = "MyCar",
  onMyCarClick,
  onDriverLicenseClick,
  docType,
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-4">
      <button
        onClick={onMyCarClick}
        className={`rounded-full py-2 text-sm font-semibold transition-all ${
          docType === "MyCar"
            ? "bg-transparent text-[#2389E3] hover:text-[#000000]"
            : "bg-transparent text-[#697C8C] hover:text-[#2389E3]"
        }`}
      >
        My Cars
      </button>

      <button
        onClick={onDriverLicenseClick}
        className={`rounded-full py-2 text-sm font-semibold transition-all ${
          docType === "DriversLicense"
            ? "bg-transparent text-[#2389E3] hover:text-[#000000]"
            : "bg-transparent text-[#697C8C] hover:text-[#2389E3]"
        }`}
      >
        My Driver's License
      </button>
    </div>
  );
}

export default DocumentsNav;
