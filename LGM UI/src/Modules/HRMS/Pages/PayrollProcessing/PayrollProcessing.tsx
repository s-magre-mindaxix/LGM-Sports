import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  PlayCircle,
  Calendar,
  Users,
  Clock,
  Check,
  RefreshCw,
  Eye,
  Loader2,
  Banknote,
  X,
  AlertTriangle, 
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import { EditSalaryRecordForm } from "./EditSalaryRecordForm";
import { FaEdit } from "react-icons/fa";
import LogoLoader from "../../../../Components/Common/LogoLoader";


interface AttendanceCheckResult {
  exceptions: AttendanceException[];
  totalAttendanceRecordsInMonth: number;
}

interface AttendanceException {
  //employeeID: number;
  employeeCode: string;
  employeeName: string;
  date: string;
  issue: string;
}

interface PendingLeaveRequest {
  employeeCode: string;
  employeeName: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  days: number;
  //reportingManagerName: string;
}

// A reusable Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface SalaryRecordSummary {
  id: number;
  employeeId: number;
  employeeName: string;
  netSalary: number;
}

interface MonthlySalaryRecordDto {
  id: number;
  employeeName: string;
  payableDays: number;
  lopDays: number;
  totalDaysInMonth: number;
  remarks: string | null;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  componentDetails: {
    id: number;
    componentName: string;
    componentType: "Earning" | "Deduction";
    amount: number;
     isProrated: boolean;          
    originalMonthlyAmount?: number;
  }[];
}

interface UpdateMonthlySalaryRecordDto {
  payableDays: number;
  lopDays: number;
  remarks: string | null;
  componentDetails: {
    id: number;
    amount: number;
  }[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

interface PayrollHistoryRecord {
  payrollRunId: number;
  period: string;
  employees: number;
  grossAmount: number;
  netAmount: number;
  status: string;
  processedOn: string;
}

interface PayrollDashboardData {
  processingMonth: string;
  totalEmployees: number;
  estimatedGrossAmount: number;
  status: string;
}

type ChecklistStatus = "Complete" | "Approved" | "Updated" | "Review";

interface ChecklistItem {
  label: string;
  status: ChecklistStatus;
  count: number;
}

// interface StatCardProps {
//   title: string;
//   value: string;
//   description: string;
//   icon: React.ReactNode;
// }

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// const StatCard: React.FC<StatCardProps> = ({
//   title,
//   value,
//   description,
//   icon,
// }) => (
//   <div className="bg-white p-5 rounded-lg shadow-sm border">
//     <div className="flex justify-between items-start">
//       <p className="text-sm font-medium text-gray-600">{title}</p>
//       <div className="text-gray-400">{icon}</div>
//     </div>
//     <div className="mt-2">
//       <p className="text-2xl font-bold text-gray-800">{value}</p>
//       <p className="text-xs text-gray-500">{description}</p>
//     </div>
//   </div>
// );

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  bgColor,
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const PayrollProcessing: React.FC = () => {
  const initialChecklistItems: ChecklistItem[] = [
    { label: "Attendance Data", status: "Review", count: 0 },
    { label: "Leave Applications", status: "Review", count: 0 },
    //{ label: "Salary Structures", status: "Review", count: 0 },
    //{ label: "Loan EMIs", status: "Review", count: 0 },
  ];
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    initialChecklistItems,
  );
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] =
    useState<boolean>(false);
  const [attendanceExceptions, setAttendanceExceptions] = useState<
    AttendanceException[]
  >([]);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeaveRequest[]>([]);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistoryRecord[]>(
    [],
  );
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] =
    useState<PayrollDashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(true);
  // const [isDownloading, setIsDownloading] = useState<number | null>(null);

   const [isRunDetailsModalOpen, setIsRunDetailsModalOpen] = useState(false);
  const [runDetails, setRunDetails] = useState<SalaryRecordSummary[]>([]);
  const [isLoadingRunDetails, setIsLoadingRunDetails] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollHistoryRecord | null>(
    null,
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<MonthlySalaryRecordDto | null>(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDashboardData = useCallback(
    async (year: number, month: number) => {
      setIsDashboardLoading(true);
      try {
        const url = `${API_ENDPOINTS.GetPayrollDashboard}/dashboard?year=${year}&month=${month}`;
        const response = await apiClient.get<PayrollDashboardData>(url);
        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        toast.error("Could not load dashboard summary.");
        setDashboardData({
          processingMonth: "Error",
          totalEmployees: 0,
          estimatedGrossAmount: 0,
          status: "Error",
        });
      } finally {
        setIsDashboardLoading(false);
      }
    },
    [],
  );

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const response = await apiClient.get<PayrollHistoryRecord[]>(
        API_ENDPOINTS.GetPayrollHistory,
      );
      setPayrollHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch payroll history:", err);
      toast.error("Could not load payroll history.");
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const handleRefresh = () => {
      fetchHistory();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchHistory]);

  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split("-").map(Number);
      fetchDashboardData(year, month);
    }
  }, [selectedMonth, fetchDashboardData]);

  useEffect(() => {
    const checkStatuses = async () => {
      if (!selectedMonth) return;
      const [year, month] = selectedMonth.split("-").map(Number);

      // --- Check 1: Attendance Data ---
      try {
        const attendanceUrl = `${API_ENDPOINTS.GetAttendanceExceptions}?year=${year}&month=${month}`;
        const attendanceResponse =
          await apiClient.get<AttendanceCheckResult>(attendanceUrl);
        const exceptionCount = attendanceResponse.data.exceptions.length;
        const totalRecords =
          attendanceResponse.data.totalAttendanceRecordsInMonth;
        const newStatus =
          totalRecords > 0 && exceptionCount === 0 ? "Complete" : "Review";

        setChecklistItems((prevItems) =>
          prevItems.map((item) =>
            item.label === "Attendance Data"
              ? { ...item, status: newStatus, count: exceptionCount }
              : item,
          ),
        );
      } catch (error) {
        console.error("Failed to check attendance status:", error);
        setChecklistItems((prevItems) =>
          prevItems.map((item) =>
            item.label === "Attendance Data"
              ? { ...item, status: "Review", count: 0 }
              : item,
          ),
        );
      }

      // --- START: ADD THIS NEW CHECK ---
      // --- Check 2: Leave Applications ---
      try {
        const leaveUrl = `${API_ENDPOINTS.GetPendingLeaves}?year=${year}&month=${month}`;
        const leaveResponse =
          await apiClient.get<PendingLeaveRequest[]>(leaveUrl);
        const pendingCount = leaveResponse.data.length;

        setChecklistItems((prevItems) =>
          prevItems.map((item) =>
            item.label === "Leave Applications"
              ? {
                  ...item,
                  status: pendingCount === 0 ? "Approved" : "Review",
                  count: pendingCount,
                }
              : item,
          ),
        );
      } catch (error) {
        console.error("Failed to check pending leaves status:", error);
        setChecklistItems((prevItems) =>
          prevItems.map((item) =>
            item.label === "Leave Applications"
              ? { ...item, status: "Review", count: 0 }
              : item,
          ),
        );
      }
    };

    checkStatuses();
  }, [selectedMonth]);

  const handleRunPayroll = async () => {
    setIsLoading(true);
    setError(null);

    const [year, month] = selectedMonth.split("-");

    try {
      const url = `${API_ENDPOINTS.RunPayroll}/process?year=${year}&month=${month}`;
      await apiClient.post(url);

      toast.success(
        `Payroll for ${new Date(Number(year), Number(month) - 1).toLocaleString(
          "default",
          {
            month: "long",
          },
        )} ${year} processed successfully!`,
      );
      await fetchHistory();
      await fetchDashboardData(Number(year), Number(month));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An unexpected error occurred while processing payroll.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Payroll processing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceCheck = useCallback(async () => {
    const [year, month] = selectedMonth.split("-").map(Number);

    const promise = apiClient.get<AttendanceCheckResult>(
      `${API_ENDPOINTS.GetAttendanceExceptions}?year=${year}&month=${month}`,
    );

    toast.promise(promise, {
      loading: "Fetching attendance report...",
      success: (response) => {
        setAttendanceExceptions(response.data.exceptions);
        setAttendanceError(null);
        setIsAttendanceModalOpen(true);
        return "Attendance Report loaded!";
      },
      error: (err) => {
        console.error("Failed to fetch attendance exceptions:", err);
        setAttendanceError(
          "Could not load the attendance report. Please try again.",
        );
        setAttendanceExceptions([]); // Ensure data is cleared
        setIsAttendanceModalOpen(true);
        return "Failed to load report";
      },
    });
  }, [selectedMonth]);

  const handleLeaveCheck = useCallback(async () => {
    const [year, month] = selectedMonth.split("-").map(Number);

    const promise = apiClient.get<PendingLeaveRequest[]>(
      `${API_ENDPOINTS.GetPendingLeaves}?year=${year}&month=${month}`,
    );

    toast.promise(promise, {
      loading: "Fetching pending leave report...",
      success: (response) => {
        setPendingLeaves(response.data);
        setLeaveError(null);
        setIsLeaveModalOpen(true);
        return "Report loaded!";
      },
      error: (err) => {
        console.error("Failed to fetch pending leaves:", err);
        setLeaveError(
          "Could not load the pending leaves report. Please try again.",
        );
        setPendingLeaves([]);
        setIsLeaveModalOpen(true);
        return "Failed to load report";
      },
    });
  }, [selectedMonth]);

  const displayMonth = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  }, [selectedMonth]);

  const filteredHistory = useMemo(() => {
    const [year, month] = selectedMonth.split("-");
    const selectedPeriod = new Date(
      Number(year),
      Number(month) - 1,
    ).toLocaleString("default", { month: "short", year: "numeric" });

    return payrollHistory.filter((record) => record.period === selectedPeriod);
  }, [selectedMonth, payrollHistory]);

  // const handleDownloadRegister = async (
  //   payrollRunId: number,
  //   period: string,
  // ) => {
  //   setIsDownloading(payrollRunId); // Start loading spinner for this specific row
  //   try {
  //     const url = `${API_ENDPOINTS.GetPayrollHistory}/${payrollRunId}/download-register`;

  //     // IMPORTANT: Request the response as a 'blob' for file downloads
  //     const response = await apiClient.get(url, { responseType: "blob" });

  //     const blob = new Blob([response.data], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     // Create a temporary link to trigger the download
  //     const downloadUrl = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = downloadUrl;

  //     const fileName = `Payroll_Register_${period.replace(" ", "_")}.xlsx`;
  //     link.setAttribute("download", fileName);

  //     document.body.appendChild(link);
  //     link.click();

  //     // Clean up
  //     link.parentNode?.removeChild(link);
  //     window.URL.revokeObjectURL(downloadUrl);
  //   } catch (err) {
  //     console.error("Failed to download payroll register:", err);
  //     toast.error("Could not download the report. Please try again.");
  //   } finally {
  //     setIsDownloading(null); // Stop loading spinner
  //   }
  // };

  const getChecklistBadge = (status: ChecklistStatus) => {
    switch (status) {
      case "Complete":
        return {
          icon: <Check size={14} />,
          text: "Complete",
          classes: "bg-blue-100 text-blue-800",
        };
      case "Approved":
        return {
          icon: <Check size={14} />,
          text: "Approved",
          classes: "bg-green-100 text-green-800",
        };
      case "Updated":
        return {
          icon: <RefreshCw size={14} />,
          text: "Updated",
          classes: "bg-indigo-100 text-indigo-800",
        };
      case "Review":
        return {
          icon: <Eye size={14} />,
          text: "Review",
          classes: "bg-gray-100 text-gray-700 border",
        };
    }
  };

   const handleViewRunDetails = async (run: PayrollHistoryRecord) => {
    setSelectedRun(run);
    setIsRunDetailsModalOpen(true);
    setIsLoadingRunDetails(true);
    try {
      const url = `${API_ENDPOINTS.GetPayrollRunDetails}/${run.payrollRunId}/salary-records`;
      const response = await apiClient.get<SalaryRecordSummary[]>(url);
      setRunDetails(response.data);
    } catch (err) {
      console.error("Failed to fetch run details:", err);
      toast.error("Could not load employee details for this run.");
      setIsRunDetailsModalOpen(false); // Close modal on error
    } finally {
      setIsLoadingRunDetails(false);
    }
  };

  const handleEditSalaryRecord = async (recordId: number) => {
    setIsEditModalOpen(true);
    setIsEditingLoading(true);
    setEditingRecord(null); // Clear previous data
    try {
      const url = `${API_ENDPOINTS.GetSalaryRecordForEdit}/${recordId}`;
      const response = await apiClient.get<MonthlySalaryRecordDto>(url);
      setEditingRecord(response.data);
    } catch (err) {
      console.error("Failed to fetch salary record for editing:", err);
      toast.error("Could not load salary record details.");
      setIsEditModalOpen(false);
    } finally {
      setIsEditingLoading(false);
    }
  };

  const handleSaveChanges = async (updatedData: UpdateMonthlySalaryRecordDto) => {
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      const url = `${API_ENDPOINTS.GetSalaryRecordForEdit}/${editingRecord.id}`;
      await apiClient.put(url, updatedData);
      toast.success("Salary record updated successfully!");
      
      // Close the edit modal and refresh the underlying list
      setIsEditModalOpen(false);
      setEditingRecord(null);
      if (selectedRun) {
        await handleViewRunDetails(selectedRun); // Refresh list
      }
    } catch (err) {
       console.error("Failed to save salary record:", err);
       toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full space-y-6">
      {/* Header */}
     <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Payroll Processing
          </h1>
          <p className="text-gray-600 mt-1">
            Select a month and run the payroll process
          </p>
        </div>
        {/* --- MODIFIED: Calendar and Button are now grouped --- */}
        <div className="flex items-center gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm font-semibold"
          />
          <button
            onClick={handleRunPayroll}
            disabled={isLoading || dashboardData?.status === "Completed"}
            className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg  disabled:bg-teal-800 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Processing...
              </>
            ) : (
              <>
                <PlayCircle size={18} /> Run Payroll
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Processing Month"
          value={
            isDashboardLoading ? "..." : dashboardData?.processingMonth ?? "N/A"
          }
          description="Currently selected period"
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Total Employees"
          value={
            isDashboardLoading
              ? "..."
              : dashboardData?.status === "Completed"
              ? dashboardData.totalEmployees.toString()
              : "-"
          }
          description={
            dashboardData?.status === "Completed"
              ? "Processed in payroll"
              : "To be processed"
          }
          icon={<Users size={20} />}
        />
        <StatCard
          title="Gross Amount"
          value={
            isDashboardLoading
              ? "..."
              : dashboardData?.status === "Completed"
              ? formatCurrency(dashboardData.estimatedGrossAmount)
              : "-"
          }
          description={
            dashboardData?.status === "Completed"
              ? "Actual gross salary"
              : "Estimated gross salary"
          }
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Status"
          value={isDashboardLoading ? "..." : dashboardData?.status ?? "N/A"}
          description="For processing"
          icon={<Clock size={20} />}
        />
      </div> */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Processing Month"
          value={
            isDashboardLoading
              ? "..."
              : (dashboardData?.processingMonth ?? "N/A")
          }
          description="Currently selected period"
          bgColor="bg-[#2eacb3]"
          icon={<Calendar size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Total Employees"
          value={
            isDashboardLoading
              ? "..."
              : dashboardData?.status === "Completed"
                ? dashboardData.totalEmployees.toString()
                : "-"
          }
          description={
            dashboardData?.status === "Completed"
              ? "Processed in payroll"
              : "To be processed"
          }
          bgColor="bg-[#f7c343]"
          icon={<Users size={20} className="text-green-600" />}
        />
        <StatCard
          title="Gross Amount"
          value={
            isDashboardLoading
              ? "..."
              : dashboardData?.status === "Completed"
                ? formatCurrency(dashboardData.estimatedGrossAmount)
                : "-"
          }
          description={
            dashboardData?.status === "Completed"
              ? "Actual gross salary"
              : "Estimated gross salary"
          }
          bgColor="bg-[#386487]"
          icon={<Banknote size={20} className="text-red-600" />}
        />
        <StatCard
          title="Status"
          value={isDashboardLoading ? "..." : (dashboardData?.status ?? "N/A")}
          description="For processing"
          bgColor="bg-[#87b6a7]"
          icon={<Clock size={20} className="text-purple-600" />}
        />
      </div>

      {/* Pre-Processing Checklist (now full-width) */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold text-gray-800">
          Pre-Processing Checklist
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Ensure all data is ready before processing
        </p>
        <ul className="space-y-3">
          {checklistItems.map((item) => {
            const badge = getChecklistBadge(item.status);
            const isClickable =
              item.label === "Attendance Data" ||
              item.label === "Leave Applications";
            let handleClick;
            if (item.label === "Attendance Data") {
              handleClick = handleAttendanceCheck;
            } else if (item.label === "Leave Applications") {
              handleClick = handleLeaveCheck;
            }

            return (
              <li
                key={item.label}
                onClick={handleClick}
                className={`flex justify-between items-center bg-gray-50 p-3 rounded-md ${
                  isClickable
                    ? "cursor-pointer hover:bg-gray-100 transition-colors"
                    : ""
                }`}
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${badge.classes}`}
                >
                  {badge.icon} {badge.text}
                  {item.count > 0 && ` (${item.count})`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* --- MODIFIED: Payroll History now uses filtered data --- */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-normal text-gray-900 border-b-2 border-[#143463] pb-1 mb-4">
          Payroll History
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Showing records for the selected month
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f07837] text-white uppercase text-xs">
              <tr>
                {[
                  "Period",
                  "Employees",
                  "Gross Amount",
                  "Net Amount",
                  "Status",
                  "Processed On",
                  "Actions",
                ].map((head) => (
                  <th key={head} scope="col" className="px-6 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {isHistoryLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-2">
                    <div className="flex justify-center items-center">
                      {<LogoLoader />}
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((rec) => (
                  <tr
                    key={rec.payrollRunId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-semibold">{rec.period}</td>
                    <td className="px-6 py-4">{rec.employees}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(rec.grossAmount)}
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(rec.netAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(rec.processedOn)}</td>
                    <td className="px-6 py-4 items-center gap-4">
                       <button
                        onClick={() => handleViewRunDetails(rec)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View / Edit Employee Salaries"
                      >
                        <FaEdit size={18} />
                      </button>
                      {/* <button
                        onClick={() =>
                          handleDownloadRegister(rec.payrollRunId, rec.period)
                        }
                        disabled={isDownloading === rec.payrollRunId}
                        className="text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-wait"
                        title="Download Payroll Register"
                      >
                        {isDownloading === rec.payrollRunId ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Download size={18} />
                        )}
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No payroll history found for {displayMonth}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        title={`Attendance Exceptions Report - ${displayMonth}`}
      >
        {attendanceError ? (
          <div className="text-center p-8 text-red-600">{attendanceError}</div>
        ) : attendanceExceptions.length === 0 ? (
          <div className="text-center p-8 text-green-600">
            <Check size={48} className="mx-auto mb-2" />
            <h3 className="font-semibold text-lg">All Clear!</h3>
            <p>No attendance exceptions found for this period.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f07837] text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Employee Code</th>
                    <th className="px-4 py-2">Employee Name</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Issue</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {attendanceExceptions.map((ex) => (
                    <tr
                      key={`${ex.employeeCode}-${ex.date}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{ex.employeeCode}</td>
                      <td className="px-4 py-2 font-medium">
                        {ex.employeeName}
                      </td>
                      <td className="px-4 py-2">{formatDate(ex.date)}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {ex.issue}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Next Steps Section */}
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400">
              <div className="flex">
                <div className="shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-md font-semibold text-amber-800">
                    Next Steps
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Contact the respective managers for the employees listed
                        above.
                      </li>
                      <li>
                        Ask them to regularize the attendance (correct missed
                        punches) in the system.
                      </li>
                      <li>
                        Once all exceptions are cleared, you can confidently
                        proceed with running the payroll.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title={`Pending Leave Applications - ${displayMonth}`}
      >
        {leaveError ? (
          <div className="text-center p-8 text-red-600">{leaveError}</div>
        ) : pendingLeaves.length === 0 ? (
          <div className="text-center p-8 text-green-600">
            <Check size={48} className="mx-auto mb-2" />
            <h3 className="font-semibold text-lg">All Clear!</h3>
            <p>No pending leave applications found for this period.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f07837] text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Leave Type</th>
                    <th className="px-4 py-2">Date Range</th>
                    {/* <th className="px-4 py-2">Manager</th> */}
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {pendingLeaves.map((leave) => (
                    <tr
                      key={`${leave.employeeCode}-${leave.fromDate}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        <div className="font-medium">{leave.employeeName}</div>
                        <div className="text-xs text-gray-500">
                          {leave.employeeCode}
                        </div>
                      </td>
                      <td className="px-4 py-2">{leave.leaveTypeName}</td>
                      <td className="px-4 py-2">
                        {formatDate(leave.fromDate)} -{" "}
                        {formatDate(leave.toDate)}
                        <span className="ml-2 font-semibold">
                          ({leave.days} {leave.days > 1 ? "days" : "day"})
                        </span>
                      </td>
                      {/* <td className="px-4 py-2">{leave.reportingManagerName}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400">
              <div className="flex">
                <div className="shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="ml-3">
                  <h3 className="text-md font-semibold text-amber-800">
                    Next Steps
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>
                        Contact the respective managers to approve or reject
                        these pending leave requests.
                      </li>
                      <li>
                        Payroll cannot be processed accurately until all pending
                        leaves are actioned.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

           <Modal
        isOpen={isRunDetailsModalOpen}
        onClose={() => setIsRunDetailsModalOpen(false)}
        title={`Employee Salaries for ${selectedRun?.period}`}
      >
        {isLoadingRunDetails ? (
           <div className="flex justify-center items-center p-8">
             <Loader2 className="animate-spin mr-2" /> Loading employees...
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-2">Employee Name</th>
                  <th className="px-4 py-2">Net Salary</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {runDetails.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{record.employeeName}</td>
                    <td className="px-4 py-2">{formatCurrency(record.netSalary)}</td>
                    <td className="px-5 py-2 text-center">
                       <button 
                         onClick={() => handleEditSalaryRecord(record.id)}
                         className="text-blue-600 hover:text-blue-800 transition-colors" 
                         title="Edit Salary Details"
                       >
                        <FaEdit size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Modal 2: The Edit Form for a Single Employee */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Salary for ${editingRecord?.employeeName}`}
      >
        {isEditingLoading ? (
           <div className="flex justify-center items-center p-8">
             <Loader2 className="animate-spin mr-2" /> Loading details...
           </div>
        ) : editingRecord ? (
          <EditSalaryRecordForm 
              key={editingRecord.id}
              record={editingRecord} 
            onSave={handleSaveChanges}
            onClose={() => setIsEditModalOpen(false)}
            isSaving={isSaving}
          />
        ) : (
          <div className="p-8 text-center text-red-500">Could not load salary details.</div>
        )}
      </Modal>
      
    </div>
  );
};

export default PayrollProcessing;
