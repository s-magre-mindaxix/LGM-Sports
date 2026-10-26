
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type { Supplier, BranchOption } from "./Services/types";
import {
  getBranches,
  getGeneratedSupplierCode,
  saveSupplier,
} from "./Services/SupplierService";

interface SupplierWizardProps {
  editData: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: Supplier = {
  supplierId: 0,
  branchId: 0,
  supplierCode: "",
  supplierName: "",
  supplierGSTIN: "",
  supplierContact: "",
  supplierAddress: "",
  paymentTerms: "",
  isActive: true,
};

const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const SupplierWizard: React.FC<SupplierWizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Supplier>({ ...initialData });
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const codeRequestRef = useRef(0);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    codeRequestRef.current += 1;
    setIsGeneratingCode(false);
    setData(editData ? { ...initialData, ...editData } : { ...initialData });
    setErrors({});
  }, [editData]);

  useEffect(() => {
    const loadBranches = async () => {
      setIsLoadingBranches(true);

      try {
        const result = await getBranches();
        setBranches(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Failed to load branches:", error);
        toast.error("Failed to load branches.");
      } finally {
        setIsLoadingBranches(false);
      }
    };

    void loadBranches();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const target = e.target;

    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : name === "supplierContact"
          ? value.replace(/\D/g, "").slice(0, 10)
          : name === "branchId"
          ? Number(value)
          : name === "supplierGSTIN"
            ? value.toUpperCase()
            : value;

    setData((previous) => ({
      ...previous,
      [name]: nextValue,
      ...(name === "supplierName" ? { supplierCode: "" } : {}),
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    if (name === "supplierName") {
      const requestId = ++codeRequestRef.current;
      const supplierName = value;

      if (!supplierName.trim()) {
        setData((previous) => ({ ...previous, supplierCode: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setIsGeneratingCode(true);
      void getGeneratedSupplierCode(supplierName, editData?.supplierId ?? 0)
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, supplierCode: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate supplier code:", error);
          setData((previous) => ({ ...previous, supplierCode: "" }));
          toast.error("Could not generate Supplier Code. Please try again.");
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

    if (!data.branchId) {
      newErrors.branchId = "Branch is required.";
    }

    if (!data.supplierCode.trim()) {
      newErrors.supplierCode = "Supplier Code is required.";
    }

    if (!data.supplierName.trim()) {
      newErrors.supplierName = "Supplier Name is required.";
    }

    if (
      data.supplierGSTIN.trim() &&
      !gstinRegex.test(data.supplierGSTIN.trim())
    ) {
      newErrors.supplierGSTIN = "Please enter a valid GSTIN.";
    }

    if (data.supplierCode.trim().length > 50) {
      newErrors.supplierCode = "Supplier Code cannot exceed 50 characters.";
    }

    if (data.supplierName.trim().length > 150) {
      newErrors.supplierName = "Supplier Name cannot exceed 150 characters.";
    }

    if (data.supplierContact.trim() && !/^\d{10}$/.test(data.supplierContact.trim())) {
      newErrors.supplierContact = "Contact number must be exactly 10 digits.";
    }

    if (data.supplierAddress.length > 300) {
      newErrors.supplierAddress =
        "Supplier Address cannot exceed 300 characters.";
    }

    if (data.paymentTerms.length > 100) {
      newErrors.paymentTerms =
        "Payment Terms cannot exceed 100 characters.";
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
      await saveSupplier(data);

      toast.success(
        data.supplierId > 0
          ? "Supplier updated successfully!"
          : "Supplier created successfully!"
      );

      onSuccess();
    } catch (error: unknown) {
      console.error("Supplier save error:", error);

      const err = error as {
        response?: {
          data?: {
            message?: string;
            title?: string;
          };
        };
        message?: string;
      };

      toast.error(
        err.response?.data?.message ??
          err.response?.data?.title ??
          err.message ??
          "Something went wrong while saving the supplier."
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
          {data.supplierId > 0 ? "Update Supplier" : "Add Supplier"}
        </h2>

        <p className="mt-1 text-xs text-blue-100">
          Enter the supplier information below.
        </p>
      </div>

      {/* Form */}
      <div className="min-h-[250px] bg-white p-6 md:p-8">
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Supplier Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Branch */}
          <div>
            <label htmlFor="branchId" className={labelClass}>
              Branch <span className="text-red-500">*</span>
            </label>

            <select
              id="branchId"
              name="branchId"
              value={data.branchId || ""}
              onChange={handleChange}
              className={`${inputClass} bg-white`}
              disabled={isLoadingBranches}
            >
              <option value="">
                {isLoadingBranches ? "Loading branches..." : "Select Branch"}
              </option>

              {branches.map((branch) => (
                <option key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </option>
              ))}
            </select>

            {errors.branchId && (
              <p className="mt-1 text-xs text-red-600">{errors.branchId}</p>
            )}
          </div>

          {/* Supplier Code */}
          <div>
            <label htmlFor="supplierCode" className={labelClass}>
              Supplier Code <span className="text-red-500">*</span>
            </label>

            <input
              id="supplierCode"
              name="supplierCode"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.supplierCode}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Supplier Name"
            />

            {errors.supplierCode && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supplierCode}
              </p>
            )}
          </div>

          {/* Supplier Name */}
          <div>
            <label htmlFor="supplierName" className={labelClass}>
              Supplier Name <span className="text-red-500">*</span>
            </label>

            <input
              id="supplierName"
              name="supplierName"
              type="text"
              maxLength={150}
              value={data.supplierName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Supplier Name"
            />

            {errors.supplierName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supplierName}
              </p>
            )}
          </div>

          {/* GSTIN */}
          <div>
            <label htmlFor="supplierGSTIN" className={labelClass}>
              Supplier GSTIN
            </label>

            <input
              id="supplierGSTIN"
              name="supplierGSTIN"
              type="text"
              maxLength={15}
              value={data.supplierGSTIN}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter GSTIN"
            />

            {errors.supplierGSTIN && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supplierGSTIN}
              </p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="supplierContact" className={labelClass}>
              Supplier Contact
            </label>

            <input
              id="supplierContact"
              name="supplierContact"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              value={data.supplierContact}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter 10-digit Contact Number"
            />

            {errors.supplierContact && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supplierContact}
              </p>
            )}
          </div>

          {/* Payment Terms */}
          <div>
            <label htmlFor="paymentTerms" className={labelClass}>
              Payment Terms
            </label>

            <input
              id="paymentTerms"
              name="paymentTerms"
              type="text"
              maxLength={100}
              value={data.paymentTerms}
              onChange={handleChange}
              className={inputClass}
              placeholder="e.g. Net 30, Advance"
            />

            {errors.paymentTerms && (
              <p className="mt-1 text-xs text-red-600">
                {errors.paymentTerms}
              </p>
            )}
          </div>

          {/* Supplier Address */}
          <div className="md:col-span-2">
            <label htmlFor="supplierAddress" className={labelClass}>
              Supplier Address
            </label>

            <textarea
              id="supplierAddress"
              name="supplierAddress"
              rows={3}
              maxLength={300}
              value={data.supplierAddress}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Supplier Address"
            />

            {errors.supplierAddress && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supplierAddress}
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
                Active Supplier
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
          disabled={isSaving || isGeneratingCode || isLoadingBranches}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.supplierId > 0
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default SupplierWizard;



