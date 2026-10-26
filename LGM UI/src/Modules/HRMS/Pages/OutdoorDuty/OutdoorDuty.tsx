import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Eye, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import CreateOutdoorDuty from "./CreateOutdoorDuty";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import {
  getMyODs,
  getPendingODs,
  updateODStatus,
  getODHistory,
  type OutdoorDutyView,
  type UpdateODStatusPayload,
} from "./outdoorDutyService";
import Pagination from "../../../../Components/Common/Pagination";
import ODDetailsModal from "./ODDetailsModal";
import {
  actionButtonStyles,
  buttonStyles,
} from "../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const isUserInRole = (role: string): boolean => {
  const token = sessionStorage.getItem("token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roles =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (Array.isArray(roles)) {
      return roles.some((r) => role.split(",").includes(r));
    }
    return role.split(",").includes(roles);
  } catch (e) {
    console.error("Failed to parse token for role check:", e);
    return false;
  }
};

const OutdoorDuty: React.FC = () => {
  const [myODs, setMyODs] = useState<OutdoorDutyView[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<OutdoorDutyView[]>(
    [],
  );
  const [odHistory, setOdHistory] = useState<OutdoorDutyView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "myRequests" | "approvals" | "history"
  >("myRequests");

  const [isManagerOrAdmin, setIsManagerOrAdmin] = useState(false);
  const [isAdminOrHr, setIsAdminOrHr] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOD, setSelectedOD] = useState<OutdoorDutyView | null>(null);

  const [requestToProcess, setRequestToProcess] = useState<{
    id: number;
    action: "Approve" | "Reject";
  } | null>(null);
  const [managerRemarks, setManagerRemarks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    setIsManagerOrAdmin(
      isUserInRole(
        "Manager,Admin,HR,Employee,Sales,Vehicle Testing,Support,Development,Account",
      ),
    );
    setIsAdminOrHr(
      isUserInRole(
        "Manager,Admin,HR,Employee,Sales,Vehicle Testing,Support,Development,Account",
      ),
    );
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const promises = [getMyODs()];

      if (isManagerOrAdmin) {
        promises.push(getPendingODs());
      }
      if (isAdminOrHr) {
        promises.push(getODHistory());
      }

      const results = await Promise.allSettled(promises);

      const myODsResult = results[0];
      if (myODsResult.status === "fulfilled") {
        setMyODs(myODsResult.value);
      } else {
        console.error("Failed to fetch MyODs:", myODsResult.reason);
        toast.error("Could not load your personal requests.");
      }

      let currentIndex = 1;

      if (isManagerOrAdmin) {
        const pendingResult = results[currentIndex];
        if (pendingResult?.status === "fulfilled") {
          const pendingData = pendingResult.value;
          setPendingApprovals(pendingData);
          if (pendingData.length > 0) {
            setActiveTab("approvals");
          }
        } else {
          console.error(
            "Failed to fetch pending approvals:",
            pendingResult?.reason,
          );
        }
        currentIndex++;
      }

      if (isAdminOrHr) {
        const historyResult = results[currentIndex];
        if (historyResult?.status === "fulfilled") {
          setOdHistory(historyResult.value);
        } else {
          console.error("Failed to fetch OD history:", historyResult?.reason);
        }
      }
    } catch (error) {
      console.error("An unexpected error occurred in fetchData:", error);
      toast.error("An unexpected error occurred while fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, [isManagerOrAdmin, isAdminOrHr]);

  useEffect(() => {
    fetchData();
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };
  const handleApprovalRequest = (id: number, action: "Approve" | "Reject") => {
    setRequestToProcess({ id, action });
    setIsConfirmModalOpen(true);
    setManagerRemarks("");
  };

  const handleConfirmProcessing = async () => {
    if (!requestToProcess) return;
    const { id, action } = requestToProcess;
    const payload: UpdateODStatusPayload = {
      status: action === "Approve" ? "Approved" : "Rejected",
      managerRemarks: managerRemarks.trim() || undefined,
    };

    if (payload.status === "Rejected" && !payload.managerRemarks) {
      toast.error("Remarks are required for rejection.");
      return;
    }

    try {
      await updateODStatus(id, payload);
      toast.success(
        `Request has been ${payload.status.toLowerCase()} successfully.`,
      );
      fetchData();
    } catch {
      toast.error("Failed to process the request.");
    } finally {
      setIsConfirmModalOpen(false);
      setRequestToProcess(null);
    }
  };

  const getStatusBadgeClass = (status: OutdoorDutyView["status"]) =>
    ({
      Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
      Approved: "bg-green-100 text-green-800 border border-green-300",
      Rejected: "bg-red-100 text-red-800 border border-red-300",
    })[status];

  const filteredData = useMemo(() => {
    let dataToFilter: OutdoorDutyView[];
    if (activeTab === "myRequests") {
      dataToFilter = myODs;
    } else if (activeTab === "approvals") {
      dataToFilter = pendingApprovals;
    } else {
      dataToFilter = odHistory;
    }

    if (!searchQuery) return dataToFilter;
    const q = searchQuery.toLowerCase();
    return dataToFilter.filter(
      (od) =>
        od.employeeName.toLowerCase().includes(q) ||
        od.description.toLowerCase().includes(q) ||
        `OD${od.id.toString().padStart(3, "0")}`.toLowerCase().includes(q),
    );
  }, [activeTab, myODs, pendingApprovals, odHistory, searchQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleViewDetails = (od: OutdoorDutyView) => {
    setSelectedOD(od);
    setIsDetailsModalOpen(true);
  };

  const renderTable = (
    data: OutdoorDutyView[],
    viewType: "myRequests" | "approvals" | "history",
  ) => {
    const showEmployeeColumn =
      viewType === "approvals" || viewType === "history";

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-t-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f07837] text-white uppercase text-xs">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
              >
                Request ID
              </th>
              {showEmployeeColumn && (
                <th
                  scope="col"
                  className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
                >
                  Employee
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
              >
                Duration / Dates
              </th>
              <th
                scope="col"
                className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
              >
                Applied On
              </th>
              <th
                scope="col"
                className="px-6 py-3 font-semibold border-r border-[#2a4a7a]"
              >
                Status
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? 8 : 7}
                  className="text-center py-0"
                >
                 {<LogoLoader />}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={showEmployeeColumn ? 8 : 7}
                  className="text-center py-8"
                >
                  No requests found.
                </td>
              </tr>
            ) : (
              data.map((od) => (
                <tr key={od.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    OD{od.id.toString().padStart(3, "0")}
                  </td>
                  {showEmployeeColumn && (
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {od.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({od.employeeCode})
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {od.totalDays === 1 ? "1 Day" : `${od.totalDays} Days`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(od.fromDate).toLocaleDateString()}
                        {od.fromDate !== od.toDate &&
                          ` - ${new Date(od.toDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 max-w-sm truncate"
                    title={od.description}
                  >
                    {od.description}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(od.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                        od.status,
                      )}`}
                    >
                      {od.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-gray-500">
                      <button
                        onClick={() => handleViewDetails(od)}
                        className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {viewType === "approvals" && od.status === "Pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleApprovalRequest(od.id, "Approve")
                            }
                            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleApprovalRequest(od.id, "Reject")
                            }
                            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                            title="Reject"
                          >
                            <X size={18} />
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
      <div className="p-6 bg-gray-50 min-h-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Outdoor Duty (OD)
            </h1>
            <p className="text-gray-600 mt-1">
              Manage outdoor visit requests and approvals.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={buttonStyles.refresh}
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
              + New Request
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("myRequests")}
              className={`py-2 px-4 font-semibold ${
                activeTab === "myRequests"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              My Requests
            </button>
            {isManagerOrAdmin && (
              <button
                onClick={() => setActiveTab("approvals")}
                className={`py-2 px-4 font-semibold ${
                  activeTab === "approvals"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                Team Approvals
                {pendingApprovals.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
            {/* Conditionally render the History tab */}
            {isAdminOrHr && (
              <button
                onClick={() => setActiveTab("history")}
                className={`py-2 px-4 font-semibold ${
                  activeTab === "history"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                History
              </button>
            )}
          </div>
          <div className="relative w-full max-w-xs mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {renderTable(paginatedData, activeTab)}
        </div>
      </div>
      <CreateOutdoorDuty
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmProcessing}
        title={`${requestToProcess?.action} Request`}
        message={`Are you sure you want to ${requestToProcess?.action?.toLowerCase()} this request?`}
        confirmText={requestToProcess?.action || ""}
        confirmButtonVariant={
          requestToProcess?.action === "Approve" ? "primary" : "danger"
        }
      >
        {/* This modal only needs the remarks field, but we can structure it for future additions */}
        <div className="space-y-4 text-left mt-4">
          <div>
            <label
              htmlFor="odManagerRemarks"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Remarks{" "}
              {requestToProcess?.action === "Reject" && (
                <span className="text-red-500">(Required)</span>
              )}
            </label>
            <textarea
              id="odManagerRemarks"
              value={managerRemarks}
              onChange={(e) => setManagerRemarks(e.target.value)}
              rows={3}
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={
                requestToProcess?.action === "Approve"
                  ? "Optional: Provide remarks for approval..."
                  : "Provide a reason for rejection..."
              }
            />
          </div>
        </div>
      </ConfirmationModal>

      <ODDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        odRequest={selectedOD}
      />
    </>
  );
};

export default OutdoorDuty;
