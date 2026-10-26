
import React from "react";
import type { TabProps } from "../Services/types";
import { SearchableSelect } from "../../Product/Tabs/SearchableSelect";

type Props = TabProps & { errors?: { [key: string]: string[] } };

const OtherInfoTab: React.FC<Props> = ({
  data,
  setData,
  options,
  onAddMaster,
  errors: _errors,
}) => {
  const inputStyle =
    "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-[#343331] outline-none transition placeholder:text-gray-400 focus:border-[#f07837] focus:ring-4 focus:ring-[#f07837]/10";

  const labelStyle =
    "mb-1.5 block text-[11px] font-extrabold uppercase tracking-[.15em] text-[#77766f]";

  return (
    <div className="space-y-6">
      <div className="border-b border-black/[.07] pb-4">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#c65b27]">
          LGM Sports · Product catalog
        </p>
        <h3 className="text-xl font-black uppercase tracking-tight text-[#252a2e]">
          Other specifications
        </h3>
        <p className="mt-1 text-sm text-[#77766f]">
          Add classification and measurement details for this product.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[.06] bg-[#fbfaf8] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="hsn-code" className={labelStyle}>
              HSN/SAC Code
            </label>
            <input
              id="hsn-code"
              className={inputStyle}
              value={data.hsnCode}
              onChange={(e) => setData({ ...data, hsnCode: e.target.value })}
              placeholder="Enter HSN/SAC code"
            />
          </div>

          <div>
            <label htmlFor="uom" className={labelStyle}>
              Unit of Measurement (UOM)
            </label>
            <input
              id="uom"
              className={inputStyle}
              value={data.uom}
              onChange={(e) => setData({ ...data, uom: e.target.value })}
              placeholder="Enter unit of measurement"
            />
          </div>

          <SearchableSelect
            label="Part Condition"
            options={options.conditions}
            value={data.partConditionId}
            onChange={(v) => setData({ ...data, partConditionId: v })}
            onAdd={() => onAddMaster("condition")}
          />
        </div>
      </section>
    </div>
  );
};

export default OtherInfoTab;
