import React, { useEffect, useRef, useState } from "react";
import type { Warehouse } from "./Services/types";
import {
  getGeneratedWarehouseCode,
  saveWarehouse,
} from "./Services/WarehouseServices";
import { getBranches } from "../Branch/Services/BranchService";
import type { BranchListItem } from "../Branch/Services/types";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Warehouse | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: Warehouse = {
  warehouseId: 0,
  branchId: 0,
  warehouseCode: "",
  warehouseName: "",
  type: "",
  isActive: true,
};

const getBranchLabel = (branch: BranchListItem): string =>
  [branch.branchCode, branch.branchName].filter(Boolean).join(" - ");

const WarehouseWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Warehouse>({ ...initialData });
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [branchSearch, setBranchSearch] = useState("");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  useEffect(() => {
    codeRequestRef.current += 1;
    const nextData = editData ? { ...editData } : { ...initialData };
    setData(nextData);
    setIsGeneratingCode(false);
    setErrors({});

    const selectedBranch = branches.find(
      (branch) => branch.branchId === nextData.branchId,
    );
    setBranchSearch(selectedBranch ? getBranchLabel(selectedBranch) : "");
  }, [editData, branches]);

  useEffect(() => {
    let isMounted = true;

    const loadBranches = async () => {
      setIsLoadingBranches(true);
      try {
        const result = await getBranches();
        if (isMounted) setBranches(Array.isArray(result) ? result : []);
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error("Failed to load branches:", error);
        toast.error("Could not load branches.");
      } finally {
        if (isMounted) setIsLoadingBranches(false);
      }
    };

    void loadBranches();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBranches = branches.filter((branch) => {
    const query = branchSearch.trim().toLowerCase();
    return (
      String(branch.branchCode ?? "").toLowerCase().includes(query) ||
      String(branch.branchName ?? "").toLowerCase().includes(query)
    );
  });

  const selectBranch = (branch: BranchListItem) => {
    setData((previous) => ({ ...previous, branchId: Number(branch.branchId) }));
    setBranchSearch(getBranchLabel(branch));
    setIsBranchDropdownOpen(false);
    setErrors((previous) => ({ ...previous, branchId: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
      ...(name === "warehouseName" ? { warehouseCode: "" } : {}),
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));

    if (name === "warehouseName") {
      const requestId = ++codeRequestRef.current;
      const warehouseName = value;

      if (!warehouseName.trim()) {
        setData((previous) => ({ ...previous, warehouseCode: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setIsGeneratingCode(true);
      void getGeneratedWarehouseCode(
        warehouseName,
        editData?.warehouseId ?? 0,
      )
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, warehouseCode: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate warehouse code:", error);
          setData((previous) => ({ ...previous, warehouseCode: "" }));
          toast.error("Could not generate Warehouse Code. Please try again.");
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

    if (!Number.isInteger(data.branchId) || data.branchId <= 0) {
      newErrors.branchId = "Please select a valid Branch.";
    }

    if (!data.warehouseCode.trim()) {
      newErrors.warehouseCode = "Warehouse Code is required.";
    }

    if (!data.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse Name is required.";
    }

    if (!data.type.trim()) {
      newErrors.type = "Warehouse Type is required.";
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
      await saveWarehouse(data);
      toast.success(
        data.warehouseId > 0
          ? "Warehouse updated successfully!"
          : "Warehouse created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      console.error("Warehouse save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the warehouse.",
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
      <div className="bg-[#f07837] px-6 py-4 text-white">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {data.warehouseId > 0 ? "Update Warehouse" : "Add Warehouse"}
        </h2>
        <p className="mt-1 text-xs text-blue-100">
          Enter the warehouse information below.
        </p>
      </div>

      <div className="min-h-[300px] bg-white p-6 md:p-8">
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Warehouse Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="relative">
            <label htmlFor="branchSearch" className={labelClass}>
              Branch <span className="text-red-500">*</span>
            </label>
            <input
              id="branchSearch"
              type="text"
              role="combobox"
              aria-expanded={isBranchDropdownOpen}
              aria-controls="branch-options"
              autoComplete="off"
              value={branchSearch}
              onFocus={() => setIsBranchDropdownOpen(true)}
              onChange={(event) => {
                setBranchSearch(event.target.value);
                setData((previous) => ({ ...previous, branchId: 0 }));
                setErrors((previous) => ({ ...previous, branchId: "" }));
                setIsBranchDropdownOpen(true);
              }}
              onBlur={() => {
                window.setTimeout(() => setIsBranchDropdownOpen(false), 150);
              }}
              className={inputClass}
              placeholder={
                isLoadingBranches ? "Loading branches..." : "Search branch"
              }
            />
            {isBranchDropdownOpen && (
              <ul
                id="branch-options"
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              >
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch) => (
                    <li
                      key={branch.branchId}
                      role="option"
                      aria-selected={data.branchId === branch.branchId}
                    >
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectBranch(branch)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                      >
                        {getBranchLabel(branch)}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    {isLoadingBranches ? "Loading..." : "No branches found."}
                  </li>
                )}
              </ul>
            )}
            {errors.branchId && (
              <p className="mt-1 text-xs text-red-600">{errors.branchId}</p>
            )}
          </div>

          <div>
            <label htmlFor="warehouseCode" className={labelClass}>
              Warehouse Code <span className="text-red-500">*</span>
            </label>
            <input
              id="warehouseCode"
              name="warehouseCode"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.warehouseCode}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Warehouse Name"
            />
            {errors.warehouseCode && (
              <p className="mt-1 text-xs text-red-600">
                {errors.warehouseCode}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="warehouseName" className={labelClass}>
              Warehouse Name <span className="text-red-500">*</span>
            </label>
            <input
              id="warehouseName"
              name="warehouseName"
              type="text"
              maxLength={100}
              value={data.warehouseName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Warehouse Name"
            />
            {errors.warehouseName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.warehouseName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="type" className={labelClass}>
              Warehouse Type <span className="text-red-500">*</span>
            </label>
            <input
              id="type"
              name="type"
              type="text"
              maxLength={50}
              value={data.type}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Warehouse Type"
            />
            {errors.type && (
              <p className="mt-1 text-xs text-red-600">{errors.type}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={data.isActive}
                onChange={handleChange}
                className="h-4 w-4 accent-blue-700"
              />
              <span className="text-sm font-semibold text-gray-700">
                Active Warehouse
              </span>
            </label>
          </div>
        </div>
      </div>

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
          onClick={() => void handleSave()}
          disabled={isSaving || isGeneratingCode}
          className={buttonStyles.save}
        >
          {isSaving
            ? "Saving..."
            : data.warehouseId > 0
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default WarehouseWizard;

