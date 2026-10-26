
import React, { useEffect, useRef, useState } from "react";
import type { Unit } from "./Services/types";
import { getGeneratedUnitCode, saveUnit } from "./Services/UnitService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Unit | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: Unit = {
  unitId: 0,
  code: "",
  name: "",
  decimalAllowed: false,
  isActive: true,
};

const UnitWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Unit>({ ...initialData });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const codeRequestRef = useRef(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    codeRequestRef.current += 1;
    setData(editData ? { ...editData } : { ...initialData });
    setIsGeneratingCode(false);
    setErrors({});
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = e.target;

    setData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "name" ? { code: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (name === "name") {
      const requestId = ++codeRequestRef.current;
      const unitName = value;

      if (!unitName.trim()) {
        setData((previous) => ({ ...previous, code: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setIsGeneratingCode(true);
      void getGeneratedUnitCode(unitName, editData?.unitId ?? 0)
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, code: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate unit code:", error);
          setData((previous) => ({ ...previous, code: "" }));
          toast.error("Could not generate Unit Code. Please try again.");
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
      newErrors.code = "Unit Code is required.";
    }

    if (!data.name.trim()) {
      newErrors.name = "Unit Name is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);

    try {
      await saveUnit(data);

      toast.success(
        data.unitId > 0
          ? "Unit updated successfully!"
          : "Unit created successfully!",
      );

      onSuccess();
    } catch (error: unknown) {
      console.error("Unit save error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the unit.",
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
          {data.unitId > 0 ? "Update Unit" : "Add Unit"}
        </h2>
        <p className="mt-1 text-xs text-blue-100">
          Enter the unit information below.
        </p>
      </div>

      {/* Form */}
      <div className="min-h-[250px] bg-white p-6 md:p-8">
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Unit Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Unit Code */}
          <div>
            <label htmlFor="code" className={labelClass}>
              Unit Code <span className="text-red-500">*</span>
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.code}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Unit Name"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">
                {errors.code}
              </p>
            )}
          </div>

          {/* Unit Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Unit Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              maxLength={100}
              value={data.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Unit Name"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Decimal Allowed */}
          <div>
            <label className={labelClass}>Decimal Allowed</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3">
              <input
                type="checkbox"
                name="decimalAllowed"
                checked={data.decimalAllowed}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-700"
              />
              <span className="text-sm font-semibold text-gray-700">
                Allow decimal quantities
              </span>
            </label>
          </div>

          {/* Active */}
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
                Active Unit
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
            : data.unitId > 0
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default UnitWizard;

