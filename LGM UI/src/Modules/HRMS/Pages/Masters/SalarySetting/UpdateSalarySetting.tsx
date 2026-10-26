import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface UpdateSalarySettingProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settingId: number | null;
}

const UpdateSalarySetting: React.FC<UpdateSalarySettingProps> = ({ isOpen, onClose, onSuccess, settingId }) => {
  const [formData, setFormData] = useState({
    // componentCode: "",
    componentName: "",
    percentage: "" as (number | string),
   // fixedAmount: "" as (number | string),
    calculationBase: "Gross Salary",
    isApplicable: true,
    effectiveFrom: "",
    effectiveTo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchSettingData = useCallback(async () => {
    if (!settingId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SalarySettingPercentage}/${settingId}`);
      const data = response.data;
      setFormData({
        // componentCode: data.componentCode,
        componentName: data.componentName,
        percentage: data.percentage ?? "",
        //fixedAmount: data.fixedAmount ?? "",
        calculationBase: data.calculationBase,
        isApplicable: data.isApplicable,
        effectiveFrom: new Date(data.effectiveFrom).toISOString().split('T')[0],
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo).toISOString().split('T')[0] : "",
      });
    } catch  {
      toast.error("Failed to fetch setting details.");
      onClose();
    } finally {
      setIsLoading(false);
    }
  }, [settingId, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchSettingData();
    }
  }, [isOpen, fetchSettingData]);
  
  if (!isOpen) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    // @ts-ignore
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? e.target.checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.componentName  || !formData.calculationBase || !settingId) {
      toast.error("Component Name, Code, and Calculation Base are required.");
      return;
    }
    if (!formData.percentage) {
      toast.error("Either Percentage or Fixed Amount must be provided.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        percentage: formData.percentage ? parseFloat(formData.percentage.toString()) : null,
        //fixedAmount: formData.fixedAmount ? parseFloat(formData.fixedAmount.toString()) : null,
        effectiveTo: formData.effectiveTo ? new Date(formData.effectiveTo).toISOString() : null,
        effectiveFrom: new Date(formData.effectiveFrom).toISOString(),
      };
      await apiClient.put(`${API_ENDPOINTS.SalarySettingPercentage}/${settingId}`, payload);
      toast.success("Salary setting updated successfully!");
      onSuccess();
      onClose();
    } catch  {
      toast.error("Failed to update setting. Please try again.");
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
          <h2 className="text-xl font-bold mb-4">Edit Salary Setting</h2>
          {isLoading ? (
            <div className="text-center py-8">Loading setting details...</div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
               <div className="md:col-span-2">
                <label htmlFor="upd-componentName" className="block text-sm font-medium text-gray-700 mb-1">Component Name</label>
                <input id="upd-componentName" type="text" name="componentName" value={formData.componentName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              
              {/* <div>
                <label htmlFor="upd-componentCode" className="block text-sm font-medium text-gray-700 mb-1">Component Code</label>
                <input id="upd-componentCode" type="text" name="componentCode" value={formData.componentCode} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div> */}
              
              <div>
                <label htmlFor="upd-calculationBase" className="block text-sm font-medium text-gray-700 mb-1">Calculation Base</label>
                <select id="upd-calculationBase" name="calculationBase" value={formData.calculationBase} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required>
                  <option value="Gross Salary">Gross Salary</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="upd-percentage" className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
                <input id="upd-percentage" type="number" step="0.01" name="percentage" value={formData.percentage} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            
              <div>
                <label htmlFor="upd-effectiveFrom" className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                <input id="upd-effectiveFrom" type="date" name="effectiveFrom" value={formData.effectiveFrom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              
              <div>
                <label htmlFor="upd-effectiveTo" className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
                <input id="upd-effectiveTo" type="date" name="effectiveTo" value={formData.effectiveTo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              
              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <input id="upd-isApplicable" type="checkbox" name="isApplicable" checked={formData.isApplicable} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
                <label htmlFor="upd-isApplicable" className="text-sm font-medium text-gray-700">Is this rule active?</label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateSalarySetting;