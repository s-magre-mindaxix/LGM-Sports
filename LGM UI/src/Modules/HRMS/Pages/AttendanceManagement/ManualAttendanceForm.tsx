import React, { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import {
  getEmployeeSelectionList,
  type EmployeeSelectItem,
} from "../../Services/MasterDataService";
import {
  addManualAttendance,
  getAttendanceByEmployee,
  type AttendanceRecord,
} from "./attendanceService";
import axios from "axios";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface ManualAttendanceFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

const ManualAttendanceForm: React.FC<ManualAttendanceFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [employees, setEmployees] = useState<EmployeeSelectItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [punchInTime, setPunchInTime] = useState("");
  const [punchOutTime, setPunchOutTime] = useState("");
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getEmployeeSelectionList();
      setEmployees(data);
    };
    fetchEmployees();
  }, []);

  const employeeOptions: SelectOption[] = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.id.toString(),
        label: emp.fullName,
      })),
    [employees],
  );

  const isSunday = useMemo(() => {
    if (!date) return false;
    const selectedDate = new Date(`${date}T00:00:00`);
    return selectedDate.getDay() === 0;
  }, [date]);

  useEffect(() => {
    const checkExistingRecord = async () => {
      if (selectedEmployeeId && date) {
        setIsLoading(true);
        try {
          const record = await getAttendanceByEmployee(
            parseInt(selectedEmployeeId),
            date,
          );
          setExistingRecord(record);
          if (record && record.inTime) {
            const inTime24 = new Date(`1970-01-01 ${record.inTime.time}`)
              .toTimeString()
              .substring(0, 5);
            setPunchInTime(inTime24);
          } else {
            setPunchInTime("");
          }
          setPunchOutTime("");
        } catch (error) {
          console.error("Failed to check for existing record", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setExistingRecord(null);
        setPunchInTime("");
        setPunchOutTime("");
      }
    };
    checkExistingRecord();
  }, [selectedEmployeeId, date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId || !date || (!punchInTime && !existingRecord)) {
      alert("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);

    const combineDateTime = (time: string) => {
      if (!time) return null;
      return `${date}T${time}:00`;
    };

    const payload = {
      employeeId: parseInt(selectedEmployeeId),
      date: new Date(date).toISOString(),
      inTime: combineDateTime(punchInTime),
      outTime: combineDateTime(punchOutTime),
      status: 0,
      notes: "Manual Entry/Update",
    };

    try {
      await addManualAttendance(payload);
      onSuccess();
    } catch (error) {
      console.error("Failed to save attendance", error);
      if (axios.isAxiosError(error) && error.response?.data) {
        toast.error(error.response.data.message || error.response.data);
      } else {
        toast.error("An error occurred while saving. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPunchInDisabled = !!existingRecord?.inTime;

  const selectedEmployeeOption = employeeOptions.find(
    (option) => option.value === selectedEmployeeId,
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {isSunday && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          <strong>Note:</strong> You have selected a Sunday (Weekly Off).
          Submitting this entry will grant the employee one "C-Off" leave
          credit.
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-500">
          Checking for existing record...
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Punch In Time
              </label>
              <input
                type="time"
                value={punchInTime}
                onChange={(e) => setPunchInTime(e.target.value)}
                // disabled={isPunchInDisabled}
                required={!isPunchInDisabled}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"                
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Punch Out Time
              </label>
              <input
                type="time"
                value={punchOutTime}
                onChange={(e) => setPunchOutTime(e.target.value)}
                disabled={!punchInTime}
                className={`mt-1 block w-full p-2 border border-gray-300 rounded-md ${
                  !punchInTime ? "bg-gray-100" : ""
                }`}
              />
            </div>
          </div>
          {isPunchInDisabled && (
            <p className="text-xs text-blue-600">
              Employee has already punched in. You can add a punch-out time.
            </p>
          )}
        </>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className={buttonStyles.cancel}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className={buttonStyles.save}
        >
          {isSubmitting ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
};

export default ManualAttendanceForm;
