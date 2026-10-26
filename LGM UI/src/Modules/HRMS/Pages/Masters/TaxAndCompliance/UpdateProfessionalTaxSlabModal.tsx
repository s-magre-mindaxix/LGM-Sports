// In a new file: pages/Masters/UpdateProfessionalTaxSlabModal.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  LoaderCircle,
  MapPin,
  TrendingUp,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";

// --- Reusable InputField component defined locally ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ElementType;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  icon: Icon,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon size={18} />
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border rounded-md shadow-sm text-sm 
                   placeholder-gray-400 focus:outline-none focus:ring-1 
                   border-gray-300 focus:ring-blue-500 focus:border-blue-500
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500`}
        {...rest}
      />
    </div>
  </div>
);

// --- Main Modal Component ---
interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slabId: number | null;
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  icon: Icon,
  children,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon size={18} />
        </span>
      )}
      <select
        id={name}
        name={name}
        className={`w-full ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border rounded-md shadow-sm text-sm 
                   placeholder-gray-400 focus:outline-none focus:ring-1 
                   border-gray-300 focus:ring-blue-500 focus:border-blue-500
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500`}
        {...rest}
      >
        {children}
      </select>
    </div>
  </div>
);

const UpdateProfessionalTaxSlabModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  slabId,
}) => {
  const [state, setState] = useState("");
  const [gender, setGender] = useState(""); 
  const [minGrossSalary, setMinGrossSalary] = useState("");
  const [maxGrossSalary, setMaxGrossSalary] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && slabId) {
      const fetchSlab = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get(
            `${API_ENDPOINTS.ProfessionalTaxSlabs}/${slabId}`
          );
          const data = response.data;
          setState(data.state);
            setGender(data.gender); 
          setMinGrossSalary(data.minGrossSalary.toString());
          setMaxGrossSalary(data.maxGrossSalary?.toString() || "");
          setTaxAmount(data.taxAmount.toString());
        } catch {
          toast.error("Failed to fetch slab details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchSlab();
    }
  }, [isOpen, slabId, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slabId) return;

    setIsSubmitting(true);
    const payload = {
      id: slabId,
      state,
       gender, 
      minGrossSalary: parseFloat(minGrossSalary),
      maxGrossSalary: maxGrossSalary ? parseFloat(maxGrossSalary) : null,
      taxAmount: parseFloat(taxAmount),
    };

    try {
      await apiClient.put(
        `${API_ENDPOINTS.ProfessionalTaxSlabs}/${slabId}`,
        payload
      );
      toast.success(`PT Slab for ${payload.state} updated successfully.`);
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data?.message ||
            "Failed to update slab due to a server error."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while updating the slab.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit PT Slab</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        {isLoading ? (
          <div className="p-6 text-center">
            <LoaderCircle className="animate-spin mx-auto text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            <InputField
              label="State"
              name="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              icon={MapPin}
            />
                <SelectField
          label="Gender"
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="All">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </SelectField>
            <InputField
              label="Min Gross Salary"
              name="minGrossSalary"
              type="number"
              step="0.01"
              value={minGrossSalary}
              onChange={(e) => setMinGrossSalary(e.target.value)}
              required
              icon={TrendingUp}
            />
            <InputField
              label="Max Gross Salary"
              name="maxGrossSalary"
              type="number"
              step="0.01"
              value={maxGrossSalary}
              onChange={(e) => setMaxGrossSalary(e.target.value)}
              placeholder="Leave empty for 'and above'"
              icon={TrendingUp}
            />
            <InputField
              label="Monthly Tax Amount"
              name="taxAmount"
              type="number"
              step="0.01"
              value={taxAmount}
              onChange={(e) => setTaxAmount(e.target.value)}
              required
              icon={IndianRupee}
            />
            <div className="flex justify-end gap-3 border-t pt-4 mt-4">
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
                {isSubmitting && (
                  <LoaderCircle className="animate-spin" size={16} />
                )}
                {isSubmitting ? "Saving..." : "Update Slab"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateProfessionalTaxSlabModal;
