
import React from "react";
import Select from "react-select";

interface Props {
  label: string;
  options: { value: number; label: string }[];
  value?: number;
  onChange: (val: number | undefined) => void;
  onAdd: () => void;
}

// Keep this as a named export.
export const SearchableSelect: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  onAdd,
}) => (
  <div className="flex grow flex-col">
    <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[.15em] text-[#77766f]">
      {label}
    </label>

    <div className="flex gap-2">
      <Select
        options={options || []}
        value={options?.find((option) => option.value === value) ?? null}
        onChange={(option) => onChange(option?.value)}
        isSearchable
        className="grow text-sm"
        placeholder="Select option"
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 42,
            borderRadius: "0.75rem",
            fontSize: "14px",
            borderColor: state.isFocused ? "#f07837" : "#dedbd5",
            boxShadow: state.isFocused ? "0 0 0 3px rgba(240, 120, 55, 0.12)" : "none",
            "&:hover": {
              borderColor: "#f07837",
            },
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#f07837"
              : state.isFocused
                ? "#fff0e7"
                : "white",
            color: state.isSelected ? "white" : "#343331",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
      />

      <button
        type="button"
        onClick={onAdd}
        className="rounded-xl bg-[#f07837] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20"
      >
        Add
      </button>
    </div>
  </div>
);

// IMPORTANT: Do not add a default export here.
