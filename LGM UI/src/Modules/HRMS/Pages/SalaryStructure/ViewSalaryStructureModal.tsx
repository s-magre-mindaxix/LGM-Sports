
import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

// --- Interfaces to match new DTOs ---
interface SalaryHistoryComponent {
  componentName: string;
  componentType: string;
  amount: number;
}

interface SalaryStructureHistory {
  effectiveDate: string;
  status: string;
  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  components: SalaryHistoryComponent[];
}

interface ViewModalProps {
  isOpen: boolean;
  employeeId: number | null;
  onClose: () => void;
}

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const AccordionItem: React.FC<{
  structure: SalaryStructureHistory;
  isCurrent: boolean;
}> = ({ structure, isCurrent }) => {
  const [isOpen, setIsOpen] = useState(isCurrent); // Default open for the current structure

  const earnings = structure.components.filter(
    (c) => c.componentType === "Earning"
  );
  // const deductions = structure.components.filter(
  //   (c) => c.componentType === "Deduction"
  // );

  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
      >
        <div className="font-semibold text-gray-800">
          Effective from: {formatDate(structure.effectiveDate)}
          {isCurrent && (
            <span className="ml-3 px-2 py-1 text-xs text-white bg-blue-600 rounded-full">
              Current
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
      <div className="p-4 border-t border-gray-200">
          {/* The grid is removed to allow the earnings table to take full width */}
          <div>
            {/* Earnings */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">Earnings</h4>
              <table className="w-full text-sm">
                <tbody>
                  {earnings.map((c) => (
                    <tr key={c.componentName}>
                      <td className="py-1">{c.componentName}</td>
                      <td className="py-1 text-right">
                        {formatCurrency(c.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td className="py-2">Gross Salary</td>
                    <td className="py-2 text-right">
                      {formatCurrency(structure.grossSalary)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {/* Net Salary */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center text-lg font-bold text-blue-600">
            <span>Net Salary Payable</span>
            <span>{formatCurrency(structure.netSalary)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewSalaryStructureModal: React.FC<ViewModalProps> = ({
  isOpen,
  employeeId,
  onClose,
}) => {
  const [history, setHistory] = useState<SalaryStructureHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await apiClient.get(
            `${API_ENDPOINTS.SalaryStructures}/${employeeId}/history`
          );
          setHistory(response.data);
        } catch (err) {
          setError(
            "Failed to load salary history. Please try again or contact support."
          );
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, employeeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Salary Structure History
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 font-bold text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="animate-spin mr-3" /> Loading history...
            </div>
          )}
          {error && (
            <div className="text-red-600 bg-red-100 p-4 rounded-lg flex items-center">
              <AlertCircle className="mr-3" /> {error}
            </div>
          )}
          {!loading && !error && history.length > 0 && (
            <div>
              {history.map((structure, index) => (
                <AccordionItem
                  key={structure.effectiveDate}
                  structure={structure}
                  isCurrent={index === 0} // The first item in the sorted list is the current one
                />
              ))}
            </div>
          )}
           {!loading && !error && history.length === 0 && (
            <div className="text-center p-10 text-gray-500">
                No salary structure records found for this employee.
            </div>
           )}
        </div>
        <div className="p-4 bg-gray-50 border-t text-right">
            <button onClick={onClose}  className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSalaryStructureModal;