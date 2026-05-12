import { getLadipoCategories, getLadipoParts } from "./apiLadipo";

const CATEGORY_VISUALS = {
  // ── Top-level categories ──────────────────────────────────
  "spare-parts": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Garage Core",
    blurb: "Suspension, brakes, engine, and hard parts for serious fixes.",
    accentFrom: "#0F2F4B",
    accentTo: "#1F7A8C",
  },
  "servicing-parts": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Routine Service",
    blurb: "Filters, plugs, belts, and essentials that keep engines healthy.",
    accentFrom: "#5A2A16",
    accentTo: "#D17A22",
  },
  "lubricants-fluids": {
    image: "https://autofactorng.com/images/category/XVyuLyp1izSHnlblXXdvplQkVbexPRmELSr90X6L.jpg",
    eyebrow: "Performance Fluids",
    blurb: "Engine oils, ATF, brake fluid, and coolant for everyday running.",
    accentFrom: "#3A260C",
    accentTo: "#A96B12",
  },
  "tyres-wheels": {
    image: "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Rubber & Rims",
    blurb: "Branded tyres and alloy wheels for every road condition.",
    accentFrom: "#1A1A1A",
    accentTo: "#555555",
  },
  "electrical-batteries": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Power & Electrics",
    blurb: "Batteries, bulbs, alternators, and starters for reliable power.",
    accentFrom: "#0A2A50",
    accentTo: "#1565C0",
  },
  "car-accessories": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Personalise",
    blurb: "Interior mats, covers, and exterior add-ons for your car.",
    accentFrom: "#1B3A2D",
    accentTo: "#2E8B57",
  },

  // ── Spare Parts sub-categories ────────────────────────────
  "spare-parts-brake-wheel-hub-bearings": {
    image: "https://autofactorng.com/images/products/l/a9WQ17QfipfcDmnwqXSh3PcXcOuAv260MGeGL7HM.webp",
    eyebrow: "Stopping Power",
    blurb: "Pads, rotors, bearings, and wheel-speed sensors.",
    accentFrom: "#4A1010",
    accentTo: "#B73434",
  },
  "spare-parts-suspension-parts": {
    image: "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Ride Control",
    blurb: "Control arms, linkages, struts, ball joints, and bushings.",
    accentFrom: "#10263E",
    accentTo: "#3F86C6",
  },
  "spare-parts-engine-parts": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Engine Work",
    blurb: "Timing chains, gaskets, tensioners, and engine rebuild kits.",
    accentFrom: "#2A0A08",
    accentTo: "#8B2500",
  },
  "spare-parts-steering-parts": {
    image: "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Stay on Course",
    blurb: "Tie rods, rack boots, steering pumps, and linkages.",
    accentFrom: "#0A2A40",
    accentTo: "#0D6B8F",
  },
  "spare-parts-exhaust-system": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Let It Breathe",
    blurb: "Mufflers, flex pipes, catalytic converters, and gaskets.",
    accentFrom: "#2A2A2A",
    accentTo: "#606060",
  },

  // ── Servicing Parts sub-categories ───────────────────────
  "servicing-parts-oil-filter": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Clean Circulation",
    blurb: "OEM and aftermarket oil filters for quick maintenance.",
    accentFrom: "#38411B",
    accentTo: "#8AA132",
  },
  "servicing-parts-air-filter": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Clean Breathing",
    blurb: "Engine and cabin air filters to keep the air clean.",
    accentFrom: "#0E3A2A",
    accentTo: "#1D8A5E",
  },
  "servicing-parts-spark-plugs": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Ignition",
    blurb: "Iridium, platinum, and standard spark plugs for all engines.",
    accentFrom: "#3A1A00",
    accentTo: "#CC6600",
  },
  "servicing-parts-fuel-filter": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "Clean Fuel",
    blurb: "Inline and in-tank fuel filters to protect injectors.",
    accentFrom: "#1A1A3A",
    accentTo: "#3A5EC2",
  },
  "servicing-parts-timing-belts": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Stay in Time",
    blurb: "Timing belt and chain kits with tensioners and water pumps.",
    accentFrom: "#2A1A00",
    accentTo: "#8B5500",
  },

  // ── Lubricants / Fluids sub-categories ───────────────────
  "lubricants-fluids-engine-oil": {
    image: "https://autofactorng.com/images/category/xiVyMDgRRNQ6jobUfllovKhnZBdJA5ENhC3ZRvMu.jpg",
    eyebrow: "Oil Shelf",
    blurb: "Synthetic and mineral engine oils across common grades.",
    accentFrom: "#2A2108",
    accentTo: "#D09A1D",
  },
  "lubricants-fluids-gear-oil": {
    image: "https://autofactorng.com/images/category/XVyuLyp1izSHnlblXXdvplQkVbexPRmELSr90X6L.jpg",
    eyebrow: "Smooth Shifts",
    blurb: "Automatic and manual transmission fluids for every gearbox.",
    accentFrom: "#0A2A1A",
    accentTo: "#1A7A3A",
  },
  "lubricants-fluids-brake-fluid-coolant": {
    image: "https://autofactorng.com/images/category/XVyuLyp1izSHnlblXXdvplQkVbexPRmELSr90X6L.jpg",
    eyebrow: "Safety Fluids",
    blurb: "DOT 4 brake fluid and long-life engine coolant.",
    accentFrom: "#1A0A2A",
    accentTo: "#6A1A8A",
  },

  // ── Tyres & Wheels sub-categories ────────────────────────
  "tyres-wheels-car-tyres": {
    image: "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Hit the Road",
    blurb: "Bridgestone, Michelin, Dunlop, and Continental tyres.",
    accentFrom: "#1A1A1A",
    accentTo: "#444444",
  },
  "tyres-wheels-alloy-wheels": {
    image: "https://autofactorng.com/images/category/CWFeB26VJcugEoNXzQNAeNsrqdVazpF8DubcZaY1.webp",
    eyebrow: "Style & Function",
    blurb: "Alloy wheels, steel rims, and hubcap covers.",
    accentFrom: "#1A1A2A",
    accentTo: "#3A3A6A",
  },

  // ── Electrical & Batteries sub-categories ────────────────
  "electrical-batteries-car-batteries": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Power Source",
    blurb: "Bosch, Exide, and Amaron batteries for all vehicles.",
    accentFrom: "#0A1A30",
    accentTo: "#1A4080",
  },
  "electrical-batteries-bulbs-lighting": {
    image: "https://autofactorng.com/images/category/Pjk5TMe4zRDvzEFM84lUKpldF4F8DdTAEebC2Ggq.webp",
    eyebrow: "See & Be Seen",
    blurb: "OSRAM, Philips, and LED bulbs for headlights and interior.",
    accentFrom: "#2A2A00",
    accentTo: "#8A8A00",
  },
  "electrical-batteries-alternators": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Keep Charging",
    blurb: "Remanufactured alternators and starter motors.",
    accentFrom: "#1A0A30",
    accentTo: "#4A1A80",
  },

  // ── Car Accessories sub-categories ───────────────────────
  "car-accessories-interior": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Inside Out",
    blurb: "Floor mats, seat covers, dashboard accessories, and more.",
    accentFrom: "#1A2A1A",
    accentTo: "#2E7D32",
  },
  "car-accessories-exterior": {
    image: "https://autofactorng.com/images/category/vhZYJ0wKwMtDAgBqFDvhEXaWMif1WtqnF5gsgC1j.jpg",
    eyebrow: "Looking Good",
    blurb: "Body kits, car covers, wipers, and exterior trim.",
    accentFrom: "#0A1A2A",
    accentTo: "#0D47A1",
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
