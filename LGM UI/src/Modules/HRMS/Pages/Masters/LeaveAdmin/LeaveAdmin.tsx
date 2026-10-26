// src/Pages/Masters/LeaveAdmin/LeaveAdmin.tsx

import React, { useState } from "react";
import { toast } from "sonner";
import { CalendarCog, Loader2 } from "lucide-react";
import YearPicker from "../../../../../Components/Common/YearPicker";
import { accrueYearlyEarnLeave } from "../../LeaveManagement/LeaveAdminService";
import axios from "axios";

const LeaveAdmin: React.FC = () => {
   const currentYear = new Date().getFullYear();
  const [yearToCredit, setYearToCredit] = useState(String(currentYear));
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const yearNum = parseInt(yearToCredit, 10);
    if (isNaN(yearNum) || yearToCredit.length !== 4) {
      toast.error("Please select a valid 4-digit year.");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await accrueYearlyEarnLeave(yearNum);
      toast.success(result.message);
    } catch (error: unknown) {
      console.error("Accrual process failed:", error); 
      
      let errorMessage = "An unexpected error occurred.";

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || error.response.data;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage); 

    } finally {
      setIsProcessing(false);
    }
  };

return (
    <div className="p-4 md:p-4 bg-gray-50 min-h-full">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Yearly Earn Leave Accrual
          </h2>
          <p className="text-sm text-gray-500 mb-4 max-w-2xl">
            Run this process at the beginning of a new year (e.g., in January 2025). It will scan all attendance from the previous year (2024). For each month an employee worked 20+ days, they will be credited with one "Earn Leave" for the current year.
          </p>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <YearPicker label="Credit Leaves for Year" value={yearToCredit} onChange={setYearToCredit} />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#f07837]  text-white font-semibold px-4 py-2 rounded-lg   h-[42px]"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CalendarCog size={18} />}
                {isProcessing ? "Processing..." : `Run Accrual for ${yearToCredit}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default LeaveAdmin;