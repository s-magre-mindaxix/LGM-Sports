import React, { useState, useEffect, useCallback, useMemo } from "react";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import {
  Loader2,
  PlusCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { FaEdit, FaTrash } from "react-icons/fa";

// --- INTERFACES & TYPES (No changes needed) ---
interface TaxSlab {
  id: number;
  financialYear: string;
  taxRegime: string;
  citizenType: string;
  fromAmount: number;
  toAmount: number | null;
  ratePercentage: number;
}
type TaxSlabFormData = Omit<TaxSlab, "id">;

// --- STYLED & REUSABLE COMPONENTS (No changes needed) ---
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  settingName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  settingName: string;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold text-gray-800">
          Delete Tax Slab
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete the slab starting from{" "}
          <span className="font-semibold">{settingName}</span>? This action is
          irreversible.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
const TaxSlabForm = ({
  slab,
  onSave,
  onCancel,
}: {
  slab: TaxSlab | TaxSlabFormData;
  onSave: (data: TaxSlab | TaxSlabFormData) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(slab);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : Number(value),
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Amount (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="fromAmount"
          value={formData.fromAmount}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Amount (₹){" "}
          <span className="text-xs text-gray-500">
            (Leave blank for 'And Above')
          </span>
        </label>
        <input
          type="number"
          name="toAmount"
          value={formData.toAmount ?? ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate (%) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          name="ratePercentage"
          value={formData.ratePercentage}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
         className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
         className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
        >
          {"id" in slab ? "Update Slab" : "Create Slab"}
        </button>
      </div>
    </form>
  );
};

// --- MAIN MANAGEMENT PAGE ---
const TaxSlabManagement: React.FC = () => {
  const [slabs, setSlabs] = useState<TaxSlab[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<
    TaxSlab | TaxSlabFormData | null
  >(null);
  const [slabToDelete, setSlabToDelete] = useState<TaxSlab | null>(null);

  const currentYear = new Date().getFullYear();
  const [selectedFy, setSelectedFy] = useState(
    `${currentYear - 1}-${currentYear}`,
  );
  const [selectedRegime, setSelectedRegime] = useState("Old");

  const financialYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1}-${year}`);
    }
    return years;
  }, [currentYear]);

  const fetchSlabs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<TaxSlab[]>(
        `${API_ENDPOINTS.TaxSlabs}/${selectedFy}/${selectedRegime}`,
      );
      setSlabs(response.data);
    } catch (error) {
      console.error("Failed to fetch tax slabs", error);
      setSlabs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFy, selectedRegime]);

  useEffect(() => {
    fetchSlabs();
  }, [fetchSlabs]);

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsDeleteModalOpen(false);
    setEditingSlab(null);
    setSlabToDelete(null);
  };
  const handleAddNew = () => {
    const newSlabTemplate: TaxSlabFormData = {
      financialYear: selectedFy,
      taxRegime: selectedRegime,
      citizenType: "Regular",
      fromAmount: 0,
      toAmount: null,
      ratePercentage: 0,
    };
    setEditingSlab(newSlabTemplate);
    setIsFormModalOpen(true);
  };
  const handleEdit = (slab: TaxSlab) => {
    setEditingSlab(slab);
    setIsFormModalOpen(true);
  };
  const confirmDelete = (slab: TaxSlab) => {
    setSlabToDelete(slab);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!slabToDelete) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.TaxSlabs}/${slabToDelete.id}`);
      alert("Slab deleted successfully.");
      fetchSlabs();
    } catch (error) {
      alert("Failed to delete slab.");
      console.error(error);
    } finally {
      handleCloseModals();
    }
  };
  const handleFormSubmit = async (data: TaxSlab | TaxSlabFormData) => {
    try {
      if ("id" in data && data.id) {
        await apiClient.put(`${API_ENDPOINTS.TaxSlabs}/${data.id}`, data);
        alert("Slab updated successfully.");
      } else {
        await apiClient.post(API_ENDPOINTS.TaxSlabs, data);
        alert("Slab created successfully.");
      }
      fetchSlabs();
      handleCloseModals();
    } catch (error: any) {
      const status = error.response?.status;
      const message =
        error.response?.data?.title ||
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred.";
      console.error("Failed to save slab:", error.response || error);
      alert(
        `Failed to save slab. Server responded with status ${status}: ${message}\nPlease check the console for more details.`,
      );
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income Tax Slab</h1>
          <p className="text-gray-600 mt-1">
            Manage tax rules for different years and regimes.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg"
        >
          <PlusCircle size={18} /> Add New Slab
        </button>
      </div>

      {/* --- UPDATED FILTER SECTION --- */}
      <div className="bg-white rounded-lg shadow-sm p-4 border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <label className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-500">
              Financial Year
            </label>
            <select
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="absolute -top-2 left-2 -mt-px inline-block bg-white px-1 text-xs font-medium text-gray-500">
              Tax Regime
            </label>
            <select
              value={selectedRegime}
              onChange={(e) => setSelectedRegime(e.target.value)}
              className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="Old">Old Tax Regime</option>
              <option value="New">New Tax Regime</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- UPDATED TABLE SECTION --- */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f07837] text-white uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold text-left">
                  From Amount (₹)
                </th>
                <th className="px-6 py-3 font-semibold text-left">
                  To Amount (₹)
                </th>
                <th className="px-6 py-3 font-semibold text-center">Rate</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center p-8">
                    <Loader2 className="animate-spin inline-block mr-2" />{" "}
                    Loading Rules...
                  </td>
                </tr>
              ) : slabs.length > 0 ? (
                slabs.map((slab) => (
                  <tr key={slab.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-left">
                      {slab.fromAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-left">
                      {slab.toAmount?.toLocaleString("en-IN") || "And Above"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-gray-800">
                      {slab.ratePercentage} %
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => handleEdit(slab)}
                         className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit Slab"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(slab)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Slab"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-gray-500">
                    No tax slabs found for the selected criteria. Please add
                    one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormModalOpen && (
        <Modal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          title={
            editingSlab && "id" in editingSlab
              ? "Edit Income Tax Slab"
              : "Create Income Tax Slab"
          }
        >
          <TaxSlabForm
            slab={editingSlab!}
            onSave={handleFormSubmit}
            onCancel={handleCloseModals}
          />
        </Modal>
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDelete}
        settingName={slabToDelete?.fromAmount.toLocaleString("en-IN") || ""}
      />
    </div>
  );
};

export default TaxSlabManagement;
