import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  name,
  filterKey,
  allowCustom = true,
  disabled = false,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option[filterKey].toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, filterKey]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option[filterKey] } });
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    if (allowCustom) {
      onChange({ target: { name, value: newValue } });
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-[#05243F]"
        >
          {label}
        </label>
      )}
      <div className="relative mt-3">
        <input
          type="text"
          id={name}
          name={name}
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`block w-full rounded-[10px] bg-[#F4F5FC] py-4 pl-4 pr-10 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD] disabled:opacity-50 ${
            error ? "ring-2 ring-red-300" : "border-0"
          }`}
        />
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          ) : (
            <svg
              className={`h-4 w-4 text-[#05243F]/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-[10px] border border-[#E1E5EE] bg-white py-1">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer px-4 py-3 text-sm text-[#05243F] hover:bg-[#FFF4DD]/50"
                onClick={() => handleSelect(option)}
              >
                {option[filterKey]}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

SearchableSelect.propTypes = {
  label: PropTypes.node,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  filterKey: PropTypes.string.isRequired,
  allowCustom: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool
};

export default SearchableSelect; 