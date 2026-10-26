import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { AxiosError } from "axios";
import UpdateStatutorySettingModal from "./UpdateStatutorySettingModal";
import CreateStatutorySettingModal from "./CreateStatutorySettingModal";
import { FaEdit, FaTrash } from "react-icons/fa";

interface StatutorySetting {
  id: number;
  settingName: string;
  settingValue: string;
  effectiveDate?: string;
}

const formatDisplayDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-GB");
};

const StatutorySettingPage: React.FC = () => {
  const [settings, setSettings] = useState<StatutorySetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [settingToEditId, setSettingToEditId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_ENDPOINTS.StatutorySettings);

      // --- BULLETPROOF FIX ---
      // Check if the response data is actually an array before setting state.
      // If not, set it to an empty array to prevent crashes.
      setSettings(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Failed to fetch statutory settings.");
      toast.error("Failed to fetch settings.");
      setSettings([]); // Also ensure it's an array on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const filteredSettings = useMemo(() => {
    if (!settings) return []; // Defensive check
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) return settings;
    return settings.filter((s) =>
      s.settingName.toLowerCase().includes(searchLower)
    );
  }, [settings, searchQuery]);

  const paginatedSettings = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSettings.slice(startIndex, endIndex);
  }, [filteredSettings, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const totalItems = filteredSettings.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleEditClick = (id: number) => {
    setSettingToEditId(id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setSettingToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;
    try {
      await apiClient.delete(
        `${API_ENDPOINTS.StatutorySettings}/${settingToDelete.id}`
      );
      toast.success(`'${settingToDelete.name}' has been deleted.`);
      fetchSettings();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data?.message || "Failed to delete setting."
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsConfirmModalOpen(false);
      setSettingToDelete(null);
    }
  };

  // The rest of your JSX remains the same
  return (
    <>
      <div className="p-4 md:p-4 bg-gray-50 min-h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Statutory Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage PF, ESIC, and other compliance rules.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg"
          >
            <Plus size={18} /> Add Setting
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="relative w-full md:max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by setting name..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
             <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Setting Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Effective Date
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
                      <LoaderCircle className="animate-spin inline-block" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : paginatedSettings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
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
                        {setting.settingName.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4">{setting.settingValue}</td>
                      <td className="px-6 py-4">
                        {formatDisplayDate(setting.effectiveDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleEditClick(setting.id)}
                             className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteRequest(
                                setting.id,
                                setting.settingName
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
      <CreateStatutorySettingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchSettings}
      />
      <UpdateStatutorySettingModal
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
        title="Delete Statutory Setting"
        message={`Are you sure you want to delete '${settingToDelete?.name}'? This is a critical setting.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default StatutorySettingPage;
