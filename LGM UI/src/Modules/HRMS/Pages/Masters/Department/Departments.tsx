// src/Features/BasicMasters/Departments.tsx
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
  getAllDepartments,
  createDepartment,
  deleteDepartment,
  type Department,
} from "./Services/DepartmentService";
import EditDepartmentModal from "./EditDepartmentModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { FaEdit, FaTrash } from "react-icons/fa";

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Department | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllDepartments();
      setDepartments(data);
    } catch {
      toast.error("Failed to fetch departments.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Department name cannot be empty.");
    setIsSaving(true);
    try {
      await createDepartment({ departmentName: newName });
      toast.success("Department created successfully!");
      setNewName("");
      fetchItems();
    } catch {
      toast.error("Failed to create department.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      departments.filter((d) =>
        d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [departments, searchQuery],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleEditClick = (item: Department) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: Department) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteDepartment(selectedItem.id);
      toast.success(`Department "${selectedItem.departmentName}" deleted.`);
      fetchItems();
    } catch {
      toast.error("Failed to delete department.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      {/* Create Leave Type Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Add New Department
        </h3>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-end gap-4"
        >
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., Human Resources"
              required
            />
          </div>
          <div className="w-full md:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-[#f07837] hover:bg-[#0d3357] text-white font-semibold px-4 py-2 rounded-lg h-[42px]"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              {isSaving ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by department name..."
            className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <table className="w-full text-sm">
          <thead className="bg-[#f07837] text-white text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Department Name</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="text-center py-8">
                  <Loader2 className="animate-spin inline-block mr-2" />{" "}
                  Loading...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-8 text-gray-500">
                  No departments found.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.departmentName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handleEditClick(item)}
                        className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(item)}
                        className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
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

      {selectedItem && (
        <EditDepartmentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchItems}
          department={selectedItem}
        />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete "${selectedItem?.departmentName}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default Departments;
