import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface UpdateHolidayProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  holidayId: number | null;
}

const UpdateHoliday: React.FC<UpdateHolidayProps> = ({ isOpen, onClose, onSuccess, holidayId }) => {
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidayData = useCallback(async () => {
    if (!holidayId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.Holiday}/${holidayId}`);
      const holidayData = response.data;
      setDescription(holidayData.description);
      // Format date for the input[type=date] which requires "yyyy-MM-dd"
      setDate(new Date(holidayData.date).toISOString().split('T')[0]);
    } catch  {
      toast.error("Failed to fetch holiday details.");
      onClose(); // Close modal if data fails to load
    } finally {
      setIsLoading(false);
    }
  }, [holidayId, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchHolidayData();
    }
  }, [isOpen, fetchHolidayData]);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !date || !holidayId) {
      toast.error("Both date and description are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const holidayData = {
        id: holidayId,
        date: new Date(date).toISOString(),
        description,
         year: new Date(date).getFullYear(),
      };
      await apiClient.put(`${API_ENDPOINTS.Holiday}/${holidayId}`, holidayData);
      toast.success("Holiday updated successfully!");
      onSuccess();
      onClose();
    } catch  {
      toast.error("Failed to update holiday. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">Edit Holiday</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading holiday details...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="update-holiday-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                id="update-holiday-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="update-holiday-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                id="update-holiday-description"
                type="text"
                placeholder="e.g., Diwali - Day 1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={onClose}  className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
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
  );
};

export default UpdateHoliday;