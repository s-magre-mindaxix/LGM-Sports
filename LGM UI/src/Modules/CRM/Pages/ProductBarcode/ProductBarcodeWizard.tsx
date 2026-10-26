import React, { useEffect, useRef, useState } from "react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import type { ProductBarcode } from "./Services/types";
import {
  getGeneratedProductBarcode,
  saveProductBarcode,
} from "./Services/ProductBarcodeService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: ProductBarcode | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface IdOption {
  id: number;
  code: string;
  name: string;
}

// type IdField = "productId" | "variantId" | "accessoryId";

const emptyBarcode: ProductBarcode = {
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

const getRecordValue = (
  item: Record<string, unknown>,
  names: string[],
): unknown => {
  for (const name of names) {
    if (item[name] !== undefined && item[name] !== null) return item[name];
  }
  return undefined;
};

const normalizeOptions = (
  value: unknown,
  idNames: string[],
  codeNames: string[],
  nameNames: string[],
): IdOption[] => {
  const record = value as Record<string, unknown> | null;
  const rows = Array.isArray(value)
    ? value
    : Array.isArray(record?.data)
      ? record.data
      : Array.isArray(record?.items)
        ? record.items
        : Array.isArray(record?.Items)
          ? record.Items
          : [];

  return rows
    .map((row): IdOption | null => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = Number(getRecordValue(item, idNames));
      const code = String(getRecordValue(item, codeNames) ?? "").trim();
      const name = String(getRecordValue(item, nameNames) ?? "").trim();

      if (!Number.isInteger(id) || id <= 0) return null;
      return { id, code, name };
    })
    .filter((option): option is IdOption => option !== null);
};

const endpointEntries = Object.entries(
  API_ENDPOINTS as unknown as Record<string, string>,
);

const findEndpoint = (pattern: RegExp, excluded: RegExp): string | undefined =>
  endpointEntries.find(
    ([key]) => pattern.test(key) && !excluded.test(key),
  )?.[1];

const productEndpoint = findEndpoint(
  /product/i,
  /barcode|variant|accessor/i,
);
const variantEndpoint = findEndpoint(/variant/i, /barcode/i);
const accessoryEndpoint = findEndpoint(/accessor/i, /barcode/i);

const loadOptions = async (
  endpoint: string | undefined,
  idNames: string[],
  codeNames: string[],
  nameNames: string[],
): Promise<IdOption[]> => {
  if (!endpoint) return [];
  const response = await apiClient.get(endpoint);
  const result = response.data?.data ?? response.data;
  return normalizeOptions(result, idNames, codeNames, nameNames);
};

interface SearchableIdDropdownProps {
  id: string;
  label: string;
  placeholder: string;
  value: number | null;
  options: IdOption[];
  loading: boolean;
  error?: string;
  onSelect: (value: number | null) => void;
  onClearError: () => void;
}

const SearchableIdDropdown: React.FC<SearchableIdDropdownProps> = ({
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
    if (value === null) return;

    const selected = options.find((option) => option.id === Number(value));
    if (selected) {
      setSearch([selected.code, selected.name].filter(Boolean).join(" - "));
    }
  }, [value, options]);

  const query = search.trim().toLowerCase();
  const filtered = options.filter((option) =>
    [option.code, option.name, String(option.id)]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );

  const choose = (option: IdOption) => {
    onSelect(option.id);
    setSearch([option.code, option.name].filter(Boolean).join(" - "));
    setIsOpen(false);
    onClearError();
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600">
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
          onSelect(null);
          onClearError();
          setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150);
        }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20"
        placeholder={loading ? `Loading ${label.toLowerCase()} options...` : placeholder}
      />
      {isOpen && (
        <ul
          id={`${id}-options`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filtered.length > 0 ? (
            filtered.map((option) => (
              <li
                key={option.id}
                role="option"
                aria-selected={Number(value) === option.id}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
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
              {loading ? "Loading..." : "No matching options found."}
            </li>
          )}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

const ProductBarcodeWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<ProductBarcode>({ ...emptyBarcode });
  const [products, setProducts] = useState<IdOption[]>([]);
  const [variants, setVariants] = useState<IdOption[]>([]);
  const [accessories, setAccessories] = useState<IdOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  useEffect(() => {
    codeRequestRef.current += 1;
    setData(editData ? { ...emptyBarcode, ...editData } : { ...emptyBarcode });
    setErrors({});
    setIsGeneratingCode(false);
  }, [editData]);

  useEffect(() => {
    let isMounted = true;

    const loadAllOptions = async () => {
      setIsLoadingOptions(true);
      const results = await Promise.allSettled([
        loadOptions(
          productEndpoint,
          ["productId", "ProductId", "id", "Id"],
          ["productCode", "ProductCode", "code", "Code"],
          ["productName", "ProductName", "name", "Name"],
        ),
        loadOptions(
          variantEndpoint,
          ["variantId", "VariantId", "productVariantId", "ProductVariantId", "id", "Id"],
          ["variantCode", "VariantCode", "productVariantCode", "ProductVariantCode", "code", "Code"],
          ["variantName", "VariantName", "productVariantName", "ProductVariantName", "name", "Name"],
        ),
        loadOptions(
          accessoryEndpoint,
          ["accessoryId", "AccessoryId", "accessoriesId", "AccessoriesId", "id", "Id"],
          ["accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode", "code", "Code"],
          ["accessoryName", "AccessoryName", "accessoriesName", "AccessoriesName", "name", "Name"],
        ),
      ]);

      if (!isMounted) return;

      const [productResult, variantResult, accessoryResult] = results;
      if (productResult.status === "fulfilled") setProducts(productResult.value);
      else console.error("Could not load products:", productResult.reason);

      if (variantResult.status === "fulfilled") setVariants(variantResult.value);
      else console.error("Could not load variants:", variantResult.reason);

      if (accessoryResult.status === "fulfilled") setAccessories(accessoryResult.value);
      else console.error("Could not load accessories:", accessoryResult.reason);

      if (results.some((result) => result.status === "rejected")) {
        toast.error("Some product, variant, or accessory options could not be loaded.");
      }
      setIsLoadingOptions(false);
    };

    void loadAllOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  const update = (
    field: keyof ProductBarcode,
    value: string | number | boolean | null,
  ) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "barcodeType" ? { barcode: "" } : {}),
    }));
    setErrors((previous) => ({ ...previous, [field]: "" }));

    if (field !== "barcodeType") return;

    const requestId = ++codeRequestRef.current;
    const barcodeType = String(value);

    if (!barcodeType.trim()) {
      setData((previous) => ({ ...previous, barcode: "" }));
      setIsGeneratingCode(false);
      return;
    }

    setIsGeneratingCode(true);
    void getGeneratedProductBarcode(barcodeType, editData?.id ?? 0)
      .then((generatedBarcode) => {
        if (requestId !== codeRequestRef.current) return;
        setData((previous) => ({ ...previous, barcode: generatedBarcode }));
      })
      .catch((error: unknown) => {
        if (requestId !== codeRequestRef.current) return;
        console.error("Failed to generate barcode:", error);
        setData((previous) => ({ ...previous, barcode: "" }));
        toast.error("Could not generate a barcode. Please try again.");
      })
      .finally(() => {
        if (requestId === codeRequestRef.current) {
          setIsGeneratingCode(false);
        }
      });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!data.barcode.trim()) next.barcode = "Barcode is required.";
    if (data.barcode.length > 100) {
      next.barcode = "Barcode must be 100 characters or fewer.";
    }
    if (!data.barcodeType.trim()) {
      next.barcodeType = "Barcode Type is required.";
    }
    if (data.barcodeType.length > 30) {
      next.barcodeType = "Barcode Type must be 30 characters or fewer.";
    }

    for (const field of ["productId", "variantId", "accessoryId"] as const) {
      const value = data[field];
      if (
        value === null ||
        !Number.isInteger(Number(value)) ||
        Number(value) <= 0
      ) {
        next[field] = "Please select a valid option.";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      await saveProductBarcode(data);
      toast.success(
        data.id > 0
          ? "Barcode updated successfully!"
          : "Barcode created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the barcode.",
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
          {data.id ? "Update Product Barcode" : "Add Product Barcode"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Enter barcode details and its linked item IDs.
        </p>
      </header>

      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Barcode Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="barcode" className={labelClass}>
              Barcode *
            </label>
            <input
              id="barcode"
              maxLength={100}
              value={isGeneratingCode ? "Generating..." : data.barcode}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Barcode Type"
            />
            {errorText("barcode")}
          </div>

          <div>
            <label htmlFor="barcodeType" className={labelClass}>
              Barcode Type *
            </label>
            <input
              id="barcodeType"
              maxLength={30}
              value={data.barcodeType}
              onChange={(event) => update("barcodeType", event.target.value)}
              className={inputClass}
              placeholder="e.g. EAN-13, UPC-A, QR, Code 128"
            />
            {errorText("barcodeType")}
          </div>

          <SearchableIdDropdown
            id="productId"
            label="Product"
            placeholder="Search by product code or name"
            value={data.productId}
            options={products}
            loading={isLoadingOptions}
            error={errors.productId}
            onSelect={(value) => update("productId", value)}
            onClearError={() =>
              setErrors((previous) => ({ ...previous, productId: "" }))
            }
          />

          <SearchableIdDropdown
            id="variantId"
            label="Variant"
            placeholder="Search by variant code or name"
            value={data.variantId}
            options={variants}
            loading={isLoadingOptions}
            error={errors.variantId}
            onSelect={(value) => update("variantId", value)}
            onClearError={() =>
              setErrors((previous) => ({ ...previous, variantId: "" }))
            }
          />

          <SearchableIdDropdown
            id="accessoryId"
            label="Accessory"
            placeholder="Search by accessory code or name"
            value={data.accessoryId}
            options={accessories}
            loading={isLoadingOptions}
            error={errors.accessoryId}
            onSelect={(value) => update("accessoryId", value)}
            onClearError={() =>
              setErrors((previous) => ({ ...previous, accessoryId: "" }))
            }
          />

          <div className="flex flex-col justify-center gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-8">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isPrimary}
                onChange={(event) => update("isPrimary", event.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />
              <span className="text-sm font-semibold text-gray-700">
                Primary barcode
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.active}
                onChange={(event) => update("active", event.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />
              <span className="text-sm font-semibold text-gray-700">Active</span>
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
          disabled={isSaving || isGeneratingCode}
          className={buttonStyles.save}
        >
          {isSaving ? "Saving..." : data.id ? "Update" : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default ProductBarcodeWizard;





