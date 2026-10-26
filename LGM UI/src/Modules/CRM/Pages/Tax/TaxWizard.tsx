
import React, { useEffect, useRef, useState } from "react";
import type { Tax } from "./Services/types";
import { getGeneratedTaxCode, saveTax } from "./Services/TaxService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface TaxWizardProps {
  editData: Tax | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: Tax = {
  taxId: 0,
  code: "",
  name: "",
  rate: 0,
  taxType: "GST",
  effectiveFrom: "",
  effectiveTo: "",
  isActive: true,
};

const TaxWizard: React.FC<TaxWizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Tax>({ ...initialData });
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
            ...initialData,
            ...editData,
            effectiveFrom: editData.effectiveFrom
              ? editData.effectiveFrom.slice(0, 10)
              : "",
            effectiveTo: editData.effectiveTo
              ? editData.effectiveTo.slice(0, 10)
              : "",
          }
        : { ...initialData }
    );

    setErrors({});
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const target = e.target;
    const fieldValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : name === "rate"
          ? value === ""
            ? 0
            : Number(value)
          : value;

    setData((previous) => ({
      ...previous,
      [name]: fieldValue,
      ...(name === "name" ? { code: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (name === "name") {
      const requestId = ++codeRequestRef.current;
      const taxName = value;

      if (!taxName.trim()) {
        setData((previous) => ({ ...previous, code: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setIsGeneratingCode(true);
      void getGeneratedTaxCode(taxName, editData?.taxId ?? 0)
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, code: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate tax code:", error);
          setData((previous) => ({ ...previous, code: "" }));
          toast.error("Could not generate Tax Code. Please try again.");
        })
        .finally(() => {
          if (requestId === codeRequestRef.current) {
            setIsGeneratingCode(false);
          }
        });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!data.code.trim()) {
      newErrors.code = "Tax Code is required.";
    }

    if (!data.name.trim()) {
      newErrors.name = "Tax Name is required.";
    }

    if (
      !Number.isFinite(Number(data.rate)) ||
      data.rate < 0 ||
      data.rate > 100
    ) {
      newErrors.rate = "Tax Rate must be between 0 and 100.";
    }

    if (!data.taxType.trim()) {
      newErrors.taxType = "Tax Type is required.";
    }

    if (!data.effectiveFrom) {
      newErrors.effectiveFrom = "Effective From date is required.";
    }

    if (
      data.effectiveFrom &&
      data.effectiveTo &&
      data.effectiveTo < data.effectiveFrom
    ) {
      newErrors.effectiveTo =
        "Effective To cannot be earlier than Effective From.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSaving(true);

    try {
      await saveTax(data);

      toast.success(
        data.taxId > 0
          ? "Tax updated successfully!"
          : "Tax created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      console.error("Tax save error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the tax."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  const labelClass = "mb-1 block text-sm font-semibold text-gray-700";

  return (
    <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.taxId > 0 ? "Update Tax" : "Add Tax"}
        </h2>
        <p className="mt-1 text-xs text-blue-100">
          Enter the tax information below.
        </p>
      </div>

      {/* Form */}
      <div className="min-h-[250px] bg-white p-6 md:p-8">
        {/* Tax Information */}
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Tax Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Tax Code */}
          <div>
            <label htmlFor="code" className={labelClass}>
              Tax Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.code}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Tax Name"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Tax Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Tax Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={150}
              value={data.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Tax Name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="rate" className={labelClass}>
              Tax Rate (%) <span className="text-red-500">*</span>
            </label>
            <input
              id="rate"
              name="rate"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={data.rate}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Tax Rate"
            />
            {errors.rate && (
              <p className="mt-1 text-xs text-red-600">{errors.rate}</p>
            )}
          </div>

          {/* Tax Type */}
          <div>
            <label htmlFor="taxType" className={labelClass}>
              Tax Type <span className="text-red-500">*</span>
            </label>
            <select
              id="taxType"
              name="taxType"
              value={data.taxType}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
            >
              <option value="GST">GST</option>
              <option value="CGST">CGST</option>
              <option value="SGST">SGST</option>
              <option value="IGST">IGST</option>
              <option value="CESS">CESS</option>
              <option value="VAT">VAT</option>
              <option value="Other">Other</option>
            </select>
            {errors.taxType && (
              <p className="mt-1 text-xs text-red-600">{errors.taxType}</p>
            )}
          </div>

          {/* Effective From */}
          <div>
            <label htmlFor="effectiveFrom" className={labelClass}>
              Effective From <span className="text-red-500">*</span>
            </label>
            <input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              value={data.effectiveFrom}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.effectiveFrom && (
              <p className="mt-1 text-xs text-red-600">
                {errors.effectiveFrom}
              </p>
            )}
          </div>

          {/* Effective To */}
          <div>
            <label htmlFor="effectiveTo" className={labelClass}>
              Effective To
            </label>
            <input
              id="effectiveTo"
              name="effectiveTo"
              type="date"
              min={data.effectiveFrom || undefined}
              value={data.effectiveTo}
              onChange={handleChange}
              className={inputClass}
            />
            {errors.effectiveTo && (
              <p className="mt-1 text-xs text-red-600">
                {errors.effectiveTo}
              </p>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className={labelClass}>Status</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3">
              <input
                type="checkbox"
                name="isActive"
                checked={data.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-700"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active Tax
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap justify-end gap-3 border-t bg-gray-50 p-5">
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
          onClick={handleSave}
          disabled={isSaving || isGeneratingCode}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.taxId > 0
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default TaxWizard;

