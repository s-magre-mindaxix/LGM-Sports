import React, { useEffect, useRef, useState } from "react";
import Select, { type StylesConfig } from "react-select";
import { toast } from "sonner";
import { getProducts } from "../Product/Services/ProductService";
import { getProductVariants } from "../ProductVariant/Services/ProductVariantService";
import { getAccessories } from "../Accessories/Services/AccessoriesService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import {
  getGeneratedProductBarcode,
  saveProductBarcode,
} from "./Services/ProductBarcodeService";
import type { ProductBarcode, ProductBarcodeLookupOption } from "./Services/types";

interface WizardProps {
  editData: ProductBarcode | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface SelectOption {
  value: number;
  label: string;
}

interface BarcodeTypeOption {
  value: string;
  label: string;
}

type LinkMode = "product" | "variant" | "accessory";
interface LinkModeOption {
  value: LinkMode;
  label: string;
}

const initialData: ProductBarcode = {
  id: 0,
  barcode: "",
  barcodeType: "",
  productId: null,
  variantId: null,
  accessoryId: null,
  isPrimary: false,
  active: true,
  isDeleted: false,
};

const barcodeTypes: BarcodeTypeOption[] = [
  { value: "EAN-13", label: "EAN-13" },
  { value: "UPC-A", label: "UPC-A" },
  { value: "Code 128", label: "Code 128" },
  { value: "QR Code", label: "QR Code" },
];

const linkModes: LinkModeOption[] = [
  { value: "product", label: "Product" },
  { value: "variant", label: "Variant" },
  { value: "accessory", label: "Accessory" },
];

const readValue = (item: Record<string, unknown>, names: string[]): unknown => {
  for (const name of names) {
    if (item[name] !== undefined && item[name] !== null) return item[name];
  }
  return undefined;
};

const getRows = (value: unknown, depth = 0): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth > 3) return [];
  const item = value as Record<string, unknown>;
  for (const key of ["data", "Data", "items", "Items", "results", "Results"]) {
    const rows = getRows(item[key], depth + 1);
    if (rows.length > 0) return rows;
  }
  return [];
};

const normalizeLookup = (
  value: unknown,
  idNames: string[],
  codeNames: string[],
  nameNames: string[],
  productIdNames: string[] = [],
): ProductBarcodeLookupOption[] =>
  getRows(value)
    .map((row): ProductBarcodeLookupOption | null => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = Number(readValue(item, idNames));
      if (!Number.isInteger(id) || id <= 0) return null;
      const productRaw = readValue(item, productIdNames);
      const productId = productRaw == null ? null : Number(productRaw);
      return {
        id,
        code: String(readValue(item, codeNames) ?? "").trim(),
        name: String(readValue(item, nameNames) ?? "").trim(),
        productId:
          productIdNames.length > 0 && productId !== null &&
          Number.isInteger(productId) && productId > 0
            ? productId
            : null,
      };
    })
    .filter((item): item is ProductBarcodeLookupOption => item !== null);

const toSelectOptions = (items: ProductBarcodeLookupOption[]): SelectOption[] =>
  items.map((item) => ({
    value: item.id,
    label: item.code ? `${item.name || item.code} (${item.code})` : item.name || `ID ${item.id}`,
  }));

const selectStyles = (hasError: boolean): StylesConfig<any, false> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 42,
    borderColor: hasError ? "#dc2626" : state.isFocused ? "#f07837" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #f07837" : "none",
    "&:hover": { borderColor: hasError ? "#dc2626" : "#f07837" },
  }),
  menu: (base) => ({ ...base, zIndex: 50 }),
});

const getSaveErrorMessage = (error: unknown): string => {
  const axiosError = error as {
    message?: string;
    response?: { data?: unknown };
  };
  const body = axiosError?.response?.data;
  if (typeof body === "string" && body.trim()) return body;

  if (body && typeof body === "object") {
    const response = body as Record<string, unknown>;
    const errors = response.errors;
    if (errors && typeof errors === "object") {
      const details = Object.entries(errors as Record<string, unknown>)
        .flatMap(([field, messages]) => {
          const list = Array.isArray(messages) ? messages : [messages];
          return list.map((message) => `${field}: ${String(message)}`);
        });
      if (details.length) return details.join(" ");
    }

    for (const key of ["message", "detail", "title"] as const) {
      if (typeof response[key] === "string" && response[key]) {
        return response[key] as string;
      }
    }
  }

  return axiosError?.message || "Something went wrong while saving the barcode.";
};

const ProductBarcodeWizard: React.FC<WizardProps> = ({ editData, onSuccess, onCancel }) => {
  const [data, setData] = useState<ProductBarcode>({ ...initialData });
  const [products, setProducts] = useState<ProductBarcodeLookupOption[]>([]);
  const [variants, setVariants] = useState<ProductBarcodeLookupOption[]>([]);
  const [accessories, setAccessories] = useState<ProductBarcodeLookupOption[]>([]);
  const [linkMode, setLinkMode] = useState<LinkMode>("product");
  const [variantProductFilterId, setVariantProductFilterId] = useState<number | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const generationRequest = useRef(0);

  useEffect(() => {
    generationRequest.current += 1;
    if (editData) {
      const edited = { ...initialData, ...editData };
      if (edited.variantId !== null) {
        edited.productId = null;
        edited.accessoryId = null;
      } else if (edited.accessoryId !== null) {
        edited.productId = null;
      }
      setData(edited);
    } else {
      setData({ ...initialData });
    }
    setLinkMode(editData?.variantId ? "variant" : editData?.accessoryId ? "accessory" : "product");
    setVariantProductFilterId(null);
    setErrors({});
    setIsGenerating(false);
  }, [editData]);

  useEffect(() => {
    let mounted = true;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      const results = await Promise.allSettled([
        getProducts(),
        getProductVariants(),
        getAccessories(),
      ]);
      if (!mounted) return;

      const [productResult, variantResult, accessoryResult] = results;
      if (productResult.status === "fulfilled") {
        setProducts(normalizeLookup(productResult.value,
          ["productId", "ProductId", "id", "Id"],
          ["productCode", "ProductCode", "code", "Code"],
          ["productName", "ProductName", "name", "Name"],
        ));
      } else console.error("Failed to load products:", productResult.reason);

      if (variantResult.status === "fulfilled") {
        setVariants(normalizeLookup(variantResult.value,
          ["variantId", "VariantId", "productVariantId", "ProductVariantId", "id", "Id"],
          ["variantCode", "VariantCode", "productVariantCode", "ProductVariantCode", "code", "Code"],
          ["variantName", "VariantName", "productVariantName", "ProductVariantName", "name", "Name"],
          ["productId", "ProductId"],
        ));
      } else console.error("Failed to load variants:", variantResult.reason);

      if (accessoryResult.status === "fulfilled") {
        setAccessories(normalizeLookup(accessoryResult.value,
          ["accessoryId", "AccessoryId", "accessoriesId", "AccessoriesId", "id", "Id"],
          ["accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode", "code", "Code"],
          ["accessoryName", "AccessoryName", "accessoriesName", "AccessoriesName", "accessoriesDescription", "AccessoriesDescription", "accessoryDescription", "AccessoryDescription", "description", "Description", "name", "Name"],
        ));
      } else console.error("Failed to load accessories:", accessoryResult.reason);

      if (results.some((result) => result.status === "rejected")) {
        toast.error("Some product, variant, or accessory options could not be loaded.");
      }
      setIsLoadingOptions(false);
    };
    void loadOptions();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (linkMode !== "variant" || !data.variantId || variantProductFilterId !== null) return;
    const selectedVariant = variants.find((variant) => variant.id === data.variantId);
    if (selectedVariant?.productId) setVariantProductFilterId(selectedVariant.productId);
  }, [data.variantId, linkMode, variantProductFilterId, variants]);

  const generateBarcode = (barcodeType: string) => {
    const requestId = ++generationRequest.current;
    setData((previous) => ({ ...previous, barcodeType, barcode: "" }));
    setErrors((previous) => ({ ...previous, barcodeType: "", barcode: "" }));
    if (!barcodeType) {
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    void getGeneratedProductBarcode(barcodeType, editData?.id ?? 0)
      .then((barcode) => {
        if (generationRequest.current !== requestId) return;
        setData((previous) => ({ ...previous, barcodeType, barcode }));
      })
      .catch((error: unknown) => {
        if (generationRequest.current !== requestId) return;
        console.error("Barcode generation failed:", error);
        toast.error(error instanceof Error ? error.message : "Could not generate a barcode.");
      })
      .finally(() => {
        if (generationRequest.current === requestId) setIsGenerating(false);
      });
  };

  const updateFlag = (field: "active" | "isPrimary", value: boolean) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!data.barcodeType.trim()) next.barcodeType = "Barcode Type is required.";
    if (!data.barcode.trim()) next.barcode = "Generate a barcode by selecting a barcode type.";
    if (data.barcode.length > 100) next.barcode = "Barcode must be 100 characters or fewer.";
    if (data.barcodeType.length > 30) next.barcodeType = "Barcode Type must be 30 characters or fewer.";
    const linkedCount = [data.productId, data.variantId, data.accessoryId]
      .filter((id) => id !== null && Number.isInteger(id) && id > 0).length;
    if (linkedCount !== 1) next.linkedItem = "Select exactly one product, variant, or accessory.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGenerating) return;
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setIsSaving(true);
    try {
      await saveProductBarcode(data);
      toast.success(data.id > 0 ? "Product barcode updated successfully!" : "Product barcode created successfully!");
      onSuccess();
    } catch (error: unknown) {
      const message = getSaveErrorMessage(error);
      console.error("Product barcode save failed:", {
        message,
        response: (error as { response?: { data?: unknown } })?.response?.data,
      });
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const productOptions = toSelectOptions(products);
  const variantOptions = toSelectOptions(
    variantProductFilterId === null ? [] : variants.filter((variant) => variant.productId === variantProductFilterId),
  );
  const accessoryOptions = toSelectOptions(accessories);
  const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "mb-1 block text-sm font-semibold text-gray-700";
  const errorText = (key: string) => errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>;

  return <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
    <div className="bg-[#f07837] px-6 py-4 text-white">
      <h2 className="text-lg font-bold uppercase tracking-wide">{data.id > 0 ? "Update Product Barcode" : "Add Product Barcode"}</h2>
      <p className="mt-1 text-xs text-white/80">Enter barcode details and link it to a product, variant, or accessory.</p>
    </div>
    <div className="min-h-[300px] bg-white p-6 md:p-8">
      <div className="mb-6 border-b border-gray-200 pb-3"><h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">Barcode Information</h3></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="barcodeType" className={labelClass}>Barcode Type <span className="text-red-500">*</span></label>
          <Select<BarcodeTypeOption, false>
            inputId="barcodeType"
            options={barcodeTypes}
            value={barcodeTypes.find((option) => option.value === data.barcodeType) ?? (data.barcodeType ? { value: data.barcodeType, label: data.barcodeType } : null)}
            onChange={(option) => generateBarcode(option?.value ?? "")}
            isSearchable
            isClearable
            placeholder="Search and select barcode type"
            noOptionsMessage={() => "No barcode types found"}
            styles={selectStyles(Boolean(errors.barcodeType))}
          />
          {errorText("barcodeType")}
        </div>
        <div>
          <label htmlFor="barcode" className={labelClass}>Generated Barcode <span className="text-red-500">*</span></label>
          <input id="barcode" value={isGenerating ? "Generating..." : data.barcode} readOnly maxLength={100} className={`${inputClass} bg-gray-50`} placeholder="Select a barcode type to generate" />
          {errorText("barcode")}
        </div>
        <div>
          <label htmlFor="linkMode" className={labelClass}>Link Barcode To <span className="text-red-500">*</span></label>
          <Select<LinkModeOption, false>
            inputId="linkMode"
            options={linkModes}
            value={linkModes.find((option) => option.value === linkMode) ?? null}
            onChange={(option) => {
              const mode = option?.value ?? "product";
              setLinkMode(mode);
              setVariantProductFilterId(null);
              setData((previous) => ({ ...previous, productId: null, variantId: null, accessoryId: null }));
              setErrors((previous) => ({ ...previous, linkedItem: "" }));
            }}
            isSearchable={false}
            isClearable={false}
            styles={selectStyles(false)}
          />
        </div>

        {linkMode === "product" && <div>
          <label htmlFor="productId" className={labelClass}>Product <span className="text-red-500">*</span></label>
          <Select
            inputId="productId"
            options={productOptions}
            value={productOptions.find((option) => option.value === data.productId) ?? null}
            onChange={(option) => {
              setData((previous) => ({ ...previous, productId: option?.value ?? null, variantId: null, accessoryId: null }));
              setErrors((previous) => ({ ...previous, linkedItem: "" }));
            }}
            isLoading={isLoadingOptions}
            isSearchable
            isClearable
            placeholder={isLoadingOptions ? "Loading products..." : "Search and select a product"}
            noOptionsMessage={() => "No products found"}
            styles={selectStyles(Boolean(errors.linkedItem))}
          />
        </div>}

        {linkMode === "variant" && <>
          <div>
            <label htmlFor="variantProductFilter" className={labelClass}>Filter Variants by Product <span className="text-red-500">*</span></label>
            <Select
              inputId="variantProductFilter"
              options={productOptions}
              value={productOptions.find((option) => option.value === variantProductFilterId) ?? null}
              onChange={(option) => {
                const productId = option?.value ?? null;
                setVariantProductFilterId(productId);
                setData((previous) => ({ ...previous, productId: null, variantId: null, accessoryId: null }));
                setErrors((previous) => ({ ...previous, linkedItem: "" }));
              }}
              isLoading={isLoadingOptions}
              isSearchable
              isClearable
              placeholder={isLoadingOptions ? "Loading products..." : "Choose a product to filter variants"}
              noOptionsMessage={() => "No products found"}
              styles={selectStyles(false)}
            />
          </div>
          <div>
            <label htmlFor="variantId" className={labelClass}>Variant <span className="text-red-500">*</span></label>
            <Select
              inputId="variantId"
              options={variantOptions}
              value={variantOptions.find((option) => option.value === data.variantId) ?? null}
              onChange={(option) => {
                setData((previous) => ({ ...previous, productId: null, variantId: option?.value ?? null, accessoryId: null }));
                setErrors((previous) => ({ ...previous, linkedItem: "" }));
              }}
              isLoading={isLoadingOptions}
              isSearchable
              isClearable
              isDisabled={!variantProductFilterId}
              placeholder={!variantProductFilterId ? "Choose a product first" : isLoadingOptions ? "Loading variants..." : "Search and select a variant"}
              noOptionsMessage={() => variantProductFilterId ? "No variants found for this product" : "Choose a product first"}
              styles={selectStyles(Boolean(errors.linkedItem))}
            />
          </div>
        </>}

        {linkMode === "accessory" && <div>
          <label htmlFor="accessoryId" className={labelClass}>Accessory <span className="text-red-500">*</span></label>
          <Select
            inputId="accessoryId"
            options={accessoryOptions}
            value={accessoryOptions.find((option) => option.value === data.accessoryId) ?? null}
            onChange={(option) => {
              setData((previous) => ({ ...previous, productId: null, variantId: null, accessoryId: option?.value ?? null }));
              setErrors((previous) => ({ ...previous, linkedItem: "" }));
            }}
            isLoading={isLoadingOptions}
            isSearchable
            isClearable
            placeholder={isLoadingOptions ? "Loading accessories..." : "Search and select an accessory"}
            noOptionsMessage={() => "No accessories found"}
            styles={selectStyles(Boolean(errors.linkedItem))}
          />
        </div>}
        <div className="flex flex-col justify-center gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-8">
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={data.isPrimary} onChange={(event) => updateFlag("isPrimary", event.target.checked)} className="h-4 w-4 accent-blue-700" /><span className="text-sm font-semibold text-gray-700">Primary Barcode</span></label>
          <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" checked={data.active} onChange={(event) => updateFlag("active", event.target.checked)} className="h-4 w-4 accent-blue-700" /><span className="text-sm font-semibold text-gray-700">Active</span></label>
        </div>
        <div className="md:col-span-2">{errorText("linkedItem")}</div>
      </div>
    </div>
    <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
      <button type="button" onClick={onCancel} disabled={isSaving} className={buttonStyles.cancel}>Cancel</button>
      <button type="button" onClick={() => void handleSave()} disabled={isSaving || isGenerating} className={buttonStyles.save}>{isSaving ? "Saving..." : data.id > 0 ? "Update" : "Save"}</button>
    </div>
  </div>;
};

export default ProductBarcodeWizard;
