import React, { useEffect, useRef, useState } from "react";
import type { Reason } from "./Services/types";
import {
  getGeneratedReasonCode,
  saveReason,
} from "./Services/ReasonService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Reason | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyReason: Reason = {
  reasonId: 0,
  code: "",
  name: "",
  reasonType: "",
  isActive: true,
  isDeleted: false,
};

const ReasonWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Reason>({ ...emptyReason });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  useEffect(() => {
    codeRequestRef.current += 1;
    setData(editData ? { ...emptyReason, ...editData } : { ...emptyReason });
    setErrors({});
    setIsGeneratingCode(false);
  }, [editData]);

  const update = (field: keyof Reason, value: string | boolean) => {
    setData((old) => ({
      ...old,
      [field]: value,
      ...(field === "name" ? { code: "" } : {}),
    }));
    setErrors((old) => ({ ...old, [field]: "" }));

    if (field !== "name") return;

    const requestId = ++codeRequestRef.current;
    const name = String(value);

    if (!name.trim()) {
      setData((old) => ({ ...old, code: "" }));
      setIsGeneratingCode(false);
      return;
    }

    setIsGeneratingCode(true);
    void getGeneratedReasonCode(name, editData?.reasonId ?? 0)
      .then((generatedCode) => {
        if (requestId !== codeRequestRef.current) return;
        setData((old) => ({ ...old, code: generatedCode }));
      })
      .catch((error: unknown) => {
        if (requestId !== codeRequestRef.current) return;
        console.error("Failed to generate reason code:", error);
        setData((old) => ({ ...old, code: "" }));
        toast.error("Could not generate reason code. Please try again.");
      })
      .finally(() => {
        if (requestId === codeRequestRef.current) {
          setIsGeneratingCode(false);
        }
      });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!data.code.trim()) next.code = "Code is required.";
    if (data.code.length > 50) {
      next.code = "Code must be 50 characters or fewer.";
    }
    if (!data.name.trim()) next.name = "Name is required.";
    if (data.name.length > 150) {
      next.name = "Name must be 150 characters or fewer.";
    }
    if (!data.reasonType.trim()) {
      next.reasonType = "Reason Type is required.";
    }
    if (data.reasonType.length > 50) {
      next.reasonType = "Reason Type must be 50 characters or fewer.";
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
      await saveReason(data);
      toast.success(
        data.reasonId > 0
          ? "Reason updated successfully!"
          : "Reason created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the reason.",
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
          {data.reasonId ? "Update Reason" : "Add Reason"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Enter the reason information below.
        </p>
      </header>

      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Reason Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="code" className={labelClass}>Code *</label>
            <input
              id="code"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.code}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Reason Name"
            />
            {errorText("code")}
          </div>

          <div>
            <label htmlFor="name" className={labelClass}>Name *</label>
            <input
              id="name"
              maxLength={150}
              value={data.name}
              onChange={(event) => update("name", event.target.value)}
              className={inputClass}
              placeholder="Enter reason name"
            />
            {errorText("name")}
          </div>

          <div>
            <label htmlFor="reasonType" className={labelClass}>
              Reason Type *
            </label>
            <input
              id="reasonType"
              maxLength={50}
              value={data.reasonType}
              onChange={(event) => update("reasonType", event.target.value)}
              className={inputClass}
              placeholder="Enter reason type"
            />
            {errorText("reasonType")}
          </div>

          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(event) => update("isActive", event.target.checked)}
                className="h-4 w-4 accent-[#f07837]"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active reason
              </span>
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
          {isSaving
            ? "Saving..."
            : data.reasonId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default ReasonWizard;
