// File: src/Pages/LoansAndAdvances/OverdueLoansModal.tsx

import React, { useEffect, useState, useMemo } from "react";
import { X, Loader2, Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx"; // Library for Excel export
import { getOverdueLoans, type OverdueLoan } from "./LoanApplicationService";

interface OverdueLoansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEMS_PER_PAGE = 10;

const OverdueLoansModal: React.FC<OverdueLoansModalProps> = ({ isOpen, onClose }) => {
  const [overdueLoans, setOverdueLoans] = useState<OverdueLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- New State for Filters and Pagination ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoanType, setSelectedLoanType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!isOpen) return;

    const fetchOverdueLoans = async () => {
      setIsLoading(true);
      try {
        const data = await getOverdueLoans();
        setOverdueLoans(data);
      } catch {
        toast.error("Failed to fetch overdue loans.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueLoans();
  }, [isOpen]);

  // --- Derived State for Filtering ---

  // Get unique loan types for the dropdown
  const loanTypes = useMemo(() => {
    if (!overdueLoans) return ["All"];
    const uniqueTypes = new Set(overdueLoans.map((item) => item.loanTypeName));
    return ["All", ...Array.from(uniqueTypes)];
  }, [overdueLoans]);

  // Apply search and dropdown filters
  const filteredData = useMemo(() => {
    let data = overdueLoans;
    if (searchQuery) {
      data = data.filter((item) =>
        item.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedLoanType !== "All") {
      data = data.filter((item) => item.loanTypeName === selectedLoanType);
    }
    return data;
  }, [overdueLoans, searchQuery, selectedLoanType]);

  // --- Pagination Logic ---

  // Reset page number when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLoanType]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);
  
  // --- Export to Excel Handler ---
  const handleExportToExcel = () => {
    toast.info("Generating Excel file...");
    const dataToExport = filteredData.map(loan => ({
      'Employee Name': loan.employeeName,
      'Loan Type': loan.loanTypeName,
      'Monthly EMI (₹)': loan.monthlyDeduction,
      'Installments Paid': `${loan.paidInstallments} / ${loan.expectedInstallments}`,
      'Overdue Amount (₹)': loan.overdueAmount,
      'Last Paid On': loan.lastPaymentDate ? new Date(loan.lastPaymentDate).toLocaleDateString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Overdue Loans Report");
    XLSX.writeFile(workbook, "OverdueLoansReport.xlsx");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold">Overdue Loans</h3>
          <button type="button" onClick={onClose}><X /></button>
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
          <div className="min-w-[200px]">
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
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Loan Type</th>
                <th className="px-4 py-3">Monthly EMI</th>
                <th className="px-4 py-3">Installments Paid</th>
                <th className="px-4 py-3">Overdue Amount</th>
                <th className="px-4 py-3">Last Paid On</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : paginatedData.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">No overdue loans found for the selected filters.</td></tr>
              ) : (
                paginatedData.map((loan) => (
                  <tr key={loan.loanId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold">{loan.employeeName}</td>
                    <td className="px-4 py-4">{loan.loanTypeName}</td>
                    <td className="px-4 py-4">₹{loan.monthlyDeduction.toLocaleString()}</td>
                    <td className="px-4 py-4">{loan.paidInstallments} / {loan.expectedInstallments}</td>
                    <td className="px-4 py-4 text-red-600 font-bold">₹{loan.overdueAmount.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      {loan.lastPaymentDate ? new Date(loan.lastPaymentDate).toLocaleDateString() : 'N/A'}
                    </td>
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

export default OverdueLoansModal;