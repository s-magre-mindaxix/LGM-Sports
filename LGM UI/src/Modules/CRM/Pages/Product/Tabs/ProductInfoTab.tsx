

import React, { useState, useEffect } from "react";
import type { TabProps } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { SearchableSelect } from "./SearchableSelect";
import Select from "react-select";
import { getGeneratedProductCode, getVendors } from "../Services/ProductService";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const ProductInfoTab: React.FC<TabProps> = ({
  data,
  setData,
  options,
  onAddMaster,
  errors = {},
}) => {
  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await getVendors();
        setVendors(res);
      } catch (error) {
        console.error("Error loading vendors", error);
      }
    };
    loadVendors();
  }, []);

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: `${v.vendorName} (${v.vendorCode})`,
  }));

  useEffect(() => {
    if (data.productImageFile) {
      const url = URL.createObjectURL(data.productImageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (data.productImagePath) {
      setPreviewUrl(`${FILE_BASE_URL}${data.productImagePath}`);
    } else {
      setPreviewUrl(null);
    }
  }, [data.productImageFile, data.productImagePath]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData({ ...data, productImageFile: e.target.files[0] });
    }
  };

  useEffect(() => {
    const generateCode = async () => {
      if (data.productId === 0 && data.vendorId > 0) {
        try {
          const code = await getGeneratedProductCode(
            data.vendorId,
            data.productSource
          );
          setData((prev) => ({ ...prev, productCode: code }));
        } catch (error) {
          console.error("Error generating code", error);
        }
      }
      if (data.vendorId === 0) {
        setData((prev) => ({ ...prev, productCode: "" }));
      }
    };
    generateCode();
  }, [data.vendorId, data.productSource]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">📦</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Product Basic Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Image Upload */}
        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
          <div className="w-24 h-24 shrink-0 rounded-lg bg-white border flex items-center justify-center overflow-hidden shadow-sm">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-gray-400 font-bold uppercase text-center px-2">
                No Image Selected
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-extrabold text-gray-500 uppercase mb-2 tracking-widest">
              Product Image
            </label>
            <input
              type="file"
              id="product-img"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <label
              htmlFor="product-img"
              className="inline-block bg-[#f07837] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer hover:bg-[#0d3357] transition shadow-md"
            >
              Browse Files
            </label>
          </div>
        </div>

        {/* Product Code */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest">
            Product Code
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-none bg-gray-50 font-mono font-bold text-blue-700"
            value={data.productCode || "Waiting for Name..."}
            readOnly
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">
            * Generated based on Product Name
          </p>
        </div>

        {/* Vendor (Required) */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest">
            Vendor <span className="text-red-500 ">*</span>
          </label>
          <Select
            options={vendorOptions}
            placeholder="Search Vendor..."
            value={vendorOptions.find(v => v.value === data.vendorId) || null}
            onChange={(opt: any) =>
              setData({ ...data, vendorId: opt?.value || 0 })
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "42px",
                borderColor: errors.vendorId ? "#ef4444" : "#d1d5db",
                backgroundColor: errors.vendorId ? "#fef2f2" : base.backgroundColor,
              }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
            }}
          />
          {errors.vendorId && (
            <p className="mt-1 text-sm text-red-500">{errors.vendorId[0]}</p>
          )}
        </div>

        {/* Product Source */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#0b2c52] uppercase mb-1">
            Product Source
          </label>
          <Select
            options={[
              { value: "Local", label: "Local" },
              { value: "Imported", label: "Imported" },
            ]}
            value={{
              value: data.productSource || "Local",
              label: data.productSource || "Local",
            }}
            onChange={(opt: any) =>
              setData({ ...data, productSource: opt.value })
            }
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "40px",
              }),
            }}
          />
        </div>

        <SearchableSelect
          label="Select Group"
          options={options.groups}
          value={data.productGroupId}
          onChange={(val) => setData({ ...data, productGroupId: val })}
          onAdd={() => onAddMaster("group")}
        />
        <SearchableSelect
          label="Select Category"
          options={options.categories}
          value={data.categoryId}
          onChange={(val) => setData({ ...data, categoryId: val })}
          onAdd={() => onAddMaster("category")}
        />
        <SearchableSelect
          label="Select Product Type"
          options={options.types}
          value={data.productTypeId}
          onChange={(val) => setData({ ...data, productTypeId: val })}
          onAdd={() => onAddMaster("type")}
        />

        {/* Product Name (Required) */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest">
            Product/Brand Name <span className="text-red-500 ">*</span>
          </label>
          <input
            className={inputStyle(!!errors.productName)}
            placeholder="Enter full product name"
            value={data.productName || ""}
            onChange={(e) => setData({ ...data, productName: e.target.value })}
          />
          {errors.productName && (
            <p className="mt-1 text-sm text-red-500">{errors.productName[0]}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest">
            Product Short Name
          </label>
          <input
            className={inputStyle(false)}
            placeholder="e.g. LAP-D1"
            value={data.productShortName || ""}
            onChange={(e) =>
              setData({ ...data, productShortName: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest">
            Company Name of Product (Manufacturer)
          </label>
          <input
            className={inputStyle(false)}
            placeholder="Enter manufacturer or brand owner name"
            value={data.companyNameOfProduct || ""}
            onChange={(e) =>
              setData({ ...data, companyNameOfProduct: e.target.value })
            }
          />
        </div>

        {/* Calibration Checkbox */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-transparent mb-1 uppercase tracking-widest">
            Spacer
          </label>
          <div
            className={`w-full border rounded-lg px-4 h-[46px] flex items-center gap-3 transition cursor-pointer ${data.isCalibration ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
            onClick={() =>
              setData({
                ...data,
                isCalibration: !data.isCalibration,
                calibrationFrequency: !data.isCalibration
                  ? data.calibrationFrequency
                  : "",
              })
            }
          >
            <input
              type="checkbox"
              className="w-5 h-5 accent-[#0b2c52]"
              checked={data.isCalibration || false}
              onChange={(e) =>
                setData({
                  ...data,
                  isCalibration: e.target.checked,
                  calibrationFrequency: e.target.checked
                    ? data.calibrationFrequency
                    : "",
                })
              }
              onClick={(e) => e.stopPropagation()}
            />
            <label className="text-[11px] font-extrabold text-[#0b2c52] uppercase tracking-widest cursor-pointer mb-0">
              Calibration Required?
            </label>
          </div>
        </div>

        {data.isCalibration && (
          <div className="flex flex-col animate-in fade-in zoom-in duration-300">
            <label className="text-[11px] font-extrabold text-gray-500 mb-1 uppercase tracking-widest">
              Calibration Frequency
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 text-sm h-[46px]"
              placeholder="e.g. 6 Months / 1 Year"
              value={data.calibrationFrequency || ""}
              onChange={(e) =>
                setData({ ...data, calibrationFrequency: e.target.value })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductInfoTab;