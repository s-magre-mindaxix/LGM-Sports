
import React, { useEffect, useState } from "react";
import type { ProductPrice } from "./Services/types";
import { saveProductPrice } from "./Services/ProductPriceService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: ProductPrice | null;
  onSuccess: () => void;
  onCancel: () => void;
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

const ProductPriceWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<ProductPrice>({
    ...emptyPrice,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      next.priceListId = "Enter a valid Price List ID.";
    }

    if (
      !Number.isInteger(Number(data.productId)) ||
      Number(data.productId) <= 0
    ) {
      next.productId = "Enter a valid Product ID.";
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
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveProductPrice({
        ...data,
        amount: Number(data.amount),
        minQty: Number(data.minQty),
        effectiveFrom: `${dateValue(data.effectiveFrom)}T00:00:00`,
        effectiveTo: data.effectiveTo
          ? `${dateValue(data.effectiveTo)}T00:00:00`
          : null,
      });

      toast.success(
        data.productPriceId > 0
          ? "Product price updated successfully!"
          : "Product price created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
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
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20";

  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";

  // Validation error
  const errorText = (key: string) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

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
          {/* Price List ID */}
          <div>
            <label
              htmlFor="priceListId"
              className={labelClass}
            >
              Price List ID *
            </label>

            <input
              id="priceListId"
              type="number"
              min="1"
              step="1"
              value={data.priceListId || ""}
              onChange={(e) =>
                update(
                  "priceListId",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Enter Price List ID"
            />

            {errorText("priceListId")}
          </div>

          {/* Product ID */}
          <div>
            <label
              htmlFor="productId"
              className={labelClass}
            >
              Product ID *
            </label>

            <input
              id="productId"
              type="number"
              min="1"
              step="1"
              value={data.productId || ""}
              onChange={(e) =>
                update(
                  "productId",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Enter Product ID"
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
          disabled={isSaving}
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
