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
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option[filterKey].toLowerCase().includes(searchTerm.toLowerCase()),
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
    // setIsOpen(true);
    if (newValue != "") {
      setIsOpen(true);
    }
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
          className="mb-2 block text-sm font-medium text-[#05243F]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          id={name}
          name={name}
          value={searchTerm || value}
          onChange={handleInputChange}
          // onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          // className="mt-3 w-full rounded-[10px] bg-[#F4F5FC] p-4 text-sm text-[#05243F] transition-colors outline-none placeholder:text-[#05243F]/40 hover:bg-[#FFF4DD]/50 focus:bg-[#FFF4DD]"
          className={`block w-full rounded-md border bg-[#F4F5FC] px-3 py-2 text-sm hover:bg-[#FFF4DD]/50 focus:border-blue-500 focus:bg-[#FFF4DD] focus:ring-blue-500 disabled:opacity-50 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {isLoading && (
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          </div>
        )}
        {isOpen && filteredOptions.length > 0 && (
          <div className="ring-opacity-5 absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
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
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  name: PropTypes.string.isRequired,
  filterKey: PropTypes.string.isRequired,
  allowCustom: PropTypes.bool,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SearchableSelect;
