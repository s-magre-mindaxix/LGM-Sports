import React from "react";
import Select from "react-select";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface Props {
  label: string;
  options: { value: number; label: string }[];
  value?: number;
  onChange: (val: number | undefined) => void;
  onAdd: () => void;
}

// Check: Must be "export const"
export const SearchableSelect: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  onAdd,
}) => (
  <div className="flex flex-col grow">
    <label className="text-[11px] font-bold text-gray-400 uppercase mb-1 tracking-wider">
      {label}
    </label>
    <div className="flex gap-1">
      <Select
        options={options || []}
        value={options ? options.find((o) => o.value === value) : null}
        onChange={(opt) => onChange(opt ? (opt as any).value : undefined)}
        isSearchable
        className="grow"
        placeholder="Select Option"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: 40,
            borderRadius: "0.5rem",
            fontSize: "14px",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
      />
      <button
        type="button"
        onClick={onAdd}
        className={buttonStyles.add}
      >
        Add
      </button>
    </div>
  </div>
);
// IMPORTANT: DO NOT ADD "export default" here.
