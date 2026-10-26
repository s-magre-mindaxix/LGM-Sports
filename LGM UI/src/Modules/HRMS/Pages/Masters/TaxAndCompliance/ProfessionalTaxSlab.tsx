import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import UpdateProfessionalTaxSlabModal from "./UpdateProfessionalTaxSlabModal";
import CreateProfessionalTaxSlabModal from "./CreateProfessionalTaxSlabModal";
import { FaEdit, FaTrash } from "react-icons/fa";

interface ProfessionalTaxSlab {
  id: number;
  state: string;
   gender: string;
  minGrossSalary: number;
  maxGrossSalary?: number;
  taxAmount: number;
}

const formatCurrency = (amount?: number) =>
  `₹${(amount || 0).toLocaleString("en-IN")}`;

const ProfessionalTaxSlabPage: React.FC = () => {
  const [slabs, setSlabs] = useState<ProfessionalTaxSlab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [slabToDelete, setSlabToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [slabToEditId, setSlabToEditId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSlabs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.ProfessionalTaxSlabs);

      // --- BULLETPROOF FIX ---
      // Ensure the state is always an array.
      setSlabs(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error("Failed to fetch PT slabs.");
      setSlabs([]); // Also ensure it's an array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlabs();
  }, [fetchSlabs]);

  const filteredSlabs = useMemo(() => {
    if (!slabs) return [];
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return slabs;
    // Search by state name
    return slabs.filter((s) => s.state.toLowerCase().includes(searchLower));
  }, [slabs, searchQuery]);

  // --- DERIVED STATE FOR PAGINATION ---
  const paginatedSlabs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSlabs.slice(startIndex, endIndex);
  }, [filteredSlabs, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const totalItems = filteredSlabs.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleEditClick = (id: number) => {
    setSlabToEditId(id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, state: string, amount: number) => {
    setSlabToDelete({ id, name: `${state} - ${formatCurrency(amount)}` });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!slabToDelete) return;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.ProfessionalTaxSlabs}/${slabToDelete.id}`
      );
      toast.success(`Slab '${slabToDelete.name}' has been deleted.`);
      fetchSlabs();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(error.response.data?.message || "Failed to delete slab.");
      } else {
        toast.error("An unknown error occurred.");
      }
    } finally {
      setIsConfirmModalOpen(false);
      setSlabToDelete(null);
    }
  };

  // The rest of your JSX remains the same
  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Professional Tax Slabs
            </h1>
            <p className="text-gray-600 mt-1">
              Manage state-wise Professional Tax rules.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg "
          >
            <Plus size={18} /> Add Slab
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="p-2 mb-4 flex justify-end">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by state..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    State
                  </th>
                   <th scope="col" className="px-6 py-3">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Min Gross Salary
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Max Gross Salary
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Monthly Tax Amount
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <LoaderCircle className="animate-spin inline-block" />
                    </td>
                  </tr>
                ) : paginatedSlabs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No slabs found.
                    </td>
                  </tr>
                ) : (
                  paginatedSlabs.map((slab) => (
                    <tr
                      key={slab.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {slab.state}
                      </td>
                      <td className="px-6 py-4">
                        {slab.gender}
                      </td>
                      <td className="px-6 py-4">
                        {formatCurrency(slab.minGrossSalary)}
                      </td>
                      <td className="px-6 py-4">
                        {slab.maxGrossSalary
                          ? formatCurrency(slab.maxGrossSalary)
                          : "And above"}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {formatCurrency(slab.taxAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleEditClick(slab.id)}
                             className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                slab.id,
                                slab.state,
                                slab.taxAmount
                              )
                            }
                             className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalItems > 0 && (
            <div className="flex items-center justify-between p-4 border-t text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="p-1 border rounded-md"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <span>
                Showing {startItem}-{endItem} of {totalItems}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateProfessionalTaxSlabModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchSlabs}
      />
      <UpdateProfessionalTaxSlabModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchSlabs();
          setIsUpdateModalOpen(false);
        }}
        slabId={slabToEditId}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete PT Slab"
        message={`Are you sure you want to delete the slab '${slabToDelete?.name}'?`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default ProfessionalTaxSlabPage;
