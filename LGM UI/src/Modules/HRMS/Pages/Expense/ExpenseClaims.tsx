import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Plus,
  Clock,
  CheckCircle2,
  Info,
  Search,
  Eye,
  Check,
  X,
  ListChecks,
  History as HistoryIcon,
  RefreshCw,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import CreateExpenseClaim from "./CreateExpenseClaim";
import {
  bulkApproveClaims,
  getClaimHistory,
  getDashboardStats,
  getMyClaims,
  getPendingApprovals,
  updateClaimStatus,
  type DashboardStats,
  type ExpenseClaimView,
  type UpdateStatusPayload,
} from "./expenseClaimService";
import ClaimDetailsModal from "./ClaimDetailsModal";
import GenerateReportModal from "./GenerateReportModal";
import Pagination from "../../../../Components/Common/Pagination";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const isUserInRole = (role: string): boolean => {
  const token = sessionStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (Array.isArray(roles)) {
      return roles.includes(role);
    }
    return roles === role;
  } catch (e) {
    console.error("Failed to parse token for role check:", e);
    return false;
  }
};

const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, description, icon, bgColor }) => (
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

const ExpenseCategoryItem: React.FC<{
  name: string;
  count: number;
  amount: number;
}> = ({ name, count, amount }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-b-0">
    <span className="font-medium text-gray-700">{name}</span>
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
        {count} Claims
      </span>
      <span className="text-sm font-semibold text-gray-800 w-24 text-right">
        ₹{amount.toLocaleString("en-IN")}
      </span>
    </div>
  </div>
);

const ActionItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}> = ({ label, icon, isPrimary = false, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
      isPrimary
        ? "bg-[#f07837] text-white hover:bg-teal-800"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
    }
    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
  >
    {icon}
    <span className="font-semibold">{label}</span>
  </button>
);

const ExpenseClaims: React.FC = () => {
  const [myClaims, setMyClaims] = useState<ExpenseClaimView[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ExpenseClaimView[]>(
    [],
  );
  const [claimHistory, setClaimHistory] = useState<ExpenseClaimView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "myClaims" | "approvals" | "history"
  >("myClaims");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  const [isUserAdminOrHr, setIsUserAdminOrHr] = useState(false);
  const isInitialLoad = useRef(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [claimToProcess, setClaimToProcess] = useState<{
    id: number;
    action: "Approve" | "Reject";
  } | null>(null);
  const [managerRemarks, setManagerRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaimView | null>(
    null,
  );
  const [selectedClaims, setSelectedClaims] = useState<number[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const allowedRoles = [
    "Manager",
    "Admin",
    "HR",
    "Employee",
    "Sales",
    "Vehicle Testing",
    "Support",
    "Development",
    "Account",
  ];

  useEffect(() => {
    const hasAccess = allowedRoles.some((role) => isUserInRole(role));
    setIsUserAdminOrHr(hasAccess);
  }, []);

  // useEffect(() => {
  //   setIsUserAdminOrHr(isUserInRole("Admin") || isUserInRole("HR")  || isUserInRole("Employee"));
  // }, []);

  const fetchData = useCallback(async () => {
    if (isInitialLoad.current) setIsLoading(true);

    const apiCalls = [
      getMyClaims(),
      getPendingApprovals(),
      getDashboardStats(),
    ];

    if (isUserAdminOrHr) {
      apiCalls.push(getClaimHistory());
    }

    try {
      const results = await Promise.allSettled(apiCalls);

      if (results[0].status === "fulfilled") {
        setMyClaims(results[0].value as ExpenseClaimView[]);
      } else {
        console.error("Failed to fetch my claims:", results[0].reason);
      }

      let pendingData: ExpenseClaimView[] = [];
      if (results[1].status === "fulfilled") {
        pendingData = results[1].value as ExpenseClaimView[];
        setPendingApprovals(pendingData);
      } else {
        console.warn(
          "Could not fetch pending approvals (expected for non-managers):",
          results[1].reason,
        );
      }

      if (results[2].status === "fulfilled") {
        setDashboardStats(results[2].value as DashboardStats);
      } else {
        console.error("Failed to fetch dashboard stats:", results[2].reason);
        toast.error("Could not load dashboard statistics.");
      }

      if (isUserAdminOrHr && results[3] && results[3].status === "fulfilled") {
        setClaimHistory(results[3].value as ExpenseClaimView[]);
      }

      if (isInitialLoad.current) {
        if (pendingData.length > 0) setActiveTab("approvals");
        isInitialLoad.current = false;
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isUserAdminOrHr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const filteredData = useMemo(() => {
    let dataToFilter: ExpenseClaimView[];
    if (activeTab === "myClaims") dataToFilter = myClaims;
    else if (activeTab === "approvals") dataToFilter = pendingApprovals;
    else dataToFilter = claimHistory;

    if (!searchQuery) return dataToFilter;

    const lowercasedQuery = searchQuery.toLowerCase();
    return dataToFilter.filter(
      (claim) =>
        claim.employeeName.toLowerCase().includes(lowercasedQuery) ||
        `EXP${claim.id.toString().padStart(3, "0")}`
          .toLowerCase()
          .includes(lowercasedQuery) ||
        claim.expenseTypeName.toLowerCase().includes(lowercasedQuery) ||
        claim.status.toLowerCase().includes(lowercasedQuery),
    );
  }, [activeTab, myClaims, pendingApprovals, claimHistory, searchQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const minimumSpinTime = new Promise((resolve) => setTimeout(resolve, 500));
    await Promise.all([fetchData(), minimumSpinTime]);

    setIsRefreshing(false);
  };

  const handleApprovalRequest = (
    claim: ExpenseClaimView,
    action: "Approve" | "Reject",
  ) => {
    setClaimToProcess({ id: claim.id, action });
    setIsConfirmModalOpen(true);
    setManagerRemarks("");
    setApprovedAmount(claim.amount.toString());
  };

  const handleConfirmProcessing = async () => {
    if (!claimToProcess) return;
    const { id, action } = claimToProcess;

    const statusPayload: UpdateStatusPayload = {
      status: action === "Approve" ? "Approved" : "Rejected",
      managerRemarks: managerRemarks.trim() || undefined,
    };

    if (statusPayload.status === "Approved") {
      const finalApprovedAmount = parseFloat(approvedAmount);
      if (!isNaN(finalApprovedAmount) && finalApprovedAmount > 0) {
        statusPayload.approvedAmount = finalApprovedAmount;
      }
    }

    if (statusPayload.status === "Rejected" && !statusPayload.managerRemarks) {
      toast.error("Remarks are required for rejection.");
      return;
    }

    try {
      await updateClaimStatus(id, statusPayload);
      toast.success(
        `Claim has been ${statusPayload.status.toLowerCase()} successfully.`,
      );
      fetchData();
    } catch {
      toast.error("Failed to process the claim.");
    } finally {
      setIsConfirmModalOpen(false);
      setClaimToProcess(null);
      setApprovedAmount("");
    }
  };

  const getStatusBadgeClass = (status: ExpenseClaimView["status"]) =>
    ({
      Pending: "bg-gray-100 text-gray-800 border border-gray-300",
      Approved: "bg-blue-600 text-white",
      Rejected: "bg-red-600 text-white",
    })[status];

  const handleViewDetails = (claim: ExpenseClaimView) => {
    setSelectedClaim(claim);
    setIsDetailsModalOpen(true);
  };

  const handleSelectClaim = (claimId: number) => {
    setSelectedClaims((prev) =>
      prev.includes(claimId)
        ? prev.filter((id) => id !== claimId)
        : [...prev, claimId],
    );
  };

  const handleSelectAllOnPage = (
    e: React.ChangeEvent<HTMLInputElement>,
    pageData: ExpenseClaimView[],
  ) => {
    if (e.target.checked) {
      const pageIds = pageData.map((c) => c.id);
      setSelectedClaims((prev) => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = pageData.map((c) => c.id);
      setSelectedClaims((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedClaims.length === 0) {
      toast.info("No claims selected for approval.");
      return;
    }

    try {
      const result = await bulkApproveClaims(selectedClaims);
      toast.success(result.message);
      setSelectedClaims([]);
      fetchData();
    } catch {
      toast.error("Bulk approval failed. Please try again.");
    }
  };

  useEffect(() => {
    setSelectedClaims([]);
  }, [activeTab]);

  const renderTable = (
    data: ExpenseClaimView[],
    viewType: "myClaims" | "approvals" | "history",
  ) => {
    const isApprovalView = viewType === "approvals";
    const areAllVisibleSelected =
      isApprovalView &&
      data.length > 0 &&
      data.every((claim) => selectedClaims.includes(claim.id));

    return (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f07837] text-white uppercase text-xs">
              <tr>
                {isApprovalView && (
                  <th scope="col" className="px-6 py-3">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAllOnPage(e, data)}
                      checked={areAllVisibleSelected}
                      title="Select all on this page"
                    />
                  </th>
                )}
                <th scope="col" className="px-6 py-3 font-medium">
                  Claim ID
                </th>
                {(viewType === "approvals" || viewType === "history") && (
                  <th scope="col" className="px-6 py-3 font-medium">
                    Employee
                  </th>
                )}
                {viewType === "myClaims" && (
                  <th scope="col" className="px-6 py-3 font-medium">
                    Approver
                  </th>
                )}
                <th scope="col" className="px-6 py-3 font-medium">
                  Expense Type
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-2">
                    {<LogoLoader />}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    No claims found.
                  </td>
                </tr>
              ) : (
                data.map((claim) => (
                  <tr key={claim.id} className="border-b hover:bg-gray-50">
                    {isApprovalView && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedClaims.includes(claim.id)}
                          onChange={() => handleSelectClaim(claim.id)}
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      EXP{claim.id.toString().padStart(3, "0")}
                    </td>
                    {(viewType === "approvals" || viewType === "history") && (
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {claim.employeeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({claim.employeeCode})
                        </div>
                      </td>
                    )}
                    {viewType === "myClaims" && (
                      <td className="px-6 py-4">{claim.approverName}</td>
                    )}
                    <td className="px-6 py-4">{claim.expenseTypeName}</td>
                    <td className="px-6 py-4">
                      {claim.status === "Approved" &&
                      claim.approvedAmount &&
                      claim.approvedAmount !== claim.amount ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-700">
                            ₹{claim.approvedAmount.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            (was ₹{claim.amount.toLocaleString("en-IN")})
                          </span>
                        </div>
                      ) : (
                        <span>₹{claim.amount.toLocaleString("en-IN")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(claim.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          claim.status,
                        )}`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-gray-500">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleViewDetails(claim)}
                        >
                          <Eye size={18} />
                        </button>
                        {viewType === "approvals" &&
                          claim.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprovalRequest(claim, "Approve")
                                }
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleApprovalRequest(claim, "Reject")
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        {viewType === "myClaims" &&
                          claim.status !== "Pending" && (
                            <button
                              onClick={() => handleViewDetails(claim)}
                              title="View Details"
                              className="hover:text-gray-700"
                            >
                              <HistoryIcon size={18} />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredData.length > 0 && (
          <Pagination
            totalItems={filteredData.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Claims</h1>
            <p className="text-gray-600 mt-1">
              Manage employee expense reimbursements
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className={buttonStyles.refresh}
              title="Refresh data"
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={buttonStyles.add}
            >
              + New Claim
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Claims"
            value={dashboardStats?.pendingClaims.toString() ?? "0"}
            description="Awaiting approval"
            bgColor="bg-[#2eacb3]"
            icon={<Clock size={20} className="text-blue-600" />}
          />
          <StatCard
            title="Approved Amount"
            value={`₹${
              dashboardStats?.approvedAmount.toLocaleString("en-IN") ?? "0"
            }`}
            description="This month"
            bgColor="bg-[#f7c343]"
            icon={<IndianRupee size={20} className="text-green-600" />}
          />
          <StatCard
            title="Processed"
            value={dashboardStats?.processedClaims.toString() ?? "0"}
            description="Claims this month"
            bgColor="bg-[#386487]"
            icon={<CheckCircle2 size={20} className="text-red-600" />}
          />
          <StatCard
            title="Rejected"
            value={dashboardStats?.rejectedClaims.toString() ?? "0"}
            description="Require revision"
            bgColor="bg-[#87b6a7]"
            icon={<Info size={20} className="text-purple-600" />}
          />
        </div>

        {/* Expense Categories and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-gray-800">
              Expense Categories
            </h2>
            <p className="text-sm text-gray-500 mb-4">Claims by expense type</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {dashboardStats && dashboardStats.expenseCategories.length > 0 ? (
                dashboardStats.expenseCategories.map((item) => (
                  <ExpenseCategoryItem
                    key={item.categoryName}
                    name={item.categoryName}
                    count={item.claimCount}
                    amount={item.totalAmount}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  No claims filed yet.
                </p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold text-gray-800">
              Quick Actions
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Expense claim management
            </p>
            <div className="space-y-3">
              <ActionItem
                label="Add New Claim"
                icon={<Plus size={20} />}
                isPrimary
                onClick={() => setIsCreateModalOpen(true)}
              />
              {pendingApprovals.length > 0 && (
                <ActionItem
                  label="Bulk Approve Claims"
                  icon={<ListChecks size={20} />}
                  onClick={handleBulkApprove}
                  disabled={selectedClaims.length === 0}
                />
              )}
              {/* {isUserAdminOrHr && (
                <ActionItem
                  label="Generate Expense Report"
                  icon={<FileText size={20} />}
                  isPrimary
                  onClick={() => setIsReportModalOpen(true)}
                />
              )} */}
              {/* <ActionItem
                label="Process Reimbursements"
                icon={<IndianRupee size={20} />}
              /> */}
            </div>
          </div>
        </div>

        {/* Main Table Section with Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("myClaims")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "myClaims"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              My Claims
            </button>
            {pendingApprovals.length > 0 && (
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-2 px-4 font-semibold ${
                  activeTab === "approvals"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                Team Approvals{" "}
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                  {pendingApprovals.length}
                </span>
              </button>
            )}
            {isUserAdminOrHr && (
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-4 font-semibold ${
                  activeTab === "history"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                Claim History
              </button>
            )}
          </div>

          <div className="relative w-full max-w-xs mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search claims..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {renderTable(paginatedData, activeTab)}
        </div>
      </div>

      <CreateExpenseClaim
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmProcessing}
        title={`${claimToProcess?.action} Claim`}
        message={`Are you sure you want to ${claimToProcess?.action?.toLowerCase()} this claim?`}
        confirmText={claimToProcess?.action || ""}
        confirmButtonVariant={
          claimToProcess?.action === "Approve" ? "primary" : "danger"
        }
      >
        <div className="space-y-4 text-left">
          {/* Section for Approved Amount */}
          {claimToProcess?.action === "Approve" && (
            <div>
              <label
                htmlFor="approvedAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Approved Amount (leave blank for full amount)
              </label>
              <input
                id="approvedAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 250"
              />
            </div>
          )}

          {/* Section for Remarks */}
          <div>
            <label
              htmlFor="managerRemarks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Remarks{" "}
              {claimToProcess?.action === "Reject" && (
                <span className="text-red-500">(Required)</span>
              )}
            </label>
            <textarea
              id="managerRemarks"
              value={managerRemarks}
              onChange={(e) => setManagerRemarks(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Provide remarks for approval or rejection..."
            />
          </div>
        </div>
      </ConfirmationModal>

      <ClaimDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        claim={selectedClaim}
      />

      <GenerateReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </>
  );
};

export default ExpenseClaims;
