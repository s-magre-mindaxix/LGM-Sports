import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { Loader2, Calendar, Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  addBulkAttendance,
  type BulkAttendancePayload,
} from "./attendanceService";
import {
  getEmployeeSelectionList,
  type EmployeeSelectItem,
} from "../../Services/MasterDataService";
import { isAxiosError } from "axios";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface BulkAttendanceFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const BulkAttendanceForm: React.FC<BulkAttendanceFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    inTime: "",
    outTime: "",
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch Employees for Dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployeeSelectionList();
        setEmployees(data);
      } catch {
        toast.error("Failed to load employee list");
      }
    };
    fetchEmployees();
  }, []);

  // Prepare Options for React Select
  const employeeOptions: SelectOption[] = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.id.toString(),
        label: emp.fullName, // Adjust if fullName format needs tweaking
      })),
    [employees],
  );

  const selectedEmployeeOption = employeeOptions.find(
    (option) => option.value === selectedEmployeeId,
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedEmployeeId) {
        toast.error("Please select an employee.");
        setIsLoading(false);
        return;
      }

      // --- TIME ZONE FIX ---
      // Manually construct "YYYY-MM-DDTHH:mm:00" to prevent UTC conversion shift
      const baseDate = formData.fromDate;

      const payload: BulkAttendancePayload = {
        employeeId: parseInt(selectedEmployeeId),
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        notes: formData.notes,
      };

      if (formData.inTime) {
        payload.inTime = `${baseDate}T${formData.inTime}:00`;
      }
      if (formData.outTime) {
        payload.outTime = `${baseDate}T${formData.outTime}:00`;
      }

      await addBulkAttendance(payload);
      toast.success("Bulk attendance updated successfully!");
      onSuccess();
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (typeof error.response?.data === "string"
              ? error.response?.data
              : "Failed to update bulk attendance."),
        );
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 mb-2">
        Use this for employees on <strong>Outdoor Duty</strong>. Attendance
        status (Present/Half Day) will be calculated based on the times entered.
      </div>

      {/* Employee Dropdown using React Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Employee
        </label>
        <Select
          inputId="employee-select"
          options={employeeOptions}
          value={selectedEmployeeOption || null}
          onChange={(selectedOption) => {
            setSelectedEmployeeId(selectedOption ? selectedOption.value : "");
          }}
          placeholder="Search and select an employee..."
          isClearable
          isSearchable
          className="mt-1"
          classNamePrefix="react-select"
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              required
              min={formData.fromDate}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            In Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="time"
              name="inTime"
              value={formData.inTime}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Out Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="time"
              name="outTime"
              value={formData.outTime}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Outdoor Duty manual entry"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onClose} className={buttonStyles.cancel}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !selectedEmployeeId}
          className={buttonStyles.save + "disabled:opacity-50"}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Apply Bulk Attendance"
          )}
        </button>
      </div>
    </form>
  );
};

export default BulkAttendanceForm;
