import React, { useState, useEffect  } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface CreateSalarySettingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EarningComponent {
  id: number;
  componentName: string;
}

const CreateSalarySetting: React.FC<CreateSalarySettingProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    // componentCode: "",
    componentName: "",
    percentage: "",
    //fixedAmount: "",
    calculationBase: "Gross Salary",
    isApplicable: true,
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
  });
    const [earningComponents, setEarningComponents] = useState<EarningComponent[]>([]);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    // Only fetch data if the modal is open
    if (isOpen) {
      const fetchEarningComponents = async () => {
        setIsLoadingComponents(true);
        try {
          const response = await apiClient.get(API_ENDPOINTS.SalaryComponentsEarning);
          if (Array.isArray(response.data)) {
            setEarningComponents(response.data);
          }
        } catch  {
          toast.error("Failed to load earning components for the dropdown.");
        } finally {
          setIsLoadingComponents(false);
        }
      };

      fetchEarningComponents();
    }
  }, [isOpen]); // This effect depends on the 'isOpen' prop

  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };
  
  const resetForm = () => {
     setFormData({
        // componentCode: "",
        componentName: "",
        percentage: "",
        //fixedAmount: "",
        calculationBase: "Gross Salary",
        isApplicable: true,
        effectiveFrom: new Date().toISOString().split("T")[0],
        effectiveTo: "",
      });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.componentName  || !formData.calculationBase) {
      toast.error("Component Name, Code, and Calculation Base are required.");
      return;
    }
     if (!formData.percentage) {
      toast.error("Percentage  must be provided.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage) : null,
        //fixedAmount: formData.fixedAmount ? parseFloat(formData.fixedAmount) : null,
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
      };
      await apiClient.post(API_ENDPOINTS.SalarySettingPercentage, payload);
      toast.success("Salary setting created successfully!");
      onSuccess();
      onClose();
      resetForm();
    } catch  {
      toast.error("Failed to create setting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Add New Salary Setting</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            <div className="md:col-span-2">
              <label htmlFor="componentName" className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
              <select 
                id="componentName" 
                name="componentName" 
                value={formData.componentName} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                required
                disabled={isLoadingComponents} // Disable while loading
              >
                <option value="" disabled>
                  {isLoadingComponents ? "Loading components..." : "Select a component"}
                </option>
                {earningComponents.map(component => (
                  <option key={component.id} value={component.componentName}>
                    {component.componentName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* <div>
              <label htmlFor="componentCode" className="block text-sm font-medium text-gray-700 mb-1">Component Code</label>
              <input id="componentCode" type="text" name="componentCode" value={formData.componentCode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div> */}
            
            <div>
              <label htmlFor="calculationBase" className="block text-sm font-medium text-gray-700 mb-1">Calculation Base</label>
              <select id="calculationBase" name="calculationBase" value={formData.calculationBase} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                <option value="Gross Salary">Gross Salary</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
              <input id="percentage" type="number" step="0.01" name="percentage" value={formData.percentage} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
            </div>
          
            <div>
              <label htmlFor="effectiveFrom" className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
              <input id="effectiveFrom" type="date" name="effectiveFrom" value={formData.effectiveFrom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
            </div>
            
            <div>
              <label htmlFor="effectiveTo" className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
              <input id="effectiveTo" type="date" name="effectiveTo" value={formData.effectiveTo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            
            <div className="md:col-span-2 flex items-center gap-3 pt-2">
              <input id="isApplicable" type="checkbox" name="isApplicable" checked={formData.isApplicable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
              <label htmlFor="isApplicable" className="text-sm font-medium text-gray-700">Is this rule active?</label>
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-4 mt-4">
              <button type="button" onClick={onClose} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
                {isSubmitting ? "Saving..." : "Save Setting"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSalarySetting;