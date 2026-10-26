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
  getAllRoles,
  createRole,
  deleteRole,
  type Role,
} from "./Services/RoleService";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import EditRoleModal from "./EditRoleModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Role | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch {
      toast.error("Failed to fetch roles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Role name cannot be empty.");
    setIsSaving(true);
    try {
      await createRole({ name: newName });
      toast.success("Role created successfully!");
      setNewName("");
      fetchItems();
    } catch {
      toast.error("Failed to create role. It may already exist.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = useMemo(
    () =>
      roles.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [roles, searchQuery],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleEditClick = (item: Role) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteRequest = (item: Role) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteRole(selectedItem.name);
      toast.success(`Role "${selectedItem.name}" deleted.`);
      fetchItems();
    } catch {
      toast.error("Failed to delete role. It may be in use.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Role
          </h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-end gap-4"
          >
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., Manager, Employee"
                required
              />
            </div>
            <div className="w-full md:w-auto">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 bg-[#f07837] hover:bg-[#0d3357] text-white font-semibold px-4 py-2 rounded-lg  disabled:bg-[#f07837] disabled:cursor-not-allowed h-[42px]"
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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Existing Roles
          </h2>
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by role name..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white text-xs uppercase">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Role Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                        <Loader2 className="animate-spin" size={20} />
                        <span>Loading Roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
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
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-md hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
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

        {selectedItem && (
          <EditRoleModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
            onSuccess={fetchItems}
            role={selectedItem}
          />
        )}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Role"
          message={`Are you sure you want to delete "${selectedItem?.name}"? This cannot be undone.`}
          confirmButtonVariant="danger"
        />
      </div>
    </>
  );
};

export default Roles;
