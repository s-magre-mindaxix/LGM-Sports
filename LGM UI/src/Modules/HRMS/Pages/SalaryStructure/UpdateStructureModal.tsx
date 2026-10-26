import React, { useState, useEffect, useMemo } from "react";
import { X, LoaderCircle, Calendar } from "lucide-react";
import { API_ENDPOINTS } from "../../../../API/apiConfig"; 
import apiClient from "../../../../API/apiClient";
import { toast } from "sonner";

// --- Reusable Components (Copy from your Create Modal) ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
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
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}
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


interface ComponentDetailItem { salaryComponentID: number; componentName: string; amount: number; }

interface UpdateStructureModalProps {
  isOpen: boolean;
  employeeId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateStructureModal: React.FC<UpdateStructureModalProps> = ({ isOpen, employeeId, onClose, onSuccess }) => {
  const [employeeName, setEmployeeName] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [status, setStatus] = useState("Active");
const [originalComponents, setOriginalComponents] = useState<ComponentDetailItem[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      const fetchInitialData = async () => {
        setIsFetchingData(true);
        setIsSubmitted(false);

          setEmployeeName("");
        setEffectiveDate("");
        setOriginalComponents([]); 

        try {
          // --- CHANGE 2: We no longer need to fetch all master components ---
          const structureResponse = await apiClient.get(`${API_ENDPOINTS.SalaryStructures}/${employeeId}`);
          const structureData = structureResponse.data;

          setEmployeeName(structureData.employeeName);
          
          if (structureData.effectiveDate) {
            setEffectiveDate(structureData.effectiveDate.substring(0, 10));
          }
          
          setStatus(structureData.status);

          // --- CHANGE 3: Store the fetched components directly ---
          setOriginalComponents(structureData.components);
          
        } catch  {
          toast.error("Failed to load salary structure data for editing.");
          onClose();
        } finally {
          setIsFetchingData(false);
        }
      };
      fetchInitialData();
    }
  }, [isOpen, employeeId, onClose]);

    const { grossSalary, totalDeductions } = useMemo(() => {
    

    return { 
        grossSalary: originalComponents.filter(c => c.componentName !== "P. F." && c.componentName !== "P. T." && c.componentName !== "ESIC" && c.componentName !== "TDS").reduce((acc, curr) => acc + curr.amount, 0),
        totalDeductions: originalComponents.filter(c => c.componentName === "P. F." || c.componentName === "P. T." || c.componentName === "ESIC" || c.componentName === "TDS").reduce((acc, curr) => acc + curr.amount, 0),
        netSalary: originalComponents.reduce((acc, curr) => acc + curr.amount, 0)
     };

  }, [originalComponents]);
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!e.currentTarget.checkValidity()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      employeeID: employeeId,
      effectiveDate,
      status,
      components: originalComponents, // Send the original components back
    };

     try {
      await apiClient.put(`${API_ENDPOINTS.SalaryStructures}/${employeeId}`, payload);
      toast.success("Salary structure updated successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) { 
      type ApiError = { response?: { data?: { message?: string; }; }; };
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || "An error occurred while updating.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

   return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Edit Salary Structure</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

          <form onSubmit={handleSubmit} className={`group ${isSubmitted ? "submitted" : ""} overflow-y-auto`} noValidate>
            <div className="p-6 space-y-5">
              
              <InputField label="Employee" name="employee" value={isFetchingData ? "Loading..." : employeeName} disabled readOnly />
              
              {/* This container will hold the two side-by-side fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <InputField 
                    label="Effective Date" 
                    name="effectiveDate" 
                    type="text"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => (e.target.type = "text")}
                    placeholder="Pick a date"
                    icon={<Calendar size={18} />}
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                    required
                    disabled={isFetchingData}
                />
                <SelectField 
                    label="Status" 
                    name="status" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)} 
                    required  
                    disabled={isFetchingData} 
                >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                </SelectField>
              </div>

            </div>
            
              <div className="px-6 pb-6">
                <div className="border-t pt-4 space-y-2 text-right font-medium text-sm">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Gross Salary:</span>
                        <span>₹{isFetchingData ? '...' : grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {/* <div className="flex justify-between items-center text-gray-600">
                        <span>Total Deductions:</span>
                        <span>₹{isFetchingData ? '...' : totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div> */}
                    <div className="flex justify-between items-center text-lg text-gray-800 pt-2 border-t mt-2">
                        <span>Net Salary:</span>
                        <span>₹{isFetchingData ? '...' : (grossSalary - totalDeductions).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
          
            <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
                Cancel
              </button>
              <button 
                  type="submit" 
                  disabled={isFetchingData || isSubmitting} 
                   className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
              >
                {isSubmitting && <LoaderCircle className="animate-spin" size={16} />}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
export default UpdateStructureModal;
