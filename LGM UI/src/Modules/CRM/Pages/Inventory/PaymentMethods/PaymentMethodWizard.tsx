
import React, { useEffect, useRef, useState } from "react";
import type { PaymentMethod } from "./Services/types";
import {
  getGeneratedPaymentMethodCode,
  savePaymentMethod,
} from "./Services/PaymentMethodService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: PaymentMethod | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyMethod: PaymentMethod = {
  paymentMethodId: 0,
  code: "",
  name: "",
  isActive: true,
  isDeleted: false,
};

const PaymentMethodWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<PaymentMethod>({
    ...emptyMethod,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  // Initialize form data
  useEffect(() => {
    codeRequestRef.current += 1;

    setData(
      editData
        ? { ...emptyMethod, ...editData }
        : { ...emptyMethod }
    );

    setErrors({});
    setIsGeneratingCode(false);
  }, [editData]);

  // Update form fields and generate code
  const update = (
    field: keyof PaymentMethod,
    value: string | boolean
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
    const name = String(value);

    if (!name.trim()) {
      setData((old) => ({
        ...old,
        code: "",
      }));

      setIsGeneratingCode(false);
      return;
    }

    setIsGeneratingCode(true);

    void getGeneratedPaymentMethodCode(
      name,
      editData?.paymentMethodId ?? 0
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

        console.error(
          "Failed to generate payment method code:",
          error
        );

        setData((old) => ({
          ...old,
          code: "",
        }));

        toast.error(
          "Could not generate payment method code. Please try again."
        );
      })
      .finally(() => {
        if (requestId === codeRequestRef.current) {
          setIsGeneratingCode(false);
        }
      });
  };

  // Validate form fields
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

    if (data.name.length > 100) {
      next.name = "Name must be 100 characters or fewer.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // Save payment method
  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      await savePaymentMethod(data);

      toast.success(
        data.paymentMethodId > 0
          ? "Payment method updated successfully!"
          : "Payment method created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the payment method."
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
          {data.paymentMethodId
            ? "Update Payment Method"
            : "Add Payment Method"}
        </h2>

        <p className="mt-1 text-xs text-white/80">
          Enter payment method details below.
        </p>
      </header>

      {/* Form Content */}
      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Payment Method Information
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
              value={
                isGeneratingCode
                  ? "Generating..."
                  : data.code
              }
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Payment Method Name"
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
              maxLength={100}
              value={data.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              className={inputClass}
              placeholder="Enter payment method name"
            />

            {errorText("name")}
          </div>

          {/* Active Status */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(event) =>
                  update("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-[#f07837]"
              />

              <span className="text-sm font-semibold text-gray-700">
                Active payment method
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
            : data.paymentMethodId
              ? "Update"
              : "Save"}
        </button>
      </footer>
    </div>
  );
};

export default PaymentMethodWizard;
