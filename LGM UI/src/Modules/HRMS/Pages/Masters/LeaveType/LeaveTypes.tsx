import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllLeaveTypes,
  deleteLeaveType,
  createLeaveType, // Import createLeaveType
  type LeaveType,
} from "./Services/LeaveTypeService";
import EditLeaveTypeModal from "./EditLeaveTypeModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { FaEdit, FaTrash } from "react-icons/fa";

const LeaveTypes: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State for the inline create form
  const [newLeaveTypeName, setNewLeaveTypeName] = useState("");

  // State for modals and selections
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);

  // State for filtering and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchLeaveTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllLeaveTypes();
      setLeaveTypes(data);
    } catch  {
      toast.error("Failed to fetch leave types.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  // Handle form submission for creating a new leave type
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveTypeName.trim()) {
      toast.error("Leave type name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await createLeaveType({ leaveTypeName: newLeaveTypeName });
      toast.success("Leave type created successfully!");
      setNewLeaveTypeName(""); // Reset form field
      fetchLeaveTypes(); // Refresh the list
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to create leave type: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Memoized filtering logic
  const filteredLeaveTypes = useMemo(() => {
    return leaveTypes.filter((lt) =>
      lt.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leaveTypes, searchQuery]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeaveTypes.length / itemsPerPage);

  // Memoized pagination logic
  const paginatedLeaveTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeaveTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeaveTypes, currentPage, itemsPerPage]);

  const handleEditClick = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (leaveType: LeaveType) => {
    setSelectedLeaveType(leaveType);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLeaveType) return;
    try {
      await deleteLeaveType(selectedLeaveType.id);
      toast.success(
        `Leave type "${selectedLeaveType.leaveTypeName}" deleted successfully.`
      );
      fetchLeaveTypes();
    } catch  {
      toast.error("Failed to delete leave type.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedLeaveType(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        {/* Create Leave Type Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create New Leave Type
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-4">
<div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type Name
              </label>
              <input
                type="text"
                value={newLeaveTypeName}
                onChange={(e) => setNewLeaveTypeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Sick Leave, Annual Leave"
                required
              />
            </div>
            <div className="w-full md:w-auto">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} />
                )}
                {isSaving ? "Saving..." : "Add Type"}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Leave Types Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Existing Leave Types
            </h2>
             <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by leave type name..."
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">Leave Type Name</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Loading Leave Types...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedLeaveTypes.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No leave types found.
                    </td>
                  </tr>
                ) : (
                  paginatedLeaveTypes.map((lt) => (
                    <tr key={lt.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {lt.leaveTypeName}
                      </td>
                    <td className="px-6 py-4">
  <div className="flex items-center justify-end gap-4">
    <button
      onClick={() => handleEditClick(lt)}
      className="text-blue-600 hover:text-blue-800 transition-colors"
      title="Edit"
    >
      <FaEdit size={16} />
    </button>
    <button
      onClick={() => handleDeleteRequest(lt)}
      className="text-red-600 hover:text-red-800 transition-colors"
      title="Delete"
    >
      <FaTrash size={16} />
    </button>
  </div>
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="p-1 border border-gray-300 rounded-md bg-white"
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
      </div>
      {selectedLeaveType && (
        <EditLeaveTypeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLeaveType(null);
          }}
          onSuccess={fetchLeaveTypes}
          leaveType={selectedLeaveType}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Leave Type"
        message={`Are you sure you want to delete the leave type "${selectedLeaveType?.leaveTypeName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default LeaveTypes;