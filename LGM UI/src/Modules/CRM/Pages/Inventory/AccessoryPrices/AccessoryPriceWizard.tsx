
import React, { useEffect, useState } from "react";

import type { AccessoryPrice } from "./services/types";
import { saveAccessoryPrice } from "./services/AccessoryPriceServices";

import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: AccessoryPrice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyPrice: AccessoryPrice = {
  accessoryPriceId: 0,
  priceListId: 0,
  accessoryId: 0,
  accessoriesId: 0,
  priceType: "",
  amount: 0,
  minQty: 1,
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
  isActive: true,
  isDeleted: false,
};

// Format date values for date inputs
const dateInputValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

const AccessoryPriceWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<AccessoryPrice>({
    ...emptyPrice,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for create or edit
  useEffect(() => {
    setData(
      editData
        ? {
            ...emptyPrice,
            ...editData,
            effectiveFrom: dateInputValue(editData.effectiveFrom),
            effectiveTo:
              dateInputValue(editData.effectiveTo) || null,
          }
        : { ...emptyPrice }
    );

    setErrors({});
  }, [editData]);

  // Update form fields and clear their validation errors
  const update = (
    field: keyof AccessoryPrice,
    value: string | number | boolean | null
  ) => {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  // Validate form fields
  const validate = () => {
    const next: Record<string, string> = {};

    if (
      !Number.isInteger(Number(data.priceListId)) ||
      Number(data.priceListId) <= 0
    ) {
      next.priceListId = "Enter a valid Price List ID.";
    }

    if (
      !Number.isInteger(Number(data.accessoryId)) ||
      Number(data.accessoryId) <= 0
    ) {
      next.accessoryId = "Enter a valid Accessory ID.";
    }

    if (
      !Number.isInteger(Number(data.accessoriesId)) ||
      Number(data.accessoriesId) <= 0
    ) {
      next.accessoriesId = "Enter a valid Accessories ID.";
    }

    if (!data.priceType.trim()) {
      next.priceType = "Price Type is required.";
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
      next.minQty = "Minimum quantity must be at least 1.";
    }

    if (!data.effectiveFrom) {
      next.effectiveFrom = "Effective From date is required.";
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

  // Save or update accessory price
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveAccessoryPrice({
        ...data,
        amount: Number(data.amount),
        minQty: Number(data.minQty),
        effectiveFrom: `${dateInputValue(data.effectiveFrom)}T00:00:00`,
        effectiveTo: data.effectiveTo
          ? `${dateInputValue(data.effectiveTo)}T00:00:00`
          : null,
      });

      toast.success(
        data.accessoryPriceId > 0
          ? "Accessory price updated successfully!"
          : "Accessory price created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the accessory price."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Common input styles
  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20";

  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-600";

  // Display validation errors
  const errorText = (field: string) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600">
        {errors[field]}
      </p>
    ) : null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.accessoryPriceId > 0
            ? "Update Accessory Price"
            : "Add Accessory Price"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Enter the price and effective period below.
        </p>
      </header>

      {/* Form content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Price Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Price List ID */}
          <div>
            <label
              className={labelClass}
              htmlFor="priceListId"
            >
              Price List ID *
            </label>

            <input
              id="priceListId"
              type="number"
              min="1"
              value={data.priceListId || ""}
              onChange={(e) =>
                update("priceListId", Number(e.target.value))
              }
              className={inputClass}
              placeholder="Enter Price List ID"
            />

            {errorText("priceListId")}
          </div>

          {/* Accessory ID */}
          <div>
            <label
              className={labelClass}
              htmlFor="accessoryId"
            >
              Accessory ID *
            </label>

            <input
              id="accessoryId"
              type="number"
              min="1"
              value={data.accessoryId || ""}
              onChange={(e) =>
                update("accessoryId", Number(e.target.value))
              }
              className={inputClass}
              placeholder="Enter Accessory ID"
            />

            {errorText("accessoryId")}
          </div>

          {/* Accessories ID */}
          <div>
            <label
              className={labelClass}
              htmlFor="accessoriesId"
            >
              Accessories ID (record key) *
            </label>

            <input
              id="accessoriesId"
              type="number"
              min="1"
              value={data.accessoriesId || ""}
              onChange={(e) =>
                update("accessoriesId", Number(e.target.value))
              }
              className={inputClass}
              placeholder="Enter Accessories ID"
            />

            {errorText("accessoriesId")}
          </div>

          {/* Price Type */}
          <div>
            <label
              className={labelClass}
              htmlFor="priceType"
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
            <label className={labelClass} htmlFor="amount">
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
            <label className={labelClass} htmlFor="minQty">
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
              className={labelClass}
              htmlFor="effectiveFrom"
            >
              Effective From *
            </label>

            <input
              id="effectiveFrom"
              type="date"
              value={dateInputValue(data.effectiveFrom)}
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
              className={labelClass}
              htmlFor="effectiveTo"
            >
              Effective To
            </label>

            <input
              id="effectiveTo"
              type="date"
              value={dateInputValue(data.effectiveTo)}
              onChange={(e) =>
                update("effectiveTo", e.target.value || null)
              }
              className={inputClass}
            />

            {errorText("effectiveTo")}
          </div>

          {/* Active status */}
          <div className="md:col-span-2">
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

      {/* Footer actions */}
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
            : data.accessoryPriceId > 0
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default AccessoryPriceWizard;
