import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings, // Using a more relevant icon
} from "lucide-react";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import CreateSalarySetting from "./CreateSalarySetting";
import UpdateSalarySetting from "./UpdateSalarySetting";
import { FaEdit, FaTrash } from "react-icons/fa";

// 1. Interface for SalarySettingPercentage data
interface SalarySetting {
  id: number;
  //   componentCode: string;
  componentName: string;
  percentage?: number | null;
  fixedAmount?: number | null;
  calculationBase: string;
  isApplicable: boolean;
  effectiveFrom: string; // Dates are ISO strings from the API
  effectiveTo?: string | null;
}

const SalarySettingPage: React.FC = () => {
  // 2. State variables adapted for Salary Settings
  const [settings, setSettings] = useState<SalarySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [settingToEditId, setSettingToEditId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<{
    id: number;
    componentName: string;
  } | null>(null);

  // 3. Data fetching logic for Salary Settings
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.SalarySettingPercentage,
      );
      // Add a check to ensure the data is an array before setting the state.
      if (Array.isArray(response.data)) {
        setSettings(response.data);
      } else {
        // If the API returns something else, default to an empty array to prevent a crash.
        setSettings([]);
        console.error(
          "API did not return an array for Salary Settings:",
          response.data,
        );
        toast.error("Received invalid data from the server.");
      }
    } catch {
      setError("Failed to fetch salary settings.");
      toast.error("Failed to fetch salary settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // 4. Filtering logic for componentName or calculationBase
  const filteredSettings = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return settings;
    return settings.filter(
      (s) =>
        s.componentName.toLowerCase().includes(searchLower) ||
        s.calculationBase.toLowerCase().includes(searchLower),
    );
  }, [settings, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const totalPages = Math.ceil(filteredSettings.length / itemsPerPage);
  const paginatedSettings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSettings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSettings, currentPage, itemsPerPage]);

  const handleAddClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (setting: SalarySetting) => {
    setSettingToEditId(setting.id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, componentName: string) => {
    setSettingToDelete({ id, componentName });
    setIsConfirmModalOpen(true);
  };

  // 5. Delete logic using soft-delete endpoint
  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.SalarySettingPercentage}/${settingToDelete.id}`,
      );
      toast.success(
        `Setting '${settingToDelete.componentName}' has been deleted successfully.`,
      );
      fetchSettings(); // Refresh data
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage =
        apiError.response?.data?.message || "Failed to delete setting.";
      toast.error(errorMessage);
    } finally {
      setIsConfirmModalOpen(false);
      setSettingToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Salary Calculation Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage the rules for dynamic salary component calculations.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg  transition-colors"
          >
            <Plus size={18} />
            Add New Setting
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={22} /> Component Rules
          </h2>

          <div className="relative w-full md:max-w-sm mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by component or base..."
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Component Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Calculation Base
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
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
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredSettings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No settings found.
                    </td>
                  </tr>
                ) : (
                  paginatedSettings.map((setting) => (
                    <tr
                      key={setting.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {setting.componentName}
                      </td>
                      <td className="px-6 py-4">
                        {setting.percentage
                          ? `${setting.percentage}%`
                          : `₹${setting.fixedAmount?.toLocaleString() ?? "0"}`}
                      </td>
                      <td className="px-6 py-4">{setting.calculationBase}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            setting.isApplicable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {setting.isApplicable ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleEditClick(setting)}
                             className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit Setting"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                setting.id,
                                setting.componentName,
                              )
                            }
                             className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete Setting"
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

      <CreateSalarySetting
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchSettings}
      />

      <UpdateSalarySetting
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchSettings();
          setIsUpdateModalOpen(false);
        }}
        settingId={settingToEditId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Salary Setting"
        message={`Are you sure you want to delete the setting for '${settingToDelete?.componentName}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default SalarySettingPage;
