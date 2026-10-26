import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Building2,
} from "lucide-react";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import CreateCompanyProfile from "./CreateCompanyProfile";
import UpdateCompanyProfile from "./UpdateCompanyProfile";
import { FaEdit, FaTrash } from "react-icons/fa";

interface CompanyProfile {
  id: number;
  companyName: string;
  address: string;
  pan: string;
  tan: string;
  cit_TDS_Address: string;
  signatoryName: string;
  signatoryDesignation: string;
}

const CompanyProfilePage: React.FC = () => {
  const [profiles, setProfiles] = useState<CompanyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [profileToEditId, setProfileToEditId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<{id: number; name: string;} | null>(null);

  const fetchCompanyProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(API_ENDPOINTS.CompanyProfile);
      setProfiles(response.data);
    } catch  {
      setError("Failed to fetch company profile.");
      toast.error("Failed to fetch company profile.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyProfiles();
  }, [fetchCompanyProfiles]);

  const handleAddClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (profile: CompanyProfile) => {
    setProfileToEditId(profile.id);
    setIsUpdateModalOpen(true);
  };

  const handleDeleteRequest = (id: number, name: string) => {
    setProfileToDelete({ id, name });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    try {
      await apiClient.delete(`${API_ENDPOINTS.CompanyProfile}/${profileToDelete.id}`);
      toast.success(`Profile for '${profileToDelete.name}' has been deleted.`);
      fetchCompanyProfiles(); 
    } catch  {
      toast.error("Failed to delete profile.");
    } finally {
      setIsConfirmModalOpen(false);
      setProfileToDelete(null);
    }
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Company Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your company's official information for payroll and tax purposes.
            </p>
          </div>
          <button
                     onClick={handleAddClick}
                     className="flex items-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg  transition-colors"
                   >
                     <Plus size={18} />
                     Add Profile
                   </button>
                 </div>

        <div className="bg-white rounded-lg shadow-md p-6">
           <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
            <Building2 size={24} className="text-blue-600"/> Company Details
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
             <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3 rounded-l-lg">Company Name</th>
                  <th scope="col" className="px-6 py-3">PAN</th>
                  <th scope="col" className="px-6 py-3">TAN</th>
                  <th scope="col" className="px-6 py-3">Signatory Name</th>
                  <th scope="col" className="px-6 py-3 rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-10">Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="text-center py-10 text-red-500">{error}</td></tr>
                ) : profiles.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500">
                      <p className="font-semibold">No Company Profile Found</p>
                      <p>Click 'Add Company Profile' to get started.</p>
                  </td></tr>
                ) : (
                  profiles.map((profile) => (
                    <tr key={profile.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">{profile.companyName}</td>
                      <td className="px-6 py-4 font-mono">{profile.pan}</td>
                      <td className="px-6 py-4 font-mono">{profile.tan}</td>
                      <td className="px-6 py-4">{profile.signatoryName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button onClick={() => handleEditClick(profile)}  className="text-blue-600 hover:text-blue-800 transition-colors" title="Edit Profile">
                            <FaEdit size={18} />
                          </button>
                          <button onClick={() => handleDeleteRequest(profile.id, profile.companyName)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete Profile">
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
        </div>
      </div>

      <CreateCompanyProfile
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCompanyProfiles}
      />

      <UpdateCompanyProfile
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSuccess={() => {
          fetchCompanyProfiles();
          setIsUpdateModalOpen(false);
        }}
        profileId={profileToEditId}
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Company Profile"
        message={`Are you sure you want to delete the profile for '${profileToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default CompanyProfilePage;