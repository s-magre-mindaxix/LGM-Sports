import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";

interface CreateCompanyProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Interface for the DTO
interface CompanyProfileDTO {
    companyName: string;
    address: string;
    pan: string;
    tan: string;
    cittdsAddress: string;
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


const CreateCompanyProfile: React.FC<CreateCompanyProfileProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CompanyProfileDTO>({
      companyName: "",
      address: "",
      pan: "",
      tan: "",
      cittdsAddress: "",
      signatoryName: "",
      signatoryDesignation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // As seen in your example screenshot, data is often stored in uppercase.
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post(API_ENDPOINTS.CompanyProfile, formData);
      toast.success("Company Profile created successfully!");
      onSuccess();
      onClose();
    } catch  {
      toast.error("Failed to create profile. Please check the details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header - Styled like AddEmployeeModal */}
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            Add Company Profile
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        
        {/* Modal Body with Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField
                    label="Company Name"
                    name="companyName"
                    placeholder="Enter Company Name"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                />
                 <InputField
                    label="PAN"
                    name="pan"
                    placeholder="Enter PAN"
                    value={formData.pan}
                    onChange={handleChange}
                    maxLength={10}
                    minLength={10}
                    required
                />
                <InputField
                    label="TAN"
                    name="tan"
                    placeholder="Enter TAN"
                    value={formData.tan}
                    onChange={handleChange}
                    maxLength={10}
                    minLength={10}
                    required
                />
                 <InputField
                    label="Signatory Name"
                    name="signatoryName"
                    placeholder="Enter Signatory Name"
                    value={formData.signatoryName}
                    onChange={handleChange}
                    required
                />
                <div className="md:col-span-2">
                  <InputField
                      label="Signatory Designation"
                      name="signatoryDesignation"
                      placeholder="Enter Signatory Designation"
                      value={formData.signatoryDesignation}
                      onChange={handleChange}
                      required
                  />
                </div>
                <div className="md:col-span-2">
                    <TextareaField
                        label="Company Address"
                        name="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                </div>
                <div className="md:col-span-2">
                     <TextareaField
                        label="CIT (TDS) Address"
                        name="cittdsAddress"
                        placeholder="Enter CIT (TDS) Address"
                        value={formData.cittdsAddress}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                </div>
            </div>
            
            {/* Modal Footer - Styled like AddEmployeeModal */}
            <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                   className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyProfile;