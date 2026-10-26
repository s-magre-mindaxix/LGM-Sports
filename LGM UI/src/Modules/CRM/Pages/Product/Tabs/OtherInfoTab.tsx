import React from "react";
import type { TabProps } from "../Services/types";
import Select from "react-select";
import { SearchableSelect } from "./SearchableSelect";

const OtherInfoTab: React.FC<TabProps> = ({
  data,
  setData,
  options,
  onAddMaster,
}) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  // 1. FIX: Consistent logic to get selected accessories for the Multi-Select
  const selectedAcc = React.useMemo(() => {
    if (!data.mapAccessories || !options.accessories) return [];
    const idArray = data.mapAccessories.split(",");
    return options.accessories.filter((opt: any) =>
      idArray.includes(opt.value.toString()),
    );
  }, [data.mapAccessories, options.accessories]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">📋</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Product Other Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HSN/SAC Code */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            HSN/SAC Code
          </label>
          <input
            className={inputStyle}
            value={data.hsnCode || ""}
            onChange={(e) => setData({ ...data, hsnCode: e.target.value })}
          />
        </div>

        <SearchableSelect
          label="Select Unit"
          options={options.units}
          value={data.unitId}
          onChange={(v) => setData({ ...data, unitId: v })}
        />

        <SearchableSelect
          label="Select Tax"
          options={options.taxes}
          value={data.taxId}
          onChange={(v) => setData({ ...data, taxId: v })}
        />

        <SearchableSelect
          label="Base Currency"
          options={options.currencies}
          value={data.currencyId}
          onChange={(v) => setData({ ...data, currencyId: v })}
          onAdd={() => onAddMaster("currency")}
        />

        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">Part Number</label>
          <input className={inputStyle} value={data.partNo || ""} onChange={(e) => setData({ ...data, partNo: e.target.value })} />
        </div>

        {/* Unit of Measurement */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            Unit of Measurement (UOM)
          </label>
          <input
            className={inputStyle}
            placeholder="e.g. Nos, Pcs, Mtr"
            value={data.uom || ""}
            onChange={(e) => setData({ ...data, uom: e.target.value })}
          />
        </div>

        {/* Currency Selection */}
        {/* <SearchableSelect 
                    label="Select Currency" 
                    options={options.currencies} 
                    value={data.currencyId} 
                    onChange={(v) => setData({ ...data, currencyId: v })} 
                    onAdd={() => onAddMaster('currency')} 
                /> */}

        {/* Part Condition Selection */}
        <SearchableSelect
          label="Select Part Condition"
          options={options.conditions}
          value={data.partConditionId}
          onChange={(v) => setData({ ...data, partConditionId: v })}
          onAdd={() => onAddMaster("condition")}
        />

        {/* Yes/No Dropdown */}
        <div className="flex flex-col">
          <label className="text-[11px] font-bold text-gray-400 uppercase mb-1">
            Select Part Have Accessories
          </label>
          <Select
            options={yesNoOptions}
            // FIX: Ensure value matches an object from yesNoOptions
            value={yesNoOptions.find(
              (o) => o.value === (data.hasAccessories || "No"),
            )}
            onChange={(opt: any) =>
              setData({
                ...data,
                hasAccessories: opt.value,
                // Auto-clear mapping if "No" is selected
                mapAccessories: opt.value === "No" ? "" : data.mapAccessories,
              })
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "42px",
              }),
            }}
          />
        </div>

        {/* Conditional Multi-Select Accessories */}
        {data.hasAccessories === "Yes" && (
          <div className="md:col-span-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[11px] font-bold text-gray-400 uppercase mb-1">
              Map Accessories (Multiple)
            </label>
            <Select
              isMulti
              options={options.accessories}
              value={selectedAcc}
              onChange={(vals: any) => {
                // Convert array of objects back to comma-separated string for DB
                const stringValue = vals
                  ? vals.map((v: any) => v.value).join(",")
                  : "";
                setData({ ...data, mapAccessories: stringValue });
              }}
              placeholder="Select Accessories by Code..."
              className="basic-multi-select"
              classNamePrefix="select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.5rem",
                  minHeight: "42px",
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#ebf2ff",
                  borderRadius: "4px",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#0b2c52",
                  fontWeight: "bold",
                }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OtherInfoTab;
