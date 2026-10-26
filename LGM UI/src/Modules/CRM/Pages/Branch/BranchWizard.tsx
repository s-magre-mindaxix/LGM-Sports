


import React, { useEffect, useRef, useState } from "react";
import type { Branch } from "./Services/types";
import { getGeneratedBranchCode, saveBranch } from "./Services/BranchService";
import { getCompanies } from "../Company/Services/CompanyService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface WizardProps {
  editData: Branch | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface CompanyOption {
  companyId: number;
  companyName: string;
}

const normalizeCompany = (value: unknown): CompanyOption | null => {
  if (!value || typeof value !== "object") return null;

  const item = value as Record<string, unknown>;
  const companyId = Number(
    item.companyId ?? item.CompanyId ?? item.id ?? item.Id ?? 0,
  );
  const companyName = String(
    item.companyName ?? item.CompanyName ?? item.name ?? item.Name ?? "",
  ).trim();

  return Number.isInteger(companyId) && companyId > 0 && companyName
    ? { companyId, companyName }
    : null;
};
const initialData: Branch = {
  branchId: 0,
  companyId: 0,
  branchCode: "",
  branchName: "",
  address: "",
  contact: "",
  isActive: true,
};

const BranchWizard: React.FC<WizardProps> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [data, setData] = useState<Branch>({ ...initialData });
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codeRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      try {
        const result = await getCompanies();
        if (!isMounted) return;

        const options = Array.isArray(result)
          ? result.map(normalizeCompany).filter(
              (company): company is CompanyOption => company !== null,
            )
          : [];
        setCompanies(options);
      } catch (error: unknown) {
        if (!isMounted) return;
        console.error("Failed to load companies:", error);
        toast.error("Could not load companies. Please try again.");
      } finally {
        if (isMounted) setIsLoadingCompanies(false);
      }
    };

    void loadCompanies();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    codeRequestRef.current += 1;
    const nextData = editData ? { ...editData } : { ...initialData };
    setData(nextData);
    setErrors({});
    setIsGeneratingCode(false);

    const selectedCompany = companies.find(
      (company) => company.companyId === nextData.companyId,
    );
    setCompanySearch(selectedCompany?.companyName ?? "");
  }, [editData, companies]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const nextValue =
      name === "contact" ? value.replace(/\D/g, "").slice(0, 10) : value;

    setData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : nextValue,
      ...(name === "branchName" ? { branchCode: "" } : {}),
    }));

    setErrors((previous) => ({ ...previous, [name]: "" }));

    if (name === "branchName") {
      const requestId = ++codeRequestRef.current;
      const branchName = value;

      if (!branchName.trim()) {
        setData((previous) => ({ ...previous, branchCode: "" }));
        setIsGeneratingCode(false);
        return;
      }

      setIsGeneratingCode(true);
      void getGeneratedBranchCode(branchName, editData?.branchId ?? 0)
        .then((generatedCode) => {
          if (requestId !== codeRequestRef.current) return;
          setData((previous) => ({ ...previous, branchCode: generatedCode }));
        })
        .catch((error: unknown) => {
          if (requestId !== codeRequestRef.current) return;
          console.error("Failed to generate branch code:", error);
          setData((previous) => ({ ...previous, branchCode: "" }));
          toast.error("Could not generate Branch Code. Please try again.");
        })
        .finally(() => {
          if (requestId === codeRequestRef.current) {
            setIsGeneratingCode(false);
          }
        });
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(companySearch.trim().toLowerCase()),
  );

  const selectCompany = (company: CompanyOption) => {
    setData((previous) => ({ ...previous, companyId: company.companyId }));
    setCompanySearch(company.companyName);
    setIsCompanyDropdownOpen(false);
    setErrors((previous) => ({ ...previous, companyId: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!Number.isInteger(data.companyId) || data.companyId <= 0) {
      newErrors.companyId = "Please select a company.";
    }

    if (!data.branchCode.trim()) {
      newErrors.branchCode = "Branch Code is required.";
    }

    if (!data.branchName.trim()) {
      newErrors.branchName = "Branch Name is required.";
    }

    if (!data.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!/^\d{10}$/.test(data.contact.trim())) {
      newErrors.contact = "Contact number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSaving || isGeneratingCode) return;

    if (!validate()) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setIsSaving(true);
    try {
      await saveBranch(data);
      toast.success(
        data.branchId > 0
          ? "Branch updated successfully!"
          : "Branch created successfully!",
      );
      onSuccess();
    } catch (error: unknown) {
      console.error("Branch save error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the branch.",
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
          {data.branchId > 0 ? "Update Branch" : "Add Branch"}
        </h2>
        <p className="mt-1 text-xs text-white/80">
          Enter the branch information below.
        </p>
      </div>

      <div className="min-h-[300px] bg-white p-6 md:p-8">
        <div className="mb-6 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
            Branch Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="relative">
            <label htmlFor="companySearch" className={labelClass}>
              Company <span className="text-red-500">*</span>
            </label>
            <input
              id="companySearch"
              type="text"
              role="combobox"
              aria-expanded={isCompanyDropdownOpen}
              aria-controls="company-options"
              autoComplete="off"
              value={companySearch}
              onFocus={() => setIsCompanyDropdownOpen(true)}
              onChange={(event) => {
                const value = event.target.value;
                setCompanySearch(value);
                setIsCompanyDropdownOpen(true);
                setData((previous) => ({ ...previous, companyId: 0 }));
                setErrors((previous) => ({ ...previous, companyId: "" }));
              }}
              onBlur={() => {
                window.setTimeout(() => setIsCompanyDropdownOpen(false), 150);
              }}
              className={inputClass}
              placeholder={
                isLoadingCompanies ? "Loading companies..." : "Search company name"
              }
            />
            {isCompanyDropdownOpen && (
              <ul
                id="company-options"
                role="listbox"
                className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg"
              >
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <li key={company.companyId} role="option" aria-selected={data.companyId === company.companyId}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => selectCompany(company)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                      >
                        {company.companyName}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    {isLoadingCompanies ? "Loading..." : "No companies found."}
                  </li>
                )}
              </ul>
            )}
            {errors.companyId && (
              <p className="mt-1 text-xs text-red-600">{errors.companyId}</p>
            )}
          </div>

          <div>
            <label htmlFor="branchCode" className={labelClass}>
              Branch Code <span className="text-red-500">*</span>
            </label>
            <input
              id="branchCode"
              name="branchCode"
              type="text"
              maxLength={50}
              value={isGeneratingCode ? "Generating..." : data.branchCode}
              readOnly
              className={`${inputClass} bg-gray-100`}
              placeholder="Generated from Branch Name"
            />
            {errors.branchCode && (
              <p className="mt-1 text-xs text-red-600">{errors.branchCode}</p>
            )}
          </div>

          <div>
            <label htmlFor="branchName" className={labelClass}>
              Branch Name <span className="text-red-500">*</span>
            </label>
            <input
              id="branchName"
              name="branchName"
              type="text"
              maxLength={100}
              value={data.branchName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Branch Name"
            />
            {errors.branchName && (
              <p className="mt-1 text-xs text-red-600">{errors.branchName}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact" className={labelClass}>
              Contact <span className="text-red-500">*</span>
            </label>
            <input
              id="contact"
              name="contact"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              value={data.contact}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter 10-digit contact number"
            />
            {errors.contact && (
              <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              maxLength={500}
              value={data.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter Branch Address"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address}</p>
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
                Active Branch
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
            : data.branchId > 0
              ? "Update"
              : "Save"}
        </button>
      </div>
    </div>
  );
};

export default BranchWizard;




