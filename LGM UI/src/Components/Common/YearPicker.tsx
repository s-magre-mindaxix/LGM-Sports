// src/Components/Common/YearPicker.tsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const YearPicker: React.FC<YearPickerProps> = ({ label, value, onChange }) => {
  const handleYearChange = (amount: number) => {
    const currentYear = parseInt(value, 10);
    if (!isNaN(currentYear)) {
      onChange(String(currentYear + amount));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and ensure it's not longer than 4 digits
    if (/^\d*$/.test(newValue) && newValue.length <= 4) {
      onChange(newValue);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative flex items-center border border-gray-300 rounded-md shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
        <button
          type="button"
          onClick={() => handleYearChange(-1)}
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
          aria-label="Previous year"
        >
          <ChevronLeft size={16} />
        </button>
        <input
          type="text" // Use text to avoid default number spinners
          value={value}
          onChange={handleInputChange}
          className="w-full text-center border-l border-r border-gray-300 py-2 text-sm font-medium text-gray-800 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => handleYearChange(1)}
          className="px-3 py-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
          aria-label="Next year"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default YearPicker;