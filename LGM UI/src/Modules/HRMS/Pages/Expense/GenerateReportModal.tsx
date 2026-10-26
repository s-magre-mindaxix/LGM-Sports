import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateExpenseReport } from "./expenseClaimService";

interface GenerateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GenerateReportModal: React.FC<GenerateReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both a start and end date.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after the end date.");
      return;
    }
    setIsLoading(true);
    try {
      await generateExpenseReport(startDate, endDate);
      toast.success("Report generated and download started!");
      onClose();
    } catch {
      toast.error("Failed to generate report.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Generate Expense Report
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full input-style"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full input-style"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
           className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
          >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {isLoading ? "Generating..." : "Generate & Download"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReportModal;
