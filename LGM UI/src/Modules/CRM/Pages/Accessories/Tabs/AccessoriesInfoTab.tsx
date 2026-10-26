import React, { useState, useEffect } from "react";
import { SearchableSelect } from "../../Product/Tabs/SearchableSelect";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { TabProps } from "../Services/types";
import { getGeneratedAccessoryCode } from "../Services/AccessoriesService";
import Select from "react-select";
import { getVendors } from "../../Product/Services/ProductService";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

type Props = TabProps & { errors?: { [key: string]: string[] } };

const AccessoriesInfoTab: React.FC<Props> = ({
  data,
  setData,
  options,
  onAddMaster,
  errors = {},
}) => {
  const inputStyle = (hasError: boolean) =>
    `w-full rounded-xl border ${hasError ? "border-red-500 bg-red-50" : "border-black/10 bg-white"} px-4 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-4 focus:ring-[#f07837]/10`;
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

  useEffect(() => {
    const generateCode = async () => {
      if (data.accessoriesId === 0 && data.vendorId > 0) {
        const code = await getGeneratedAccessoryCode(
          data.vendorId,
          data.productSource,
        );
        setData((prev) => ({ ...prev, accessoriesCode: code }));
      }
    };
    generateCode();
  }, [data.vendorId, data.productSource]);

  useEffect(() => {
    if (data.accessoriesImageFile) {
      setPreviewUrl(URL.createObjectURL(data.accessoriesImageFile));
    } else if (data.accessoriesImagePath) {
      setPreviewUrl(`${FILE_BASE_URL}${data.accessoriesImagePath}`);
    }
  }, [data.accessoriesImageFile, data.accessoriesImagePath]);

  const vendorOptions = vendors.map((v: any) => ({
    value: v.id,
    label: `${v.vendorName} (${v.vendorCode})`,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="border-b border-black/[.07] pb-4">
        <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#c65b27]">LGM Sports · Product catalog</p>
        <h3 className="text-xl font-black uppercase tracking-tight text-[#252a2e]">Accessories information</h3>
        <p className="mt-1 text-sm text-[#77766f]">Add the product details, source, vendor, and image.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Image */}
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#f07837]/35 bg-[#fff7f1] p-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-black/[.07] bg-white">
            {previewUrl ? (
              <img src={previewUrl} alt="Accessory preview" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                No Image
              </span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              id="acc-img"
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files &&
                setData({ ...data, accessoriesImageFile: e.target.files[0] })
              }
            />
            <label
              htmlFor="acc-img"
              className="inline-flex cursor-pointer rounded-xl bg-[#f07837] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#dd6328]"
            >
              Browse
            </label>
          </div>
        </div>

        {/* Accessories Code */}
        <div className="flex flex-col">
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
            Accessories Code
          </label>
          <input
            className="w-full rounded-xl border border-black/[.07] bg-[#f7f6f2] px-4 py-2.5 font-mono font-bold text-[#a64a1d] outline-none"
            value={data.accessoriesCode || "Waiting for Name..."}
            disabled
          />
        </div>

        {/* Vendor (Required) */}
        <div className="flex flex-col">
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
            Vendor <span className="text-red-500 ">*</span>
          </label>
          <Select
            options={vendorOptions}
            placeholder="Search Vendor..."
            value={vendorOptions.find((v) => v.value === data.vendorId) || null}
            onChange={(opt: any) => {
              setData((prev) => ({ ...prev, vendorId: opt?.value || 0 }));
            }}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                minHeight: "42px",
                borderColor: errors.vendorId ? "#ef4444" : "#dedbd5",
                backgroundColor: errors.vendorId
                  ? "#fef2f2"
                  : base.backgroundColor,
                boxShadow: "none",
                "&:hover": { borderColor: errors.vendorId ? "#ef4444" : "#f07837" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#f07837" : state.isFocused ? "#fff0e7" : "white",
                color: state.isSelected ? "white" : "#343331",
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
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
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
                minHeight: "38px",
                borderColor: "#dedbd5",
                boxShadow: "none",
                "&:hover": { borderColor: "#f07837" },
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#f07837" : state.isFocused ? "#fff0e7" : "white",
                color: state.isSelected ? "white" : "#343331",
              }),
            }}
          />
        </div>

        <SearchableSelect
          label="Select Group"
          options={options.groups}
          value={data.productGroupId}
          onChange={(v) => setData({ ...data, productGroupId: v })}
          onAdd={() => onAddMaster("group")}
        />
        <SearchableSelect
          label="Select Category"
          options={options.categories}
          value={data.categoryId}
          onChange={(v) => setData({ ...data, categoryId: v })}
          onAdd={() => onAddMaster("category")}
        />
        <SearchableSelect
          label="Select Product Type"
          options={options.types}
          value={data.productTypeId}
          onChange={(v) => setData({ ...data, productTypeId: v })}
          onAdd={() => onAddMaster("type")}
        />

        {/* Accessories Name (Required) */}
        <div className="flex flex-col">
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
            Accessories Name <span className="text-red-500 ">*</span>
          </label>
          <input
            className={inputStyle(!!errors.accessoriesName)}
            value={data.accessoriesName || ""}
            onChange={(e) =>
              setData({ ...data, accessoriesName: e.target.value })
            }
            placeholder="Enter accessory name"
          />
          {errors.accessoriesName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.accessoriesName[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
            Short Name
          </label>
          <input
            className={inputStyle(false)}
            value={data.accessoriesShortName || ""}
            onChange={(e) =>
              setData({ ...data, accessoriesShortName: e.target.value })
            }
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-[#77766f]">
            Company Name of Product
          </label>
          <input
            className={inputStyle(false)}
            value={data.companyNameOfProduct || ""}
            onChange={(e) =>
              setData({ ...data, companyNameOfProduct: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AccessoriesInfoTab;
