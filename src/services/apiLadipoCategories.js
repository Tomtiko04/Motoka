import { getLadipoCategories, getLadipoParts } from "./apiLadipo";

const CATEGORY_VISUALS = {
  "spare-parts": {
    image:
      "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Garage Core",
    blurb: "Suspension, brakes, and hard parts for serious fixes.",
    accentFrom: "#0F2F4B",
    accentTo: "#1F7A8C",
  },
  "servicing-parts": {
    image:
      "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Routine Service",
    blurb: "Filters and essentials that keep engines healthy.",
    accentFrom: "#5A2A16",
    accentTo: "#D17A22",
  },
  "lubricants-fluids": {
    image:
      "https://autofactorng.com/images/category/XVyuLyp1izSHnlblXXdvplQkVbexPRmELSr90X6L.jpg",
    eyebrow: "Performance Fluids",
    blurb: "Engine oils and fluids for everyday running and long life.",
    accentFrom: "#3A260C",
    accentTo: "#A96B12",
  },
  "spare-parts-brake-wheel-hub-bearings": {
    image:
      "https://autofactorng.com/images/products/l/a9WQ17QfipfcDmnwqXSh3PcXcOuAv260MGeGL7HM.webp",
    eyebrow: "Stopping Power",
    blurb: "Pads, rotors, bearings, and wheel-speed parts.",
    accentFrom: "#4A1010",
    accentTo: "#B73434",
  },
  "spare-parts-suspension-parts": {
    image:
      "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Ride Control",
    blurb: "Control arms, linkages, struts, and bushings.",
    accentFrom: "#10263E",
    accentTo: "#3F86C6",
  },
  "servicing-parts-oil-filter": {
    image:
      "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Clean Circulation",
    blurb: "OEM and aftermarket oil filters for quick maintenance.",
    accentFrom: "#38411B",
    accentTo: "#8AA132",
  },
  "lubricants-fluids-engine-oil": {
    image:
      "https://autofactorng.com/images/category/xiVyMDgRRNQ6jobUfllovKhnZBdJA5ENhC3ZRvMu.jpg",
    eyebrow: "Oil Shelf",
    blurb: "Synthetic and mineral engine oils across common grades.",
    accentFrom: "#2A2108",
    accentTo: "#D09A1D",
  },
};

const withVisuals = (category) => ({
  ...category,
  ...(CATEGORY_VISUALS[category.slug] || {
    image: null,
    eyebrow: "Category",
    blurb: "Browse parts in this section.",
    accentFrom: "#12324C",
    accentTo: "#2389E3",
  }),
});

async function fetchCategories() {
  const categories = await getLadipoCategories();
  return Array.isArray(categories) ? categories.map(withVisuals) : [];
}

function buildHierarchy(categories) {
  const parents = categories.filter((category) => !category.parent_id);
  const childrenByParent = new Map();

  categories
    .filter((category) => category.parent_id)
    .forEach((category) => {
      const existing = childrenByParent.get(category.parent_id) || [];
      existing.push(category);
      childrenByParent.set(category.parent_id, existing);
    });

  return parents.map((parent) => ({
    ...parent,
    subcategories: (childrenByParent.get(parent.id) || []).sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
  }));
}

/**
 * Fetch all main categories with their subcategories
 */
export const getAllLadipoCategoriesWithSubs = async () => {
  try {
    const categories = await fetchCategories();
    return buildHierarchy(categories);
  } catch (error) {
    console.error("Error fetching ladipo categories:", error);
    throw error;
  }
};

/**
 * Fetch a single main category with its subcategories
 */
export const getLadipoCategoryBySlug = async (slug) => {
  try {
    const categories = await getAllLadipoCategoriesWithSubs();
    return categories.find((category) => category.slug === slug) || null;
  } catch (error) {
    console.error(`Error fetching category ${slug}:`, error);
    throw error;
  }
};

/**
 * Fetch just main categories (without subcategories)
 */
export const getLadipoMainCategories = async () => {
  try {
    const categories = await fetchCategories();
    return categories
      .filter((category) => !category.parent_id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  } catch (error) {
    console.error("Error fetching main categories:", error);
    throw error;
  }
};

/**
 * Fetch subcategories for a specific main category
 */
export const getLadipoSubcategoriesByMainId = async (mainCategoryId) => {
  try {
    const categories = await fetchCategories();
    return categories
      .filter((category) => category.parent_id === mainCategoryId)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

/**
 * Fetch subcategories by main category slug
 */
export const getLadipoSubcategoriesByMainSlug = async (mainCategorySlug) => {
  try {
    const category = await getLadipoCategoryBySlug(mainCategorySlug);
    return category?.subcategories || [];
  } catch (error) {
    console.error("Error fetching subcategories by slug:", error);
    throw error;
  }
};

/**
 * Fetch a single subcategory
 */
export const getLadipoSubcategoryBySlug = async (mainCategorySlug, subcategorySlug) => {
  try {
    const subcategories = await getLadipoSubcategoriesByMainSlug(mainCategorySlug);
    return subcategories.find((subcategory) => subcategory.slug === subcategorySlug) || null;
  } catch (error) {
    console.error("Error fetching subcategory:", error);
    throw error;
  }
};

/**
 * Get parts filtered by main category and/or subcategory
 */
export const getLadipoPartsByCategory = async (
  mainCategorySlug,
  subcategorySlug = null,
  { page = 1, limit = 12, q, make, model, year } = {}
) => {
  try {
    const result = await getLadipoParts({
      category_slug: subcategorySlug || mainCategorySlug,
      page,
      limit,
      q,
      make,
      model,
      year,
    });

    const total = result?.total || 0;
    return {
      parts: result?.parts || [],
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  } catch (error) {
    console.error("Error fetching parts by category:", error);
    throw error;
  }
};

/**
 * Get all subcategories for a part
 */
export const getPartSubcategories = async (partId) => {
  if (!partId) return [];
  // No dedicated backend endpoint exists for part → subcategory mapping.
  // Return an empty list so callers don't accidentally consume unrelated subcategories.
  return [];
};
