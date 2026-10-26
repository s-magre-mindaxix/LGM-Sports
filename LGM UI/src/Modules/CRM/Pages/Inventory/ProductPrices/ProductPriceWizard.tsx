
import React, { useEffect, useState } from "react";
import Select from "react-select";
import type { ProductPrice } from "./Services/types";
import { saveProductPrice } from "./Services/ProductPriceService";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: ProductPrice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DropdownOption {
  id: number;
  name: string;
}

// Default product price
const emptyPrice: ProductPrice = {
  productPriceId: 0,
  priceListId: 0,
  productId: 0,
  priceType: "",
  amount: 0,
  minQty: 1,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
  isActive: true,
  isDeleted: false,
};

// Format date
const dateValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

// Normalize API responses
const getArray = (response: any): any[] => {
  const result = response?.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;

  return [];
};

// Map API records to dropdown options
const mapOptions = (
  items: any[],
  type: "priceList" | "product"
): DropdownOption[] => {
  return items
    .map((item) => {
      const id =
        type === "priceList"
          ? Number(
            item.priceListId ??
            item.PriceListId ??
            item.id ??
            item.Id
          )
          : Number(
            item.productId ??
            item.ProductId ??
            item.id ??
            item.Id
          );

      const name =
        type === "priceList"
          ? item.priceListName ??
          item.PriceListName ??
          item.name ??
          item.Name
          : item.productName ??
          item.ProductName ??
          item.name ??
          item.Name;

      return {
        id,
        name: String(name ?? ""),
      };
    })
    .filter(
      (item) =>
        Number.isInteger(item.id) &&
        item.id > 0 &&
        item.name.trim() !== ""
    );
};

const ProductPriceWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<ProductPrice>({
    ...emptyPrice,
  });

  const [priceLists, setPriceLists] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load Price Lists and Products
  useEffect(() => {
    let cancelled = false;

    const loadDropdowns = async () => {
      setLoadingOptions(true);

      try {
        const [priceListResponse, productResponse] = await Promise.all([
          apiClient.get(
            API_ENDPOINTS.PriceList || "/PriceLists"
          ),
          apiClient.get(
            API_ENDPOINTS.Products || "/Products"
          ),
        ]);

        if (cancelled) return;

        setPriceLists(
          mapOptions(getArray(priceListResponse), "priceList")
        );

        setProducts(
          mapOptions(getArray(productResponse), "product")
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load Price Lists and Products:",
            error
          );

          toast.error(
            "Unable to load Price Lists and Products."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    void loadDropdowns();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load edit data
  useEffect(() => {
    setData(
      editData
        ? {
          ...emptyPrice,
          ...editData,
          effectiveFrom: dateValue(editData.effectiveFrom),
          effectiveTo:
            dateValue(editData.effectiveTo) || null,
        }
        : { ...emptyPrice }
    );

    setErrors({});
  }, [editData]);

  // Update form fields
  const update = (
    field: keyof ProductPrice,
    value: string | number | boolean | null
  ) => {
    setData((old) => ({
      ...old,
      [field]: value,
    }));

    setErrors((old) => ({
      ...old,
      [field]: "",
    }));
  };

  // Validate form
  const validate = () => {
    const next: Record<string, string> = {};

    if (
      !Number.isInteger(Number(data.priceListId)) ||
      Number(data.priceListId) <= 0
    ) {
      next.priceListId = "Please select a valid Price List.";
    }

    if (
      !Number.isInteger(Number(data.productId)) ||
      Number(data.productId) <= 0
    ) {
      next.productId = "Please select a valid Product.";
    }

    if (!data.priceType.trim()) {
      next.priceType = "Price Type is required.";
    }

    if (data.priceType.length > 50) {
      next.priceType =
        "Price Type must be 50 characters or fewer.";
    }

    if (
      !Number.isFinite(Number(data.amount)) ||
      Number(data.amount) < 0
    ) {
      next.amount = "Amount must be zero or greater.";
    }

    if (
      !Number.isInteger(Number(data.minQty)) ||
      Number(data.minQty) < 1
    ) {
      next.minQty =
        "Minimum quantity must be at least 1.";
    }

    if (!data.effectiveFrom) {
      next.effectiveFrom = "Effective From is required.";
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

  // Save product price
  const handleSave = async () => {
    if (isSaving) return;

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      // Send only the numeric IDs to the backend.
      const payload: ProductPrice = {
        ...data,
        priceListId: Number(data.priceListId),
        productId: Number(data.productId),
        amount: Number(data.amount),
        minQty: Number(data.minQty),
        effectiveFrom: `${dateValue(data.effectiveFrom)}T00:00:00`,
        effectiveTo: data.effectiveTo
          ? `${dateValue(data.effectiveTo)}T00:00:00`
          : null,
      };

      await saveProductPrice(payload);

      toast.success(
        data.productPriceId > 0
          ? "Product price updated successfully!"
          : "Product price created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      console.error("Failed to save product price:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the product price."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Input styles
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20 disabled:cursor-not-allowed disabled:bg-gray-100";

  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";

  // Validation error
  const errorText = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

  const searchableOptions = (items: DropdownOption[]) =>
    items.map((item) => ({
      value: item.id,
      label: `${item.id} - ${item.name}`,
    }));

  const selectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "8px",
      borderColor: state.isFocused ? "#f07837" : "#d1d5db",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(240,120,55,0.2)"
        : "none",
      "&:hover": {
        borderColor: "#f07837",
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
    }),
  };
  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.productPriceId
            ? "Update Product Price"
            : "Add Product Price"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Enter pricing and effective period details.
        </p>
      </header>

      {/* Content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Product Price Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Price List Dropdown */}
          <div>
            <label className={labelClass}>
              Price List *
            </label>

            <Select
              options={searchableOptions(priceLists)}
              value={
                priceLists
                  .filter((item) => item.id === Number(data.priceListId))
                  .map((item) => ({
                    value: item.id,
                    label: `${item.id} - ${item.name}`,
                  }))[0] ?? null
              }
              onChange={(option) =>
                update("priceListId", option?.value ?? 0)
              }
              isLoading={loadingOptions}
              isDisabled={loadingOptions || isSaving}
              isClearable
              isSearchable
              placeholder="Search Price List by ID or name..."
              noOptionsMessage={() => "No Price Lists found"}
              styles={selectStyles}
            />

            {errorText("priceListId")}
          </div>

          {/* Product Dropdown */}
          <div>
            <label className={labelClass}>
              Product *
            </label>

            <Select
              options={searchableOptions(products)}
              value={
                products
                  .filter((item) => item.id === Number(data.productId))
                  .map((item) => ({
                    value: item.id,
                    label: `${item.id} - ${item.name}`,
                  }))[0] ?? null
              }
              onChange={(option) =>
                update("productId", option?.value ?? 0)
              }
              isLoading={loadingOptions}
              isDisabled={loadingOptions || isSaving}
              isClearable
              isSearchable
              placeholder="Search Product by ID or name..."
              noOptionsMessage={() => "No Products found"}
              styles={selectStyles}
            />

            {errorText("productId")}
          </div>

          {/* Price Type */}
          <div>
            <label
              htmlFor="priceType"
              className={labelClass}
            >
              Price Type *
            </label>

            <input
              id="priceType"
              maxLength={50}
              value={data.priceType}
              onChange={(e) =>
                update("priceType", e.target.value)
              }
              disabled={isSaving}
              className={inputClass}
              placeholder="e.g. Retail, Wholesale"
            />

            {errorText("priceType")}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className={labelClass}>
              Amount *
            </label>

            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={data.amount}
              onChange={(e) =>
                update(
                  "amount",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              disabled={isSaving}
              className={inputClass}
              placeholder="0.00"
            />

            {errorText("amount")}
          </div>

          {/* Minimum Quantity */}
          <div>
            <label htmlFor="minQty" className={labelClass}>
              Minimum Quantity *
            </label>

            <input
              id="minQty"
              type="number"
              min="1"
              step="1"
              value={data.minQty}
              onChange={(e) =>
                update(
                  "minQty",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              disabled={isSaving}
              className={inputClass}
            />

            {errorText("minQty")}
          </div>

          {/* Effective From */}
          <div>
            <label
              htmlFor="effectiveFrom"
              className={labelClass}
            >
              Effective From *
            </label>

            <input
              id="effectiveFrom"
              type="date"
              value={dateValue(data.effectiveFrom)}
              onChange={(e) =>
                update("effectiveFrom", e.target.value)
              }
              disabled={isSaving}
              className={inputClass}
            />

            {errorText("effectiveFrom")}
          </div>

          {/* Effective To */}
          <div>
            <label
              htmlFor="effectiveTo"
              className={labelClass}
            >
              Effective To
            </label>

            <input
              id="effectiveTo"
              type="date"
              value={dateValue(data.effectiveTo)}
              onChange={(e) =>
                update(
                  "effectiveTo",
                  e.target.value || null
                )
              }
              disabled={isSaving}
              className={inputClass}
            />

            {errorText("effectiveTo")}
          </div>

          {/* Active Status */}
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) =>
                  update("isActive", e.target.checked)
                }
                disabled={isSaving}
                className="h-4 w-4 accent-[#f07837]"
              />

              <span className="text-sm font-semibold text-gray-700">
                Active price
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
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
          disabled={isSaving || loadingOptions}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.productPriceId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default ProductPriceWizard;