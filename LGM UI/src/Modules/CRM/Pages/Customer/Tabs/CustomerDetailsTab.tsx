import React, { useEffect, useMemo, useState } from "react";
import type {
  CompanyGroupOption,
  CustomerTabProps,
} from "../Services/types";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { getGeneratedCustomerCode } from "../Services/CustomerService";
import Select from "react-select";
import CompanyGroupForm from "../../CompanyGroup/CompanyGroupForm";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface ExtendedTabProps extends CustomerTabProps {
  errors?: { [key: string]: string[] };
}

const CustomerDetailsTab: React.FC<ExtendedTabProps> = ({
  data,
  setData,
  errors = {},
}) => {
  const [groups, setGroups] = useState<CompanyGroupOption[]>([]);
  //const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const inputStyle = (hasError: boolean) =>
    `w-full border ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";


useEffect(() => {
  if (data.id) return;

  let cancelled = false;

  const generateCode = async () => {
    try {
      const code = await getGeneratedCustomerCode();

      if (!cancelled && code) {
        setData((prev) => ({
          ...prev,
          customerCode: code,
        }));
      }
    } catch (error) {
      console.error("Error generating customer code:", error);
    }
  };

  generateCode();

  return () => {
    cancelled = true;
  };
}, [data.id, setData]);



  const fetchGroups = async () => {
    try {
      const groupRes = await apiClient.get(API_ENDPOINTS.CompanyGroup);
      const groupData = Array.isArray(groupRes.data)
        ? groupRes.data
        : groupRes.data?.data || [];
      setGroups(groupData);
      return groupData;
    } catch (error) {
      console.error("Group fetch error", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const groupRes = await apiClient.get(API_ENDPOINTS.CompanyGroup);
        setGroups(
          Array.isArray(groupRes.data)
            ? groupRes.data
            : groupRes.data?.data || [],
        );
      } catch (error) {
        console.error("Master fetch error", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleGroupCreateSuccess = async () => {
    const updatedGroups = await fetchGroups();
    setIsGroupModalOpen(false);

    if (updatedGroups && updatedGroups.length > 0) {
      const newestGroup = updatedGroups[updatedGroups.length - 1];
      setData((prev) => ({
        ...prev,
        companyGroupId: newestGroup.id,
      }));
    }
  };

  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: g.id,
        label: g.companyGroupName,
      })),
    [groups],
  );

  const selectedGroup =
    groupOptions.find((g) => g.value === data.companyGroupId) || null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg relative">
            <button
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black z-10"
            >
              ✕
            </button>
            <CompanyGroupForm
              editData={null}
              onSuccess={handleGroupCreateSuccess}
              onCancel={() => setIsGroupModalOpen(false)}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#154068]">🏢</span>
        <h3 className="text-lg font-bold text-[#154068] uppercase tracking-tight">
          Customer Basic Information
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          {/* Label stays on top */}
          <label className={labelStyle}>
            Company Group <span className="text-red-500">*</span>
          </label>

          {/* Flex container for Select and Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Select
                options={groupOptions}
                value={selectedGroup}
                onChange={(opt) =>
                  setData({ ...data, companyGroupId: opt?.value || 0 })
                }
                isClearable
                isSearchable
                placeholder="Select Group..."
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: 43,
                    borderRadius: "0.5rem",
                    borderColor: errors.companyGroupId
                      ? "#ef4444"
                      : base.borderColor,
                    backgroundColor: errors.companyGroupId
                      ? "#fef2f2"
                      : base.backgroundColor,
                  }),
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsGroupModalOpen(true)}
              className={buttonStyles.add}
            >
              Add
            </button>
          </div>

          {/* Error message below the input row */}
          {errors.companyGroupId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.companyGroupId[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>
            Company Name <span className="text-red-500 ">*</span>
          </label>
          <input
            className={inputStyle(!!errors.customerName)}
            value={data.customerName || ""}
            onChange={(e) => setData({ ...data, customerName: e.target.value })}
            placeholder="Enter customer name"
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.customerName[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Company Code </label>
          <input
            className={`${inputStyle(false)} bg-gray-50 font-mono font-bold text-[#154068] cursor-not-allowed`}
            value={data.customerCode || "Waiting for Name..."}
            readOnly
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>
            Company Short Name <span className="text-red-500 ">*</span>
          </label>
          <input
            className={inputStyle(!!errors.customerShortName)}
            value={data.customerShortName || ""}
            onChange={(e) =>
              setData({ ...data, customerShortName: e.target.value })
            }
            placeholder="Enter short name"
          />
          {errors.customerShortName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.customerShortName[0]}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Branch</label>
          <input
            className={inputStyle(false)}
            value={data.branch || ""}
            onChange={(e) => setData({ ...data, branch: e.target.value })}
            placeholder="Enter branch name"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Plant Code</label>
          <input
            className={inputStyle(false)}
            value={data.plantCode || ""}
            onChange={(e) => setData({ ...data, plantCode: e.target.value })}
            placeholder="Enter plant code"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Indian Vendor/Supplier Code</label>
          <input
            className={inputStyle(false)}
            value={data.vendorCode || ""}
            onChange={(e) => setData({ ...data, vendorCode: e.target.value })}
            placeholder="Enter vendor code (Optional)"
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Foreign Vendor Code</label>
          <input
            className={inputStyle(false)}
            value={data.foreignVendorCode || ""}
            onChange={(e) => setData({ ...data, foreignVendorCode: e.target.value })}
            placeholder="Enter foreign vendor code (Optional)"
          />
        </div>

      </div>
    </div>
  );
};

export default CustomerDetailsTab;
