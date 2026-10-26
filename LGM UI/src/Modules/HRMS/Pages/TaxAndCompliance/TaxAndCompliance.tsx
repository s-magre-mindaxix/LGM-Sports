import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  LoaderCircle,
} from "lucide-react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { toast } from "sonner";
import "react-datepicker/dist/react-datepicker.css";

// --- Interfaces ---
interface StatutoryRecord {
  employeeName: string;
  employeeId: string;
  pfWages: number;
  pfContribution: number;
  esicWages: number;
  esicContribution: number;
  tds: number;
  pt: number;
}

interface DashboardStats {
  totalPfContribution: number;
  totalEsicContribution: number;
  totalTdsDeducted: number;
  pendingReturns: number;
  latestCompletedRunId?: number;
}

interface ComplianceStatus {
  id: number;
  label: string;
  status: "Filed" | "Pending" | "Due";
  dueDateInfo?: string;
}

interface ComplianceItemDetails {
  complianceType: string;
  filedDate?: string;
  transactionId?: string;
  notes?: string;
}
const defaultStats: DashboardStats = {
  totalPfContribution: 0,
  totalEsicContribution: 0,
  totalTdsDeducted: 0,
  pendingReturns: 0,
};

const formatCurrency = (amount?: number) =>
  `₹${(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

// const StatCard: React.FC<{
//   title: string;
//   value: string;
//   description: string;
//   icon: React.ReactNode;
//   bgColor: string;
// }> = ({ title, value, description, icon, bgColor }) => (
//   <div
//     className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
//   >
//     <div>
//       <p className="text-sm opacity-90">{title}</p>
//       <p className="text-3xl font-bold">{value}</p>
//       <p className="text-xs opacity-80">{description}</p>
//     </div>
//     <div className="bg-white/20 p-3 rounded-full">{icon}</div>
//   </div>
// );

// --- Main Component ---
const TaxAndCompliance: React.FC = () => {
  const [statutoryRecords, setStatutoryRecords] = useState<StatutoryRecord[]>(
    [],
  );
  // const [dashboardStats, setDashboardStats] =
  //   useState<DashboardStats>(defaultStats);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>(
    [],
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceStatus | null>(
    null,
  );
  const [filedDate, setFiledDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestRunId, setLatestRunId] = useState<number | null>(null);
  const [isEcrModalOpen, setIsEcrModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedMonthYear, setSelectedMonthYear] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [itemDetails, setItemDetails] = useState<ComplianceItemDetails | null>(
    null,
  );

  const fetchData = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { year, month };
      const [statsResponse, recordsResponse, statusResponse] =
        await Promise.all([
          apiClient.get(API_ENDPOINTS.TaxComplianceDashboard, { params }),
          apiClient.get(API_ENDPOINTS.TaxComplianceRecords, { params }),
          apiClient.get(`${API_ENDPOINTS.TaxAndCompliance}/compliance-status`, {
            params,
          }),
        ]);

      const statsData = statsResponse.data ?? defaultStats;
      // setDashboardStats(statsData);
      setLatestRunId(statsData.latestCompletedRunId ?? null);

      setStatutoryRecords(
        Array.isArray(recordsResponse.data) ? recordsResponse.data : [],
      );
      const filteredStatus = Array.isArray(statusResponse.data) 
  ? statusResponse.data.filter(item => 
      !item.label.toLowerCase().includes('pf') && 
      !item.label.toLowerCase().includes('esic')
    )
  : [];
setComplianceStatus(filteredStatus);
    } catch {
      setError("Failed to fetch compliance data. Please try again.");
      toast.error("Failed to fetch compliance data.");
      setStatutoryRecords([]);
     // setDashboardStats(defaultStats);
      setComplianceStatus([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const [year, month] = selectedMonthYear.split("-").map(Number);
    fetchData(year, month);
  }, [fetchData, selectedMonthYear]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return statutoryRecords.slice(startIndex, startIndex + pageSize);
  }, [statutoryRecords, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  const totalItems = statutoryRecords.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getComplianceBadge = (item: ComplianceStatus) => {
    switch (item.status) {
      case "Filed":
        return {
          icon: <CheckCircle size={14} />,
          text: "Filed",
          classes: "bg-blue-100 text-blue-800",
        };
      case "Pending":
        return {
          icon: <AlertTriangle size={14} />,
          text: "Pending",
          classes: "bg-red-100 text-red-800",
        };
      case "Due":
        return {
          icon: <Calendar size={14} />,
          text: item.dueDateInfo,
          classes: "bg-gray-100 text-gray-700 border",
        };
      default:
        return { icon: null, text: "Unknown", classes: "bg-gray-100" };
    }
  };

  const handleDownloadReport = async (
    reportType: "pf-ecr" | "esic-report" | "pt-report" | "tds-report",
  ) => {
    if (!latestRunId) {
      toast.error("No completed payroll run found to generate a report.");
      return;
    }
    try {
      // toast.info(`Generating ${reportType.replace("-", " ")}...`);
      const response = await apiClient.get(
        `${API_ENDPOINTS.ComplianceReports}/${reportType}/${latestRunId}`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${reportType}.xlsx`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch?.[1]) fileName = fileNameMatch[1];
      }
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to download report.`);
    }
  };

  const handleItemClick = async (item: ComplianceStatus) => {
    setSelectedItem(item);
    if (item.status === "Filed") {
      // If already filed, fetch and show details
      try {
        const response = await apiClient.get(
          `${API_ENDPOINTS.TaxAndCompliance}/compliance-item/${item.id}`,
        );
        setItemDetails(response.data);
        setIsDetailsModalOpen(true);
      } catch {
        toast.error("Could not fetch filing details.");
      }
    } else {
      handleOpenUpdateModal(item);
    }
  };

  const handleOpenUpdateModal = (item: ComplianceStatus) => {
    if (item.status === "Filed") {
      toast.info("This item has already been filed.");
      return;
    }
    setSelectedItem(item);
    // Set today's date as default
    setFiledDate(new Date().toISOString().split("T")[0]);
    setTransactionId("");
    setNotes("");
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !filedDate) {
      toast.error("Filed Date is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(
        `${API_ENDPOINTS.TaxAndCompliance}/update-compliance-item`,
        {
          id: selectedItem.id,
          filedDate,
          transactionId,
          notes,
        },
      );
      toast.success(`${selectedItem.label} marked as Filed!`);
      setIsUpdateModalOpen(false);
      const [year, month] = selectedMonthYear.split("-").map(Number);
      fetchData(year, month); // Refresh the list to show the new status
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax & Compliance</h1>
          <p className="text-gray-600 mt-1">
            Manage P.T. ,TDS, and other statutory compliances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="p-2 border border-gray-300 rounded-md shadow-sm text-sm font-semibold"
          />
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="PF Contribution"
          value={
            isLoading
              ? "..."
              : formatCurrency(dashboardStats.totalPfContribution)
          }
          description="Current month"
          bgColor="bg-[#2eacb3]"
          icon={<IndianRupee size={22} className="text-blue-600" />}
        />
        <StatCard
          title="ESIC Contribution"
          value={
            isLoading
              ? "..."
              : formatCurrency(dashboardStats.totalEsicContribution)
          }
          description="Current month"
          bgColor="bg-[#f7c343]"
          icon={<IndianRupee size={22} className="text-green-600" />}
        />
        <StatCard
          title="TDS Deducted"
          value={
            isLoading ? "..." : formatCurrency(dashboardStats.totalTdsDeducted)
          }
          description="Current month"
          bgColor="bg-[#386487]"
          icon={<FileText size={22} className="text-red-600" />}
        />
        <StatCard
          title="Pending Returns"
          value={isLoading ? "..." : dashboardStats.pendingReturns.toString()}
          description="Due this month"
          bgColor="bg-[#87b6a7]"
          icon={<AlertTriangle size={22} className="text-purple-600" />}
        />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Compliance Status
          </h2>
          <p className="text-sm text-gray-500 mb-2">
            Current month compliance overview
          </p>
          {isLoading ? (
            <LoaderCircle className="animate-spin mt-4 mx-auto text-gray-400" />
          ) : (
            <ul className="divide-y divide-gray-100">
              {complianceStatus.map((item) => {
                const badge = getComplianceBadge(item);
                return (
                  <li key={item.label}>
                    {/* --- CHANGE THE onClick HANDLER HERE --- */}
                    <button
                      onClick={() => handleItemClick(item)}
                      className="w-full flex justify-between items-center py-2.5 text-left hover:bg-gray-50 rounded-md px-2 -mx-2"
                    >
                      <span className="font-medium text-gray-700 text-sm">
                        {item.label}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${badge.classes}`}
                      >
                        {badge.icon} {badge.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Generate compliance reports and files
          </p>
          <ul className="space-y-3">
            {/* <li>
              <button
                onClick={() => handleDownloadReport("pf-ecr")}
                className="w-full flex items-center gap-3 p-3 bg-[#f07837] rounded-lg hover:bg-[#0d3357] text-sm"
              >
                <Download size={18} className="text-white" />
                <span className="font-medium text-white">
                  Download PF ECR
                </span>
              </button>
            </li> */}
            {/* Added a new list item for the ESIC button */}
            {/* <li>
              <button
                onClick={() => handleDownloadReport("esic-report")}
                className="w-full flex items-center gap-3 p-3 bg-[#f07837] rounded-lg hover:bg-[#0d3357] text-sm"
              >
                <Download size={18} className="text-white" />
                <span className="font-medium text-white">
                  Download ESIC Return
                </span>
              </button>
            </li> */}
            <li>
              <button
                onClick={() => handleDownloadReport("tds-report")}
                className="w-full flex items-center gap-3 p-3 bg-[#f07837] rounded-lg hover:bg-[#0d3357] text-sm"
              >
                <Download size={18} className="text-white" />
                <span className="font-medium text-white">
                  Download TDS Report
                </span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleDownloadReport("pt-report")}
                className="w-full flex items-center gap-3 p-3 bg-[#f07837] rounded-lg hover:bg-[#0d3357] text-sm"
              >
                <FileText size={18} className="text-white" />
                <span className="font-medium text-white">
                  Professional Tax Report
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold text-gray-800">
          Statutory Records
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Employee-wise statutory records for the current month
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f07837] text-white uppercase text-xs">
              <tr>
                {[
                  "Employee",
                  // "PF Wages",
                  // "PF Contribution",
                  // "ESIC Wages",
                  // "ESIC Contribution",
                  "TDS",
                  "PT",
                ].map((h) => (
                  <th key={h} scope="col" className="px-6 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center p-6">
                    <LoaderCircle className="animate-spin inline-block text-blue-600" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => (
                  <tr
                    key={record.employeeId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {record.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({record.employeeId})
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      {formatCurrency(record.pfWages)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(record.pfContribution)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(record.esicWages)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(record.esicContribution)}
                    </td> */}
                    <td className="px-6 py-4">{formatCurrency(record.tds)}</td>
                    <td className="px-6 py-4">{formatCurrency(record.pt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isEcrModalOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Manual ECR Text</h3>
                <button
                  onClick={() => setIsEcrModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              {/* <textarea readOnly value={ecrText} className="w-full h-64 p-2 border rounded bg-gray-50 font-mono text-sm" />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={handleCopyToClipboard} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"><Copy size={16} /> Copy to Clipboard</button>
              <button onClick={() => setIsEcrModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
            </div> */}
            </div>
          </div>
        )}

        {isUpdateModalOpen && selectedItem && (
          <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <form onSubmit={handleUpdateStatus}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">
                    Update Status: {selectedItem.label}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="filedDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Filed Date
                    </label>
                    <input
                      type="date"
                      id="filedDate"
                      value={filedDate}
                      onChange={(e) => setFiledDate(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="transactionId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Transaction / Challan ID
                    </label>
                    <input
                      type="text"
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter government portal transaction ID"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add any relevant notes"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                     className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                     className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
                  >
                    {isSubmitting ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Mark as Filed
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isDetailsModalOpen && itemDetails && (
          <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">
                  Filing Details: {itemDetails.complianceType}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex">
                  <p className="w-1/3 font-semibold text-gray-600">
                    Filing Date:
                  </p>
                  <p>
                    {itemDetails.filedDate
                      ? new Date(itemDetails.filedDate).toLocaleDateString(
                          "en-GB",
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="flex">
                  <p className="w-1/3 font-semibold text-gray-600">
                    Transaction ID:
                  </p>
                  <p className="font-mono">
                    {itemDetails.transactionId || "Not Provided"}
                  </p>
                </div>
                <div className="flex">
                  <p className="w-1/3 font-semibold text-gray-600">Notes:</p>
                  <p className="whitespace-pre-wrap">
                    {itemDetails.notes || "No notes"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {totalItems > 0 && !isLoading && (
          <div className="flex items-center justify-between p-4 border-t text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="p-1 border rounded-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxAndCompliance;
