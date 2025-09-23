import { useState } from "react";
import ApperIcon from "@/components/ApperIcon";

const FilterDropdown = ({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "All"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center justify-between min-w-[140px]"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ApperIcon 
          name="ChevronDown" 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                onClick={() => handleSelect("")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                {placeholder}
              </button>
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                    value === option.value 
                      ? "bg-primary text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterDropdown;