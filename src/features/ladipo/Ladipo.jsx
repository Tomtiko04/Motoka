import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";
import { getLadipoParts, getLadipoSections } from "../../services/apiLadipo";
import {
  getLadipoSubcategoriesByMainId,
  getLadipoPartsByCategory,
  getLadipoMainCategories,
} from "../../services/apiLadipoCategories";
import { useGetCars } from "../car/useCar";
import LadipoLayout from "./components/LadipoLayout";
import Categories from "./components/Categories";
import SubcategoriesNav from "./components/SubcategoriesNav";
import ProductsList from "./components/productsList";
import ProductRail from "./components/ProductRail";
import ProductSkeleton from "./components/ProductSkeleton";
import Searchbar from "./components/Searchbar";
import AllCategoriesModal from "./components/AllCategoriesModal";
import SelectCarModal from "./components/SelectCarModal";
import FilterSidebar from "./components/FilterSidebar";
import ladipoStore from "../../store/ladipoStore";

export default function Ladipo() {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [activeSearch, setActiveSearch] = useState(initialQ);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showCarModal, setShowCarModal] = useState(false);
  const hasPromptedCarModal = useRef(false);
  const [subcategories, setSubcategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  // Merchandising tag or null — set when user clicks "See All" on a
  // curated landing section, to browse the full tagged collection (paginated)
  const [activeCollection, setActiveCollection] = useState(null);
  // Force the full catalog grid (Browse All / Shop all parts) while staying
  // on /ladipo with no category/search filters applied.
  const [showCatalog, setShowCatalog] = useState(false);
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

  function normalizeFilterValue(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function normalizeMake(value) {
    const normalized = normalizeFilterValue(value);
    if (normalized === "mercedes" || normalized === "benz") return "mercedesbenz";
    if (normalized === "vw") return "volkswagen";
    return normalized;
  }

  function isCompatibilityMatch(car, rule) {
    if (!car || !rule) return false;
    const carMake = normalizeMake(car.vehicle_make);
    const carModel = normalizeFilterValue(car.vehicle_model);
    const carYearRaw = car.vehicle_year;
    const carYear = carYearRaw === undefined || carYearRaw === null || carYearRaw === ""
      ? null
      : Number(carYearRaw);

    const ruleMake = normalizeMake(rule.make);
    const ruleModel = normalizeFilterValue(rule.model);

    if (!ruleMake || carMake !== ruleMake) return false;
    if (ruleModel && carModel !== ruleModel) return false;

    if (carYear != null && Number.isFinite(carYear)) {
      if (rule.year_min != null && carYear < Number(rule.year_min)) return false;
      if (rule.year_max != null && carYear > Number(rule.year_max)) return false;
    }

    return true;
  }

  // Get store state and actions
  const {
    selectedMainCategory,
    selectedSubcategory,
    setSelectedMainCategory,
  } = ladipoStore();

  const { cars } = useGetCars();
  const garageCars = useMemo(() => {
    const carArray = cars?.cars || [];
    return Array.isArray(carArray) ? carArray : Object.values(carArray);
  }, [cars]);

  useEffect(() => {
    if (
      garageCars.length > 0 &&
      !selectedCar &&
      !hasPromptedCarModal.current &&
      !sessionStorage.getItem("ladipo_car_modal_shown")
    ) {
      hasPromptedCarModal.current = true;
      sessionStorage.setItem("ladipo_car_modal_shown", "1");
      setShowCarModal(true);
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
      activeCollection,
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

      // "See All" on a curated landing section — browse the full tagged
      // collection, independent of category/search filters.
      if (activeCollection) {
        const result = await getLadipoParts({
          tag: activeCollection,
          ...carParams,
          limit: itemsPerPage,
          page: currentPage,
        });
        const total = result?.total || 0;
        return {
          ...result,
          totalPages: total > 0 ? Math.ceil(total / itemsPerPage) : 0,
        };
      }

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
  const visibleParts = useMemo(() => {
    if (!selectedCar) return parts;
    return parts.filter((part) => {
      if (part?.is_universal) return true;
      const compatibilityRows = Array.isArray(part?.compatibility) ? part.compatibility : [];
      if (compatibilityRows.length === 0) return false;
      return compatibilityRows.some((rule) => isCompatibilityMatch(selectedCar, rule));
    });
  }, [parts, selectedCar]);

  const totalParts = partsData?.total ?? parts.length;
  const displayedPartsCount = selectedCar ? visibleParts.length : totalParts;
  const totalPages = (partsData?.totalPages ?? Math.ceil(totalParts / itemsPerPage)) || 1;

  const { data: fallbackData } = useQuery({
    queryKey: [
      "ladipo-parts",
      selectedMainCategory?.slug,
      selectedSubcategory?.slug,
      activeSearch,
      "fallback-no-car",
      sidebarQueryParams,
    ],
    queryFn: async () => {
      if (!selectedMainCategory) {
        return getLadipoParts({
          q: activeSearch || undefined,
          ...sidebarQueryParams,
          limit: itemsPerPage,
          page: currentPage,
        });
      }

      if (selectedSubcategory) {
        return getLadipoPartsByCategory(selectedMainCategory.slug, selectedSubcategory.slug, {
          page: currentPage,
          limit: itemsPerPage,
          q: activeSearch || undefined,
          ...sidebarQueryParams,
        });
      }

      return getLadipoPartsByCategory(selectedMainCategory.slug, null, {
        page: currentPage,
        limit: itemsPerPage,
        q: activeSearch || undefined,
        ...sidebarQueryParams,
      });
    },
    enabled: Boolean(selectedCar && activeSearch),
    staleTime: 60 * 1000,
  });

  const fallbackCount = fallbackData?.total ?? fallbackData?.parts?.length ?? 0;
  const partsCountLabel = partsLoading
    ? "Searching..."
    : `${displayedPartsCount} ${displayedPartsCount === 1 ? "part" : "parts"}`;

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
    setActiveCollection(null);
    setShowCatalog(false);
    resetSidebarFilters();
    ladipoStore.setState({
      selectedMainCategory: null,
      selectedMainCategoryId: null,
      selectedSubcategory: null,
      selectedSubcategoryId: null,
    });
  }

  function openCatalog() {
    setShowCatalog(true);
    setActiveCollection(null);
    setCurrentPage(1);
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

  // A real filter (category, search, car, sidebar) always wins over
  // collection-browsing — drop out of "See All" mode the moment one is applied.
  useEffect(() => {
    if (hasFilters && activeCollection) setActiveCollection(null);
  }, [hasFilters, activeCollection]);

  // Leave forced-catalog mode once a real filter is applied (category, etc.).
  useEffect(() => {
    if (hasFilters && showCatalog) setShowCatalog(false);
  }, [hasFilters, showCatalog]);

  const isLandingBase = !hasFilters && !activeCollection && !showCatalog;

  // Admin-curated sections shown only on the default landing view —
  // membership comes straight from is_essential/is_must_have flags an
  // admin sets per product, never inferred.
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ["ladipo-sections"],
    queryFn: getLadipoSections,
    enabled: isLandingBase,
    staleTime: 5 * 60 * 1000,
  });
  const essentialProducts = sectionsData?.essentials ?? [];
  const mustHaveProducts = sectionsData?.mustHaves ?? [];
  const featuredProducts = sectionsData?.featured ?? [];
  const bestsellerProducts = sectionsData?.bestsellers ?? [];
  const dealProducts = sectionsData?.deals ?? [];
  const hasCuratedContent =
    essentialProducts.length > 0 ||
    mustHaveProducts.length > 0 ||
    featuredProducts.length > 0 ||
    bestsellerProducts.length > 0 ||
    dealProducts.length > 0;

  // True landing state: no filters, no collection drill-in, not forced catalog,
  // AND there's curated content to show. If nothing is tagged yet, fall back
  // to the full grid rather than a blank page under Categories.
  const isCuratedLanding = isLandingBase && (sectionsLoading || hasCuratedContent);

  const { data: justInData, isLoading: justInLoading } = useQuery({
    queryKey: ["ladipo-parts", "just-in"],
    queryFn: () => getLadipoParts({ sort: "newest", limit: 8, page: 1 }),
    enabled: isCuratedLanding,
    staleTime: 5 * 60 * 1000,
  });
  const justInProducts = justInData?.parts ?? [];

  const { data: mainCategories = [] } = useQuery({
    queryKey: ["ladipo-main-categories"],
    queryFn: getLadipoMainCategories,
    enabled: isCuratedLanding,
    staleTime: 5 * 60 * 1000,
  });
  const railCategories = useMemo(() => (mainCategories || []).slice(0, 2), [mainCategories]);

  const categoryRailQueries = useQueries({
    queries: railCategories.map((category) => ({
      queryKey: ["ladipo-parts", "category-rail", category.slug],
      queryFn: () => getLadipoParts({ category_slug: category.slug, limit: 8, page: 1 }),
      enabled: isCuratedLanding && !!category.slug,
      staleTime: 5 * 60 * 1000,
    })),
  });

  function openCollection(tag) {
    setShowCatalog(false);
    setActiveCollection(tag);
    setCurrentPage(1);
  }

  function exitCollection() {
    setActiveCollection(null);
    setCurrentPage(1);
  }

  const COLLECTION_LABELS = {
    essential: "Essential Products",
    must_have: "Must Have",
    featured: "Featured",
    bestseller: "Bestsellers",
    deal: "Deals",
  };
  const collectionLabel = COLLECTION_LABELS[activeCollection] || "Collection";

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
            <Categories
              onBrowseAll={openCatalog}
              isBrowseAllActive={showCatalog && !selectedMainCategory}
            />
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

        {/* Discovery landing — curated rails + Just in + category rails */}
        {isCuratedLanding && sectionsLoading && (
          <ProductRail title="Essential Products" loading />
        )}

        {isCuratedLanding && !sectionsLoading && essentialProducts.length > 0 && (
          <ProductRail
            title="Essential Products"
            parts={essentialProducts}
            onSeeAll={() => openCollection("essential")}
          />
        )}

        {isCuratedLanding && !sectionsLoading && mustHaveProducts.length > 0 && (
          <ProductRail
            title="Must Have"
            parts={mustHaveProducts}
            onSeeAll={() => openCollection("must_have")}
          />
        )}

        {isCuratedLanding && !sectionsLoading && featuredProducts.length > 0 && (
          <ProductRail
            title="Featured"
            parts={featuredProducts}
            onSeeAll={() => openCollection("featured")}
          />
        )}

        {isCuratedLanding && !sectionsLoading && bestsellerProducts.length > 0 && (
          <ProductRail
            title="Bestsellers"
            parts={bestsellerProducts}
            onSeeAll={() => openCollection("bestseller")}
          />
        )}

        {isCuratedLanding && !sectionsLoading && dealProducts.length > 0 && (
          <ProductRail
            title="Deals"
            parts={dealProducts}
            onSeeAll={() => openCollection("deal")}
          />
        )}

        {isCuratedLanding && !sectionsLoading && (
          <ProductRail
            title="Just in"
            parts={justInProducts}
            loading={justInLoading}
            onSeeAll={openCatalog}
          />
        )}

        {isCuratedLanding &&
          !sectionsLoading &&
          railCategories.map((category, index) => (
            <ProductRail
              key={category.id || category.slug}
              title={category.name}
              parts={categoryRailQueries[index]?.data?.parts ?? []}
              loading={categoryRailQueries[index]?.isLoading}
              onSeeAll={() => setSelectedMainCategory(category)}
            />
          ))}

        {isCuratedLanding && !sectionsLoading && hasCuratedContent && (
          <div className="pt-8 pb-2 flex justify-center">
            <button
              type="button"
              onClick={openCatalog}
              className="inline-flex items-center justify-center rounded-full bg-[#2389E3] px-6 py-3 text-[14px] font-bold text-white hover:bg-[#1a7acf] transition-colors cursor-pointer"
            >
              Shop all parts
            </button>
          </div>
        )}

        {/* Active filters / active collection / forced catalog */}
        {(hasFilters || activeCollection || showCatalog) && (
          <>
            {/* Mobile: Compact filter summary */}
            <div className="md:hidden flex items-center justify-between gap-3 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#697C8C] font-medium">
                  {activeCollection
                    ? collectionLabel
                    : showCatalog && !hasFilters
                      ? "All parts"
                      : (() => {
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
                onClick={
                  activeCollection
                    ? exitCollection
                    : showCatalog && !hasFilters
                      ? () => setShowCatalog(false)
                      : clearAllFilters
                }
                className="text-[11px] text-[#2389E3] hover:text-[#1a7acf] font-semibold cursor-pointer whitespace-nowrap"
              >
                {activeCollection || (showCatalog && !hasFilters) ? "Back" : "Clear all"}
              </button>
            </div>

            {/* Desktop: Detailed filter chips */}
            <div className="hidden md:flex items-center gap-2 flex-wrap pt-4">
              <span className="text-[12px] text-[#697C8C] font-medium">Showing:</span>
              {activeCollection && (
                <span className="inline-flex items-center gap-1.5 bg-[#2389E3]/8 text-[#2389E3] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  {collectionLabel}
                  <button
                    onClick={exitCollection}
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {showCatalog && !hasFilters && !activeCollection && (
                <span className="inline-flex items-center gap-1.5 bg-[#2389E3]/8 text-[#2389E3] text-[12px] font-semibold px-3 py-1.5 rounded-[10px]">
                  All parts
                  <button
                    onClick={() => setShowCatalog(false)}
                    className="ml-0.5 hover:opacity-70 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
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

        {/* Results + sidebar — hidden on the curated landing view so it
            doesn't duplicate the Essential/Must Have rows above. Shown
            whenever a real filter or a collection ("See All") is active,
            or as a fallback if nothing has been curated yet. */}
        {!isCuratedLanding && (
        <div className="pt-6 mt-6 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 lg:justify-start">
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setShowDesktopFilters((v) => !v);
                  setShowMobileFilters(false);
                } else {
                  setShowMobileFilters(true);
                  setShowDesktopFilters(false);
                }
              }}
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
              {partsCountLabel}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div
              className={`hidden lg:block overflow-hidden transition-[width,opacity] duration-300 ease-out ${
                showDesktopFilters ? "w-[300px] opacity-100" : "w-0 opacity-0"
              }`}
            >
              <div className="flex h-full w-full items-start justify-center rounded-2xl border border-[#E1E6F4] bg-[#F9FAFC] px-4 py-5 shadow-sm">
                <FilterSidebar
                  filters={sidebarFilters}
                  onFiltersChange={(patch) => setSidebarFilters((f) => ({ ...f, ...patch }))}
                  categorySlug={selectedSubcategory?.slug || selectedMainCategory?.slug}
                  onClear={resetSidebarFilters}
                  hasActiveFilters={hasSidebarFilters}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
          {hasFilters && (
            <div className="hidden lg:flex items-center justify-between mb-3">
              <p className="text-[13px] text-[#697C8C]">
                {partsCountLabel}
              </p>
            </div>
          )}

          {partsLoading ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 sm:gap-3 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
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
                <>
                  <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                    No parts match "{activeSearch}" for {selectedCar.vehicle_make}{" "}
                    {selectedCar.vehicle_model}.
                  </p>
                  {fallbackCount > 0 ? (
                    <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                      We found {fallbackCount} matching {fallbackCount === 1 ? "part" : "parts"} for "{activeSearch}" across all cars. Remove the selected car filter to broaden results.
                    </p>
                  ) : (
                    <p className="text-[13px] text-[#697C8C] text-center max-w-xs">
                      Try a different search or clear the selected car filter.
                    </p>
                  )}
                </>
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
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={clearAllFilters}
                    className="text-[14px] text-white bg-[#2389E3] hover:bg-[#1a7acf] font-semibold px-4 py-2 rounded-[10px] cursor-pointer transition-colors"
                  >
                    Clear all filters
                  </button>
                  {activeSearch && selectedCar && fallbackCount > 0 && (
                    <button
                      onClick={() => setSelectedCar(null)}
                      className="text-[14px] text-[#2389E3] bg-white border border-[#2389E3] hover:bg-[#EFF7FF] font-semibold px-4 py-2 rounded-[10px] cursor-pointer transition-colors"
                    >
                      Show matching parts for all cars
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              <ProductsList parts={visibleParts} />
              
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
        )}
      </div>
      </div>
      <AllCategoriesModal
        open={showAllCategories}
        onClose={() => setShowAllCategories(false)}
      />
      <SelectCarModal
        open={showCarModal}
        onClose={() => setShowCarModal(false)}
        garageCars={garageCars}
        selectedCar={selectedCar}
        onProceed={(car) => {
          setSelectedCar(car);
          setShowCarModal(false);
        }}
      />
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40"
          onClick={() => setShowMobileFilters(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-[#F9FAFC] px-4 py-5 lg:max-h-full lg:w-[420px] lg:rounded-l-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex w-full max-w-[280px] items-center justify-between">
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
