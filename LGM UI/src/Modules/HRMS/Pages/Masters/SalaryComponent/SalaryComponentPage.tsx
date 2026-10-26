import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import CreateSalaryComponent from "./CreateSalaryComponent";
import UpdateSalaryComponent from "./UpdateSalaryComponent";
import { FaEdit, FaTrash } from "react-icons/fa";

interface SalaryComponent {
  id: number;
  componentName: string;
  componentType: "Earning" | "Deduction";
  isTaxable: boolean;
}

const SalaryComponentPage: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [componentToEditId, setComponentToEditId] = useState<number | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_ENDPOINTS.SalaryComponents);
      setComponents(response.data);
    } catch {
      setError("Failed to fetch salary components.");
      toast.error("Failed to fetch salary components.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  const filteredComponents = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return components;
    return components.filter((c) =>
      c.componentName.toLowerCase().includes(searchLower),
    );
  }, [components, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Calculate total pages and the items for the current page
  const totalPages = Math.ceil(filteredComponents.length / itemsPerPage);
  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredComponents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredComponents, currentPage, itemsPerPage]);

  const handleAddClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (component: SalaryComponent) => {
    setComponentToEditId(component.id); // Set the ID of the component to edit
    setIsUpdateModalOpen(true); // Open the update modal
  };
  const handleDeleteRequest = (id: number, name: string) => {
    setComponentToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!componentToDelete) return;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.SalaryComponents}/${componentToDelete.id}`,
      );
      toast.success(
        `'${componentToDelete.name}' has been deleted successfully.`,
      );
      fetchComponents();
    } catch (error: unknown) {
      // <-- THE CHANGE IS HERE
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Failed to delete component.";
      toast.error(errorMessage);
    } finally {
      setIsConfirmModalOpen(false);
      setComponentToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Salary Components
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all earning and deduction types
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg  transition-colors"
          >
            <Plus size={18} />
            Create Component
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Component List
          </h2>

          {/* Search Bar */}
          <div className="relative w-full md:max-w-sm mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by component name..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Components Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Component Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Component Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Is Taxable
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
                ) : filteredComponents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No components found.
                    </td>
                  </tr>
                ) : (
                  paginatedComponents.map((component) => (
                    <tr
                      key={component.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {component.componentName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            component.componentType.toLowerCase() === "earning"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {component.componentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {component.isTaxable ? "Yes" : "No"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* --- THIS BUTTON IS ADDED --- */}
                          <button
                            onClick={() => handleEditClick(component)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                component.id,
                                component.componentName,
                              )
                            }
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

      {/* --- Modals --- */}

      <CreateSalaryComponent
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchComponents} // This will refresh the table data
      />

      <UpdateSalaryComponent
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchComponents();
          setIsUpdateModalOpen(false); // Ensure modal closes on success
        }}
        componentId={componentToEditId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Salary Component"
        message={`Are you sure you want to delete '${componentToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default SalaryComponentPage;
