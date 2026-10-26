import React, { useEffect, useState } from "react";
import Select, { type StylesConfig } from "react-select";
import { toast } from "sonner";
import apiClient from "../../.././../../API/apiClient";
import { API_ENDPOINTS } from "../../.././../../API/apiConfig";
import { getProducts } from "../../Product/Services/ProductService";
import { getProductVariants } from "../../ProductVariant/Services/ProductVariantService";
import { getAccessories } from "../../Accessories/Services/AccessoriesService";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { saveBundleItem } from "./Services/BundleItemService";
import type { BundleItem, BundleItemLookupOption } from "./Services/types";

interface WizardProps {
  editData: BundleItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SelectOption {
  value: number;
  label: string;
}

type ItemMode = "product" | "variant" | "accessory";
interface ItemModeOption { value: ItemMode; label: string }

const itemModes: ItemModeOption[] = [
  { value: "product", label: "Product" },
  { value: "variant", label: "Variant" },
  { value: "accessory", label: "Accessory" },
];

const initialData: BundleItem = {
  bundleItemId: 0,
  bundleId: 0,
  productId: null,
  variantId: null,
  accessoriesId: null,
  quantity: 1,
  pricingType: "Default",
  allocatedPrice: 0,
  isOptional: false,
  isDeleted: false,
};

const getRows = (value: unknown, depth = 0): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth > 4) return [];
  const record = value as Record<string, unknown>;
  for (const key of ["data", "Data", "items", "Items", "results", "Results"]) {
    const rows = getRows(record[key], depth + 1);
    if (rows.length) return rows;
  }
  return [];
};

const read = (record: Record<string, unknown>, keys: string[]): unknown => {
  for (const key of keys) if (record[key] !== undefined && record[key] !== null) return record[key];
  return undefined;
};

const normalizeOptions = (
  source: unknown,
  idKeys: string[],
  codeKeys: string[],
  nameKeys: string[],
  parentKeys: string[] = [],
): BundleItemLookupOption[] => getRows(source)
  .map((row): BundleItemLookupOption | null => {
    if (!row || typeof row !== "object") return null;
    const record = row as Record<string, unknown>;
    const id = Number(read(record, idKeys));
    if (!Number.isInteger(id) || id < 1) return null;
    const rawParentId = read(record, parentKeys);
    const parentId = rawParentId == null ? null : Number(rawParentId);
    return {
      id,
      code: String(read(record, codeKeys) ?? "").trim(),
      name: String(read(record, nameKeys) ?? "").trim(),
      ...(parentKeys.length ? { productId: parentId !== null && Number.isInteger(parentId) && parentId > 0 ? parentId : null } : {}),
    };
  })
  .filter((item): item is BundleItemLookupOption => item !== null);

const toOptions = (items: BundleItemLookupOption[]): SelectOption[] => items.map((item) => ({
  value: item.id,
  label: item.code ? `${item.name || item.code} (${item.code})` : item.name || `ID ${item.id}`,
}));

const selectStyles = (hasError = false): StylesConfig<any, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderColor: hasError ? "#dc2626" : state.isFocused ? "#f07837" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #f07837" : "none",
    "&:hover": { borderColor: hasError ? "#dc2626" : "#f07837" },
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
});

const endpointEntries = Object.entries(API_ENDPOINTS as unknown as Record<string, string>);
const bundleEndpoint = endpointEntries.find(([key]) => /bundle/i.test(key) && !/bundle.?items?/i.test(key))?.[1] || "/Bundles";

const BundleItemWizard: React.FC<WizardProps> = ({ editData, onSuccess, onCancel }) => {
  const [data, setData] = useState<BundleItem>({ ...initialData });
  const [bundles, setBundles] = useState<BundleItemLookupOption[]>([]);
  const [products, setProducts] = useState<BundleItemLookupOption[]>([]);
  const [variants, setVariants] = useState<BundleItemLookupOption[]>([]);
  const [accessories, setAccessories] = useState<BundleItemLookupOption[]>([]);
  const [mode, setMode] = useState<ItemMode>("product");
  const [variantProductId, setVariantProductId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      const edited = { ...initialData, ...editData };
      if (edited.variantId !== null) {
        edited.productId = null;
        edited.accessoriesId = null;
        setMode("variant");
      } else if (edited.accessoriesId !== null) {
        edited.productId = null;
        setMode("accessory");
      } else {
        setMode("product");
      }
      setData(edited);
    } else {
      setData({ ...initialData });
      setMode("product");
    }
    setVariantProductId(null);
    setErrors({});
  }, [editData]);

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        apiClient.get(bundleEndpoint),
        getProducts(),
        getProductVariants(),
        getAccessories(),
      ]);
      if (!mounted) return;
      const [bundleResult, productResult, variantResult, accessoryResult] = results;
      if (bundleResult.status === "fulfilled") {
        setBundles(normalizeOptions(bundleResult.value.data,
          ["bundleId", "BundleId", "id", "Id"],
          ["bundleCode", "BundleCode", "code", "Code"],
          ["bundleName", "BundleName", "name", "Name", "description", "Description"],
        ));
      } else console.error("Failed to load bundles:", bundleResult.reason);
      if (productResult.status === "fulfilled") {
        setProducts(normalizeOptions(productResult.value,
          ["productId", "ProductId", "id", "Id"],
          ["productCode", "ProductCode", "code", "Code"],
          ["productName", "ProductName", "name", "Name"],
        ));
      } else console.error("Failed to load products:", productResult.reason);
      if (variantResult.status === "fulfilled") {
        setVariants(normalizeOptions(variantResult.value,
          ["variantId", "VariantId", "productVariantId", "ProductVariantId", "id", "Id"],
          ["variantCode", "VariantCode", "productVariantCode", "ProductVariantCode", "code", "Code"],
          ["variantName", "VariantName", "productVariantName", "ProductVariantName", "name", "Name"],
          ["productId", "ProductId"],
        ));
      } else console.error("Failed to load variants:", variantResult.reason);
      if (accessoryResult.status === "fulfilled") {
        setAccessories(normalizeOptions(accessoryResult.value,
          ["accessoriesId", "AccessoriesId", "accessoryId", "AccessoryId", "id", "Id"],
          ["accessoriesCode", "AccessoriesCode", "accessoryCode", "AccessoryCode", "code", "Code"],
          ["accessoriesDescription", "AccessoriesDescription", "accessoryName", "AccessoryName", "accessoriesName", "AccessoriesName", "description", "Description", "name", "Name"],
        ));
      } else console.error("Failed to load accessories:", accessoryResult.reason);
      if (results.some((result) => result.status === "rejected")) {
        toast.error("Some Bundle Item dropdown options could not be loaded.");
      }
      setLoading(false);
    };
    void loadAll();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (mode !== "variant" || !data.variantId || variantProductId !== null) return;
    const selected = variants.find((variant) => variant.id === data.variantId);
    if (selected?.productId) setVariantProductId(selected.productId);
  }, [data.variantId, mode, variantProductId, variants]);

  const setField = <K extends keyof BundleItem>(field: K, value: BundleItem[K]) => {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!Number.isInteger(data.bundleId) || data.bundleId < 1) next.bundleId = "Please select a bundle.";
    const linkedCount = [data.productId, data.variantId, data.accessoriesId]
      .filter((id) => id !== null && Number.isInteger(id) && id > 0).length;
    if (linkedCount !== 1) next.item = "Select exactly one product, variant, or accessory.";
    if (!Number.isInteger(data.quantity) || data.quantity < 1) next.quantity = "Quantity must be at least 1.";
    if (!data.pricingType.trim()) next.pricingType = "Pricing Type is required.";
    if (data.pricingType.length > 30) next.pricingType = "Pricing Type must be 30 characters or fewer.";
    if (!Number.isFinite(data.allocatedPrice) || data.allocatedPrice < 0) next.allocatedPrice = "Allocated Price cannot be negative.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (saving) return;
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      await saveBundleItem(data);
      toast.success(data.bundleItemId > 0 ? "Bundle Item updated successfully." : "Bundle Item created successfully.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save Bundle Item.");
    } finally {
      setSaving(false);
    }
  };

  const bundleOptions = toOptions(bundles);
  const productOptions = toOptions(products);
  const variantOptions = toOptions(variantProductId === null ? [] : variants.filter((variant) => variant.productId === variantProductId));
  const accessoryOptions = toOptions(accessories);
  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-semibold text-gray-700";
  const errorText = (field: string) => errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>;

  return <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
    <div className="bg-[#f07837] px-6 py-4 text-white"><h2 className="text-lg font-bold uppercase tracking-wide">{data.bundleItemId > 0 ? "Update Bundle Item" : "Add Bundle Item"}</h2><p className="mt-1 text-xs text-white/80">Add a product, variant, or accessory to a bundle.</p></div>
    <div className="min-h-[300px] bg-white p-6 md:p-8">
      <div className="mb-6 border-b border-gray-200 pb-3"><h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">Bundle Item Information</h3></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="bundleId" className={labelClass}>Bundle <span className="text-red-500">*</span></label>
          <Select inputId="bundleId" options={bundleOptions} value={bundleOptions.find((option) => option.value === data.bundleId) ?? null} onChange={(option) => setField("bundleId", option?.value ?? 0)} isLoading={loading} isSearchable isClearable placeholder={loading ? "Loading bundles..." : "Search and select a bundle"} noOptionsMessage={() => "No bundles found"} styles={selectStyles(Boolean(errors.bundleId))} />
          {errorText("bundleId")}
        </div>
        <div>
          <label htmlFor="itemMode" className={labelClass}>Item Type <span className="text-red-500">*</span></label>
          <Select<ItemModeOption, false> inputId="itemMode" options={itemModes} value={itemModes.find((option) => option.value === mode) ?? null} onChange={(option) => { const nextMode = option?.value ?? "product"; setMode(nextMode); setVariantProductId(null); setData((previous) => ({ ...previous, productId: null, variantId: null, accessoriesId: null })); setErrors((previous) => ({ ...previous, item: "" })); }} isSearchable={false} isClearable={false} styles={selectStyles()} />
        </div>

        {mode === "product" && <div className="md:col-span-2">
          <label htmlFor="productId" className={labelClass}>Product <span className="text-red-500">*</span></label>
          <Select inputId="productId" options={productOptions} value={productOptions.find((option) => option.value === data.productId) ?? null} onChange={(option) => { setData((previous) => ({ ...previous, productId: option?.value ?? null, variantId: null, accessoriesId: null })); setErrors((previous) => ({ ...previous, item: "" })); }} isLoading={loading} isSearchable isClearable placeholder={loading ? "Loading products..." : "Search and select a product"} noOptionsMessage={() => "No products found"} styles={selectStyles(Boolean(errors.item))} />
        </div>}

        {mode === "variant" && <>
          <div>
            <label htmlFor="variantProduct" className={labelClass}>Filter Variants by Product <span className="text-red-500">*</span></label>
            <Select inputId="variantProduct" options={productOptions} value={productOptions.find((option) => option.value === variantProductId) ?? null} onChange={(option) => { setVariantProductId(option?.value ?? null); setData((previous) => ({ ...previous, productId: null, variantId: null, accessoriesId: null })); setErrors((previous) => ({ ...previous, item: "" })); }} isLoading={loading} isSearchable isClearable placeholder="Choose a product to filter variants" noOptionsMessage={() => "No products found"} styles={selectStyles()} />
          </div>
          <div>
            <label htmlFor="variantId" className={labelClass}>Variant <span className="text-red-500">*</span></label>
            <Select inputId="variantId" options={variantOptions} value={variantOptions.find((option) => option.value === data.variantId) ?? null} onChange={(option) => { setData((previous) => ({ ...previous, productId: null, variantId: option?.value ?? null, accessoriesId: null })); setErrors((previous) => ({ ...previous, item: "" })); }} isLoading={loading} isSearchable isClearable isDisabled={!variantProductId} placeholder={!variantProductId ? "Choose a product first" : "Search and select a variant"} noOptionsMessage={() => variantProductId ? "No variants found for this product" : "Choose a product first"} styles={selectStyles(Boolean(errors.item))} />
          </div>
        </>}

        {mode === "accessory" && <div className="md:col-span-2">
          <label htmlFor="accessoriesId" className={labelClass}>Accessory <span className="text-red-500">*</span></label>
          <Select inputId="accessoriesId" options={accessoryOptions} value={accessoryOptions.find((option) => option.value === data.accessoriesId) ?? null} onChange={(option) => { setData((previous) => ({ ...previous, productId: null, variantId: null, accessoriesId: option?.value ?? null })); setErrors((previous) => ({ ...previous, item: "" })); }} isLoading={loading} isSearchable isClearable placeholder={loading ? "Loading accessories..." : "Search and select an accessory"} noOptionsMessage={() => "No accessories found"} styles={selectStyles(Boolean(errors.item))} />
        </div>}
        <div className="md:col-span-2">{errorText("item")}</div>

        <div><label htmlFor="quantity" className={labelClass}>Quantity <span className="text-red-500">*</span></label><input id="quantity" type="number" min="1" step="1" value={data.quantity} onChange={(event) => setField("quantity", event.target.value === "" ? 0 : Number(event.target.value))} className={inputClass} />{errorText("quantity")}</div>
        <div><label htmlFor="pricingType" className={labelClass}>Pricing Type <span className="text-red-500">*</span></label><input id="pricingType" maxLength={30} value={data.pricingType} onChange={(event) => setField("pricingType", event.target.value)} className={inputClass} placeholder="e.g. Default, Fixed" />{errorText("pricingType")}</div>
        <div><label htmlFor="allocatedPrice" className={labelClass}>Allocated Price</label><input id="allocatedPrice" type="number" min="0" step="0.01" value={data.allocatedPrice} onChange={(event) => setField("allocatedPrice", event.target.value === "" ? 0 : Number(event.target.value))} className={inputClass} placeholder="0.00" />{errorText("allocatedPrice")}</div>
        <div className="flex items-center"><label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={data.isOptional} onChange={(event) => setField("isOptional", event.target.checked)} className="h-4 w-4 accent-blue-700" /><span className="text-sm font-semibold text-gray-700">Optional Item</span></label></div>
      </div>
    </div>
    <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5"><button type="button" onClick={onCancel} disabled={saving} className={buttonStyles.cancel}>Cancel</button><button type="button" onClick={() => void save()} disabled={saving || loading} className={buttonStyles.save}>{saving ? "Saving..." : data.bundleItemId > 0 ? "Update" : "Save"}</button></div>
  </div>;
};

export default BundleItemWizard;
