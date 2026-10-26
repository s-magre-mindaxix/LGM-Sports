import React from "react";
import type { TabProps, Accessories } from "../Services/types";
import Select from "react-select";
import { FaPlus, FaTrash } from "react-icons/fa";
import { SearchableSelect } from "./SearchableSelect";

type Props = TabProps & { errors?: { [key: string]: string[] } };

const RateTab: React.FC<Props> = ({
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

  const addCurrencyRow = () => {
    const current = data.currencyPrices || [];
    setData({
      ...data,
      currencyPrices: [...current, { currencyId: 0, price: 0 }],
    });
  };

  const updateCurrencyRow = (index: number, field: string, value: any) => {
    const newList = [...(data.currencyPrices || [])];
    newList[index] = { ...newList[index], [field]: value };
    setData({ ...data, currencyPrices: newList });
  };

  const handleFocus = (field: keyof Accessories) => {
    if (data[field] === 0) {
      setData((prev) => ({ ...prev, [field]: "" as any }));
    }
  };

  const handleBlur = (field: keyof Accessories) => {
    if (data[field] === "" || data[field] === null || data[field] === undefined) {
      setData((prev) => ({ ...prev, [field]: 0 }));
    }
  };

  const taxPreferences = [
    { value: "Taxable", label: "Taxable" },
    { value: "Non Taxable", label: "Non Taxable" },
    { value: "Out Of Scope", label: "Out Of Scope" },
    { value: "Non Gst Supply", label: "Non Gst Supply" },
  ];

  const taxRates = [
    { value: 0, label: "GST 0%" },
    { value: 5, label: "GST 5%" },
    { value: 12, label: "GST 12%" },
    { value: 18, label: "GST 18%" },
    { value: 28, label: "GST 28%" },
  ];

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: "0.75rem",
      minHeight: "44px",
      borderColor: "#dedbd5",
      boxShadow: "none",
      "&:hover": { borderColor: "#f07837" },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#f07837"
        : state.isFocused
          ? "#fff0e7"
          : "white",
      color: state.isSelected ? "white" : "#343331",
    }),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-black/[.07] pb-4">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#c65b27]">
          LGM Sports · Product catalog
        </p>
        <h3 className="text-xl font-black uppercase tracking-tight text-[#252a2e]">
          Accessories rate information
        </h3>
        <p className="mt-1 text-sm text-[#77766f]">
          Set product pricing, tax rates, inventory levels, and import duties.
        </p>
      </div>

      <section className="rounded-2xl border border-black/[.06] bg-[#fbfaf8] p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <label className={labelStyle}>Purchase Price</label>
            <input
              type="number"
              className={inputStyle}
              value={data.purchasePrice}
              onFocus={() => handleFocus("purchasePrice")}
              onBlur={() => handleBlur("purchasePrice")}
              onChange={(e) =>
                setData({ ...data, purchasePrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Sale Price</label>
            <input
              type="number"
              className={inputStyle}
              value={data.salePrice}
              onFocus={() => handleFocus("salePrice")}
              onBlur={() => handleBlur("salePrice")}
              onChange={(e) =>
                setData({ ...data, salePrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Tax Preferences</label>
            <Select
              options={taxPreferences}
              value={taxPreferences.find((o) => o.value === data.taxPreference)}
              onChange={(opt) => setData({ ...data, taxPreference: opt?.value })}
              styles={selectStyles}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Select Tax Rate</label>
            <Select
              options={taxRates}
              value={taxRates.find((o) => o.value === data.taxRateId)}
              onChange={(opt) => setData({ ...data, taxRateId: opt?.value })}
              styles={selectStyles}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Available Quantity</label>
            <input
              type="number"
              className={inputStyle}
              value={data.availableQuantity}
              onFocus={() => handleFocus("availableQuantity")}
              onBlur={() => handleBlur("availableQuantity")}
              onChange={(e) =>
                setData({ ...data, availableQuantity: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="flex flex-col">
            <label className={labelStyle}>Out of Stock Warning</label>
            <input
              type="number"
              className={inputStyle}
              value={data.outOfStockWarning}
              onFocus={() => handleFocus("outOfStockWarning")}
              onBlur={() => handleBlur("outOfStockWarning")}
              onChange={(e) =>
                setData({ ...data, outOfStockWarning: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      </section>

      {data.productSource === "Imported" && (
        <section className="animate-in slide-in-from-top-2 rounded-2xl border border-[#f07837]/20 bg-[#fff7f1] p-4 sm:p-5">
          <h4 className="mb-4 text-[11px] font-black uppercase tracking-[.17em] text-[#a64a1d]">
            Import duty configuration
          </h4>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="flex flex-col">
              <label className={labelStyle}>BCD (%)</label>
              <input type="number" className={inputStyle} value={data.bcd} onChange={(e) => setData({ ...data, bcd: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>SWS (%)</label>
              <input type="number" className={inputStyle} value={data.sws} onChange={(e) => setData({ ...data, sws: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>IGST (%)</label>
              <input type="number" className={inputStyle} value={data.igst} onChange={(e) => setData({ ...data, igst: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-black/[.08] bg-white shadow-sm">
        <div className="flex flex-col gap-3 bg-[#252a2e] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em]">Manual multi-currency pricing</p>
            <p className="mt-1 text-xs text-white/60">Add direct product prices by currency.</p>
          </div>
          <button
            type="button"
            onClick={addCurrencyRow}
            className="inline-flex items-center justify-center rounded-xl bg-[#f07837] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/25"
          >
            <FaPlus className="mr-2" /> Add price row
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b border-black/[.06] bg-[#fbfaf8] text-[10px] font-extrabold uppercase tracking-wider text-[#77766f]">
              <tr>
                <th className="border-r border-black/[.06] p-4 text-left">Select Currency</th>
                <th className="w-32 border-r border-black/[.06] p-4 text-center">Symbol</th>
                <th className="border-r border-black/[.06] p-4 text-left">Direct Product Price</th>
                <th className="w-20 p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data.currencyPrices || []).map((cp: any, i: number) => {
                const master = options?.currencies_full?.find(
                  (c: any) => c.id === cp.currencyId,
                );
                return (
                  <tr key={i} className="border-b border-black/[.05] last:border-0 hover:bg-[#fffaf6]">
                    <td className="min-w-[300px] border-r border-black/[.05] p-2">
                      <SearchableSelect
                        label="Currency"
                        options={options.currencies}
                        value={cp.currencyId}
                        onChange={(v: any) => updateCurrencyRow(i, "currencyId", v)}
                        onAdd={() => onAddMaster("currency")}
                      />
                    </td>
                    <td className="border-r border-black/[.05] p-2 text-center text-lg font-bold text-[#a64a1d]">
                      {master?.currencySymbol || "—"}
                    </td>
                    <td className="border-r border-black/[.05] p-2">
                      <input
                        type="number"
                        className={inputStyle}
                        value={cp.price}
                        placeholder="Enter price manually"
                        onChange={(e) => updateCurrencyRow(i, "price", parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        aria-label="Remove currency price"
                        onClick={() => setData({ ...data, currencyPrices: (data.currencyPrices || []).filter((_: any, idx: number) => idx !== i) })}
                        className="rounded-lg p-2 text-red-500 transition hover:scale-110 hover:bg-red-50 hover:text-red-600"
                      >
                        <FaTrash size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {(data.currencyPrices || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-sm text-[#8a8984]">
                    No currency prices added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RateTab;
