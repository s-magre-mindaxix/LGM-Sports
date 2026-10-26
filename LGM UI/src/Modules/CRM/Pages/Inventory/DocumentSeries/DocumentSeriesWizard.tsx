
import React, { useEffect, useState } from "react";
import type { DocumentSeries } from "./Services/types";
import { saveDocumentSeries } from "./Services/DocumentSeriesService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: DocumentSeries | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptySeries: DocumentSeries = {
  documentSeriesId: 0,
  documentType: "",
  prefix: "",
  nextNumber: 1,
  financialYear: "",
  branchId: 0,
  isDeleted: false,
};

const DocumentSeriesWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<DocumentSeries>({
    ...emptySeries,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data for create or edit
  useEffect(() => {
    setData(
      editData
        ? { ...emptySeries, ...editData }
        : { ...emptySeries }
    );

    setErrors({});
  }, [editData]);

  // Update form fields
  const update = (
    field: keyof DocumentSeries,
    value: string | number
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

    if (!data.documentType.trim()) {
      next.documentType = "Document Type is required.";
    }

    if (data.documentType.length > 50) {
      next.documentType =
        "Document Type must be 50 characters or fewer.";
    }

    if (!data.prefix.trim()) {
      next.prefix = "Prefix is required.";
    }

    if (data.prefix.length > 20) {
      next.prefix = "Prefix must be 20 characters or fewer.";
    }

    if (
      !Number.isInteger(Number(data.nextNumber)) ||
      Number(data.nextNumber) < 1
    ) {
      next.nextNumber = "Next Number must be at least 1.";
    }

    if (!data.financialYear.trim()) {
      next.financialYear = "Financial Year is required.";
    }

    if (data.financialYear.length > 20) {
      next.financialYear =
        "Financial Year must be 20 characters or fewer.";
    }

    if (
      !Number.isInteger(Number(data.branchId)) ||
      Number(data.branchId) <= 0
    ) {
      next.branchId = "Enter a valid Branch ID.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // Save or update document series
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveDocumentSeries({
        ...data,
        nextNumber: Number(data.nextNumber),
        branchId: Number(data.branchId),
      });

      toast.success(
        data.documentSeriesId > 0
          ? "Document series updated successfully!"
          : "Document series created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving document series."
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
          {data.documentSeriesId
            ? "Update Document Series"
            : "Add Document Series"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Configure numbering for a document type and branch.
        </p>
      </header>

      {/* Form content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Series Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Document Type */}
          <div>
            <label
              htmlFor="documentType"
              className={labelClass}
            >
              Document Type *
            </label>

            <input
              id="documentType"
              maxLength={50}
              value={data.documentType}
              onChange={(e) =>
                update("documentType", e.target.value)
              }
              className={inputClass}
              placeholder="e.g. Invoice"
            />

            {errorText("documentType")}
          </div>

          {/* Prefix */}
          <div>
            <label htmlFor="prefix" className={labelClass}>
              Prefix *
            </label>

            <input
              id="prefix"
              maxLength={20}
              value={data.prefix}
              onChange={(e) =>
                update("prefix", e.target.value)
              }
              className={inputClass}
              placeholder="e.g. INV"
            />

            {errorText("prefix")}
          </div>

          {/* Next Number */}
          <div>
            <label
              htmlFor="nextNumber"
              className={labelClass}
            >
              Next Number *
            </label>

            <input
              id="nextNumber"
              type="number"
              min="1"
              step="1"
              value={data.nextNumber}
              onChange={(e) =>
                update(
                  "nextNumber",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
            />

            {errorText("nextNumber")}
          </div>

          {/* Financial Year */}
          <div>
            <label
              htmlFor="financialYear"
              className={labelClass}
            >
              Financial Year *
            </label>

            <input
              id="financialYear"
              maxLength={20}
              value={data.financialYear}
              onChange={(e) =>
                update("financialYear", e.target.value)
              }
              className={inputClass}
              placeholder="e.g. 2026-27"
            />

            {errorText("financialYear")}
          </div>

          {/* Branch ID */}
          <div>
            <label htmlFor="branchId" className={labelClass}>
              Branch ID *
            </label>

            <input
              id="branchId"
              type="number"
              min="1"
              step="1"
              value={data.branchId || ""}
              onChange={(e) =>
                update(
                  "branchId",
                  e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                )
              }
              className={inputClass}
              placeholder="Enter Branch ID"
            />

            {errorText("branchId")}
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
            : data.documentSeriesId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default DocumentSeriesWizard;
