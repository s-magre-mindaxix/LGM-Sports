import React, { useEffect, useState } from "react";
import type {
  InstallationContact,
  InstallationReportTabProps,
} from "../Services/types";
import {
  getAllCompanies,
  getAllCustomers,
} from "../Services/InstallationReportService";
import Select from "react-select";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaTrashAlt } from "react-icons/fa";
import {
  getEmployeeSelectionList,
  type EmployeeSelectItem,
} from "../../../../HRMS/Services/MasterDataService";

const ReportDetailsTab: React.FC<InstallationReportTabProps> = ({
  data,
  setData,
}) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const [companies, setCompanies] = useState<
    { id: number; companyName: string }[]
  >([]);
  const [customers, setCustomers] = useState<
    { id: number; customerName: string }[]
  >([]);
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSelectItem | null>(null);

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [companyList, customerList, employeeList] = await Promise.all([
          getAllCompanies(),
          getAllCustomers(),
          getEmployeeSelectionList(),
        ]);

        setCompanies(companyList || []);
        setCustomers(customerList || []);
        setEmployees(employeeList || []);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadDropdownData();
  }, []);

  const addContact = () => {
    const newContact: InstallationContact = {
      id: 0,
      name: "",
      designation: "",
    };
    setData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }));
  };

  const removeContact = (index: number) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const updateContact = (
    idx: number,
    field: keyof InstallationContact,
    val: string,
  ) => {
    setData((prev) => {
      const updated = [...(prev.contacts || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, contacts: updated };
    });
  };

  const addEmployeeContact = (employee: EmployeeSelectItem) => {
    const newContact: InstallationContact = {
      id: 0,
      name: `${employee.firstName} ${employee.lastName}`,
      designation: employee.designation,
    };

    setData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }));

    setSelectedEmployee(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">📋</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Report Details
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Dropdown */}
        <div className="flex flex-col">
          <label className={labelStyle}>Select Company</label>
          <Select
            options={companies.map((c: any) => ({
              value: c.id || c.companyId,
              label: c.companyName,
            }))}
            value={
              companies
                .map((c: any) => ({
                  value: c.id || c.companyId,
                  label: c.companyName,
                }))
                .find((c) => c.value === data.companyId) || null
            }
            onChange={(opt: any) =>
              setData((prev) => ({
                ...prev,
                companyId: opt?.value || 0,
                companyName: opt?.label || "",
              }))
            }
            placeholder="Search Company..."
            isClearable
          />
        </div>

        {/* Customer Dropdown */}

        <div className="flex flex-col">
          <label className={labelStyle}>Select Customer</label>
          <Select
            options={customers.map((c: any) => ({
              value: c.id || c.customerId,
              label: c.customerName,
            }))}
            value={
              customers
                .map((c: any) => ({
                  value: c.id || c.customerId,
                  label: c.customerName,
                }))
                .find((c) => c.value === data.customerId) || null
            }
            onChange={(opt: any) =>
              setData((prev) => ({
                ...prev,
                customerId: opt?.value || 0,
                customerName: opt?.label || "",
              }))
            }
            placeholder="Search Customer..."
            isClearable
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Installation Date</label>
          <input
            type="date"
            className={inputStyle}
            value={data.installationDate || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, installationDate: e.target.value }))
            }
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Place / Location</label>
          <input
            className={inputStyle}
            value={data.place || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, place: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col">
          <label className={labelStyle}>Inspection Summary</label>
          <textarea
            className={inputStyle}
            rows={3}
            value={data.inspectionSummary || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                inspectionSummary: e.target.value,
              }))
            }
          />
        </div>
        <div className="flex flex-col">
          <label className={labelStyle}>Product Information</label>
          <textarea
            className={inputStyle}
            rows={3}
            value={data.productInformation || ""}
            onChange={(e) =>
              setData((prev) => ({
                ...prev,
                productInformation: e.target.value,
              }))
            }
          />
        </div>

        <div className="flex flex-col">
          <label className={labelStyle}>Customer Notes (Optional)</label>
          <textarea
            className={inputStyle}
            rows={3}
            value={data.customerNotes || ""}
            onChange={(e) =>
              setData((prev) => ({ ...prev, customerNotes: e.target.value }))
            }
          />
        </div>

        <div className="border-t pt-6">
          <h4 className="text-md font-bold text-[#0b2c52] mb-4">
            Associated Contacts
          </h4>
          <div className="mb-4">
            <label className={labelStyle}>Employee</label>

            <Select
              value={
                selectedEmployee
                  ? {
                      value: selectedEmployee.id,
                      label: selectedEmployee.fullName,
                    }
                  : null
              }
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
              onChange={(selected) => {
                const employee = employees.find(
                  (e) => e.id === selected?.value,
                );

                if (!employee) return;

                addEmployeeContact(employee);
              }}
              placeholder="Select Employee..."
              isClearable
            />
          </div>
          <div className="space-y-4">
            {(data.contacts || []).map((contact, idx) => (
              <div
                key={idx}
                className="relative border p-4 rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {data.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                  >
                    <FaTrashAlt />
                  </button>
                )}

                <div>
                  <label className={labelStyle}>Person Name</label>
                  <input
                    className={inputStyle}
                    value={contact.name || ""}
                    onChange={(e) => updateContact(idx, "name", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Designation</label>
                  <input
                    className={inputStyle}
                    value={contact.designation || ""}
                    onChange={(e) =>
                      updateContact(idx, "designation", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addContact}
            className={`${buttonStyles.add} mt-4`}
          >
            + Add New Contact
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsTab;
