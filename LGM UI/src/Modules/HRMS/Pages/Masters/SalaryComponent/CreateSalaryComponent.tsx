import React, { useEffect, useState } from "react";
import { X, LoaderCircle } from "lucide-react";
import apiClient from "../../../../../API/apiClient"; // Adjust path if needed
import { API_ENDPOINTS } from "../../../../../API/apiConfig"; // Adjust path if needed
import { toast } from "sonner";

// --- Reusable Field Components (Copied for consistency) ---
// ... (InputField and SelectField components remain the same as in your code)

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode; // <-- THIS IS THE MISSING LINE
}

const InputField: React.FC<InputFieldProps> = ({ label, name, icon, ...rest }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500 
                   group-[.submitted]:invalid:focus:border-red-500`}
        {...rest}
      />
    </div>
  </div>
);
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label: string; name: string; children: React.ReactNode; }
const SelectField: React.FC<SelectFieldProps> = ({ label, name, children, ...rest }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      className={`w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                  group-[.submitted]:invalid:border-red-500 
                  group-[.submitted]:invalid:focus:ring-red-500 
                  group-[.submitted]:invalid:focus:border-red-500`}
      {...rest}
    >
      {children}
    </select>
  </div>
);

// --- THIS COMPONENT IS NOW A MODAL ---
interface CreateSalaryComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSalaryComponent: React.FC<CreateSalaryComponentProps> = ({ isOpen, onClose, onSuccess }) => {
  const [componentName, setComponentName] = useState("");
  const [componentType, setComponentType] =  useState<"Earning" | "Deduction">("Earning");
  const [isTaxable, setIsTaxable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when it opens
  useEffect(() => {
    if (isOpen) {
      setComponentName("");
      setComponentType("Earning");
      setIsTaxable(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!e.currentTarget.checkValidity()) {
      toast.error("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    const payload = { componentName, componentType, isTaxable };

    try {
      await apiClient.post(API_ENDPOINTS.SalaryComponents, payload);
      toast.success(`'${payload.componentName}' created successfully.`);
      onSuccess(); // This calls the fetchComponents function on the parent page
      onClose();   // This closes the modal
    } catch (error: unknown) { 
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      const apiError = error as ApiError;

      const errorMessage = apiError.response?.data?.message || "Failed to create component.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null; // Don't render anything if the modal is not open
  }

  return (
         <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Create Salary Component</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`group ${isSubmitted ? "submitted" : ""} overflow-y-auto`} noValidate>
          <div className="p-6 space-y-4">
            <InputField
              label="Component Name"
              name="componentName"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g., Medical Allowance"
              required
            />
            <SelectField
              label="Component Type"
              name="componentType"
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as "Earning" | "Deduction")}
              required
            >
              <option value="Earning">Earning</option>
              <option value="Deduction">Deduction</option>
            </SelectField>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isTaxablePage"
                checked={isTaxable}
                onChange={(e) => setIsTaxable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isTaxablePage" className="text-sm text-gray-700">
                Is this component taxable?
              </label>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50">
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
              {isSubmitting && <LoaderCircle className="animate-spin" size={16} />}
              {isSubmitting ? "Saving..." : "Save Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSalaryComponent;