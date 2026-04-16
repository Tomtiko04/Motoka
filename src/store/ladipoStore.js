import { create } from "zustand";
import { persist } from "zustand/middleware";

const ladipoStore = create(
  persist(
    (set, get) => ({
      // State
      selectedMainCategory: null,
      selectedMainCategoryId: null,
      selectedSubcategory: null,
      selectedSubcategoryId: null,
      filters: {
        searchTerm: "",
        sortBy: "newest", // newest, pricelow, pricehigh, rating
        priceRange: [0, 10000000],
        brands: [],
        condition: [], // new, used, refurbished
      },

      // Actions
      setSelectedMainCategory: (category) =>
        set({
          selectedMainCategory: category,
          selectedMainCategoryId: category?.id || null,
          selectedSubcategory: null, // Reset subcategory when main category changes
          selectedSubcategoryId: null,
        }),

      setSelectedSubcategory: (subcategory) =>
        set({
          selectedSubcategory: subcategory,
          selectedSubcategoryId: subcategory?.id || null,
        }),

      clearCategoryFilters: () =>
        set({
          selectedMainCategory: null,
          selectedMainCategoryId: null,
          selectedSubcategory: null,
          selectedSubcategoryId: null,
        }),

      updateFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        })),

      setSearchTerm: (term) =>
        set((state) => ({
          filters: {
            ...state.filters,
            searchTerm: term,
          },
        })),

      setSortBy: (sort) =>
        set((state) => ({
          filters: {
            ...state.filters,
            sortBy: sort,
          },
        })),

      setPriceRange: (min, max) =>
        set((state) => ({
          filters: {
            ...state.filters,
            priceRange: [min, max],
          },
        })),

      addBrandFilter: (brand) =>
        set((state) => ({
          filters: {
            ...state.filters,
            brands: [...new Set([...state.filters.brands, brand])],
          },
        })),

      removeBrandFilter: (brand) =>
        set((state) => ({
          filters: {
            ...state.filters,
            brands: state.filters.brands.filter((b) => b !== brand),
          },
        })),

      clearBrandFilters: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            brands: [],
          },
        })),

      addConditionFilter: (condition) =>
        set((state) => ({
          filters: {
            ...state.filters,
            condition: [...new Set([...state.filters.condition, condition])],
          },
        })),

      removeConditionFilter: (condition) =>
        set((state) => ({
          filters: {
            ...state.filters,
            condition: state.filters.condition.filter((c) => c !== condition),
          },
        })),

      clearConditionFilters: () =>
        set((state) => ({
          filters: {
            ...state.filters,
            condition: [],
          },
        })),

      resetAllFilters: () =>
        set({
          selectedMainCategory: null,
          selectedMainCategoryId: null,
          selectedSubcategory: null,
          selectedSubcategoryId: null,
          filters: {
            searchTerm: "",
            sortBy: "newest",
            priceRange: [0, 10000000],
            brands: [],
            condition: [],
          },
        }),

      // Getters (not state, but computed values)
      getActiveFiltersCount: () => {
        const state = get();
        let count = 0;
        if (state.selectedMainCategory) count++;
        if (state.selectedSubcategory) count++;
        if (state.filters.searchTerm) count++;
        if (state.filters.brands.length > 0) count += state.filters.brands.length;
        if (state.filters.condition.length > 0) count += state.filters.condition.length;
        return count;
      },

      getFilterSummary: () => {
        const state = get();
        const summary = [];
        if (state.selectedMainCategory) {
          summary.push(`Category: ${state.selectedMainCategory.name}`);
        }
        if (state.selectedSubcategory) {
          summary.push(`Subcategory: ${state.selectedSubcategory.name}`);
        }
        if (state.filters.searchTerm) {
          summary.push(`Search: "${state.filters.searchTerm}"`);
        }
        if (state.filters.brands.length > 0) {
          summary.push(`Brands: ${state.filters.brands.join(", ")}`);
        }
        return summary.join(" | ");
      },
    }),
    {
      name: "ladipo-store", // Name of the storage key
      partialize: (state) => ({
        filters: state.filters,
        selectedMainCategory: state.selectedMainCategory,
        selectedMainCategoryId: state.selectedMainCategoryId,
        selectedSubcategory: state.selectedSubcategory,
        selectedSubcategoryId: state.selectedSubcategoryId,
      }), // Only persist filters and selected categories
    }
  )
);

export default ladipoStore;
