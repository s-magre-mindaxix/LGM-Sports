
import React, { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface UpdateCompanyProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileId: number | null;
}

interface CompanyProfileDTO {
    id: number;
    companyName: string;
    address: string;
    pan: string;
    tan: string;
    citTdsAddress: string;
    signatoryName: string;
    signatoryDesignation: string;
}

// Reusable InputField component styled to match your reference
const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, name, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {rest.required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            {...rest}
            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>
);

// Reusable TextareaField component styled to match your reference
const TextareaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, name, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label} {rest.required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            {...rest}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>
);

// Reusable SaveChangesButton from your EditEmployeeModal
const SaveChangesButton: React.FC<{ isSaving: boolean }> = ({ isSaving }) => (
  <div className="md:col-span-2 flex justify-end mt-4">
    <button
      type="submit"
      disabled={isSaving}
      className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
    >
      {isSaving && <Loader2 className="animate-spin" size={16} />}
      {isSaving ? "Saving..." : "Save Changes"}
    </button>
  </div>
);

const UpdateCompanyProfile: React.FC<UpdateCompanyProfileProps> = ({ isOpen, onClose, onSuccess, profileId }) => {
  const [formData, setFormData] = useState<CompanyProfileDTO>({
  id: 0,
  companyName: "",
  address: "",
  pan: "",
  tan: "",
  citTdsAddress: "",
  signatoryName: "",
  signatoryDesignation: ""
});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.CompanyProfile}/${profileId}`);
       const data = response.data;
       setFormData({
      id: data.id,
      companyName: data.companyName,
      address: data.address,
      pan: data.pan,
      tan: data.tan,
      signatoryName: data.signatoryName,
      signatoryDesignation: data.signatoryDesignation,
      citTdsAddress: data.cittdsAddress  
    });

    } catch  {
      toast.error("Failed to fetch profile details.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [profileId, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen, fetchProfileData]);
  
  if (!isOpen) return null;

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     const processedValue = name === 'citTdsAddress' ? value : value.toUpperCase();
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setIsSubmitting(true);
    try {
      await apiClient.put(`${API_ENDPOINTS.CompanyProfile}/${profileId}`, formData);
      toast.success("Company Profile updated successfully!");
      onSuccess();
      onClose();
    } catch  {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
      <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header - Styled like EditEmployeeModal */}
            <div className="flex justify-between items-center border-b p-4 shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">Edit Company Profile</h2>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={24} />
                </button>
            </div>
            
            <div className="overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} key={formData.id}>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <InputField
                                label="Company Name"
                                name="companyName"
                                value={formData.companyName || ''}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="PAN"
                                name="pan"
                                value={formData.pan || ''}
                                onChange={handleChange}
                                maxLength={10}
                                minLength={10}
                                required
                            />
                            <InputField
                                label="TAN"
                                name="tan"
                                value={formData.tan || ''}
                                onChange={handleChange}
                                maxLength={10}
                                minLength={10}
                                required
                            />
                            <InputField
                                label="Signatory Name"
                                name="signatoryName"
                                value={formData.signatoryName || ''}
                                onChange={handleChange}
                                required
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Signatory Designation"
                                    name="signatoryDesignation"
                                    value={formData.signatoryDesignation || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <TextareaField
                                    label="Company Address"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <TextareaField
                                    label="CIT (TDS) Address"
                                    name="citTdsAddress" 
                                    value={formData.citTdsAddress || ''} 
                                    onChange={handleChange}
                                    rows={3}
                                    required
                                />
                            </div>
                            <SaveChangesButton isSaving={isSubmitting} />
                        </div>
                    </form>
                )}
            </div>
        </div>
      </div>
  );
};

export default UpdateCompanyProfile;