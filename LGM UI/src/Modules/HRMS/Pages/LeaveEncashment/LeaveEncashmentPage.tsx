import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calculator,
  Users,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Award,
} from "lucide-react";
import { useSelector } from "react-redux";
import { usePermissions } from "../../../../hooks/usePermissions";
import type { RootState } from "../../../../store";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import LogoLoader from "../../../../Components/Common/LogoLoader";

// --- TYPE DEFINITIONS ---
interface LeaveEncashmentData {
  employeeName: string;
  designation: string;
  grossSalary: number;
  rateOfELEncashment: number;
  totalEarnedLeaves: number;
  leavesTaken: number;
  remainingLeavesForEncashment: number;
  totalAmountOfELEncashment: number;
  dateOfPayment: string;
  status: string;
}

// ... (StatCard, Modal, formatCurrency, generateFinancialYears, InfoRow components remain unchanged) ...
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

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

// --- HELPER FUNCTIONS & COMPONENTS ---
const formatCurrency = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

const generateFinancialYears = (range = 5) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < range; i++) {
    years.push(currentYear - i);
  }
  return years;
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

const InfoRow: React.FC<{ label: string; value: string | number }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-center py-3 border-b">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

// --- MAIN COMPONENT ---
const LeaveEncashmentPage: React.FC = () => {
  const { hasPermission } = usePermissions();
  // ====================== CHANGE 2: GET USER ROLE DIRECTLY FROM REDUX =======================
  // This provides a stable and definitive check to prevent race conditions.
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  // =========================================================================================

  const [leaveEncashments, setLeaveEncashments] = useState<
    LeaveEncashmentData[]
  >([]);
  const [myEncashmentRecord, setMyEncashmentRecord] =
    useState<LeaveEncashmentData | null>(null);
  const financialYears = useMemo(() => generateFinancialYears(), []);
  const [financialYear, setFinancialYear] = useState<number>(financialYears[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    showCancel: true,
    type: "confirmation" as "confirmation" | "success" | "error",
  });

  const encashmentStats = useMemo(() => {
    const totalAmountPaid = leaveEncashments.reduce(
      (acc, curr) => acc + curr.totalAmountOfELEncashment,
      0,
    );
    const employeesPaid = leaveEncashments.filter(
      (rec) => rec.status.toLowerCase() === "paid",
    ).length;
    return {
      totalAmountPaid,
      employeesPaid,
    };
  }, [leaveEncashments]);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<LeaveEncashmentData[]>(
        `${API_ENDPOINTS.LeaveEncashment}/${financialYear}`,
      );
      setLeaveEncashments(response.data);
    } catch (err) {
      console.error("Failed to fetch admin leave encashment data:", err);
      setModalState({
        isOpen: true,
        title: "Error",
        message: "Failed to load encashment records. Please try again.",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "Close",
        showCancel: false,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [financialYear]);

  const fetchEmployeeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<LeaveEncashmentData>(
        `${API_ENDPOINTS.LeaveEncashment}/my-record/${financialYear}`,
      );
      setMyEncashmentRecord(response.data);
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setMyEncashmentRecord(null);
      } else {
        console.error("Failed to fetch employee leave encashment data:", err);
        setModalState({
          isOpen: true,
          title: "Error",
          message: "Failed to load your encashment data. Please try again.",
          onConfirm: () =>
            setModalState((prev) => ({ ...prev, isOpen: false })),
          confirmText: "Close",
          showCancel: false,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [financialYear]);

  const canViewAll = hasPermission("LeaveEncashment", "CanView");

  useEffect(() => {
    // Wait until the user role is loaded to prevent fetching the wrong data on initial render
    if (!userRole) {
      return;
    }

    // ================== CHANGE 3: MODIFY DATA FETCHING LOGIC ==================
    // Prioritize the direct role check. An employee should never fetch admin data.
    if (userRole === "Employee") {
      fetchEmployeeData();
    }
    // For all other roles (Admin, Manager, etc.), we can now trust the permission system.
    else if (canViewAll) {
      fetchAdminData();
    } else {
      // Fallback for non-admins who might lack 'CanView' permission for some reason
      fetchEmployeeData();
    }
    // =========================================================================
  }, [financialYear, userRole, canViewAll, fetchAdminData, fetchEmployeeData]);

  const proceedWithProcessing = async () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setIsProcessing(true);
    try {
      const response = await apiClient.post<{ message: string }>(
        `${API_ENDPOINTS.LeaveEncashment}/process/${financialYear}`,
      );
      await fetchAdminData();
      setModalState({
        isOpen: true,
        title: "Success",
        message:
          response.data.message ||
          "Leave encashment processed successfully for the year!",
        onConfirm: () => setModalState((prev) => ({ ...prev, isOpen: false })),
        confirmText: "OK",
        showCancel: false,
        type: "success",
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An unknown error occurred during processing.";
      setModalState({
        isOpen: true,
        title: "Processing Failed",
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

  const handleProcessEncashment = () => {
    setModalState({
      isOpen: true,
      title: "Confirm Encashment Processing",
      message: `This will calculate and process leave encashment for all eligible employees for the year ${financialYear}. Are you sure you want to continue?`,
      onConfirm: proceedWithProcessing,
      confirmText: "Yes, Process",
      showCancel: true,
      type: "confirmation",
    });
  };

  const renderAdminView = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Total Encashment Paid"
          value={formatCurrency(encashmentStats.totalAmountPaid)}
          description={`For FY ${financialYear}`}
          bgColor="bg-[#2eacb3]"
          icon={<IndianRupee size={20} />}
        />
        <StatCard
          title="Employees Paid"
          value={encashmentStats.employeesPaid.toString()}
          description="Received encashment payment"
          bgColor="bg-[#f7c343]"
          icon={<Users size={20} />}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Encashment Records
            </h2>
            <p className="text-sm text-gray-500">
              Showing records for {financialYear}.
            </p>
          </div>
          {hasPermission("LeaveEncashment", "CanAdd") && (
            <button
              onClick={handleProcessEncashment}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-[#f07837] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#0d3357] disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Calculator size={18} />
              {isProcessing ? "Processing..." : `Process for ${financialYear}`}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f07837]">
              <tr>
                {[
                  "Employee",
                  "Gross Salary",
                  "Rate/Day",
                  "Total EL",
                  "Taken",
                  "Remaining",
                  "Total Amount",
                  "Status",
                ].map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center p-2">
                    {<LogoLoader />}
                  </td>
                </tr>
              ) : leaveEncashments.length > 0 ? (
                leaveEncashments.map((encashment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {encashment.employeeName} <br />{" "}
                      <span className="text-xs text-gray-500">
                        {encashment.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(encashment.grossSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(encashment.rateOfELEncashment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {encashment.totalEarnedLeaves}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {encashment.leavesTaken}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {encashment.remainingLeavesForEncashment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(encashment.totalAmountOfELEncashment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          encashment.status.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {encashment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center p-4">
                    No records found for {financialYear}. You can process them
                    using the button above.
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
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
          <Award className="h-6 w-6 text-teal-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          My Leave Encashment Status
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your information for the financial year {financialYear}.
        </p>
      </div>
      <div className="mt-6">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading your details...</p>
        ) : myEncashmentRecord ? (
          <div className="space-y-2">
            <InfoRow
              label="Gross Salary"
              value={myEncashmentRecord.grossSalary}
            />
            <InfoRow
              label="Rate/Day"
              value={myEncashmentRecord.rateOfELEncashment}
            />
            <InfoRow
              label="Total Earned Leaves"
              value={myEncashmentRecord.totalEarnedLeaves}
            />
            <InfoRow
              label="Leaves Taken"
              value={myEncashmentRecord.leavesTaken}
            />
            <InfoRow
              label="Leaves for Encashment"
              value={myEncashmentRecord.remainingLeavesForEncashment}
            />
            <InfoRow
              label="Encashment Amount"
              value={formatCurrency(
                myEncashmentRecord.totalAmountOfELEncashment,
              )}
            />
            <InfoRow label="Status" value={myEncashmentRecord.status} />
          </div>
        ) : (
          <p className="text-center text-gray-600 py-4">
            Your leave encashment for {financialYear} has not been processed
            yet.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Encashment</h1>
          <p className="text-gray-600 mt-1">
            {/* Use the definitive role check for the description */}
            {userRole === "Employee"
              ? "View your personal leave encashment details."
              : "Calculate and view yearly earned leave encashment."}
          </p>
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
            onChange={(e) => setFinancialYear(Number(e.target.value))}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
          >
            {financialYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===================== CHANGE 4: MODIFY RENDER LOGIC ===================== */}
      {/* This logic now safely renders the correct view by prioritizing the user's role */}
      {userRole === "Employee"
        ? renderEmployeeView()
        : canViewAll
          ? renderAdminView()
          : renderEmployeeView()}
      {/* ======================================================================= */}

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

export default LeaveEncashmentPage;
