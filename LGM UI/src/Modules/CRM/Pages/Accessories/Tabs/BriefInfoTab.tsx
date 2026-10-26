import React from "react";
import type { TabProps } from "../Services/types";
import { SearchableSelect } from "../../Product/Tabs/SearchableSelect";

type Props = TabProps & { errors?: { [key: string]: string[] } };

const BriefInfoTab: React.FC<Props> = ({
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
          Brief details
        </h3>
        <p className="mt-1 text-sm text-[#77766f]">
          Add product descriptions, specifications, and warranty information.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[.06] bg-[#fbfaf8] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="accessories-description" className={labelStyle}>
              Description
            </label>
            <textarea
              id="accessories-description"
              rows={4}
              className={inputStyle}
              value={data.accessoriesDescription}
              onChange={(e) =>
                setData({ ...data, accessoriesDescription: e.target.value })
              }
              placeholder="Describe the product..."
            />
          </div>

          <div>
            <label htmlFor="accessories-specification" className={labelStyle}>
              Specification
            </label>
            <textarea
              id="accessories-specification"
              rows={4}
              className={inputStyle}
              value={data.specification}
              onChange={(e) =>
                setData({ ...data, specification: e.target.value })
              }
              placeholder="Add product specifications..."
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[.06] bg-white p-4 sm:p-5">
        <h4 className="mb-4 text-xs font-extrabold uppercase tracking-[.16em] text-[#a64a1d]">
          Product details
        </h4>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SearchableSelect
            label="Variant"
            options={options.variants}
            value={data.variantId}
            onChange={(v) => setData({ ...data, variantId: v })}
            onAdd={() => onAddMaster("variant")}
          />

          <SearchableSelect
            label="Version"
            options={options.versions}
            value={data.versionId}
            onChange={(v) => setData({ ...data, versionId: v })}
            onAdd={() => onAddMaster("version")}
          />

          <div>
            <label htmlFor="part-unique" className={labelStyle}>
              Part Unique No
            </label>
            <input
              id="part-unique"
              className={inputStyle}
              value={data.partUnique}
              onChange={(e) => setData({ ...data, partUnique: e.target.value })}
              placeholder="Enter part number"
            />
          </div>

          <div>
            <label htmlFor="manufacturing-date" className={labelStyle}>
              Manufacturing Date
            </label>
            <input
              id="manufacturing-date"
              type="date"
              className={inputStyle}
              value={data.manufacturingDate?.split("T")[0]}
              onChange={(e) =>
                setData({ ...data, manufacturingDate: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="expiry-date" className={labelStyle}>
              Expiry Date
            </label>
            <input
              id="expiry-date"
              type="date"
              className={inputStyle}
              value={data.expiryDate?.split("T")[0]}
              onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="warranty-period" className={labelStyle}>
              Warranty
            </label>
            <input
              id="warranty-period"
              className={inputStyle}
              value={data.warrantyPeriod}
              onChange={(e) =>
                setData({ ...data, warrantyPeriod: e.target.value })
              }
              placeholder="Enter warranty period"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default BriefInfoTab;
