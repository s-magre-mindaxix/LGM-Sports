
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DocumentSeries } from "./Services/types";
import { saveDocumentSeries } from "./Services/DocumentSeriesService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface WizardProps {
  editData: DocumentSeries | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BranchOption {
  id: number;
  name: string;
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

const getResponseArray = (response: any): any[] => {
  const result = response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.result)) return result.result;
  if (Array.isArray(result?.$values)) return result.$values;

  return [];
};

const getFirstValue = (item: any, keys: string[]) => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }

  return undefined;
};

const SearchableBranchDropdown: React.FC<{
  value: number;
  options: BranchOption[];
  loading: boolean;
  error?: string;
  onChange: (id: number) => void;
  inputClass: string;
  labelClass: string;
}> = ({
  value,
  options,
  loading,
  error,
  onChange,
  inputClass,
  labelClass,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedBranch = options.find(
    (branch) => branch.id === Number(value)
  );

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return options;

    return options.filter(
      (branch) =>
        String(branch.id).includes(query) ||
        branch.name.toLowerCase().includes(query) ||
        `${branch.id} - ${branch.name}`.toLowerCase().includes(query)
    );
  }, [options, search]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        rootRef.current &&
        event.target instanceof Node &&
        !rootRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <label htmlFor="branchSearch" className={labelClass}>
        Branch *
      </label>

      <input
        id="branchSearch"
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        autoComplete="off"
        className={inputClass}
        disabled={loading}
        placeholder={
          loading
            ? "Loading branches..."
            : selectedBranch
              ? `${selectedBranch.id} - ${selectedBranch.name}`
              : "Search branch by ID or name..."
        }
        value={
          isOpen
            ? search
            : selectedBranch
              ? `${selectedBranch.id} - ${selectedBranch.name}`
              : ""
        }
        onFocus={() => {
          setSearch("");
          setIsOpen(true);
        }}
        onClick={() => setIsOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setIsOpen(true);
        }}
      />

      {isOpen && !loading && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {filteredBranches.length > 0 ? (
            filteredBranches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                role="option"
                aria-selected={branch.id === Number(value)}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 ${
                  branch.id === Number(value)
                    ? "bg-orange-50 font-semibold text-[#154068]"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  onChange(branch.id);
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                {branch.id} - {branch.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">
              No matching branches found.
            </p>
          )}
        </div>
      )}

      {loading && (
        <p className="mt-1 text-xs text-gray-500">
          Loading branches...
        </p>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
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

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchLoadError, setBranchLoadError] = useState("");

  // Initialize form data for create or edit.
  useEffect(() => {
    setData(
      editData
        ? { ...emptySeries, ...editData }
        : { ...emptySeries }
    );

    setErrors({});
  }, [editData]);

  // Load branch options from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadBranches = async () => {
      setIsLoadingBranches(true);
      setBranchLoadError("");

      try {
        const endpoint = API_ENDPOINTS.Branch || "/Branch";
        const response = await apiClient.get(endpoint);

        const options: BranchOption[] = getResponseArray(response)
          .map((branch: any) => {
            const id = Number(
              getFirstValue(branch, [
                "branchId",
                "BranchId",
                "id",
                "Id",
              ])
            );

            const rawName = getFirstValue(branch, [
              "branchName",
              "BranchName",
              "name",
              "Name",
              "branchCode",
              "BranchCode",
            ]);

            return {
              id,
              name:
                rawName == null || String(rawName).trim() === ""
                  ? `Branch ${id}`
                  : String(rawName).trim(),
            };
          })
          .filter(
            (branch) =>
              Number.isInteger(branch.id) && branch.id > 0
          )
          .sort((a, b) => a.id - b.id);

        if (!cancelled) {
          setBranches(options);

          if (options.length === 0) {
            setBranchLoadError(
              "No branches returned. Check the Branch API response."
            );
          }
        }
      } catch (error) {
        console.error("Failed to load branches:", error);

        if (!cancelled) {
          setBranchLoadError(
            "Could not load branches. Check the Branch API endpoint."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBranches(false);
        }
      }
    };

    void loadBranches();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update form fields.
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

  // Validate form fields.
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
      next.branchId = "Please select a valid Branch.";
    } else if (
      branches.length > 0 &&
      !branches.some((branch) => branch.id === Number(data.branchId))
    ) {
      next.branchId = "Please select a branch from the list.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // Save or update document series.
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

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-[#f07837] focus:ring-2 focus:ring-[#f07837]/20 disabled:cursor-not-allowed disabled:bg-gray-100";

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

      <div className="p-5 sm:p-8">
        <h3 className="mb-5 border-b border-gray-200 pb-3 text-sm font-extrabold uppercase tracking-wide text-[#154068]">
          Series Information
        </h3>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="documentType" className={labelClass}>
              Document Type *
            </label>

            <input
              id="documentType"
              maxLength={50}
              value={data.documentType}
              onChange={(e) => update("documentType", e.target.value)}
              className={inputClass}
              placeholder="e.g. Invoice"
            />

            {errorText("documentType")}
          </div>

          <div>
            <label htmlFor="prefix" className={labelClass}>
              Prefix *
            </label>

            <input
              id="prefix"
              maxLength={20}
              value={data.prefix}
              onChange={(e) => update("prefix", e.target.value)}
              className={inputClass}
              placeholder="e.g. INV"
            />

            {errorText("prefix")}
          </div>

          <div>
            <label htmlFor="nextNumber" className={labelClass}>
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
                  e.target.value === "" ? 0 : Number(e.target.value)
                )
              }
              className={inputClass}
            />

            {errorText("nextNumber")}
          </div>

          <div>
            <label htmlFor="financialYear" className={labelClass}>
              Financial Year *
            </label>

            <input
              id="financialYear"
              maxLength={20}
              value={data.financialYear}
              onChange={(e) => update("financialYear", e.target.value)}
              className={inputClass}
              placeholder="e.g. 2026-27"
            />

            {errorText("financialYear")}
          </div>

          <div>
            <SearchableBranchDropdown
              value={Number(data.branchId)}
              options={branches}
              loading={isLoadingBranches}
              error={errors.branchId || branchLoadError}
              onChange={(id) => update("branchId", id)}
              inputClass={inputClass}
              labelClass={labelClass}
            />
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
          disabled={isSaving || isLoadingBranches}
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
