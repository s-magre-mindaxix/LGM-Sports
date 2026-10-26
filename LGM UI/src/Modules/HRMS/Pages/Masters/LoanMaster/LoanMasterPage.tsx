import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  getLoanMasters,
  createLoanMaster,
  deleteLoanMaster,
  getLoanMaster,
} from "./LoanMasterService";

import EditLoanMasterModal from "./EditLoanMasterModal";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { FaEdit, FaTrash } from "react-icons/fa";

interface LoanMaster {
  id: number;
  loanTypeName: string;
  description?: string;
  isDeleted: boolean;
}

const LoanMasterPage: React.FC = () => {
  const [items, setItems] = useState<LoanMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LoanMaster | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // FETCHING ALL LOAN TYPES
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getLoanMasters(true); // fetch all inc. deleted
      setItems(response.data);
      setCurrentPage(1); // VERY IMPORTANT
    } catch {
      toast.error("Failed to fetch loan types.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error("Loan type name is required.");

    setIsSaving(true);
    try {
      await createLoanMaster({
        loanTypeName: newName,
        description: newDescription,
      });
      toast.success("Loan type created!");
      setNewName("");
      setNewDescription("");
      fetchItems();
    } catch {
      toast.error("Creation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // SEARCH FILTER
  const filteredItems = useMemo(
    () =>
      items.filter((d) =>
        d.loanTypeName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [items, searchQuery],
  );

  // PAGINATION CALCULATION
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // DON'T ALLOW INVALID PAGE NUMBER
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages === 0 ? 1 : totalPages);
    }
  }, [totalPages]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handleEditClick = async (item: LoanMaster) => {
    try {
      const res = await getLoanMaster(item.id);
      setSelectedItem(res.data);
      setIsEditModalOpen(true);
    } catch {
      toast.error("Unable to load record.");
    }
  };

  const handleDeleteRequest = (item: LoanMaster) => {
    setSelectedItem(item);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteLoanMaster(selectedItem.id);
      toast.success("Marked as deleted.");
      fetchItems();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      {/* CREATE CARD */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">Add New Loan Type</h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-end gap-4"
        >
          <div className="w-full md:w-1/3">
            <label className="text-sm">Loan Type Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
              placeholder="e.g., Personal Loan"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="text-sm">Description</label>
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full border px-3 py-2 rounded text-sm"
            />
          </div>

          <button
            disabled={isSaving}
            className="bg-[#f07837]  text-white px-4 py-2 rounded flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            {isSaving ? "Saving..." : "Add"}
          </button>
        </form>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full md:max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search loan type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border rounded text-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-sm rounded p-6">
        <table className="w-full text-sm">
          <thead className="bg-[#f07837] text-white uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Loan Type</th>
              <th className="px-6 py-3 text-left">Description</th>
              <th className="px-6 py-3 text-left">Deleted</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  <Loader2 className="animate-spin" />
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No loan types found.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{item.loanTypeName}</td>
                  <td className="px-6 py-4">{item.description}</td>

                  {/* SHOW Yes/No */}
                  <td className="px-6 py-4">{item.isDeleted ? "Yes" : "No"}</td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-4">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </button>

                      {/* Delete Button (only shows if item is not already deleted) */}
                      {!item.isDeleted && (
                        <button
                          onClick={() => handleDeleteRequest(item)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
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

      {/* PAGINATION */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="p-1 border rounded"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* PAGE NUMBER */}
          <div className="flex items-center gap-4">
            Page {currentPage} of {totalPages || 1}
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 border rounded disabled:text-gray-300"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 border rounded disabled:text-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedItem && (
        <EditLoanMasterModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchItems}
          loanMaster={selectedItem}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Loan Type"
        message={`Are you sure you want to delete "${selectedItem?.loanTypeName}"?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default LoanMasterPage;
