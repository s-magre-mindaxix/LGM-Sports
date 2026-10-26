
import React, { useEffect, useRef, useState } from "react";
import type { Bundle } from "./Services/type";
import {
  getGeneratedBundleCode,
  saveBundle,
} from "./Services/BundleService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Bundle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyBundle: Bundle = {
  bundleId: 0,
  code: "",
  name: "",
  parentProductId: 0,
  packagePrice: 0,
  taxMode: "",
  effectiveFrom: new Date().toISOString().slice(0, 10),
  effectiveTo: null,
  isActive: true,
  isDeleted: false,
};

const dateValue = (value?: string | null) =>
  value ? value.slice(0, 10) : "";

const BundleWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Bundle>({ ...emptyBundle });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const codeRequestRef = useRef(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    codeRequestRef.current += 1;
    setIsGeneratingCode(false);

    setData(
      editData
        ? {
            ...emptyBundle,
            ...editData,
            effectiveFrom: dateValue(editData.effectiveFrom),
            effectiveTo: dateValue(editData.effectiveTo) || null,
          }
        : { ...emptyBundle }
    );

    setErrors({});
  }, [editData]);

  const update = (
    field: keyof Bundle,
    value: string | number | boolean | null
  ) => {
    setData((old) => ({
      ...old,
      [field]: value,
      ...(field === "name" ? { code: "" } : {}),
    }));

    setErrors((old) => ({
      ...old,
      [field]: "",
    }));

    if (field !== "name") return;

    const requestId = ++codeRequestRef.current;
    const bundleName = String(value);

    if (!bundleName.trim()) {
      setData((old) => ({ ...old, code: "" }));
      setIsGeneratingCode(false);
      return;
    }

    setIsGeneratingCode(true);

    void getGeneratedBundleCode(
      bundleName,
      editData?.bundleId ?? 0
    )
      .then((generatedCode) => {
        if (requestId !== codeRequestRef.current) return;

        setData((old) => ({
          ...old,
          code: generatedCode,
        }));
      })
      .catch((error: unknown) => {
        if (requestId !== codeRequestRef.current) return;

        console.error("Failed to generate bundle code:", error);

        setData((old) => ({
          ...old,
          code: "",
        }));

        toast.error(
          "Could not generate bundle code. Please try again."
        );
      })
      .finally(() => {
        if (requestId === codeRequestRef.current) {
          setIsGeneratingCode(false);
        }
      });
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!data.code.trim()) {
      next.code = "Code is required.";
    }

    if (data.code.length > 50) {
      next.code = "Code must be 50 characters or fewer.";
    }

    if (!data.name.trim()) {
      next.name = "Name is required.";
    }

    if (data.name.length > 150) {
      next.name = "Name must be 150 characters or fewer.";
    }

    if (
      !Number.isInteger(Number(data.parentProductId)) ||
      Number(data.parentProductId) <= 0
    ) {
      next.parentProductId = "Enter a valid Parent Product ID.";
    }

    if (
      !Number.isFinite(Number(data.packagePrice)) ||
      Number(data.packagePrice) < 0
    ) {
      next.packagePrice = "Package Price must be zero or greater.";
    }

    if (!data.taxMode.trim()) {
      next.taxMode = "Tax Mode is required.";
    }

    if (data.taxMode.length > 30) {
      next.taxMode = "Tax Mode must be 30 characters or fewer.";
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

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveBundle({
        ...data,
        packagePrice: Number(data.packagePrice),
        effectiveFrom: `${dateValue(data.effectiveFrom)}T00:00:00`,
        effectiveTo: data.effectiveTo
          ? `${dateValue(data.effectiveTo)}T00:00:00`
          : null,
      });

      toast.success(
        data.bundleId > 0
          ? "Bundle updated successfully!"
          : "Bundle created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the bundle."
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
      {/* Header */}
      <header className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.bundleId ? "Update Bundle" : "Add Bundle"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Enter the bundle information below.
        </p>
      </header>

      {/* Form Content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Bundle Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Code */}
          <div>
            <label htmlFor="code" className={labelClass}>
              Code *
            </label>

            <input
              id="code"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.code}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Bundle Name"
            />

            {errorText("code")}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Name *
            </label>

            <input
              id="name"
              maxLength={150}
              value={data.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="Enter bundle name"
            />

            {errorText("name")}
          </div>

          {/* Parent Product ID */}
          <div>
            <label htmlFor="parentProductId" className={labelClass}>
              Parent Product ID *
            </label>

            <input
              id="parentProductId"
              type="number"
              min="1"
              step="1"
              value={data.parentProductId || ""}
              onChange={(e) =>
                update(
                  "parentProductId",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Enter parent product ID"
            />

            {errorText("parentProductId")}
          </div>

          {/* Package Price */}
          <div>
            <label htmlFor="packagePrice" className={labelClass}>
              Package Price
            </label>

            <input
              id="packagePrice"
              type="number"
              min="0"
              step="0.01"
              value={data.packagePrice}
              onChange={(e) =>
                update(
                  "packagePrice",
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="0.00"
            />

            {errorText("packagePrice")}
          </div>

          {/* Tax Mode */}
          <div>
            <label htmlFor="taxMode" className={labelClass}>
              Tax Mode *
            </label>

            <input
              id="taxMode"
              maxLength={30}
              value={data.taxMode}
              onChange={(e) => update("taxMode", e.target.value)}
              className={inputClass}
              placeholder="e.g. Inclusive or Exclusive"
            />

            {errorText("taxMode")}
          </div>

          {/* Effective From */}
          <div>
            <label htmlFor="effectiveFrom" className={labelClass}>
              Effective From *
            </label>

            <input
              id="effectiveFrom"
              type="date"
              value={dateValue(data.effectiveFrom)}
              onChange={(e) => update("effectiveFrom", e.target.value)}
              className={inputClass}
            />

            {errorText("effectiveFrom")}
          </div>

          {/* Effective To */}
          <div>
            <label htmlFor="effectiveTo" className={labelClass}>
              Effective To
            </label>

            <input
              id="effectiveTo"
              type="date"
              value={dateValue(data.effectiveTo)}
              onChange={(e) =>
                update("effectiveTo", e.target.value || null)
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
                onChange={(e) => update("isActive", e.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />

              <span className="text-sm font-semibold text-gray-700">
                Active Bundle
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
          disabled={isSaving || isGeneratingCode}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.bundleId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default BundleWizard;
