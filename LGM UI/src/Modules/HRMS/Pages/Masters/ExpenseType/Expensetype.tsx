import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import UpdateExpenseType from "./UpdateExpenseType";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { FaEdit, FaTrash } from "react-icons/fa";

interface ExpenseType {
  id: number;
  expenseTypeName: string;
}

const ExpenseTypePage: React.FC = () => {
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExpenseTypeName, setNewExpenseTypeName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [expenseTypeToEditId, setExpenseTypeToEditId] = useState<number | null>(
    null,
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [expenseTypeToDelete, setExpenseTypeToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fetchExpenseTypes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_ENDPOINTS.ExpenseType);
      setExpenseTypes(response.data);
    } catch {
      setError("Failed to fetch expense types.");
      toast.error("Failed to fetch expense types.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenseTypes();
  }, [fetchExpenseTypes]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseTypeName.trim()) {
      toast.error("Expense type name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.ExpenseType, {
        expenseTypeName: newExpenseTypeName.trim(),
        isDeleted: false,
      });
      toast.success("Expense type created successfully!");
      fetchExpenseTypes();
      setNewExpenseTypeName("");
    } catch (error: unknown) {
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Failed to create expense type.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenseTypes = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return expenseTypes;
    return expenseTypes.filter((et) =>
      et.expenseTypeName.toLowerCase().includes(searchLower),
    );
  }, [expenseTypes, searchQuery]);

  const handleEditClick = (expenseType: ExpenseType) => {
    setExpenseTypeToEditId(expenseType.id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setExpenseTypeToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!expenseTypeToDelete) return;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.ExpenseType}/${expenseTypeToDelete.id}`,
      );
      toast.success(
        `'${expenseTypeToDelete.name}' has been deleted successfully.`,
      );
      fetchExpenseTypes();
    } catch (error: unknown) {
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const apiError = error as ApiError;
      const errorMessage =
        apiError.response?.data?.message || "Failed to delete expense type.";
      toast.error(errorMessage);
    } finally {
      setIsConfirmModalOpen(false);
      setExpenseTypeToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expense Types</h1>
          <p className="text-gray-600 mt-1">
            Manage core organizational data like expense types.
          </p>
        </div>

        {/* --- ADD NEW EXPENSE TYPE FORM (changed from modal) --- */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Expense Type
          </h2>

          <form
            onSubmit={handleCreateSubmit}
            className="flex items-center gap-3" // Input & Button aligned in one row
          >
            {/* Input Box */}
            <div className="flex flex-col">
              <label
                htmlFor="expenseTypeName"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Expense Type Name
              </label>

              <input
                id="expenseTypeName"
                type="text"
                placeholder="e.g., Travel, Meals, Office Supplies"
                className="w-64 px-4 py-2 border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newExpenseTypeName}
                onChange={(e) => setNewExpenseTypeName(e.target.value)}
              />
            </div>

            {/* Add Button */}
            <button
              type="submit"
              className="mt-6 flex items-center gap-2 bg-[#f07837] text-white 
                 font-semibold px-5 py-2 rounded-lg  
                 transition-colors "
              disabled={isSubmitting}
            >
              <Plus size={18} />
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </form>
        </div>

        {/* --- EXPENSE TYPE LIST (previously Main Content Area) --- */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Search Bar */}
          <div className="relative w-full md:max-w-xs mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by expense type name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Expense Types Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Expense Type Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={2} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredExpenseTypes.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No expense types found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenseTypes.map((expenseType) => (
                    <tr
                      key={expenseType.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {expenseType.expenseTypeName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={() => handleEditClick(expenseType)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                expenseType.id,
                                expenseType.expenseTypeName,
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
        </div>
      </div>

      {/* --- Modals --- */}
      {/* The CreateExpenseType modal is no longer needed */}
      <UpdateExpenseType
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchExpenseTypes();
          setIsUpdateModalOpen(false);
        }}
        expenseTypeId={expenseTypeToEditId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Type"
        message={`Are you sure you want to delete '${expenseTypeToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default ExpenseTypePage;
