import { Search } from "lucide-react";

export default function SearchBar({ value = "", onChange }) {
  return (
    <div>
      <form
        className="mx-auto flex max-w-md items-center gap-2 overflow-hidden rounded-full border border-gray-300 bg-white p-1 ps-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="settings-search" className="sr-only">
          Search settings
        </label>
        <Search className="mr-1 shrink-0 text-[#45A1F2]" size={20} />
        <input
          type="search"
          id="settings-search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="block w-full border-none bg-white py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
          placeholder="Search settings..."
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-[#697C8C] hover:bg-gray-100"
          >
            Clear
          </button>
        ) : (
          <span className="shrink-0 rounded-full bg-[#45A1F2] px-4 py-2 text-sm text-white">
            Search
          </span>
        )}
      </form>
    </div>
  );
}
