import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getAllLadipoCategoriesWithSubs } from "../../../services/apiLadipoCategories";
import ladipoStore from "../../../store/ladipoStore";

export default function AllCategoriesModal({ open, onClose }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { setSelectedMainCategory, setSelectedSubcategory } = ladipoStore();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllLadipoCategoriesWithSubs();
        if (!cancelled) setGroups(data || []);
      } catch {
        if (!cancelled) setError("Unable to load categories.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePickMain = (category) => {
    setSelectedMainCategory(category);
    onClose();
  };

  const handlePickSub = (parent, sub) => {
    setSelectedMainCategory(parent);
    setSelectedSubcategory(sub);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E1E6F4] px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#05243F]">All categories</h2>
            <p className="text-[12px] text-[#697C8C]">
              Browse parts by category and subcategory.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#697C8C] hover:bg-[#F4F5FC]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="mb-3 h-4 w-40 animate-pulse rounded bg-[#F4F5FC]" />
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <div
                        key={j}
                        className="h-7 w-24 animate-pulse rounded-full bg-[#F4F5FC]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="rounded-xl border border-[#F2D3D3] bg-[#FFF7F7] px-4 py-3 text-[13px] text-[#A33A3A]">
              {error}
            </p>
          ) : groups.length === 0 ? (
            <p className="text-[13px] text-[#697C8C]">No categories available.</p>
          ) : (
            <div className="space-y-6">
              {groups.map((parent) => (
                <section key={parent.id}>
                  <button
                    onClick={() => handlePickMain(parent)}
                    className="mb-3 text-left text-[15px] font-bold text-[#05243F] hover:text-[#1A7ACF]"
                  >
                    {parent.name}
                  </button>
                  {parent.subcategories?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {parent.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handlePickSub(parent, sub)}
                          className="rounded-full border border-[#E1E6F4] px-3 py-1.5 text-[12px] font-semibold text-[#05243F] hover:border-[#1A7ACF] hover:bg-[#1A7ACF]/5 hover:text-[#1A7ACF]"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#697C8C]">
                      Tap to browse this category.
                    </p>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
