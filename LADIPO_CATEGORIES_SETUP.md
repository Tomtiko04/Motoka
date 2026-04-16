# Ladipo Categories Implementation - Setup Guide

## STEP 1: Execute SQL Migration in Supabase

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content from: `scripts/seed-ladipo-categories.sql`
5. Click **Run** to execute

This will create:
- `ladipo_main_categories` table (10 categories)
- `ladipo_subcategories` table (47 subcategories)
- `ladipo_parts_subcategories` table (junction table)
- All necessary indexes

**Expected Output**: "Query successful" with no errors

---

## STEP 2: Link Existing Parts to Subcategories

You have two options:

### Option A: Manual Linking (Best for controlling categorization)

```javascript
// Use this in your backend or frontend console to categorize parts
import { linkPartToSubcategory } from '@/services/apiLadipoCategories';

// Example: Link a part to "Oil & Filters" subcategory
// 1. Find the subcategory ID in Supabase (ladipo_subcategories table)
// 2. Get your part IDs from ladipo_parts table
// 3. Link them:
await linkPartToSubcategory('part-uuid-here', 'subcategory-uuid-here');
```

### Option B: SQL Batch Link (Fastest - based on part names)

Add this to your `scripts/seed-ladipo-categories.sql`:

```sql
-- Link existing parts to subcategories based on keywords in their names
-- Oil & Filters
INSERT INTO ladipo_parts_subcategories (part_id, subcategory_id)
SELECT lp.id, ls.id
FROM ladipo_parts lp
JOIN ladipo_subcategories ls ON ls.slug = 'oil-filters'
WHERE LOWER(lp.name) LIKE '%oil%' OR LOWER(lp.name) LIKE '%filter%'
ON CONFLICT DO NOTHING;

-- Brake Pads & Shoes
INSERT INTO ladipo_parts_subcategories (part_id, subcategory_id)
SELECT lp.id, ls.id
FROM ladipo_parts lp
JOIN ladipo_subcategories ls ON ls.slug = 'brake-pads-shoes'
WHERE LOWER(lp.name) LIKE '%brake%pad%' OR LOWER(lp.name) LIKE '%brake%shoe%'
ON CONFLICT DO NOTHING;

-- Tires
INSERT INTO ladipo_parts_subcategories (part_id, subcategory_id)
SELECT lp.id, ls.id
FROM ladipo_parts lp
JOIN ladipo_subcategories ls ON ls.slug = 'tires'
WHERE LOWER(lp.name) LIKE '%tire%' OR LOWER(lp.name) LIKE '%tyre%'
ON CONFLICT DO NOTHING;
```

---

## STEP 3: Verify Database Setup

Run this query in Supabase SQL Editor to verify tables exist:

```sql
-- Check main categories
SELECT COUNT(*) as main_categories FROM ladipo_main_categories;
-- Expected: 10

-- Check subcategories
SELECT COUNT(*) as subcategories FROM ladipo_subcategories;
-- Expected: 47

-- Check junction table
SELECT COUNT(*) as linked_parts FROM ladipo_parts_subcategories;
-- Expected: varies based on parts you linked
```

---

## STEP 4: Start the Dev Server

Run your Vite dev server:

```bash
npm run dev
```

---

## STEP 5: Test the Implementation

### Desktop Testing:
1. Navigate to the Ladipo page
2. See main categories as horizontal pills
3. Click any category → subcategories appear below
4. Click a subcategory → products filter
5. Search still works within filtered view
6. Use "Clear all" to reset filters

### Mobile Testing:
1. Test on mobile viewport
2. Verify scroll arrows appear when needed
3. Check that category pills are selectable
4. Verify subcategories scroll smoothly
5. Test filter chips display correctly

### Advanced Testing:
- Try combining category + search + car filter
- Verify empty states show contextual messages
- Check that breadcrumbs update correctly
- Test "Clear selection" buttons

---

## STEP 6: Troubleshooting

### Issue: "Table does not exist" error
**Solution**: Run the SQL migration again, ensure no errors

### Issue: Categories not loading
**Solution**: 
- Check browser console for API errors
- Verify Zustand store is imported correctly
- Check that apiLadipoCategories.js imports supabaseClient properly

### Issue: Products not filtering
**Solution**:
- Verify parts are linked to subcategories in database
- Check that part IDs match in both tables
- Review browser console for query errors

### Issue: Styling looks wrong
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Restart dev server
- Check Tailwind is building correctly

---

## FILE CHECKLIST

✅ **Created:**
- `scripts/seed-ladipo-categories.sql` - Database migration
- `src/services/apiLadipoCategories.js` - API service
- `src/store/ladipoStore.js` - State management
- `src/features/ladipo/components/SubcategoriesNav.jsx` - Subcategories UI

✅ **Modified:**
- `src/features/ladipo/components/Categories.jsx` - Updated to fetch from DB
- `src/features/ladipo/Ladipo.jsx` - Integrated category filtering

---

## API FUNCTIONS AVAILABLE

```javascript
import {
  getAllLadipoCategoriesWithSubs,      // Get all + subcategories
  getLadipoMainCategories,              // Get just main categories
  getLadipoSubcategoriesByMainId,      // Get subs for a main category
  getLadipoSubcategoriesByMainSlug,    // Same, by slug
  getLadipoPartsByCategory,             // Get parts filtered by category
  linkPartToSubcategory,                // Link a part to subcategory
  unlinkPartFromSubcategory,            // Unlink a part
  getPartSubcategories,                 // Get all subs for a part
} from '@/services/apiLadipoCategories';
```

---

## ZUSTAND STORE METHODS

```javascript
import ladipoStore from '@/store/ladipoStore';

// Get state
const { selectedMainCategory, selectedSubcategory, filters } = ladipoStore();

// Set category
ladipoStore.setState({ selectedMainCategory: category });

// Clear filters
ladipoStore.setState({
  selectedMainCategory: null,
  selectedSubcategory: null,
  filters: { searchTerm: '', sortBy: 'newest', ... }
});

// Get filter count
const count = ladipoStore.getState().getActiveFiltersCount();
```

---

## NEXT FEATURES (Optional Enhancements)

- Add category-based promotions/featured items
- Create "Related categories" recommendations
- Add category analytics (most viewed/purchased)
- Build admin panel for category management
- Add category images instead of just icons
- Create maintenance schedule recommendations per category

---

## Support

All files are production-ready. The system handles:
- ✅ Loading states with skeletons
- ✅ Error handling with try-catch
- ✅ Mobile responsiveness
- ✅ State persistence with localStorage
- ✅ Proper scroll behavior
- ✅ Touch-friendly interactions
- ✅ Accessible button labeling
