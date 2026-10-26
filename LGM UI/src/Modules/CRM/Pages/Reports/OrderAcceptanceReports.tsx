import React, { useEffect, useState } from "react";
import Select, { type StylesConfig } from "react-select";
import {
  getCompanies,
  getCompanyGroups,
  getCurrencies,
  getCustomersByCompanyGroup,
  getOrderAcceptanceReport,
  getProductGroups,
  getStates,
  getVendors,
  updateOrderAcceptanceFinalNote,
} from "./Services/ReportServices";
import type { OrderAcceptanceReportFilters, SelectOption } from "./Types/types";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import { FaEdit, FaEye } from "react-icons/fa";

const labelStyle =
  "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
const inputStyle =
  "w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base) => ({
    ...base,
    minHeight: 46,
    borderRadius: "0.75rem",
  }),
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const OrderAcceptanceReports: React.FC = () => {
  const [filters, setFilters] = useState<OrderAcceptanceReportFilters>({
    group: null,
    company: null,
    vendor: null,
    currency: null,
    placeOfSupply: null,
    companyGroup: null,
    customerCompany: null,
    startDate: getTodayDate(),
    endDate: getTodayDate(),
  });

  const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<SelectOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [companyGroupOptions, setCompanyGroupOptions] = useState<
    SelectOption[]
  >([]);
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [finalNote, setFinalNote] = useState("");
  const [modalMode, setModalMode] = useState<"edit" | "view">("edit");

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("OrderAcceptanceReport", "CanAdd");

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    const [groups, companies, vendors, currencies, states, companyGroups] =
      await Promise.all([
        getProductGroups(),
        getCompanies(),
        getVendors(),
        getCurrencies(),
        getStates(),
        getCompanyGroups(),
      ]);

    setGroupOptions(
      groups.map((g: { id: number; groupName: string }) => ({
        value: g.id,
        label: g.groupName,
      })),
    );

    setCompanyOptions(
      companies.map((c: { companyId: number; companyName: string }) => ({
        value: c.companyId,
        label: c.companyName,
      })),
    );

    setVendorOptions(
      vendors.map((v: { id: number; vendorName: string }) => ({
        value: v.id,
        label: v.vendorName,
      })),
    );

    setCurrencyOptions(
      currencies.map((c: { id: number; currencyName: string }) => ({
        value: c.id,
        label: c.currencyName,
      })),
    );

    setStateOptions(
      states.map((s: { id: number; stateName: string }) => ({
        value: s.id,
        label: s.stateName,
      })),
    );

    setCompanyGroupOptions(
      companyGroups.map((cg: { id: number; companyGroupName: string }) => ({
        value: cg.id,
        label: cg.companyGroupName,
      })),
    );
  };

  const handleCompanyGroupChange = async (opt: SelectOption | null) => {
    setFilters((p) => ({
      ...p,
      companyGroup: opt,
      customerCompany: null,
    }));

    if (opt?.value) {
      const customers = await getCustomersByCompanyGroup(Number(opt.value));
      setCustomerOptions(
        customers.map(
          (c: { id: number; customerName: string; customerCode: string }) => ({
            value: c.id,
            label: `${c.customerName} (${c.customerCode})`,
          }),
        ),
      );
    } else {
      setCustomerOptions([]);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB");
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        groupId: filters.group?.value ?? null,
        companyId: filters.company?.value ?? null,
        vendorId: filters.vendor?.value ?? null,
        currencyId: filters.currency?.value ?? null,
        placeOfSupplyId: filters.placeOfSupply?.value ?? null,
        companyGroupId: filters.companyGroup?.value ?? null,
        customerId: filters.customerCompany?.value ?? null,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      const data = await getOrderAcceptanceReport(payload);
      setRows(data);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!rows.length) {
      toast.error("No data to export");
      return;
    }

    const excelData = rows.map((r, i) => ({
      "Sr No": i + 1,
      "OA No": r.offerNo,
      Group: r.group,
      Company: r.company,
      Vendor: r.vendor,
      "Customer Company Group": r.customerCompanyGroup,
      "Customer Company": r.customerCompany,
      "Customer Person": r.customerPerson,
      "Customer Email": r.customerEmail,
      "Customer Number": r.customerNumber,
      "Place Of Supply": r.placeOfSupply,
      Currency: r.currency,
      "Total Amount": r.totalAmount,
      "Created Date": formatDate(r.createdDate),
      "Created Time": formatTime(r.createdDate),
      "Expiry Date": formatDate(r.expiryDate),
      "Final Notes": r.finalNote,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "OA Reports");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "OrderAcceptanceReports.xlsx");
  };

  const handleEditNote = (row: any) => {
    setSelectedOrderId(row.orderAcceptanceId);
    setFinalNote(row.finalNote || "");
    setModalMode("edit");
    setShowNoteModal(true);
  };

  const handleViewNote = (row: any) => {
    setSelectedOrderId(row.orderAcceptanceId);
    setFinalNote(row.finalNote || "");
    setModalMode("view");
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    try {
      if (!selectedOrderId) return;

      await updateOrderAcceptanceFinalNote({
        orderAcceptanceId: selectedOrderId,
        finalNote: finalNote,
      });

      toast.success("Final note updated successfully");

      setRows((prev) =>
        prev.map((x) =>
          x.orderAcceptanceId === selectedOrderId
            ? { ...x, finalNote: finalNote }
            : x,
        ),
      );

      setShowNoteModal(false);
    } catch {
      toast.error("Failed to update note");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow border space-y-8">
      {/* Header */}
      <h2 className="text-lg font-normal text-[#154068] border-b pb-2">
        Order Acceptance Reports
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>Select Group</label>
          <Select
            options={groupOptions}
            value={filters.group}
            onChange={(v) => setFilters((p) => ({ ...p, group: v }))}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Select Company</label>
          <Select
            options={companyOptions}
            value={filters.company}
            onChange={(v) => setFilters((p) => ({ ...p, company: v }))}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Select Vendor</label>
          <Select
            options={vendorOptions}
            value={filters.vendor}
            onChange={(v) => setFilters((p) => ({ ...p, vendor: v }))}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Start Date</label>
          <input
            type="date"
            className={inputStyle}
            value={filters.startDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, startDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={labelStyle}>End Date</label>
          <input
            type="date"
            className={inputStyle}
            value={filters.endDate}
            onChange={(e) =>
              setFilters((p) => ({ ...p, endDate: e.target.value }))
            }
          />
        </div>

        <div>
          <label className={labelStyle}>Select Currency</label>
          <Select
            options={currencyOptions}
            value={filters.currency}
            onChange={(v) => setFilters((p) => ({ ...p, currency: v }))}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Place of Supply</label>
          <Select
            options={stateOptions}
            value={filters.placeOfSupply}
            onChange={(v) => setFilters((p) => ({ ...p, placeOfSupply: v }))}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Company Group</label>
          <Select
            options={companyGroupOptions}
            value={filters.companyGroup}
            onChange={handleCompanyGroupChange}
            styles={selectStyles}
            isClearable
          />
        </div>

        <div>
          <label className={labelStyle}>Customer Company</label>
          <Select
            options={customerOptions}
            value={filters.customerCompany}
            onChange={(v) => setFilters((p) => ({ ...p, customerCompany: v }))}
            styles={selectStyles}
            isClearable
            isDisabled={!filters.companyGroup}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        {canAdd && (
          <button onClick={handleSubmit} className={buttonStyles.save}>
            Submit
          </button>
        )}
      </div>

      {/* Listing Header */}
      <div className="flex justify-between items-center border-t pt-4">
        <h3 className="text-md font-normal text-[#154068] border-b-2 border-[#154068]">
          Listing of Order Acceptance Reports
        </h3>

        <button
          onClick={exportExcel}
          className="border border-black px-4 py-1.5 rounded text-sm font-normal hover:bg-gray-50"
        >
          Export Excel
        </button>
      </div>

      {/* Table Placeholder */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="min-w-max w-full text-sm">
          <thead className="bg-[#f07837] text-white">
            <tr>
              <th className="px-3 py-2 text-left whitespace-nowrap">Sr No</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                OA No
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Group</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Company</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Vendor</th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Customer Company Group
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Customer Company
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Customer Company Person
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Customer Company Email
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Customer Company Number
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Place Of Supply
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Currency
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Total Amount
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Created Date
              </th>
              {/* <th className="px-3 py-2 text-left whitespace-nowrap">
                Created Time
              </th> */}
              <th className="px-3 py-2 text-left whitespace-nowrap">
                Expiry Date
              </th>
              <th className="px-3 py-2 text-left whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={16} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={16} className="text-center py-6 text-gray-400">
                  No matching records found
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">{r.offerNo}</td>
                  <td className="px-3 py-2">{r.group}</td>
                  <td className="px-3 py-2">{r.company}</td>
                  <td className="px-3 py-2">{r.vendor}</td>
                  <td className="px-3 py-2">{r.customerCompanyGroup}</td>
                  <td className="px-3 py-2">{r.customerCompany}</td>
                  <td className="px-3 py-2">{r.customerPerson}</td>
                  <td className="px-3 py-2">{r.customerEmail}</td>
                  <td className="px-3 py-2">{r.customerNumber}</td>
                  <td className="px-3 py-2">{r.placeOfSupply}</td>
                  <td className="px-3 py-2">{r.currency}</td>
                  <td className="px-3 py-2">{r.totalAmount}</td>
                  <td className="px-3 py-2">{formatDate(r.createdDate)}</td>
                  {/* <td className="px-3 py-2">{formatTime(r.createdDate)}</td> */}
                  <td className="px-3 py-2">{formatDate(r.expiryDate)}</td>
                  <td className="px-3 py-2 flex items-center gap-3">
                    <button
                      onClick={() => handleEditNote(r)}
                      className="text-blue-600 hover:text-blue-800 px-1 py-1 rounded text-xs cursor-pointer"
                    >
                      <FaEdit size={15} />
                    </button>

                    <button
                      onClick={() => handleViewNote(r)}
                      className="text-green-600 hover:text-green-800 rounded text-xs cursor-pointer"
                    >
                      <FaEye size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[400px] shadow-lg">
            <h2 className="text-lg font-semibold mb-4">
              {modalMode === "edit" ? "Update Note" : "View Note"}
            </h2>

            <textarea
              value={finalNote}
              onChange={(e) => setFinalNote(e.target.value)}
              rows={5}
              readOnly={modalMode === "view"}
              className={`w-full border rounded-lg p-3 outline-none ${
                modalMode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              placeholder="Enter note..."
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowNoteModal(false)}
                className="border px-4 py-2 rounded"
              >
                {modalMode === "view" ? "Close" : "Cancel"}
              </button>

              {modalMode === "edit" && (
                <button
                  onClick={handleSaveNote}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderAcceptanceReports;
