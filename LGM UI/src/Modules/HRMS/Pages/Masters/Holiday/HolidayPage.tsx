import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import CreateHoliday from "./CreateHoliday";
import UpdateHoliday from "./UpdateHoliday";
import { FaEdit, FaTrash } from "react-icons/fa";
import { usePermissions } from "../../../../../hooks/usePermissions";

// 1. Interface updated for Holiday data
interface Holiday {
  id: number;
  date: string; // Dates from APIs are typically ISO strings
  description: string;
  year: number;
}

const HolidayPage: React.FC = () => {
  // 2. State variables renamed for clarity
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [holidayToEditId, setHolidayToEditId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<{
    id: number;
    description: string;
  } | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Holiday", "CanAdd");
  const canEdit = hasPermission("Holiday", "CanEdit");
  const canDelete = hasPermission("Holiday", "CanDelete");

  // 3. Data fetching logic adapted for Holidays
  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use the correct API endpoint
      const response = await apiClient.get(API_ENDPOINTS.Holiday);
      setHolidays(response.data);
    } catch {
      setError("Failed to fetch holidays.");
      toast.error("Failed to fetch holidays.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // 4. Filtering logic adapted to search by description or year
  const filteredHolidays = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return holidays;
    return holidays.filter(
      (h) =>
        h.description.toLowerCase().includes(searchLower) ||
        h.year.toString().includes(searchLower),
    );
  }, [holidays, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const paginatedHolidays = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHolidays.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHolidays, currentPage, itemsPerPage]);

  const handleAddClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (holiday: Holiday) => {
    setHolidayToEditId(holiday.id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, description: string) => {
    setHolidayToDelete({ id, description });
    setIsConfirmModalOpen(true);
  };

  // 5. Delete logic adapted for Holidays
  const handleConfirmDelete = async () => {
    if (!holidayToDelete) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.Holiday}/${holidayToDelete.id}`);
      toast.success(
        `Holiday '${holidayToDelete.description}' has been deleted successfully.`,
      );
      fetchHolidays(); // Refresh data
    } catch (error: unknown) {
      type ApiError = { response?: { data?: { message?: string } } };
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Failed to delete holiday.";
      toast.error(errorMessage);
    } finally {
      setIsConfirmModalOpen(false);
      setHolidayToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        {/* Header - Text updated for Holidays */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Holiday Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage the company's holiday list for each year
            </p>
          </div>
          {canAdd && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg  transition-colors"
            >
              <Plus size={18} />
              Add Holiday
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalendarDays size={22} /> Holiday List
          </h2>

          {/* Search Bar - Placeholder updated */}
          <div className="relative w-full md:max-w-sm mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by description or year..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Holidays Table - Columns and data mapping updated */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredHolidays.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No holidays found.
                    </td>
                  </tr>
                ) : (
                  paginatedHolidays.map((holiday) => (
                    <tr
                      key={holiday.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {holiday.description}
                      </td>
                      <td className="px-6 py-4">
                        {/* Format date for better readability */}
                        {new Date(holiday.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">{holiday.year}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {canEdit && (
                            <button
                              onClick={() => handleEditClick(holiday)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit Holiday"
                            >
                              <FaEdit size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() =>
                                handleDeleteRequest(
                                  holiday.id,
                                  holiday.description,
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Delete Holiday"
                            >
                              <FaTrash size={18} />
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

          {/* Pagination - No changes needed here */}
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
      </div>

      {/* Modals - Updated to use Holiday components */}
      <CreateHoliday
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchHolidays}
      />

      <UpdateHoliday
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchHolidays();
          setIsUpdateModalOpen(false);
        }}
        holidayId={holidayToEditId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Holiday"
        message={`Are you sure you want to delete the holiday '${holidayToDelete?.description}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default HolidayPage;
