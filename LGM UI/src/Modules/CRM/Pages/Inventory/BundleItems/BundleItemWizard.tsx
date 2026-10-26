
import React, { useEffect, useState } from "react";
import type { BundleItem } from "./Services/types";
import { saveBundleItem } from "./Services/BundleItemService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: BundleItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyItem: BundleItem = {
  bundleItemId: 0,
  bundleId: 0,
  quantity: 1,
  pricingType: "",
  allocatedPrice: 0,
  isOptional: false,
  isDeleted: false,
  accessoriesId: null,
};

const BundleItemWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<BundleItem>({ ...emptyItem });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setData(
      editData
        ? { ...emptyItem, ...editData }
        : { ...emptyItem }
    );

    setErrors({});
  }, [editData]);

  // Update form fields
  const update = (
    field: keyof BundleItem,
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

  // Validate form fields
  const validate = () => {
    const next: Record<string, string> = {};

    if (
      !Number.isInteger(Number(data.bundleId)) ||
      Number(data.bundleId) <= 0
    ) {
      next.bundleId = "Enter a valid Bundle ID.";
    }

    if (
      !Number.isInteger(Number(data.quantity)) ||
      Number(data.quantity) < 1
    ) {
      next.quantity = "Quantity must be at least 1.";
    }

    if (!data.pricingType.trim()) {
      next.pricingType = "Pricing Type is required.";
    }

    if (data.pricingType.length > 30) {
      next.pricingType =
        "Pricing Type must be 30 characters or fewer.";
    }

    if (
      !Number.isFinite(Number(data.allocatedPrice)) ||
      Number(data.allocatedPrice) < 0
    ) {
      next.allocatedPrice =
        "Allocated Price cannot be negative.";
    }

    if (
      data.accessoriesId !== null &&
      (
        !Number.isInteger(Number(data.accessoriesId)) ||
        Number(data.accessoriesId) <= 0
      )
    ) {
      next.accessoriesId =
        "Enter a valid Accessories ID or leave it blank.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // Save bundle item
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveBundleItem({
        ...data,
        quantity: Number(data.quantity),
        allocatedPrice: Number(data.allocatedPrice),
        accessoriesId: data.accessoriesId
          ? Number(data.accessoriesId)
          : null,
      });

      toast.success(
        data.bundleItemId > 0
          ? "Bundle item updated successfully!"
          : "Bundle item created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the bundle item."
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
      <p className="mt-1 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
      {/* Header */}
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.bundleItemId
            ? "Update Bundle Item"
            : "Add Bundle Item"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Enter the bundle item information below.
        </p>
      </header>

      {/* Form Content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Bundle Item Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Bundle ID */}
          <div>
            <label htmlFor="bundleId" className={labelClass}>
              Bundle ID *
            </label>

            <input
              id="bundleId"
              type="number"
              min="1"
              step="1"
              value={data.bundleId || ""}
              onChange={(e) =>
                update(
                  "bundleId",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Enter Bundle ID"
            />

            {errorText("bundleId")}
          </div>

          {/* Accessories ID */}
          <div>
            <label htmlFor="accessoriesId" className={labelClass}>
              Accessories ID
            </label>

            <input
              id="accessoriesId"
              type="number"
              min="1"
              step="1"
              value={data.accessoriesId ?? ""}
              onChange={(e) =>
                update(
                  "accessoriesId",
                  e.target.value === ""
                    ? null
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Optional accessory ID"
            />

            {errorText("accessoriesId")}
          </div>

          {/* Quantity */}
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
              onChange={(e) =>
                update(
                  "quantity",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
            />

            {errorText("quantity")}
          </div>

          {/* Pricing Type */}
          <div>
            <label htmlFor="pricingType" className={labelClass}>
              Pricing Type *
            </label>

            <input
              id="pricingType"
              maxLength={30}
              value={data.pricingType}
              onChange={(e) =>
                update("pricingType", e.target.value)
              }
              className={inputClass}
              placeholder="Enter pricing type"
            />

            {errorText("pricingType")}
          </div>

          {/* Allocated Price */}
          <div>
            <label htmlFor="allocatedPrice" className={labelClass}>
              Allocated Price
            </label>

            <input
              id="allocatedPrice"
              type="number"
              min="0"
              step="0.01"
              value={data.allocatedPrice}
              onChange={(e) =>
                update(
                  "allocatedPrice",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="0.00"
            />

            {errorText("allocatedPrice")}
          </div>

          {/* Optional Item */}
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isOptional}
                onChange={(e) =>
                  update("isOptional", e.target.checked)
                }
                className="h-4 w-4 accent-[#f07837]"
              />

              <span className="text-sm font-semibold text-gray-700">
                Optional item
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
            : data.bundleItemId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default BundleItemWizard;
