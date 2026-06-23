import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";
import { getLadipoParts } from "../../services/apiLadipo";
import { getLadipoSubcategoriesByMainId, getLadipoPartsByCategory } from "../../services/apiLadipoCategories";
import { useGetCars } from "../car/useCar";
import LadipoLayout from "./components/LadipoLayout";
import Categories from "./components/Categories";
import SubcategoriesNav from "./components/SubcategoriesNav";
import ProductsList from "./components/productsList";
import ProductSkeleton from "./components/ProductSkeleton";
import Searchbar from "./components/Searchbar";
import AllCategoriesModal from "./components/AllCategoriesModal";
import FilterSidebar from "./components/FilterSidebar";
import ladipoStore from "../../store/ladipoStore";

export default function Ladipo() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [activeSearch, setActiveSearch] = useState(initialQ);
  const [selectedCar, setSelectedCar] = useState(null);
  const hasAutoSelectedSingleCar = useRef(false);
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState({
    brand: [],
    condition: [],
    part_type: [],
    minPriceNgn: null,
    maxPriceNgn: null,
    sort: "newest",
  });

  const sidebarQueryParams = useMemo(() => {
    const p = {};
    if (sidebarFilters.brand?.length) p.brand = sidebarFilters.brand.join(",");
    if (sidebarFilters.condition?.length) p.condition = sidebarFilters.condition.join(",");
    if (sidebarFilters.part_type?.length) p.part_type = sidebarFilters.part_type.join(",");
    if (sidebarFilters.minPriceNgn != null) p.min_price_kobo = sidebarFilters.minPriceNgn * 100;
    if (sidebarFilters.maxPriceNgn != null) p.max_price_kobo = sidebarFilters.maxPriceNgn * 100;
    if (sidebarFilters.sort && sidebarFilters.sort !== "newest") p.sort = sidebarFilters.sort;
    return p;
  }, [sidebarFilters]);

  const hasSidebarFilters =
    sidebarFilters.brand?.length > 0 ||
    sidebarFilters.condition?.length > 0 ||
    sidebarFilters.part_type?.length > 0 ||
    sidebarFilters.minPriceNgn != null ||
    sidebarFilters.maxPriceNgn != null ||
    (sidebarFilters.sort && sidebarFilters.sort !== "newest");
  const itemsPerPage = 12; // 3 rows on desktop (4 columns), 6 items on mobile (2 columns)

  // Get store state and actions
  const {
    selectedMainCategory,
    selectedSubcategory,
  } = ladipoStore();

  const { cars } = useGetCars();
  const garageCars = useMemo(() => {
    const carArray = cars?.cars || [];
    return Array.isArray(carArray) ? carArray : Object.values(carArray);
  }, [cars]);

  useEffect(() => {
    if (garageCars.length === 1 && !selectedCar && !hasAutoSelectedSingleCar.current) {
      hasAutoSelectedSingleCar.current = true;
      setSelectedCar(garageCars[0]);
    }
  }, [garageCars, selectedCar]);

  // Fetch subcategories when main category changes
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (selectedMainCategory?.id) {
        try {
          const data = await getLadipoSubcategoriesByMainId(selectedMainCategory.id);
          setSubcategories(data);
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    };

    fetchSubcategories();
  }, [selectedMainCategory]);

  // Fetch parts based on category/subcategory
  const { data: partsData, isLoading: partsLoading, isError: partsError } = useQuery({
    queryKey: [
      "ladipo-parts",
      selectedMainCategory?.slug,
      selectedSubcategory?.slug,
      activeSearch,
      selectedCar?.vehicle_make,
      selectedCar?.vehicle_model,
      selectedCar?.vehicle_year,
      currentPage,
      sidebarQueryParams,
    ],
    queryFn: async () => {
      const carParams = {
        make: selectedCar?.vehicle_make || undefined,
        model: selectedCar?.vehicle_model || undefined,
        year: selectedCar?.vehicle_year || undefined,
      };

      // If no category selected, get all parts
      if (!selectedMainCategory) {
        const result = await getLadipoParts({
          q: activeSearch || undefined,
          ...carParams,
          ...sidebarQueryParams,
          limit: itemsPerPage,
          page: currentPage,
        });

        const total = result?.total || 0;
        return {
          ...result,
          totalPages: total > 0 ? Math.ceil(total / itemsPerPage) : 0,
        };
      }

      // If category selected with subcategory
      if (selectedSubcategory) {
        const result = await getLadipoPartsByCategory(
          selectedMainCategory.slug,
          selectedSubcategory.slug,
          {
            page: currentPage,
            limit: itemsPerPage,
            q: activeSearch || undefined,
            ...carParams,
            ...sidebarQueryParams,
          }
        );
        return result;
      }

      // If only main category selected
      const result = await getLadipoPartsByCategory(
        selectedMainCategory.slug,
        null,
        {
          page: currentPage,
          limit: itemsPerPage,
          q: activeSearch || undefined,
          ...carParams,
          ...sidebarQueryParams,
        }
      );
      return result;
    },
    staleTime: 60 * 1000,
  });

  const parts = partsData?.parts ?? [];
  const totalParts = partsData?.total ?? parts.length;
  const totalPages = partsData?.totalPages ?? 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMainCategory, selectedSubcategory, activeSearch, selectedCar, sidebarQueryParams]);

  function handlePageChange(page) {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSearch(overrideTerm) {
    setActiveSearch(typeof overrideTerm === "string" ? overrideTerm : searchTerm);
  }

  function resetSidebarFilters() {
    setSidebarFilters({
      brand: [],
      condition: [],
      part_type: [],
      minPriceNgn: null,
      maxPriceNgn: null,
      sort: "newest",
    });
  }

  function clearAllFilters() {
    setSelectedCar(null);
    setActiveSearch("");
    setSearchTerm("");
    resetSidebarFilters();
    ladipoStore.setState({
      selectedMainCategory: null,
      selectedMainCategoryId: null,
      selectedSubcategory: null,
      selectedSubcategoryId: null,
    });
  }

  const hasFilters =
    selectedMainCategory || selectedSubcategory || selectedCar || activeSearch || hasSidebarFilters;

  return (
    <LadipoLayout
      title="Ladipo"
      subTitle="Browse genuine and aftermarket parts for your vehicle."
      showWalletDemo
    >
      <div className="bg-white rounded-2xl pt-5 pb-6 px-5 sm:px-6">
        <div className="flex flex-col gap-0">
          {/* Search */}
          <Searchbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            selectedCar={selectedCar}
            setSelectedCar={setSelectedCar}
            garageCars={garageCars}
          />

          {/* Main Categories */}
          <div className="pt-5 pb-2">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[15px]">
                <span className="font-semibold text-[#8B98A5]">Categories</span>
                {selectedMainCategory && (
                  <span className="font-bold text-[#05243F]"> / {selectedMainCategory.name}</span>
                )}
              </p>
              <button
                onClick={() => setShowAllCategories(true)}
                className="text-[13px] font-semibold text-[#8B98A5] hover:text-[#05243F] transition-colors"
              >
                See All
              </button>
            </div>
            <Categories />
          </div>

        {/* Subcategories — shown when main category is selected */}
        {selectedMainCategory && subcategories.length > 0 && (
          <div className="pt-2 pb-2 -mx-5 sm:-mx-6">
            <SubcategoriesNav
              subcategories={subcategories}
              mainCategory={selectedMainCategory}
            />
          </div>
        )}

        {/* Active filters — only shown when filtering */}
        {hasFilters && (
          <>
            {/* Mobile: Compact filter summary */}
            <div className="md:hidden flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#697C8C] font-medium">
                  {(() => {
                    let count = 0;
                    if (selectedCar) count++;
                    if (selectedMainCategory) count++;
                    if (selectedSubcategory) count++;
                    if (activeSearch) count++;
                    return `${count} filter${count !== 1 ? "s" : ""} active`;
                  })()}
                </span>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#2389E3] hover:text-[#1a7acf] font-semibold cursor-pointer whitespace-nowrap"
              >
                Clear all
              </button>
            </div>

            {/* Desktop: Detailed filter chips */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <span className="text-[12px] text-[#697C8C] font-medium">Showing:</span>
              {selectedCar && (
                <span className="inline-flex items-center gap-1.5 bg-[#2389E3]/8 text-[#2389E3] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  <Icon icon="ion:car-sport-sharp" width="13" />
                  {selectedCar.vehicle_make} {selectedCar.vehicle_model}
                  <button
                    onClick={() => setSelectedCar(null)}
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedMainCategory && (
                <span className="inline-flex items-center gap-1.5 bg-[#05243F]/8 text-[#05243F] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  {selectedMainCategory.name}
                  <button
                    onClick={() =>
                      ladipoStore.setState({
                        selectedMainCategory: null,
                        selectedMainCategoryId: null,
                        selectedSubcategory: null,
                        selectedSubcategoryId: null,
                      })
                    }
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="inline-flex items-center gap-1.5 bg-[#7C3AED]/8 text-[#7C3AED] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  {selectedSubcategory.name}
                  <button
                    onClick={() =>
                      ladipoStore.setState({
                        selectedSubcategory: null,
                        selectedSubcategoryId: null,
                      })
                    }
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {activeSearch && (
                <span className="inline-flex items-center gap-1.5 bg-[#EBB850]/12 text-[#9A7730] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  &ldquo;{activeSearch}&rdquo;
                  <button
                    onClick={() => {
                      setActiveSearch("");
                      setSearchTerm("");
                    }}
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-[12px] text-[#697C8C] hover:text-[#2389E3] font-medium ml-1 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </>
        )}

        {/* Results + sidebar */}
        <div className="border-t border-[#E1E6F4] pt-6 mt-6 flex flex-col lg:flex-row gap-6">
          {/* Sidebar — desktop static, mobile drawer */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={sidebarFilters}
              onFiltersChange={(patch) => setSidebarFilters((f) => ({ ...f, ...patch }))}
              categorySlug={selectedSubcategory?.slug || selectedMainCategory?.slug}
              onClear={resetSidebarFilters}
              hasActiveFilters={hasSidebarFilters}
            />
          </div>

          {/* Mobile filter trigger */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E1E6F4] bg-white px-3 py-2 text-[13px] font-semibold text-[#05243F]"
            >
              <Icon icon="solar:filter-bold-duotone" width="16" />
              Filters
              {hasSidebarFilters && (
                <span className="ml-1 rounded-full bg-[#1A7ACF] px-2 py-0.5 text-[10px] text-white">
                  on
                </span>
              )}
            </button>
            <p className="text-[12px] text-[#697C8C]">
              {partsLoading ? "Searching..." : `${totalParts} ${totalParts === 1 ? "part" : "parts"}`}
            </p>
          </div>

          <div className="flex-1 min-w-0">
          {hasFilters && (
            <div className="hidden lg:flex items-center justify-between mb-3">
              <p className="text-[13px] text-[#697C8C]">
                {partsLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <span className="font-bold text-[#05243F] text-[15px]">
                      {totalParts}
                    </span>{" "}
                    {totalParts === 1 ? "part" : "parts"} found
                  </>
                )}
              </p>
            </div>
          )}

          {partsLoading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : partsError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-[#E1E6F4]">
              <p className="text-[16px] font-semibold text-[#05243F]">Failed to load parts</p>
              <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                Please check your connection and try again.
              </p>
            </div>
          ) : parts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl">
              <div className="w-20 h-20 rounded-2xl bg-[#F4F5FC] flex items-center justify-center">
                <Icon
                  icon="solar:box-bold-duotone"
                  width="36"
                  className="text-[#D3D9DE]"
                />
              </div>
              <p className="text-[16px] font-semibold text-[#05243F]">
                No parts found
              </p>
              {activeSearch && selectedCar && (
                <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                  No parts match "{activeSearch}" for {selectedCar.vehicle_make}{" "}
                  {selectedCar.vehicle_model}. Try a different search.
                </p>
              )}
              {activeSearch && !selectedCar && (
                <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                  No parts match "{activeSearch}". Try searching for a different
                  term or browse categories.
                </p>
              )}
              {!activeSearch && selectedCar && (
                <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                  No parts available for your {selectedCar.vehicle_make}{" "}
                  {selectedCar.vehicle_model}. Try browsing all parts.
                </p>
              )}
              {!activeSearch && selectedMainCategory && !selectedCar && (
                <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                  No parts in this category. Try browsing other categories.
                </p>
              )}
              {!activeSearch && !selectedMainCategory && !selectedCar && (
                <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                  Try different filters or search terms.
                </p>
              )}
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[14px] text-white bg-[#2389E3] hover:bg-[#1a7acf] font-semibold px-4 py-2 rounded-[10px] cursor-pointer transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <ProductsList parts={parts} selectedCar={selectedCar} garageCars={garageCars} />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6">
                  {/* Mobile: Show compact pagination (< 5/20 >) */}
                  <div className="md:hidden flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#697C8C] hover:bg-[#F4F5FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon icon="solar:arrow-left-linear" width="16" />
                    </button>

                    <span className="text-[13px] font-medium text-[#697C8C] whitespace-nowrap">
                      {currentPage} / {totalPages}
                    </span>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#697C8C] hover:bg-[#F4F5FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon icon="solar:arrow-right-linear" width="16" />
                    </button>
                  </div>

                  {/* Desktop: Show full pagination */}
                  <div className="hidden md:flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#697C8C] hover:bg-[#F4F5FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon icon="solar:arrow-left-linear" width="16" />
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                            pageNum === currentPage
                              ? "bg-[#2389E3] text-white"
                              : "text-[#697C8C] hover:bg-[#F4F5FC]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage <= totalPages - 3 && (
                      <span className="text-[#697C8C] text-sm">...</span>
                    )}

                    {totalPages > 5 && currentPage > 3 && (
                      <span className="text-[#697C8C] text-sm">...</span>
                    )}

                    {totalPages > 5 && (
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                          totalPages === currentPage
                            ? "bg-[#2389E3] text-white"
                            : "text-[#697C8C] hover:bg-[#F4F5FC]"
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-[#697C8C] hover:bg-[#F4F5FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon icon="solar:arrow-right-linear" width="16" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
        </div>
      </div>
      <AllCategoriesModal
        open={showAllCategories}
        onClose={() => setShowAllCategories(false)}
      />
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-[#F9FAFC] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#05243F]">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-[13px] font-semibold text-[#2389E3]"
              >
                Done
              </button>
            </div>
            <FilterSidebar
              filters={sidebarFilters}
              onFiltersChange={(patch) => setSidebarFilters((f) => ({ ...f, ...patch }))}
              categorySlug={selectedSubcategory?.slug || selectedMainCategory?.slug}
              onClear={resetSidebarFilters}
              hasActiveFilters={hasSidebarFilters}
            />
          </div>
        </div>
      )}
    </LadipoLayout>
  );
}
