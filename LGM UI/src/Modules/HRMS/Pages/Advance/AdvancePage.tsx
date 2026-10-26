import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  DollarSign,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllAdvances,
  deleteAdvance,
  type Advance,
} from "./Services/AdvanceService";
import {
  getEmployeeSelectionList,
  type EmployeeSelectItem,
} from "../../Services/MasterDataService";
import AdvanceModal from "./AdvanceModal";
import AdvanceRepaymentModal from "./AdvanceRepaymentModal";
import AdvanceHistoryModal from "./AdvanceHistoryModal";
import { useAuth } from "../../../../hooks/useAuth";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { usePermissions } from "../../../../hooks/usePermissions";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const AdvancePage: React.FC = () => {
  const { user } = useAuth();
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [advanceToDelete, setAdvanceToDelete] = useState<{
    id: number;
    employeeName: string;
  } | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Advance Management", "CanAdd");
  const canEdit = hasPermission("Advance Management", "CanEdit");
  const canDelete = hasPermission("Advance Management", "CanDelete");

  // === 1. PAGINATION SAATHI NAVIN STATE ===
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10 rows per page

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [advancesData, employeesData] = await Promise.all([
        getAllAdvances(),
        getEmployeeSelectionList(),
      ]);
      setAdvances(advancesData);
      setEmployees(employeesData);
    } catch {
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRepaymentModal = (advance: Advance) => {
    setSelectedAdvance(advance);
    setIsRepaymentModalOpen(true);
  };

  const handleOpenHistoryModal = (advance: Advance) => {
    setSelectedAdvance(advance);
    setIsHistoryModalOpen(true);
  };

  const handleDeleteRequest = (id: number, employeeName: string) => {
    setAdvanceToDelete({ id, employeeName });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!advanceToDelete) return;
    try {
      await deleteAdvance(advanceToDelete.id);
      toast.success(
        `Advance for '${advanceToDelete.employeeName}' has been deleted.`,
      );
      fetchData(); // Refresh data
    } catch {
      toast.error("Failed to delete the advance record.");
    } finally {
      setIsConfirmModalOpen(false);
      setAdvanceToDelete(null);
    }
  };

  const filteredAdvances = useMemo(() => {
    return advances.filter(
      (adv) =>
        adv.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adv.status.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [advances, searchQuery]);

  // === 2. PAGINATION SAATHI LOGIC ===

  // Search kelyavar page 1 var reset karnya sathi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Total pages calculate karne
  const totalPages = Math.ceil(filteredAdvances.length / itemsPerPage);

  // Current page var dakhvanya sathi data slice karne
  const paginatedAdvances = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAdvances.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAdvances, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string, balance: number) => {
    if (balance === 0 && (status === "Paid" || status === "Partially Paid"))
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Paid
        </span>
      );
    if (status === "Partially Paid")
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Partially Paid
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
        Approved
      </span>
    );
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Advance Management
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage employee advance payments and repayments.
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={buttonStyles.add}
          >
            + Add Advance
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative w-full max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-[#f07837] text-white text-xs uppercase">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Employee Name
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Total Advance (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Repaid (₹)
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Balance (₹)
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-2">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      {<LogoLoader />}
                    </div>
                  </td>
                </tr>
              ) : paginatedAdvances.length === 0 ? ( // === BADAL: paginatedAdvances vaparla ===
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No advance records found.
                  </td>
                </tr>
              ) : (
                paginatedAdvances.map(
                  (
                    adv, // === BADAL: paginatedAdvances vaparla ===
                  ) => (
                    <tr
                      key={adv.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {adv.employeeName}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {adv.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600">
                        {adv.totalRepaid.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-red-600">
                        {adv.balance.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(adv.status, adv.balance)}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => handleOpenRepaymentModal(adv)}
                            disabled={adv.balance === 0}
                            className="p-1 text-green-600 hover:text-green-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="Add Repayment"
                          >
                            <DollarSign size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenHistoryModal(adv)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View History"
                        >
                          <History size={16} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() =>
                              handleDeleteRequest(adv.id, adv.employeeName)
                            }
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* === 3. PAGINATION CONTROLS UI === */}
        {filteredAdvances.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="p-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AdvanceModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={fetchData}
          employees={employees}
        />
      )}

      {isRepaymentModalOpen && selectedAdvance && (
        <AdvanceRepaymentModal
          isOpen={isRepaymentModalOpen}
          onClose={() => setIsRepaymentModalOpen(false)}
          onSave={fetchData}
          advanceId={selectedAdvance.id}
          balance={selectedAdvance.balance}
          currentUserId={user?.employeeId || 0}
        />
      )}

      {isHistoryModalOpen && selectedAdvance && (
        <AdvanceHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          advanceId={selectedAdvance.id}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Advance Record"
        message={`Are you sure you want to delete the advance for '${advanceToDelete?.employeeName}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AdvancePage;
