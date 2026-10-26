import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  ListChecks,
  FileEdit,
  History,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Info,
  Check,
  X,
   Bell,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useAuth } from "../../../../hooks/useAuth";
import ApplyLoanModal from "./ApplyLoanModal";
import RecoveryReportModal from "./RecoveryReportModal";
import OverdueLoansModal from "./OverdueLoansModal";
import {
  getLoanHistory,
  getPendingLoanApprovals,
   getEmployeeDashboard,
  updateLoanStatus,
  getTeamLoanHistory,
  getDashboard,
  type LoanApplication,
  type LoanDashboard,
} from "./LoanApplicationService";


const ITEMS_PER_PAGE = 10;
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
}) => (
  <div className="bg-white p-5 rounded-lg shadow-sm border">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <div className="text-gray-400">{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    {description && <p className="text-xs text-gray-500">{description}</p>}
  </div>
);

const LoansAndAdvances: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === "Manager" || user?.role === "Admin" || user?.role === "HR" || user?.role === "Sales" || user?.role === "Account";

  const [dashboard, setDashboard] = useState<LoanDashboard | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isOverdueModalOpen, setIsOverdueModalOpen] = useState(false);

 

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
    const [approvalNotificationCount, setApprovalNotificationCount] = useState(0);
  const [viewMode, setViewMode] = useState<"my_loans" | "team_approvals" | "team_history">(
    "my_loans"
  );
  
    const fetchDashboard = useCallback(async () => {
    if (!user) return; 
    try {
      let data: LoanDashboard;
      if (isManager) {
        
        data = await getDashboard(user.employeeId);
      } else {
        
        data = await getEmployeeDashboard(user.employeeId);
      }
      setDashboard(data);
    } catch {
      toast.error("Failed to load dashboard data.");
    }
  }, [isManager, user]);



   const fetchApplications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      let data: LoanApplication[];
      if (isManager && viewMode === "team_approvals") {
        data = await getPendingLoanApprovals(user.employeeId);
      } else if (isManager && viewMode === "team_history") {
        // This is the new logic for the third tab
        data = await getTeamLoanHistory(user.employeeId);
      } else {
        // This handles "my_loans" for everyone
        data = await getLoanHistory(user.employeeId);
      }
      setApplications(data);
    } catch {
      toast.error("Failed to load loan records.");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isManager, viewMode, user]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (dashboard && isManager) {
      if (viewMode !== 'team_approvals') {
        setApprovalNotificationCount(dashboard.pendingApprovalsCount);
      }
    }
  }, [dashboard, isManager, viewMode]);

  const handleTeamApprovalsClick = () => {
    setViewMode("team_approvals");
    setApprovalNotificationCount(0);
  };
  const stats = useMemo(
    () => ({
      activeCount: dashboard?.activeLoansCount ?? 0,
      activeTotal: dashboard
        ? `₹${dashboard.activeLoansTotalAmount.toLocaleString()}`
        : "₹0",
      monthlyRecovery: dashboard
        ? `₹${dashboard.monthlyRecoveryAmount.toLocaleString()}`
        : "₹0",
      pendingCount: dashboard?.pendingApprovalsCount ?? 0,
    }),
    [dashboard]
  );
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = searchQuery.toLowerCase();
      if (viewMode === "team_approvals" && isManager)
        return app.employeeName?.toLowerCase().includes(q);
      return (
        app.loanTypeName?.toLowerCase().includes(q) ||
        app.employeeName?.toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery, viewMode, isManager]);

  useEffect(() => setCurrentPage(1), [searchQuery, viewMode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApps.length / ITEMS_PER_PAGE)
  );
  const paginated = filteredApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusUpdate = async (
    id: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      await updateLoanStatus(id, {
        status,
        approvedByUserId: user!.employeeId,
      });
      toast.success(`Loan ${status.toLowerCase()}.`);
      fetchDashboard();
      fetchApplications();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleExportToExcel = () => {
    if (filteredApps.length === 0) {
      toast.info("No data available to export.");
      return;
    }

    const dataToExport = filteredApps.map((rec) => ({
      "Employee Name": rec.employeeName,
      "Employee Code": rec.employeeCode,
      "Loan Type": rec.loanTypeName,
      "Loan Amount (₹)": rec.loanAmount,
      "EMI Amount (₹)": rec.monthlyDeduction,
      "Paid Installments": `${rec.paidInstallments ?? 0}/${rec.tenureInMonths}`,
      "Balance (₹)": rec.balance ?? rec.loanAmount,
      "Status": rec.status === "Approved" ? "Active" : rec.status,
      "Application Date": new Date(rec.applicationDate).toLocaleDateString(),
    }));

    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Loan Records");


    let filename = "Loan_Records.xlsx";
    if (viewMode === 'my_loans') filename = "My_Loans_Report.xlsx";
    if (viewMode === 'team_approvals') filename = "Team_Approvals_Report.xlsx";
    if (viewMode === 'team_history') filename = "Team_History_Report.xlsx";
    
    
    XLSX.writeFile(workbook, filename);
    toast.success("Excel report downloaded successfully!");
  };


  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Loans & Advances
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employee loans and salary advances
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2eacb3] hover:bg-teal-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={16} /> New Loan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Loans"
            value={String(stats.activeCount)}
            description="Currently active"
            icon={<CalendarDays size={20} color="blue" />}
          />
          <StatCard
            title="Total Outstanding"
            value={stats.activeTotal}
            description="Remaining amount"
            icon={<DollarSign size={20} color="red" />}
          />
          <StatCard
            title="Monthly Recovery"
            value={stats.monthlyRecovery}
            description="EMI collection"
            icon={<TrendingUp size={20} color="Green" />}
          />
          <StatCard
            title="Pending Approvals"
            value={String(stats.pendingCount)}
            description="For Managers"
            icon={<Info size={20} color="#F59E0B"  />}
            
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-2">Loan Types</h3>
            <div className="space-y-3">
              {dashboard?.loanTypes?.map((lt) => (
                <div
                  key={lt.loanTypeId}
                  className="flex justify-between border-b pb-2"
                >
                  <div className="font-medium text-gray-800">
                    {lt.loanTypeName}
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {lt.count} Loans
                    </span>
                    <span className="font-semibold">
                      ₹{lt.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 text-white p-3 rounded flex items-center gap-3"
              >
                <Plus /> Add New Loan
              </button>
              <button className="w-full p-3 border rounded flex items-center gap-3">
                <ListChecks /> Process EMI Deductions
              </button>
              <button
                onClick={() => setIsRecoveryModalOpen(true)}
                className="w-full p-3 border rounded flex items-center gap-3"
              >
                <FileEdit /> Generate Recovery Report
              </button>
              <button
                onClick={() => setIsOverdueModalOpen(true)}
                className="w-full p-3 border rounded flex items-center gap-3"
              >
                <History /> Review Overdue Loans
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border">
         
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Loan Records</h3>

            {isManager && (
         

             <div className="flex gap-2 bg-gray-100 p-1 rounded-lg text-sm">
                <button
                  onClick={() => setViewMode("my_loans")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "my_loans" ? "bg-white shadow text-blue-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  My Loans
                </button>

             
                 <button
                  onClick={handleTeamApprovalsClick}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${ // Added flexbox classes
                    viewMode === "team_approvals" ? "bg-white shadow text-blue-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  <div className="relative"> 
                    <Bell size={18} /> 
                    {approvalNotificationCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {approvalNotificationCount}
                      </span>
                    )}
                  </div>
                  <span>Team Approvals</span>
                </button>

                <button
                  onClick={() => setViewMode("team_history")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "team_history" ? "bg-white shadow text-blue-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  Team History
                </button>
              </div>
            )}
          </div>

          {/* Search */}
          {/*
           <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}

              {/*
               <div className="mb-4 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}

          {/* --- WITH THIS NEW SECTION --- */}
          {/* Search and Export Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 border rounded"
                placeholder="Search by Employee or Loan Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportToExcel}
              disabled={filteredApps.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <FileDown size={16} />
              Export to Excel
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Loan Type</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">EMI</th>
                  <th className="px-6 py-3">Paid</th>
                  <th className="px-6 py-3">Balance</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <Loader2 className="animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No loan records found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((rec) => (
                    <tr key={rec.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">
                        {rec.employeeName}
                        <div className="text-xs text-gray-400">
                          ({rec.employeeCode})
                        </div>
                      </td>

                      <td className="px-6 py-4">{rec.loanTypeName}</td>

                      <td className="px-6 py-4">
                        ₹{rec.loanAmount.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        ₹{rec.monthlyDeduction.toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        {rec.paidInstallments ?? 0}/{rec.tenureInMonths}
                      </td>

                      <td className="px-6 py-4">
                        ₹{(rec.balance ?? rec.loanAmount).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rec.status === "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : rec.status === "Pending"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {rec.status === "Approved" ? "Active" : rec.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          {isManager &&
                            viewMode === "team_approvals" &&
                            rec.status === "Pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(rec.id, "Approved")
                                  }
                                  className="text-green-600"
                                >
                                  <Check />
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(rec.id, "Rejected")
                                  }
                                  className="text-red-600"
                                >
                                  <X />
                                </button>
                              </>
                            )}
                          <button className="text-gray-500">📄</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of{" "}
              {filteredApps.length}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 border rounded disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ApplyLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchDashboard();
          fetchApplications();
        }}
      />
      <RecoveryReportModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />

      <OverdueLoansModal
        isOpen={isOverdueModalOpen}
        onClose={() => setIsOverdueModalOpen(false)}
      />
    </>
  );
};

export default LoansAndAdvances;
