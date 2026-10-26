import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Search,
  FileEdit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
} from "lucide-react";
import CreateStructureModal from "./CreateStructureModal";
import UpdateStructureModal from "./UpdateStructureModal";
import ViewSalaryStructureModal from "./ViewSalaryStructureModal";
import ReviseStructureModal from "./ReviseStructureModal";
import { toast } from "sonner";
import { usePermissions } from "../../../../hooks/usePermissions";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import LogoLoader from "../../../../Components/Common/LogoLoader";

type SalaryStatus = "Active" | "Pending";

interface SalaryRecord {
  employeeID: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  basicPay: number;
  hra: number;
  conveyanceAllowance: number;
  productionIncentive: number;
  esic: number;
  pf: number;
  pt: number;
  tds: number;

  grossSalary: number;
  totalDeduction: number;
  netSalary: number;
  status: SalaryStatus;
}

interface DashboardStats {
  employeesMapped: number;
  avgBasicPay: number;
  pendingUpdates: number;
  totalStructures: number;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

const formatCurrency = (amount?: number) => {
  return `₹${(amount || 0).toLocaleString("en-IN")}`;
};

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

const SalaryStructure: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [employeeIdToView, setEmployeeIdToView] = useState<number | null>(null);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [employeeToRevise, setEmployeeToRevise] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleReviseClick = (employeeId: number, employeeName: string) => {
    setEmployeeToRevise({ id: employeeId, name: employeeName });
    setIsReviseModalOpen(true);
  };

  const handleViewClick = (employeeId: number) => {
    setEmployeeIdToView(employeeId);
    setIsViewModalOpen(true);
  };

  const filteredSalaryData = useMemo(() => {
    if (!searchQuery) {
      return salaryData;
    }

    const searchLower = searchQuery.toLowerCase();
    return salaryData.filter((record) => {
      const nameLower = record.employeeName.toLowerCase();
      const codeLower = record.employeeCode.toLowerCase();

      return nameLower.includes(searchLower) || codeLower.includes(searchLower);
    });
  }, [salaryData, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredSalaryData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSalaryData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSalaryData, currentPage, itemsPerPage]);

  const fetchPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [structureResponse, statsResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.SalaryStructureView),
        apiClient.get(API_ENDPOINTS.SalaryStructureDashboard),
      ]);
      setSalaryData(structureResponse.data);
      setDashboardStats(statsResponse.data);
    } catch (err) {
      setError("Failed to fetch data. Please check the API connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPageData();
    const handleRefresh = () => {
      fetchPageData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [fetchPageData]);

  const getStatusBadgeClass = (status: SalaryStatus) => {
    return status === "Active"
      ? "bg-[#f07837] text-white"
      : "bg-gray-100 text-gray-700 border border-gray-300";
  };

  const handleEditClick = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setStructureToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!structureToDelete) return;

    try {
      await apiClient.delete(
        `${API_ENDPOINTS.SalaryStructures}/${structureToDelete.id}`,
      );
      toast.success(
        `Salary structure for ${structureToDelete.name} has been deleted.`,
      );
      fetchPageData();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete structure.";
      toast.error(message);
    } finally {
      setIsConfirmModalOpen(false);
      setStructureToDelete(null);
    }
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Structure</h1>
          <p className="text-gray-600 mt-1">
            Define and manage salary components and structures
          </p>
        </div>
        {hasPermission("SalaryStructure", "CanAdd") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className={buttonStyles.add}
          >
            + Create Structure
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Structures"
          value={dashboardStats?.totalStructures?.toString() || "..."}
          description="Active structures"
          bgColor="bg-[#2eacb3]"
          icon={<DollarSign size={22} className="text-blue-600" />}
        />
        <StatCard
          title="Avg Basic Pay"
          value={formatCurrency(dashboardStats?.avgBasicPay)}
          description="Across all employees"
          bgColor="bg-[#f7c343]"
          icon={<TrendingUp size={22} className="text-green-600" />}
        />
        <StatCard
          title="Employees Mapped"
          value={dashboardStats?.employeesMapped?.toString() || "..."}
          description="With salary structure"
          bgColor="bg-[#386487]"
          icon={<Users size={22} className="text-red-600" />}
        />
        <StatCard
          title="Pending Updates"
          value={dashboardStats?.pendingUpdates?.toString() || "..."}
          description="Require approval"
          bgColor="bg-[#87b6a7]"
          icon={<DollarSign size={22} className="text-purple-600" />}
        />
      </div>

      {/* Salary Structures Table Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Salary Structures
          </h2>
          <p className="text-sm text-gray-500">
            Manage employee salary structures and components
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search structures..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-t-lg">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-[#f07837] text-white text-xs uppercase">
              <tr>
                {[
                  "Employee",
                  "Department",
                  "Basic Salary",
                  "HRA",
                  "Conve. Allowance",
                  "Production Incentive",
                  "Gross Salary",
                  "Net Salary",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="px-6 py-3 font-semibold tracking-wider text-left"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-2 text-gray-500">
                   {<LogoLoader />}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="text-center p-6 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filteredSalaryData.length > 0 ? (
                paginatedData.map((record) => (
                  <tr
                    key={record.employeeID}
                    className="bg-white border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {record.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({record.employeeCode})
                      </div>
                    </td>
                    <td className="px-6 py-4">{record.department}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(record.basicPay)}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(record.hra)}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(record.conveyanceAllowance)}
                    </td>{" "}
                    <td className="px-6 py-4">
                      {formatCurrency(record.productionIncentive)}
                    </td>{" "}
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(record.grossSalary)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {hasPermission("SalaryStructure", "CanView") && (
                          <button
                            onClick={() => handleViewClick(record.employeeID)}
                            className="text-blue-500 hover:text-blue-700"
                            title="View Structure History"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        {/* These buttons are hidden for the 'Employee' role */}
                        {hasPermission("SalaryStructure", "CanEdit") && (
                          <>
                            <button
                              onClick={() =>
                                handleReviseClick(
                                  record.employeeID,
                                  record.employeeName,
                                )
                              }
                              className="text-gray-500 hover:text-green-600"
                              title="Revise Structure"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleEditClick(record.employeeID)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit Structure"
                            >
                              <FileEdit size={18} />
                            </button>
                          </>
                        )}

                        {hasPermission("SalaryStructure", "CanDelete") && (
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                record.employeeID,
                                record.employeeName,
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                            title="Delete Structure"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // --- THIS IS THE MISSING PART THAT FIXES THE ERROR ---
                <tr>
                  <td colSpan={21} className="text-center p-8 text-gray-500">
                    No salary structures found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="p-1 border rounded-md"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md disabled:text-gray-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md disabled:text-gray-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateStructureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          console.log("Structure created, refreshing data...");
          fetchPageData();
        }}
      />
      <UpdateStructureModal
        isOpen={isUpdateModalOpen}
        employeeId={selectedEmployeeId}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          console.log("Structure updated, refreshing data...");
          fetchPageData();
          setIsUpdateModalOpen(false); // Also close the modal on success
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Salary Structure"
        message={`Are you sure you want to delete the salary structure for ${structureToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
      <ReviseStructureModal
        isOpen={isReviseModalOpen}
        employee={employeeToRevise}
        onClose={() => setIsReviseModalOpen(false)}
        onSuccess={() => {
          toast.success("Salary structure revised successfully.");
          fetchPageData();
          setIsReviseModalOpen(false);
        }}
      />
      <ViewSalaryStructureModal
        isOpen={isViewModalOpen}
        employeeId={employeeIdToView}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default SalaryStructure;
