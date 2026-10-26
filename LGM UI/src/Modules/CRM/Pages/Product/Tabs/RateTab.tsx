import React from "react";
import type { TabProps, Product } from "../Services/types";
import Select from "react-select";
import { FaPlus, FaTrash } from "react-icons/fa";
import { SearchableSelect } from "./SearchableSelect";

const RateTab: React.FC<TabProps> = ({
  data,
  setData,
  options,
  onAddMaster,
}) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition bg-white text-sm";

  // 1. Simple row addition without any math
  const addCurrencyRow = () => {
    const current = data.currencyPrices || [];
    setData({
      ...data,
      currencyPrices: [...current, { currencyId: 0, price: 0 }],
    });
  };

  // 2. Simple update logic (No auto-calculation)
  const updateCurrencyRow = (index: number, field: string, value: any) => {
    const newList = [...data.currencyPrices];
    newList[index] = { ...newList[index], [field]: value };
    setData({ ...data, currencyPrices: newList });
  };

  // Standard helpers for 0 clear/restore
  const handleFocus = (field: keyof Product) => {
    if (data[field] === 0) setData((prev) => ({ ...prev, [field]: "" as any }));
  };
  const handleBlur = (field: keyof Product) => {
    if (data[field] === "" || data[field] === null || data[field] === undefined)
      setData((prev) => ({ ...prev, [field]: 0 }));
  };

  const taxPreferences = [
    { value: "Taxable", label: "Taxable (1)" },
    { value: "Non Taxable", label: "Non Taxable (2)" },
    { value: "Out Of Scope", label: "Out Of Scope (3)" },
    { value: "Non Gst Supply", label: "Non Gst Supply (4)" },
  ];

  const taxRates = [
    { value: 0, label: "GST 0%" },
    { value: 5, label: "GST 5%" },
    { value: 12, label: "GST 12%" },
    { value: 18, label: "GST 18%" },
    { value: 28, label: "GST 28%" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">💰</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Product Rate Information
        </h3>
      </div>

      {/* Main Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            Purchase Price
          </label>
          <input
            type="number"
            className={inputStyle}
            value={data.purchasePrice}
            onFocus={() => handleFocus("purchasePrice")}
            onBlur={() => handleBlur("purchasePrice")}
            onChange={(e) =>
              setData({
                ...data,
                purchasePrice: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            Sale Price
          </label>
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
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            Tax Preferences
          </label>
          <Select
            options={taxPreferences}
            value={taxPreferences.find((o) => o.value === data.taxPreference)}
            onChange={(opt: any) =>
              setData({ ...data, taxPreference: opt?.value })
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "46px",
              }),
            }}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1">
            Select Tax Rate
          </label>
          <Select
            options={taxRates}
            value={taxRates.find((o) => o.value === data.taxRateId)}
            onChange={(opt: any) => setData({ ...data, taxRateId: opt?.value })}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "46px",
              }),
            }}
          />
        </div>
      </div>

      {/* Imported Source Section */}
      {data.productSource === "Imported" && (
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm animate-in slide-in-from-top-2">
          <h4 className="text-[11px] font-black text-blue-800 uppercase mb-4 tracking-widest flex items-center gap-2">
            🚢 Import Duty Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                BCD (%)
              </label>
              <input
                type="number"
                className={inputStyle}
                value={data.bcd}
                onChange={(e) =>
                  setData({ ...data, bcd: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                SWS (%)
              </label>
              <input
                type="number"
                className={inputStyle}
                value={data.sws}
                onChange={(e) =>
                  setData({ ...data, sws: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                IGST (%)
              </label>
              <input
                type="number"
                className={inputStyle}
                value={data.igst}
                onChange={(e) =>
                  setData({ ...data, igst: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CURRENCY PRICING TABLE (Cleaned Up) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-[#f07837] text-white p-3 flex justify-between items-center px-6">
          <h4 className="text-xs font-bold uppercase tracking-widest">
            Manual Multi-Currency Pricing
          </h4>
          <button
            type="button"
            onClick={addCurrencyRow}
            className="bg-white text-[#154068] px-4 py-1.5 rounded-lg text-[10px] font-black hover:bg-blue-50 transition"
          >
            <FaPlus className="inline mr-2" /> Add Price Row
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-[10px] uppercase font-bold text-gray-500 border-b">
            <tr>
              <th className="p-4 text-left border-r">Select Currency</th>
              <th className="p-4 text-center border-r w-32">Symbol</th>
              {/* EXCHANGE RATE COLUMN REMOVED AS REQUESTED */}
              <th className="p-4 text-left border-r">Direct Product Price</th>
              <th className="p-4 text-center w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data.currencyPrices || []).map((cp: any, i: number) => {
              const master = options?.currencies_full?.find(
                (c: any) => c.id === cp.currencyId,
              );
              return (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="p-2 border-r min-w-[300px]">
                    <SearchableSelect
                      label="Currency"
                      options={options.currencies}
                      value={cp.currencyId}
                      onChange={(v: any) =>
                        updateCurrencyRow(i, "currencyId", v)
                      }
                      onAdd={() => onAddMaster("currency")}
                    />
                  </td>
                  <td className="p-2 border-r text-center text-lg font-bold text-blue-600">
                    {master?.currencySymbol || "—"}
                  </td>
                  <td className="p-2 border-r">
                    <input
                      type="number"
                      className={inputStyle}
                      value={cp.price}
                      placeholder="Enter Price Manually"
                      onChange={(e) =>
                        updateCurrencyRow(
                          i,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setData({
                          ...data,
                          currencyPrices: data.currencyPrices.filter(
                            (_: any, idx: number) => idx !== i,
                          ),
                        })
                      }
                      className="text-red-500 hover:scale-125 transition"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="flex flex-col">
          <label className="text-[11px] font-bold text-gray-500 uppercase">
            Available Quantity
          </label>
          <input
            type="number"
            className={inputStyle}
            value={data.availableQuantity}
            onFocus={() => handleFocus("availableQuantity")}
            onBlur={() => handleBlur("availableQuantity")}
            onChange={(e) =>
              setData({
                ...data,
                availableQuantity: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-bold text-gray-500 uppercase">
            Stock Warning
          </label>
          <input
            type="number"
            className={inputStyle}
            value={data.outOfStockWarning}
            onFocus={() => handleFocus("outOfStockWarning")}
            onBlur={() => handleBlur("outOfStockWarning")}
            onChange={(e) =>
              setData({
                ...data,
                outOfStockWarning: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default RateTab;
