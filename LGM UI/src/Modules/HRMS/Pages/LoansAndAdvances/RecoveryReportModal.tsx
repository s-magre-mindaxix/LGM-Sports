// File: src/Pages/LoansAndAdvances/RecoveryReportModal.tsx

import React, { useEffect, useState, useMemo } from "react";
import { X, Loader2, Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx"; // Library for Excel export
import {
  generateRecoveryReport,
  type LoanRecoveryReportItem,
} from "./LoanApplicationService";

interface RecoveryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10; // Controls how many items are shown per page

const RecoveryReportModal: React.FC<RecoveryReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [reportData, setReportData] = useState<LoanRecoveryReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- New State for Filters and Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoanType, setSelectedLoanType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data Fetching Effect (remains the same) ---
  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const data = await generateRecoveryReport();
        setReportData(data);
      } catch {
        toast.error("Failed to generate recovery report.");
        setReportData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [isOpen]);

  // --- Derived State for Filtering and Sorting ---

  // Get unique loan types for the filter dropdown
  const loanTypes = useMemo(() => {
    if (!reportData) return ["All"];
    const uniqueTypes = new Set(reportData.map((item) => item.loanTypeName));
    return ["All", ...Array.from(uniqueTypes)];
  }, [reportData]);

  // Apply search and dropdown filters
  const filteredData = useMemo(() => {
    let data = reportData;

    // Apply search query filter (searches employee name)
    if (searchQuery) {
      data = data.filter((item) =>
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply loan type filter
    if (selectedLoanType !== "All") {
      data = data.filter((item) => item.loanTypeName === selectedLoanType);
    }

    return data;
  }, [reportData, searchQuery, selectedLoanType]);
  
  // --- Pagination Logic ---
  
  // Reset to the first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLoanType]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  
  // Slice the filtered data to get only the items for the current page
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage]);
  
  // --- Export to Excel Handler ---
  const handleExportToExcel = () => {
    toast.info("Generating Excel file...");
    // We export the `filteredData`, not just the `paginatedData`
    const dataToExport = filteredData.map(item => ({
      'Employee Name': item.employeeName,
      'Loan Type': item.loanTypeName,
      'Total Amount (₹)': item.totalLoanAmount,
      'Amount Paid (₹)': item.totalAmountPaid,
      'Balance (₹)': item.balanceAmount,
      'Status': item.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Recovery Report");
    
    // Trigger the file download
    XLSX.writeFile(workbook, "LoanRecoveryReport.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Loan Recovery Report</h3>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>

        {/* --- Filters and Export Button --- */}
        <div className="p-4 flex flex-wrap gap-4 items-center border-b">
          <div className="relative  min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input
              type="text"
              placeholder="Search by Employee Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
          <div className=" min-w-[200px]">
            <select
              value={selectedLoanType}
              onChange={(e) => setSelectedLoanType(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {loanTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <button
            onClick={handleExportToExcel}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400"
          >
            <FileDown size={16}/> Export to Excel
          </button>
        </div>

        <div className="p-4 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Loan Type</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Amount Paid</th>
                <th className="px-6 py-3">Balance</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <Loader2 className="animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No data available for the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.loanId} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{item.employeeName}</td>
                    <td className="px-6 py-4">{item.loanTypeName}</td>
                    <td className="px-6 py-4">₹{item.totalLoanAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-green-700">₹{item.totalAmountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold">₹{item.balanceAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">{item.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Controls --- */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredData.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryReportModal;