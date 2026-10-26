// import React, { useEffect, useState } from "react";
// import type { ProductAccessoryRule } from "./Services/types";
// import { saveProductAccessoryRule } from "./Services/ProductAccessoryRuleService";
// import { toast } from "sonner";
// import { buttonStyles } from "../../../../Components/Common/buttonStyles";

// interface WizardProps { editData: ProductAccessoryRule | null; onSuccess: () => void; onCancel: () => void; }
// const emptyRule: ProductAccessoryRule = { id: 0, productId: 0, accessoriesId: 0, quantity: 1, mandatoryOptional: "Optional", pricingType: "Default", defaultPrice: 0, effectiveFrom: new Date().toISOString().slice(0, 10), effectiveTo: null, active: true, isDeleted: false };
// const dateValue = (value?: string | null) => value ? value.slice(0, 10) : "";
// const ProductAccessoryRuleWizard: React.FC<WizardProps> = ({ editData, onSuccess, onCancel }) => {
//   const [data, setData] = useState<ProductAccessoryRule>({ ...emptyRule });
//   const [isSaving, setIsSaving] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   useEffect(() => { setData(editData ? { ...emptyRule, ...editData, effectiveFrom: dateValue(editData.effectiveFrom), effectiveTo: dateValue(editData.effectiveTo) || null } : { ...emptyRule }); setErrors({}); }, [editData]);
//   const update = (field: keyof ProductAccessoryRule, value: string | number | boolean | null) => { setData((old) => ({ ...old, [field]: value })); setErrors((old) => ({ ...old, [field]: "" })); };
//   const validate = () => {
//     const next: Record<string, string> = {};
//     if (!Number.isInteger(Number(data.productId)) || Number(data.productId) <= 0) next.productId = "Enter a valid Product ID.";
//     if (!Number.isInteger(Number(data.accessoriesId)) || Number(data.accessoriesId) <= 0) next.accessoriesId = "Enter a valid Accessory ID.";
//     if (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) < 1) next.quantity = "Quantity must be at least 1.";
//     if (!data.mandatoryOptional.trim()) next.mandatoryOptional = "Choose Mandatory or Optional.";
//     if (data.mandatoryOptional.length > 20) next.mandatoryOptional = "Must be 20 characters or fewer.";
//     if (!data.pricingType.trim()) next.pricingType = "Pricing Type is required.";
//     if (data.pricingType.length > 30) next.pricingType = "Pricing Type must be 30 characters or fewer.";
//     if (!Number.isFinite(Number(data.defaultPrice)) || Number(data.defaultPrice) < 0) next.defaultPrice = "Default Price cannot be negative.";
//     if (data.effectiveTo && data.effectiveFrom && data.effectiveTo < data.effectiveFrom) next.effectiveTo = "Effective To must be on or after Effective From.";
//     setErrors(next); return Object.keys(next).length === 0;
//   };
//   const handleSave = async () => {
//     if (!validate()) { toast.error("Please correct the highlighted fields."); return; }
//     setIsSaving(true);
//     try { await saveProductAccessoryRule({ ...data, quantity: Number(data.quantity), defaultPrice: Number(data.defaultPrice), effectiveFrom: data.effectiveFrom ? `${dateValue(data.effectiveFrom)}T00:00:00` : "", effectiveTo: data.effectiveTo ? `${dateValue(data.effectiveTo)}T00:00:00` : null }); toast.success(data.id > 0 ? "Product accessory rule updated successfully!" : "Product accessory rule created successfully!"); onSuccess(); }
//     catch (error: unknown) { toast.error(error instanceof Error ? error.message : "Something went wrong while saving this rule."); }
//     finally { setIsSaving(false); }
//   };
//   const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20";
//   const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";
//   const errorText = (key: string) => errors[key] ? <p className="mt-1 text-xs text-red-600">{errors[key]}</p> : null;
//   return <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
//     <header className="bg-[#f07837] px-6 py-4 text-white"><h2 className="text-lg font-bold uppercase tracking-wide">{data.id ? "Update Product Accessory Rule" : "Add Product Accessory Rule"}</h2><p className="mt-1 text-xs text-white/80">Configure the accessory requirement and pricing.</p></header>
//     <div className="p-5 sm:p-8"><h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">Rule Information</h3>
//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//         <div><label htmlFor="productId" className={labelClass}>Product ID *</label><input id="productId" type="number" min="1" step="1" value={data.productId || ""} onChange={(e) => update("productId", e.target.value === "" ? 0 : Number(e.target.value))} className={inputClass} placeholder="Enter Product ID" />{errorText("productId")}</div>
//         <div><label htmlFor="accessoriesId" className={labelClass}>Accessories ID *</label><input id="accessoriesId" type="number" min="1" step="1" value={data.accessoriesId || ""} onChange={(e) => update("accessoriesId", e.target.value === "" ? 0 : Number(e.target.value))} className={inputClass} placeholder="Enter Accessories ID" />{errorText("accessoriesId")}</div>
//         <div><label htmlFor="quantity" className={labelClass}>Quantity *</label><input id="quantity" type="number" min="1" step="1" value={data.quantity} onChange={(e) => update("quantity", e.target.value === "" ? 0 : Number(e.target.value))} className={inputClass} />{errorText("quantity")}</div>
//         <div><label htmlFor="mandatoryOptional" className={labelClass}>Requirement *</label><select id="mandatoryOptional" value={data.mandatoryOptional} onChange={(e) => update("mandatoryOptional", e.target.value)} className={inputClass}><option value="Mandatory">Mandatory</option><option value="Optional">Optional</option></select>{errorText("mandatoryOptional")}</div>
//         <div><label htmlFor="pricingType" className={labelClass}>Pricing Type *</label><input id="pricingType" maxLength={30} value={data.pricingType} onChange={(e) => update("pricingType", e.target.value)} className={inputClass} placeholder="e.g. Default, Fixed" />{errorText("pricingType")}</div>
//         <div><label htmlFor="defaultPrice" className={labelClass}>Default Price</label><input id="defaultPrice" type="number" min="0" step="0.01" value={data.defaultPrice} onChange={(e) => update("defaultPrice", e.target.value === "" ? 0 : Number(e.target.value))} className={inputClass} placeholder="0.00" />{errorText("defaultPrice")}</div>
//         <div><label htmlFor="effectiveFrom" className={labelClass}>Effective From</label><input id="effectiveFrom" type="date" value={dateValue(data.effectiveFrom)} onChange={(e) => update("effectiveFrom", e.target.value)} className={inputClass} /></div>
//         <div><label htmlFor="effectiveTo" className={labelClass}>Effective To</label><input id="effectiveTo" type="date" value={dateValue(data.effectiveTo)} onChange={(e) => update("effectiveTo", e.target.value || null)} className={inputClass} />{errorText("effectiveTo")}</div>
//         <div className="md:col-span-2"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={data.active} onChange={(e) => update("active", e.target.checked)} className="h-4 w-4 accent-[#f07837]" /><span className="text-sm font-semibold text-gray-700">Active rule</span></label></div>
//       </div>
//     </div>
//     <footer className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5"><button type="button" onClick={onCancel} disabled={isSaving} className={buttonStyles.cancel}>Cancel</button><button type="button" onClick={() => void handleSave()} disabled={isSaving} className={buttonStyles.save}>{isSaving ? "Saving..." : data.id ? "Update" : "Save"}</button></footer>
//   </div>;
// };
// export default ProductAccessoryRuleWizard;



import React, { useEffect, useState } from "react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import type { ProductAccessoryRule } from "./Services/types";
import { saveProductAccessoryRule } from "./Services/ProductAccessoryRuleService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: ProductAccessoryRule | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ForeignKeyOption {
  id: number;
  code: string;
  name: string;
}

const emptyRule: ProductAccessoryRule = {
  id: 0,
  productId: 0,
  accessoriesId: 0,
  quantity: 1,
  mandatoryOptional: "Optional",
  pricingType: "Default",
  defaultPrice: 0,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
  active: true,
  isDeleted: false,
};

const dateValue = (value?: string | null) => (value ? value.slice(0, 10) : "");

const endpointEntries = Object.entries(
  API_ENDPOINTS as unknown as Record<string, string>,
);

const findEndpoint = (pattern: RegExp, excluded: RegExp): string | undefined =>
  endpointEntries.find(([key]) => pattern.test(key) && !excluded.test(key))?.[1];

const productEndpoint = findEndpoint(/product/i, /accessor|barcode|variant|rule/i);
const accessoryEndpoint = findEndpoint(/accessor/i, /rule/i);

const getField = (
  item: Record<string, unknown>,
  keys: string[],
): unknown => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
  }
  return undefined;
};

const getRows = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const data = value as Record<string, unknown>;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.Items)) return data.Items;
  return [];
};

const loadForeignKeyOptions = async (
  endpoint: string | undefined,
  idKeys: string[],
  codeKeys: string[],
  nameKeys: string[],
): Promise<ForeignKeyOption[]> => {
  if (!endpoint) return [];

  const response = await apiClient.get(endpoint);
  const rows = getRows(response.data?.data ?? response.data);

  return rows
    .map((row): ForeignKeyOption | null => {
      if (!row || typeof row !== "object") return null;

      const item = row as Record<string, unknown>;
      const id = Number(getField(item, idKeys));
      if (!Number.isInteger(id) || id <= 0) return null;

      return {
        id,
        code: String(getField(item, codeKeys) ?? "").trim(),
        name: String(getField(item, nameKeys) ?? "").trim(),
      };
    })
    .filter((option): option is ForeignKeyOption => option !== null);
};

interface SearchableForeignKeyProps {
  id: string;
  label: string;
  placeholder: string;
  value: number;
  options: ForeignKeyOption[];
  loading: boolean;
  error?: string;
  onSelect: (id: number) => void;
  onClearError: () => void;
}

const SearchableForeignKey: React.FC<SearchableForeignKeyProps> = ({
  id,
  label,
  placeholder,
  value,
  options,
  loading,
  error,
  onSelect,
  onClearError,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!value) return;

    const selected = options.find((option) => option.id === Number(value));
    if (selected) {
      setSearch([selected.code, selected.name].filter(Boolean).join(" - "));
    }
  }, [value, options]);

  const query = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    [option.code, option.name, String(option.id)]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  const selectOption = (option: ForeignKeyOption) => {
    onSelect(option.id);
    setSearch([option.code, option.name].filter(Boolean).join(" - "));
    setIsOpen(false);
    onClearError();
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600"
      >
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-options`}
        autoComplete="off"
        value={search}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          onSelect(0);
          onClearError();
          setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150);
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20"
        placeholder={loading ? `Loading ${label.toLowerCase()}...` : placeholder}
      />

      {isOpen && (
        <ul
          id={`${id}-options`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                role="option"
                aria-selected={Number(value) === option.id}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                >
                  <span className="font-semibold text-gray-800">
                    {option.code || `ID ${option.id}`}
                  </span>
                  {option.name && (
                    <span className="text-gray-600"> — {option.name}</span>
                  )}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-gray-500">
              {loading ? "Loading..." : "No matching records found."}
            </li>
          )}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const ProductAccessoryRuleWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<ProductAccessoryRule>({ ...emptyRule });
  const [products, setProducts] = useState<ForeignKeyOption[]>([]);
  const [accessories, setAccessories] = useState<ForeignKeyOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setData(
      editData
        ? {
            ...emptyRule,
            ...editData,
            effectiveFrom: dateValue(editData.effectiveFrom),
            effectiveTo: dateValue(editData.effectiveTo) || null,
          }
        : { ...emptyRule },
    );
    setErrors({});
  }, [editData]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      const results = await Promise.allSettled([
        loadForeignKeyOptions(
          productEndpoint,
          ["productId", "ProductId", "id", "Id"],
          ["productCode", "ProductCode", "code", "Code"],
          ["productName", "ProductName", "name", "Name"],
        ),
        loadForeignKeyOptions(
          accessoryEndpoint,
          [
            "accessoriesId",
            "AccessoriesId",
            "accessoryId",
            "AccessoryId",
            "id",
            "Id",
          ],
          [
            "accessoryCode",
            "AccessoryCode",
            "accessoriesCode",
            "AccessoriesCode",
            "code",
            "Code",
          ],
          [
            "accessoryName",
            "AccessoryName",
            "accessoriesName",
            "AccessoriesName",
            "name",
            "Name",
          ],
        ),
      ]);

      if (!isMounted) return;

      const [productResult, accessoryResult] = results;
      if (productResult.status === "fulfilled") {
        setProducts(productResult.value);
      } else {
        console.error("Failed to load products:", productResult.reason);
      }

      if (accessoryResult.status === "fulfilled") {
        setAccessories(accessoryResult.value);
      } else {
        console.error("Failed to load accessories:", accessoryResult.reason);
      }

      if (results.some((result) => result.status === "rejected")) {
        toast.error("Could not load all product and accessory options.");
      }

      setIsLoadingOptions(false);
    };

    void loadOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const update = (
    field: keyof ProductAccessoryRule,
    value: string | number | boolean | null,
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!Number.isInteger(Number(data.productId)) || Number(data.productId) <= 0) {
      next.productId = "Please select a product.";
    }
    if (
      !Number.isInteger(Number(data.accessoriesId)) ||
      Number(data.accessoriesId) <= 0
    ) {
      next.accessoriesId = "Please select an accessory.";
    }
    if (!Number.isInteger(Number(data.quantity)) || Number(data.quantity) < 1) {
      next.quantity = "Quantity must be at least 1.";
    }
    if (!data.mandatoryOptional.trim()) {
      next.mandatoryOptional = "Choose Mandatory or Optional.";
    }
    if (data.mandatoryOptional.length > 20) {
      next.mandatoryOptional = "Must be 20 characters or fewer.";
    }
    if (!data.pricingType.trim()) {
      next.pricingType = "Pricing Type is required.";
    }
    if (data.pricingType.length > 30) {
      next.pricingType = "Pricing Type must be 30 characters or fewer.";
    }
    if (
      !Number.isFinite(Number(data.defaultPrice)) ||
      Number(data.defaultPrice) < 0
    ) {
      next.defaultPrice = "Default Price cannot be negative.";
    }
    if (
      data.effectiveTo &&
      data.effectiveFrom &&
      data.effectiveTo < data.effectiveFrom
    ) {
      next.effectiveTo =
        "Effective To must be on or after Effective From.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      await saveProductAccessoryRule({
        ...data,
        quantity: Number(data.quantity),
        defaultPrice: Number(data.defaultPrice),
        effectiveFrom: data.effectiveFrom
          ? `${dateValue(data.effectiveFrom)}T00:00:00`
          : "",
        effectiveTo: data.effectiveTo
          ? `${dateValue(data.effectiveTo)}T00:00:00`
          : null,
      });
      toast.success(
        data.id > 0
          ? "Product accessory rule updated successfully!"
          : "Product accessory rule created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving this rule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20";
  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";
  const errorText = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-600">{errors[key]}</p>
    ) : null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.id
            ? "Update Product Accessory Rule"
            : "Add Product Accessory Rule"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Configure the accessory requirement and pricing.
        </p>
      </header>

      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Rule Information
        </h3>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SearchableForeignKey
            id="productId"
            label="Product"
            placeholder="Search product code or name"
            value={data.productId}
            options={products}
            loading={isLoadingOptions}
            error={errors.productId}
            onSelect={(id) => update("productId", id)}
            onClearError={() =>
              setErrors((previous) => ({ ...previous, productId: "" }))
            }
          />

          <SearchableForeignKey
            id="accessoriesId"
            label="Accessory"
            placeholder="Search accessory code or name"
            value={data.accessoriesId}
            options={accessories}
            loading={isLoadingOptions}
            error={errors.accessoriesId}
            onSelect={(id) => update("accessoriesId", id)}
            onClearError={() =>
              setErrors((previous) => ({ ...previous, accessoriesId: "" }))
            }
          />

          <div>
            <label htmlFor="quantity" className={labelClass}>
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              value={data.quantity}
              onChange={(event) =>
                update(
                  "quantity",
                  event.target.value === "" ? 0 : Number(event.target.value),
                )
              }
              className={inputClass}
            />
            {errorText("quantity")}
          </div>

          <div>
            <label htmlFor="mandatoryOptional" className={labelClass}>
              Requirement *
            </label>
            <select
              id="mandatoryOptional"
              value={data.mandatoryOptional}
              onChange={(event) =>
                update("mandatoryOptional", event.target.value)
              }
              className={inputClass}
            >
              <option value="Mandatory">Mandatory</option>
              <option value="Optional">Optional</option>
            </select>
            {errorText("mandatoryOptional")}
          </div>

          <div>
            <label htmlFor="pricingType" className={labelClass}>
              Pricing Type *
            </label>
            <input
              id="pricingType"
              maxLength={30}
              value={data.pricingType}
              onChange={(event) => update("pricingType", event.target.value)}
              className={inputClass}
              placeholder="e.g. Default, Fixed"
            />
            {errorText("pricingType")}
          </div>

          <div>
            <label htmlFor="defaultPrice" className={labelClass}>
              Default Price
            </label>
            <input
              id="defaultPrice"
              type="number"
              min="0"
              step="0.01"
              value={data.defaultPrice}
              onChange={(event) =>
                update(
                  "defaultPrice",
                  event.target.value === "" ? 0 : Number(event.target.value),
                )
              }
              className={inputClass}
              placeholder="0.00"
            />
            {errorText("defaultPrice")}
          </div>

          <div>
            <label htmlFor="effectiveFrom" className={labelClass}>
              Effective From
            </label>
            <input
              id="effectiveFrom"
              type="date"
              value={dateValue(data.effectiveFrom)}
              onChange={(event) => update("effectiveFrom", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="effectiveTo" className={labelClass}>
              Effective To
            </label>
            <input
              id="effectiveTo"
              type="date"
              value={dateValue(data.effectiveTo)}
              onChange={(event) =>
                update("effectiveTo", event.target.value || null)
              }
              className={inputClass}
            />
            {errorText("effectiveTo")}
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.active}
                onChange={(event) => update("active", event.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active rule
              </span>
            </label>
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className={buttonStyles.cancel}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isLoadingOptions}
          className={buttonStyles.save}
        >
          {isSaving ? "Saving..." : data.id ? "Update" : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default ProductAccessoryRuleWizard;

