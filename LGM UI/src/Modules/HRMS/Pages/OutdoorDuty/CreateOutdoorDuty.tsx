import React, { useEffect, useState } from "react";
import { X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { createOD, type CreateODPayload } from "./outdoorDutyService";
import { isAxiosError } from "axios";

interface CreateOutdoorDutyProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
  fromDate: "",
  toDate: "",
  description: "",
};

// const getTodayString = () => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, "0");
//   const day = String(today.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

const CreateOutdoorDuty: React.FC<CreateOutdoorDutyProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitted(false);
      setDuration(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.fromDate && formData.toDate) {
      const start = new Date(formData.fromDate);
      const end = new Date(formData.toDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDuration(diffDays);
      } else {
        setDuration(0);
      }
    }
  }, [formData.fromDate, formData.toDate]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);

    if (!event.currentTarget.checkValidity()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const payload: CreateODPayload = {
        fromDate: new Date(formData.fromDate).toISOString(),
        toDate: new Date(formData.toDate).toISOString(),
        description: formData.description,
      };
      await createOD(payload);
      toast.success("Outdoor duty request submitted successfully!");
      onSuccess();
      onClose();
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      let errorMessage = "Failed to submit request. Please try again.";
      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            New Outdoor Duty Request
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className={`group ${isSubmitted ? "submitted" : ""}`}
          noValidate
        >
          <div className="p-6 space-y-4">
            {/* Date Range Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="fromDate"
                  type="date"
                  value={formData.fromDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="toDate"
                  type="date"
                  value={formData.toDate}
                  onChange={handleChange}
                  required
                  min={formData.fromDate} // Prevent selecting past dates relative to start
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-200">
                <Calendar size={16} />
                <span>
                  Total Duration: <strong>{duration} Days</strong>
                </span>
              </div>
            )}

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description / Purpose <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="e.g., Client visit to Delhi for Project X implementation."
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end items-center gap-3 border-t p-4 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
             className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
            >
              {isLoading && <Loader2 className="animate-spin" size={16} />}
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOutdoorDuty;
