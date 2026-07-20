import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getLadipoPartFacets } from "../../../services/apiLadipo";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name (A–Z)" },
];

function CollapsibleSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E1E6F4] py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-[13px] font-bold text-[#05243F]"
      >
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function CheckboxRow({ label, count, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-2 text-[13px]">
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 cursor-pointer rounded border-[#D3D9DE] text-[#1A7ACF] focus:ring-[#1A7ACF]"
        />
        <span className={`${checked ? "font-semibold text-[#05243F]" : "text-[#465465]"}`}>
          {label}
        </span>
      </span>
      {count != null && (
        <span className="text-[11px] text-[#8B98A5]">{count}</span>
      )}
    </label>
  );
}

export default function FilterSidebar({
  filters,
  onFiltersChange,
  categorySlug,
  onClear,
  hasActiveFilters,
}) {
  const { data: facets, isLoading } = useQuery({
    queryKey: ["ladipo-facets", categorySlug || null],
    queryFn: () => getLadipoPartFacets(categorySlug ? { category_slug: categorySlug } : {}),
    staleTime: 5 * 60 * 1000,
  });

  const priceBounds = useMemo(() => {
    const min = Math.floor((facets?.price_kobo?.min ?? 0) / 100);
    const max = Math.ceil((facets?.price_kobo?.max ?? 0) / 100);
    return { min, max };
  }, [facets]);

  const [localPrice, setLocalPrice] = useState({
    min: filters.minPriceNgn ?? "",
    max: filters.maxPriceNgn ?? "",
  });

  useEffect(() => {
    setLocalPrice({
      min: filters.minPriceNgn ?? "",
      max: filters.maxPriceNgn ?? "",
    });
  }, [filters.minPriceNgn, filters.maxPriceNgn]);

  const toggleArray = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ [key]: next });
  };

  const applyPrice = () => {
    const min = localPrice.min === "" ? null : Math.max(0, parseInt(localPrice.min, 10) || 0);
    const max = localPrice.max === "" ? null : Math.max(0, parseInt(localPrice.max, 10) || 0);
    onFiltersChange({ minPriceNgn: min, maxPriceNgn: max });
  };

  return (
    <aside className="mx-auto w-full max-w-[280px]">
      <div className="rounded-2xl border border-[#E1E6F4] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E1E6F4] pb-3">
          <h3 className="text-[15px] font-bold text-[#05243F]">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClear}
              className="text-[12px] font-semibold text-[#2389E3] hover:text-[#1a7acf]"
            >
              Reset
            </button>
          )}
        </div>

        <CollapsibleSection title="Sort by">
          <select
            value={filters.sort || "newest"}
            onChange={(e) => onFiltersChange({ sort: e.target.value })}
            className="w-full rounded-lg border border-[#E1E6F4] bg-white px-3 py-2 text-[13px] text-[#05243F] focus:border-[#1A7ACF] focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </CollapsibleSection>

        <CollapsibleSection title="Price (₦)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              placeholder={`Min ${priceBounds.min.toLocaleString()}`}
              value={localPrice.min}
              onChange={(e) => setLocalPrice((p) => ({ ...p, min: e.target.value }))}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="w-full rounded-lg border border-[#E1E6F4] bg-white px-2 py-1.5 text-[12px] text-[#05243F] focus:border-[#1A7ACF] focus:outline-none"
            />
            <span className="text-[12px] text-[#8B98A5]">–</span>
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              placeholder={`Max ${priceBounds.max.toLocaleString()}`}
              value={localPrice.max}
              onChange={(e) => setLocalPrice((p) => ({ ...p, max: e.target.value }))}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="w-full rounded-lg border border-[#E1E6F4] bg-white px-2 py-1.5 text-[12px] text-[#05243F] focus:border-[#1A7ACF] focus:outline-none"
            />
          </div>
          {priceBounds.max > 0 && (
            <p className="text-[11px] text-[#8B98A5]">
              In catalog: ₦{priceBounds.min.toLocaleString()} – ₦{priceBounds.max.toLocaleString()}
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Brand">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-[#F4F5FC]" />
              ))}
            </div>
          ) : facets?.brands?.length ? (
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {facets.brands.slice(0, 50).map((b) => (
                <CheckboxRow
                  key={b.value}
                  label={b.value}
                  count={b.count}
                  checked={(filters.brand || []).includes(b.value)}
                  onChange={() => toggleArray("brand", b.value)}
                />
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#8B98A5]">No brands available</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Condition">
          {isLoading ? (
            <div className="h-4 animate-pulse rounded bg-[#F4F5FC]" />
          ) : facets?.conditions?.length ? (
            facets.conditions.map((c) => (
              <CheckboxRow
                key={c.value}
                label={c.value[0].toUpperCase() + c.value.slice(1)}
                count={c.count}
                checked={(filters.condition || []).includes(c.value)}
                onChange={() => toggleArray("condition", c.value)}
              />
            ))
          ) : (
            <p className="text-[12px] text-[#8B98A5]">No conditions available</p>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Part type" defaultOpen={false}>
          {isLoading ? (
            <div className="h-4 animate-pulse rounded bg-[#F4F5FC]" />
          ) : facets?.part_types?.length ? (
            facets.part_types.map((p) => (
              <CheckboxRow
                key={p.value}
                label={p.value[0].toUpperCase() + p.value.slice(1)}
                count={p.count}
                checked={(filters.part_type || []).includes(p.value)}
                onChange={() => toggleArray("part_type", p.value)}
              />
            ))
          ) : (
            <p className="text-[12px] text-[#8B98A5]">No part types available</p>
          )}
        </CollapsibleSection>
      </div>
    </aside>
  );
}
