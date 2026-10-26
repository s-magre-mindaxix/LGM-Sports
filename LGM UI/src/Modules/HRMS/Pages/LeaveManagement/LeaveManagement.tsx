import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  User,
  Calendar,
  FileText,
  Search,
  Upload,
  Check,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import ApplyLeaveModal from "./ApplyLeaveModal";
import { toast } from "sonner";
import {
  getPendingApprovals,
  getLeaveBalance,
  updateLeaveStatus,
  getLeaveHistory,
  getLeaveTypes,
  getFilteredTeamLeaveHistory,
  getAllEmployeesBalances,
  type LeaveApplication,
  type LeaveBalance,
  type LeaveType,
  type EmployeeBalanceReport,
} from "./LeaveService";
import {
  exportToExcel,
  type ExcelExportData,
} from "../../../../Utils/exportToExcel";
import { useAuth } from "../../../../hooks/useAuth";
import {
  actionButtonStyles,
  buttonStyles,
} from "../../../../Components/Common/buttonStyles";
import { FaEye } from "react-icons/fa";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const getCurrentFinancialYear = () => {
  return new Date().getFullYear();
};

// --- COMPONENTS ---

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, icon, bgColor }) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-4xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-90">{title}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

// --- NEWLY REDESIGNED LEAVE BALANCE CARD ---
const LeaveBalanceCard: React.FC<LeaveBalance> = ({
  leaveTypeName,
  allocatedDays,
  availedDays,
  balanceDays,
}) => {
  const progress = allocatedDays > 0 ? (availedDays / allocatedDays) * 100 : 0;

  const getProgressColors = () => {
    if (progress > 80) {
      return {
        bar: "bg-red-500",
        text: "text-red-800",
        bg: "bg-red-100/50",
      };
    }
    if (progress > 50) {
      return {
        bar: "bg-amber-500",
        text: "text-amber-800",
        bg: "bg-amber-100/50",
      };
    }
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-800",
      bg: "bg-emerald-100/50",
    };
  };

  const colors = getProgressColors();

  return (
    <div
      className={`p-4 rounded-lg border border-slate-200/80 bg-linear-to-br from-white to-slate-50 transition-shadow hover:shadow-lg`}
    >
      <p className="font-bold text-slate-800 text-md mb-2">{leaveTypeName}</p>

      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
        <div
          className={`${colors.bar} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-slate-500">
          <span className="font-semibold text-slate-700">{availedDays}</span>{" "}
          used of{" "}
          <span className="font-semibold text-slate-700">{allocatedDays}</span>
        </p>
        <p
          className={`font-bold py-1 px-2.5 rounded-full text-xs ${colors.text} ${colors.bg}`}
        >
          {balanceDays} Left
        </p>
      </div>
    </div>
  );
};

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonVariant?: "primary" | "danger";
  children?: React.ReactNode;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmButtonVariant = "primary",
  children,
}) => {
  if (!isOpen) return null;

  const isDanger = confirmButtonVariant === "danger";
  const iconBgColor = isDanger ? "bg-red-100" : "bg-teal-100";
  const iconColor = isDanger ? "text-red-600" : "text-teal-600";
  const buttonClass = isDanger
    ? "bg-red-600 hover:bg-red-700"
    : "bg-teal-600 hover:bg-teal-700";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center transform transition-all animate-modal-pop-in">
        <div
          className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${iconBgColor} mb-4`}
        >
          <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">{message}</p>

        {children}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md text-sm font-medium ${buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const isManager =
    user?.role === "Manager" ||
    user?.role === "Admin" ||
    user?.role === "HR" ||
    user?.role === "Employee" ||
    user?.role === "Sales" ||
    user?.role === "Vehicle Testing" ||
    user?.role === "Support" ||
    user?.role === "Development" ||
    user?.role === "Account";
  const canViewMasterBalances =
    user?.role === "Manager" ||
    user?.role === "Admin" ||
    user?.role === "HR" ||
    user?.role === "Employee" ||
    user?.role === "Sales" ||
    user?.role === "Vehicle Testing" ||
    user?.role === "Support" ||
    user?.role === "Development" ||
    user?.role === "Account";

  const [viewMode, setViewMode] = useState<
    "my_leaves" | "team_approvals" | "leave_history" | "all_balances"
  >("my_leaves");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allApps, setAllApps] = useState<LeaveApplication[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [allBalances, setAllBalances] = useState<EmployeeBalanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("All");

  const [searchQuery, setSearchQuery] = useState("");
  type LeaveStatus = "All" | "Pending" | "Approved" | "Rejected";
  const [statusFilter, setStatusFilter] = useState<LeaveStatus>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [leaveToProcess, setLeaveToProcess] = useState<{
    id: number;
    action: "Approve" | "Reject";
  } | null>(null);
  const [managerRemarks, setManagerRemarks] = useState("");
  const pageSize = viewMode === "all_balances" ? 3 : 10;

  // const isEligibleForLeave = useMemo(() => {
  //   if (!user || !user.dateOfJoining) {
  //     return false;
  //   }
  //   const joiningDate = new Date(user.dateOfJoining);
  //   const eligibilityDate = new Date(joiningDate);
  //   eligibilityDate.setMonth(eligibilityDate.getMonth() + 6);
  //   const today = new Date();
  //   return today >= eligibilityDate;
  // }, [user]);

  // const eligibilityTooltip = isEligibleForLeave
  //   ? "Apply for a new leave"
  //   : "You are not eligible to apply for leave until you have completed 6 months of service.";

  const fetchLeaveData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const year = getCurrentFinancialYear();
      const [balanceData, typesData] = await Promise.all([
        getLeaveBalance(user.employeeId, year),
        getLeaveTypes(),
      ]);
      setLeaveBalances(balanceData);
      setLeaveTypes(typesData);

      if (viewMode === "all_balances") {
        const reportData = await getAllEmployeesBalances(year);
        setAllBalances(reportData);
      } else {
        let applicationData: LeaveApplication[];

        if (isManager) {
          const pendingData = await getPendingApprovals(user.employeeId);
          setPendingApprovalsCount(pendingData.length);

          switch (viewMode) {
            case "team_approvals":
              applicationData = pendingData;
              break;
            case "leave_history":
              applicationData = await getFilteredTeamLeaveHistory(
                user.employeeId,
              );
              break;
            default:
              applicationData = await getLeaveHistory(user.employeeId);
              break;
          }
        } else {
          applicationData = await getLeaveHistory(user.employeeId);
        }
        setAllApps(applicationData);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast.error("Failed to fetch data.");
    } finally {
      setIsLoading(false);
    }
  }, [user, isManager, viewMode]);

  useEffect(() => {
    fetchLeaveData();
    const handleRefresh = () => {
      fetchLeaveData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchLeaveData]);

  const filteredBalances = useMemo(() => {
    if (viewMode !== "all_balances") return [];
    return allBalances.filter((row) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (row.employeeName || "").toLowerCase().includes(searchLower) ||
        (row.employeeCode || "").toLowerCase().includes(searchLower) ||
        (row.department || "").toLowerCase().includes(searchLower)
      );
    });
  }, [allBalances, searchQuery, viewMode]);

  const filteredApps = useMemo(() => {
    const isTeamView =
      (isManager && viewMode === "team_approvals") ||
      viewMode === "leave_history";

    return allApps
      .filter((app) => statusFilter === "All" || app.status === statusFilter)
      .filter(
        (app) =>
          leaveTypeFilter === "All" || app.leaveTypeName === leaveTypeFilter,
      )
      .filter((app) => {
        const searchLower = searchQuery.toLowerCase();
        return isTeamView
          ? // ? app.employeeName.toLowerCase().includes(searchLower)
            // : app.leaveTypeName.toLowerCase().includes(searchLower);
            (app.employeeName || "").toLowerCase().includes(searchLower)
          : (app.leaveTypeName || "").toLowerCase().includes(searchLower);
      });
  }, [
    allApps,
    statusFilter,
    leaveTypeFilter,
    searchQuery,
    isManager,
    viewMode,
  ]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const dataSource =
      viewMode === "all_balances" ? filteredBalances : filteredApps;
    return dataSource.slice(startIndex, startIndex + pageSize);
  }, [filteredApps, filteredBalances, currentPage, viewMode, pageSize]);

  const totalResults =
    viewMode === "all_balances" ? filteredBalances.length : filteredApps.length;
  const totalPages = Math.ceil(totalResults / pageSize);

  const stats = useMemo(() => {
    const pendingCount =
      isManager && viewMode !== "my_leaves"
        ? pendingApprovalsCount
        : allApps.filter((app) => app.status === "Pending").length;

    const approvedDays = allApps
      .filter((app) => app.status === "Approved")
      .reduce((total, app) => total + app.days, 0);

    const totalAllocatedThisYear = leaveBalances.reduce(
      (acc, curr) => acc + curr.allocatedDays,
      0,
    );

    return {
      pendingCount,
      approvedDays,
      totalDays: totalAllocatedThisYear,
    };
  }, [allApps, isManager, pendingApprovalsCount, viewMode, leaveBalances]);

  const getStatusBadge = (status: LeaveApplication["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800";
      case "Approved":
        return "bg-emerald-100 text-emerald-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
    }
  };

  const handleExportClick = () => {
    if (viewMode === "all_balances") {
      if (filteredBalances.length === 0)
        return toast.warning("No data to export");

      interface ExportRow {
        "Employee ID": string;
        Name: string;
        Department: string;
        [key: string]: string | number;
      }

      const dataToExport = filteredBalances.map((emp): ExportRow => {
        const row: ExportRow = {
          "Employee ID": emp.employeeCode,
          Name: emp.employeeName,
          Department: emp.department,
        };

        emp.balances.forEach((b) => {
          row[`${b.leaveTypeName} Balance`] = b.balanceDays;
        });
        return row;
      });

      exportToExcel(dataToExport, "Master_Leave_Report", "Balances");
      return;
    }

    if (filteredApps.length === 0) {
      toast.warning("There is no data to export.");
      return;
    }

    const isTeamView =
      isManager &&
      (viewMode === "team_approvals" || viewMode === "leave_history");

    const dataToExport: ExcelExportData[] = filteredApps.map((app) => {
      const commonData = {
        "Leave Type": app.leaveTypeName,
        "Start Date": app.fromDate,
        "End Date": app.toDate,
        "Number of Days": app.days,
        Reason: app.reason,
        Status: app.status,
        "Applied On": app.appliedDate,
      };

      if (isTeamView) {
        return {
          "Employee ID": `EMP${app.employeeId.toString().padStart(3, "0")}`,
          "Employee Name": app.employeeName,
          ...commonData,
        };
      }
      return commonData;
    });

    const fileNameSuffix = isTeamView ? "Team_Approvals" : "My_Leaves";
    exportToExcel(
      dataToExport,
      `Leave_Apps_${fileNameSuffix}`,
      "Leave Applications",
    );
  };

  const handleUpdateStatus = async (
    leaveId: number,
    status: "Approved" | "Rejected",
  ) => {
    if (!user) return;
    try {
      await updateLeaveStatus(leaveId, {
        status,
        approvedByEmployeeId: user.employeeId,
      });
      toast.success(`Leave request has been ${status.toLowerCase()}.`);
      fetchLeaveData();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleViewChange = (
    mode: "my_leaves" | "team_approvals" | "leave_history" | "all_balances",
  ) => {
    setViewMode(mode);
    setSearchQuery("");
    setStatusFilter(mode === "team_approvals" ? "Pending" : "All");
    setLeaveTypeFilter("All");
    setCurrentPage(1);
  };

  const handleViewDetails = (leaveApp: LeaveApplication) => {
    setSelectedLeave(leaveApp);
    setIsDetailsModalOpen(true);
  };

  const handleApprovalRequest = (id: number, action: "Approve" | "Reject") => {
    setLeaveToProcess({ id, action });
    setIsConfirmModalOpen(true);
    setManagerRemarks("");
  };

  const handleConfirmProcessing = async () => {
    if (!leaveToProcess) return;
    const { id, action } = leaveToProcess;

    if (action === "Reject" && !managerRemarks.trim()) {
      toast.error("Remarks are required for rejection.");
      return;
    }

    await handleUpdateStatus(
      id,
      action === "Approve" ? "Approved" : "Rejected",
    );
    setIsConfirmModalOpen(false);
    setLeaveToProcess(null);
  };

  return (
    <>
      {/* <div className="p-4 md:p-6 bg-slate-100 min-h-full font-sans"> */}
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            {/* <h1 className="text-3xl font-bold text-slate-800"> */}
            <h1 className="text-2xl font-bold text-gray-900">
              Leave Management
            </h1>
            <p className="text-slate-600 mt-1">
              View your leave applications and balance, or manage team requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeaveData}
              disabled={isLoading}
              className={buttonStyles.refresh}
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              // disabled={!isEligibleForLeave}
              // title={eligibilityTooltip}
              className={buttonStyles.add}
            >
              + Apply for Leave
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={isManager ? "Pending Approvals" : "My Pending Requests"}
            value={stats.pendingCount}
            bgColor="bg-[#2eacb3]"
            icon={<Clock className="h-7 w-7  text-amber-700" />}
          />
          <StatCard
            title="Approved Days"
            value={stats.approvedDays}
            bgColor="bg-[#f7c343]"
            icon={<CheckCircle2 className="h-7 w-7 text-cyan-600" />}
          />
          <StatCard
            title="On Leave Today"
            value={"--"}
            bgColor="bg-[#386487]"
            icon={<User className="h-7 w-7 text-purple-600" />}
          />
          <StatCard
            title="Total Leave Days This Year"
            value={stats.totalDays}
            bgColor="bg-[#89beb3]"
            icon={<Calendar className="h-7 w-7 text-indigo-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg shadow-slate-200/50 p-6 border border-slate-200/80">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={20} />
                {viewMode === "all_balances"
                  ? "Master Balance Report"
                  : "Leave Applications"}
              </h2>
              {isManager && (
                <div className="flex items-center p-1 bg-slate-200/70 rounded-lg">
                  <button
                    onClick={() => handleViewChange("my_leaves")}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                      viewMode === "my_leaves"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    My Leaves
                  </button>
                  <button
                    onClick={() => handleViewChange("team_approvals")}
                    className={`flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                      viewMode === "team_approvals"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Team Approvals
                    {pendingApprovalsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleViewChange("leave_history")}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                      viewMode === "leave_history"
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-800"
                    }`}
                  >
                    Leave History
                  </button>
                  {canViewMasterBalances && (
                    <button
                      onClick={() => handleViewChange("all_balances")}
                      className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                        viewMode === "all_balances"
                          ? "bg-white text-teal-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      Master Balances
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Filter Section */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="relative grow md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    viewMode === "all_balances"
                      ? "Search by name or code..."
                      : isManager &&
                          (viewMode === "team_approvals" ||
                            viewMode === "leave_history")
                        ? "Search by employee name..."
                        : "Search by leave type..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {viewMode !== "all_balances" && (
                  <>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as LeaveStatus);
                        setCurrentPage(1);
                      }}
                      className="border border-slate-300 px-3 py-2 rounded-lg text-sm bg-white"
                    >
                      <option value="All">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <select
                      value={leaveTypeFilter}
                      onChange={(e) => {
                        setLeaveTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="border border-slate-300 px-3 py-2 rounded-lg text-sm bg-white"
                    >
                      <option value="All">All Types</option>
                      {leaveTypes.map((lt) => (
                        <option key={lt.id} value={lt.leaveTypeName}>
                          {lt.leaveTypeName}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  onClick={handleExportClick}
                  className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-lg text-sm text-white bg-[#088c27] hover:bg-[#04741e]"
                >
                  <Upload size={16} /> Export
                </button>
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f07837] text-white uppercase text-xs">
                  <tr>
                    {viewMode === "all_balances" ? (
                      <>
                        <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                          Employee
                        </th>
                        <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                          Department
                        </th>
                        {leaveTypes.map((lt, index) => (
                          <th
                            key={lt.id}
                            className={`px-6 py-3 font-semibold text-center ${index < leaveTypes.length - 1 ? "border-r border-[#2a4a7a]" : ""}`}
                          >
                            {lt.leaveTypeName}
                          </th>
                        ))}
                      </>
                    ) : (
                      <>
                        {(viewMode === "team_approvals" ||
                          viewMode === "leave_history") && (
                          <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                            Employee
                          </th>
                        )}
                        <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                          Leave Type
                        </th>
                        <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                          Duration
                        </th>
                        <th className="px-6 py-3 font-semibold text-center border-r border-[#2a4a7a]">
                          Days
                        </th>
                        <th className="px-6 py-3 font-semibold border-r border-[#2a4a7a]">
                          Status
                        </th>
                        <th className="px-6 py-3 font-semibold">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-0">
                       {<LogoLoader />}
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center py-8 text-red-500"
                      >
                        {error}
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        No results found.
                      </td>
                    </tr>
                  ) : viewMode === "all_balances" ? (
                    (paginatedData as EmployeeBalanceReport[]).map((row) => (
                      <tr
                        key={row.employeeId}
                        className="border-b border-slate-200 hover:bg-teal-50/50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">
                            {row.employeeName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.employeeCode}
                          </div>
                        </td>
                        <td className="px-6 py-4">{row.department}</td>
                        {leaveTypes.map((lt) => {
                          const bal = row.balances.find(
                            (b) => b.leaveTypeName === lt.leaveTypeName,
                          );
                          return (
                            <td
                              key={lt.id}
                              className="px-6 py-4 text-center font-medium"
                            >
                              <span
                                className={
                                  bal && bal.balanceDays > 0
                                    ? "text-teal-700"
                                    : "text-slate-400"
                                }
                              >
                                {bal ? bal.balanceDays : "0"}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    (paginatedData as LeaveApplication[]).map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-slate-200 hover:bg-teal-50/50"
                      >
                        {(viewMode === "team_approvals" ||
                          viewMode === "leave_history") && (
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-800">
                              {app.employeeName}
                            </div>
                            <div className="text-xs text-slate-500">
                              EMP{app.employeeId.toString().padStart(3, "0")}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">{app.leaveTypeName}</td>
                        <td className="px-6 py-4">{`${app.fromDate} to ${app.toDate}`}</td>
                        <td className="px-6 py-4 text-center">{app.days}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              app.status,
                            )}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleViewDetails(app)}
                              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                              title="View Details"
                            >
                              <FaEye size={16} />
                            </button>

                            {viewMode === "team_approvals" &&
                              app.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleApprovalRequest(app.id, "Approve")
                                    }
                                    className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                                    title="Approve"
                                  >
                                    <Check size={20} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleApprovalRequest(app.id, "Reject")
                                    }
                                    className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                                    title="Reject"
                                  >
                                    <X size={20} />
                                  </button>
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm text-slate-600">
                Showing{" "}
                {paginatedData.length > 0
                  ? (currentPage - 1) * pageSize + 1
                  : 0}{" "}
                to {Math.min(currentPage * pageSize, totalResults)} of{" "}
                {totalResults} results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-100"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - My Balances */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg shadow-slate-200/50 p-6 border border-slate-200/80">
            <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileText size={20} /> My Leave Balances (
              {getCurrentFinancialYear()})
            </h2>
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading balances...</p>
              ) : leaveBalances.length > 0 ? (
                leaveBalances.map((balance) => (
                  <LeaveBalanceCard key={balance.leaveTypeName} {...balance} />
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No leave balances found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApplyLeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeaveData}
      />
      <LeaveDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        leave={selectedLeave}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmProcessing}
        title={`${leaveToProcess?.action} Leave`}
        message={`Are you sure you want to ${leaveToProcess?.action?.toLowerCase()} this leave application?`}
        confirmText={leaveToProcess?.action || ""}
        confirmButtonVariant={
          leaveToProcess?.action === "Approve" ? "primary" : "danger"
        }
      >
        {leaveToProcess?.action === "Reject" && (
          <div className="mt-4 text-left">
            <label className="block text-sm font-medium text-slate-700">
              Remarks (Required)
            </label>
            <textarea
              value={managerRemarks}
              onChange={(e) => setManagerRemarks(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Provide a reason for rejection..."
            />
          </div>
        )}
      </ConfirmationModal>
    </>
  );
};

const LeaveDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveApplication | null;
}> = ({ isOpen, onClose, leave }) => {
  if (!isOpen || !leave) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all animate-modal-pop-in">
        <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Leave Application Details
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <p className="text-sm text-gray-500 font-medium">Employee</p>
              <p className="text-base text-gray-800 font-semibold mt-1">
                {leave.employeeName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Leave Type</p>
              <p className="text-base text-gray-800 font-semibold mt-1">
                {leave.leaveTypeName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Duration</p>
              <p className="text-base text-gray-800 mt-1">{`${leave.fromDate} to ${leave.toDate}`}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Days</p>
              <p className="text-base text-gray-800 font-semibold mt-1">
                {leave.days}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Applied On</p>
              <p className="text-base text-gray-800 mt-1">
                {new Date(leave.appliedDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Status</p>
              <div className="mt-1">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(
                    leave.status,
                  )}`}
                >
                  {leave.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 font-medium">Reason</p>
            <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-md text-gray-700 min-h-20 max-h-32 overflow-y-auto text-base">
              {leave.reason || "No reason provided."}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
