import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Option {
  id: number | string;
  name: string;
}

interface SearchableSelectProps {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an Option",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find(
    (opt) => String(opt.id) === String(value),
  );

  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- NEW KEYBOARD HANDLER ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Prevent form submission if nested in a form
      e.preventDefault();

      if (filteredOptions.length > 0) {
        // Select the first item from the filtered results
        const firstResult = filteredOptions[0];
        onChange(String(firstResult.id));
        setIsOpen(false);
        setSearchTerm("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const labelStyle =
    "absolute -top-2.5 left-6 bg-gray-100 px-1 text-[11px] font-bold text-black uppercase z-10 tracking-wide";
  const inputStyle = `w-full border border-gray-200 rounded-full px-4 py-2 flex items-center justify-between bg-white text-sm font-medium transition-all shadow-sm cursor-pointer ${
    disabled
      ? "opacity-50 cursor-not-allowed bg-gray-50"
      : "hover:border-blue-400"
  }`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className={labelStyle}>{label}</label>

      <div
        className={inputStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-50 bg-gray-50 flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent text-sm outline-none py-1"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // --- ATTACHED THE HANDLER HERE ---
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    String(opt.id) === String(value)
                      ? "bg-[#133561] text-white"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                  onClick={() => {
                    onChange(String(opt.id));
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {opt.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default SearchableSelect;
