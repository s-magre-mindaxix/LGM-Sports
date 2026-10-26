import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  Users,
  IndianRupee,
  Award,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { useAuth } from "../../../../hooks/useAuth";

// --- TYPE DEFINITIONS ---
interface BonusRecordDTO {
  employeeName: string;
  eligibleSalary: number;
  workingDays: number; // Represents tenure in days
  bonusAmount: number;
  status: string;
  appliedRule?: string; // Add this field, useful for the employee view
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface InfoRowProps {
  label: string;
  value: string;
}

// --- HELPER FUNCTIONS & COMPONENTS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const generateFinancialYears = (range = 5) => {
  const currentMonth = new Date().getMonth();
  const currentFinancialYearStart =
    currentMonth >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;

  const years = [];
  for (let i = range; i >= -1; i--) {
    const startYear = currentFinancialYearStart - i;
    years.push(`${startYear}-${startYear + 1}`);
  }
  return years.reverse();
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  bgColor,
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex-1`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  showCancel?: boolean;
  type?: "confirmation" | "success" | "error";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  showCancel = true,
  type = "confirmation",
}) => {
  if (!isOpen) return null;

  const icon = {
    success: <CheckCircle size={32} className="text-green-500" />,
    error: <AlertTriangle size={32} className="text-red-500" />,
    confirmation: <AlertTriangle size={32} className="text-blue-500" />,
  }[type];

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{icon}</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <div className="text-gray-600 mb-6">{children}</div>
        </div>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Bonus: React.FC = () => {
  const { user } = useAuth();
  const [bonusRecords, setBonusRecords] = useState<BonusRecordDTO[]>([]); // For Admin view only
  const [myBonusRecord, setMyBonusRecord] = useState<BonusRecordDTO | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const financialYears = useMemo(() => generateFinancialYears(), []);
  const [financialYear, setFinancialYear] = useState<string>(financialYears[0]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    showCancel: true,
    type: "confirmation" as "confirmation" | "success" | "error",
  });

  // --- DERIVED STATE ---
  const bonusStats = useMemo(() => {
    const totalBonus = bonusRecords.reduce(
      (acc, curr) => acc + curr.bonusAmount,
      0,
    );
    const eligibleEmployees = bonusRecords.filter(
      (rec) => rec.bonusAmount > 0,
    ).length;
    return {
      totalBonus,
      eligibleEmployees,
    };
  }, [bonusRecords]);

  // --- API CALLS ---
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<BonusRecordDTO[]>(
        `${API_ENDPOINTS.Bonus}/${financialYear}`,
      );
      setBonusRecords(response.data);
    } catch (error) {
      console.error("Error fetching admin bonus data:", error);
      alert("Failed to load bonus records.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CHANGE: New function to fetch data from the employee-specific endpoint ---
  const fetchEmployeeData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<BonusRecordDTO>(
        `${API_ENDPOINTS.Bonus}/my-record/${financialYear}`,
      );
      setMyBonusRecord(response.data);
    } catch (error: any) {
      // A 404 error is expected if the bonus hasn't been processed for the user.
      // We treat this as a valid state, not a failure.
      if (error.response && error.response.status === 404) {
        setMyBonusRecord(null);
      } else {
        console.error("Error fetching my bonus data:", error);
        alert("Failed to load your bonus information.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleRefresh = () => {
      if (user?.role === "Admin") {
        fetchAdminData();
      } else {
        fetchEmployeeData();
      }
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [user?.role, financialYear]);

  useEffect(() => {
    // --- CHANGE: Logic to call the correct API based on user role ---
    if (user?.role === "Admin") {
      fetchAdminData();
    } else {
      fetchEmployeeData();
    }
  }, [financialYear, user]); // Re-run when year or user changes

  const proceedWithCalculation = async () => {
    setModalState((prev) => ({ ...prev, isOpen: false })); // Close the confirmation modal

    try {
      setIsProcessing(true);
      const response = await apiClient.post<{ message: string }>(
        `${API_ENDPOINTS.Bonus}/process/${financialYear}`,
      );
      await fetchAdminData();

      // Show success modal
      setModalState({
        isOpen: true,
        title: "Success",
        message:
          response.data.message || "Bonus calculation completed successfully!",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "OK",
        showCancel: false,
        type: "success",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";

      // Show error modal
      setModalState({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "Close",
        showCancel: false,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // This function will now only open the modal
  const handleProcessBonus = () => {
    setModalState({
      isOpen: true,
      title: "Confirm Bonus Calculation",
      message: `Are you sure you want to calculate the bonus for FY ${financialYear}? This may overwrite existing data.`,
      onConfirm: proceedWithCalculation,
      confirmText: "Yes, Calculate",
      showCancel: true,
      type: "confirmation",
    });
  };

  // --- NEW: Logic for Diwali Bonus ---
  const proceedWithDiwaliCalculation = async () => {
    setModalState((prev) => ({ ...prev, isOpen: false })); // Close confirmation

    try {
      setIsProcessing(true);
      // Note: Assuming API_ENDPOINTS.Bonus is the base path (e.g., /api/bonus)
      const response = await apiClient.post(
        `${API_ENDPOINTS.Bonus}/process-diwali/${financialYear}`,
      );
      await fetchAdminData(); // Refresh the table after calculation

      setModalState({
        isOpen: true,
        title: "Success",
        message:
          response.data.message ||
          "Diwali bonus calculation completed successfully!",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "OK",
        showCancel: false,
        type: "success",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      setModalState({
        isOpen: true,
        title: "Error",
        message: errorMessage,
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "Close",
        showCancel: false,
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessDiwaliBonus = () => {
    setModalState({
      isOpen: true,
      title: "Confirm Diwali Bonus",
      message: `Are you sure you want to calculate the Diwali Bonus (50% of Gross Salary) for FY ${financialYear}? This will update records containing "Diwali" rules.`,
      onConfirm: proceedWithDiwaliCalculation,
      confirmText: "Yes, Calculate Diwali",
      showCancel: true,
      type: "confirmation",
    });
  };

  // --- UI HELPERS ---
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "processed":
        return "bg-blue-100 text-blue-800";
      case "calculated":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-700 border";
    }
  };

  // --- RENDER FUNCTIONS FOR DIFFERENT ROLES ---
  const renderAdminView = () => (
    <>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Stats Section */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <StatCard
            title="Total Annual Bonus"
            value={formatCurrency(bonusStats.totalBonus)}
            description={`FY ${financialYear}`}
            bgColor="bg-[#2eacb3]"
            icon={<IndianRupee size={20} className="text-blue-600" />}
          />
          <StatCard
            title="Eligible Employees"
            value={bonusStats.eligibleEmployees.toString()}
            description="For bonus"
            bgColor="bg-[#f7c343]"
            icon={<Users size={20} className="text-red-600" />}
          />
        </div>

        {/* Right Calculation Section */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm p-6 border h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Bonus Calculation
                </h2>
                <p className="text-sm text-gray-500">
                  Process bonuses based on company policy
                </p>
              </div>
              <div className="bg-gray-100 px-3 py-1 rounded-md border text-sm font-medium text-gray-700">
                FY {financialYear}
              </div>
            </div>

            {/* Rules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-t border-b border-gray-100 mb-6">
              {/* Annual Rules */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#154068] font-semibold">
                  <Calculator size={16} />
                  <span>Annual Bonus Rules</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex justify-between">
                    <span>Full Year Tenure:</span>
                    <span className="font-medium text-gray-800">
                      1 Month Gross
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Partial Tenure:</span>
                    <span className="font-medium text-gray-800">
                      Pro-rata basis
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Min. Tenure:</span>
                    <span className="font-medium text-gray-800">180 Days</span>
                  </li>
                </ul>
              </div>

              {/* Diwali Rules */}
              <div className="space-y-3 md:border-l md:pl-8">
                <div className="flex items-center gap-2 text-[#c2410c] font-semibold">
                  <Award size={16} />
                  <span>Diwali Bonus Rules</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex justify-between">
                    <span>Flat Rate:</span>
                    <span className="font-medium text-gray-800">
                      50% of Gross
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tenure:</span>
                    <span className="font-medium text-gray-800">
                      Not Applicable
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Eligibility:</span>
                    <span className="font-medium text-gray-800">
                      All Active
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons Side-by-Side */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleProcessBonus}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-[#f07837] text-white font-semibold py-3 rounded-lg hover:bg-[#0d3357] transition-colors disabled:opacity-50"
              >
                <Calculator size={18} />
                {isProcessing ? "Processing..." : "Calculate Annual Bonus"}
              </button>

              <button
                onClick={handleProcessDiwaliBonus}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 bg-[#c2410c] text-white font-semibold py-3 rounded-lg hover:bg-[#9a3412] transition-colors disabled:opacity-50"
              >
                <Award size={18} />
                {isProcessing ? "Processing..." : "Calculate Diwali Bonus"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Bonus Records
            </h2>
            <p className="text-sm text-gray-500">
              History for FY {financialYear}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f07837] text-white text-xs">
              <tr>
                {[
                  "Employee",
                  "Tenure (Days)",
                  "Eligible Salary Base",
                  "Bonus Amount",
                  "Status",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-400">
                    Loading records...
                  </td>
                </tr>
              ) : bonusRecords.length > 0 ? (
                bonusRecords.map((rec, index) => (
                  <tr
                    key={`${rec.employeeName}-${index}`}
                    className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {rec.employeeName}
                    </td>
                    <td className="px-4 py-3">{rec.workingDays}</td>
                    <td className="px-4 py-3">
                      {formatCurrency(rec.eligibleSalary)}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {formatCurrency(rec.bonusAmount)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${getStatusBadgeClass(rec.status)}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-8 text-gray-500 italic"
                  >
                    No bonus records found. Please calculate a bonus above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderEmployeeView = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 border max-w-2xl mx-auto">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <Award className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          My Annual Bonus Status
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your bonus information for the financial year {financialYear}.
        </p>
      </div>
      <div className="mt-6 border-t border-gray-200 pt-6">
        {isLoading ? (
          <p className="text-center text-gray-500">
            Loading your bonus details...
          </p>
        ) : // --- CHANGE: The logic now uses the 'myBonusRecord' state variable ---
        myBonusRecord ? (
          <div className="space-y-4">
            <InfoRow
              label="Bonus Amount"
              value={formatCurrency(myBonusRecord.bonusAmount)}
            />
            <InfoRow label="Status" value={myBonusRecord.status} />
            <InfoRow
              label="Eligibility Rule"
              value={myBonusRecord.appliedRule || "Not Applicable"}
            />
            <InfoRow
              label="Service in FY (Days)"
              value={myBonusRecord.workingDays.toString()}
            />
          </div>
        ) : (
          <p className="text-center text-gray-600">
            Your bonus for the financial year {financialYear} has not been
            processed yet.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === "Admin" ? "Bonus" : "My Bonus"}
          </h1>
          <p className="text-gray-600 mt-1">Manage annual bonus payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="financialYearSelect"
            className="text-sm font-medium text-gray-700"
          >
            Financial Year:
          </label>
          <select
            id="financialYearSelect"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          >
            {financialYears.map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conditional Rendering based on Role */}
      {user?.role === "Admin" ? renderAdminView() : renderEmployeeView()}

      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        confirmText={modalState.confirmText}
        showCancel={modalState.showCancel}
        type={modalState.type}
      >
        <p>{modalState.message}</p>
      </Modal>
    </div>
  );
};

export default Bonus;
