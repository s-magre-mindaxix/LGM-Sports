import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import apiClient from '../../../../../API/apiClient';
import { API_ENDPOINTS } from '../../../../../API/apiConfig';

interface UpdateExpenseTypeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseTypeId: number | null;
}

const UpdateExpenseType: React.FC<UpdateExpenseTypeProps> = ({ isOpen, onClose, onSuccess, expenseTypeId }) => {
  const [expenseTypeName, setExpenseTypeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && expenseTypeId !== null) {
      const fetchExpenseTypeData = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`${API_ENDPOINTS.ExpenseType}/${expenseTypeId}`);
          setExpenseTypeName(response.data.expenseTypeName);
        } catch  {
          toast.error('Failed to fetch expense type details.');
          onClose(); // Close if we can't fetch the data
        } finally {
          setIsLoading(false);
        }
      };
      fetchExpenseTypeData();
    }
  }, [isOpen, expenseTypeId, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTypeName.trim()) {
      toast.error('Expense type name cannot be empty.');
      return;
    }
    if (expenseTypeId === null) return;

    setIsSubmitting(true);
    try {
      await apiClient.put(`${API_ENDPOINTS.ExpenseType}/${expenseTypeId}`, {
        id: expenseTypeId,
        expenseTypeName: expenseTypeName.trim(),
      });
      toast.success('Expense type updated successfully!');
      onSuccess();
    } catch (error: unknown) { 
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };
      
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message || 'Failed to update expense type.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Expense Type</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="expenseTypeNameUpdate" className="block text-sm font-medium text-gray-700 mb-1">
                Expense Type Name
              </label>
              <input
                id="expenseTypeNameUpdate"
                type="text"
                value={expenseTypeName}
                onChange={(e) => setExpenseTypeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                 className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                 className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateExpenseType;