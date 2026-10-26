import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import Select from "react-select";
import {
  createAdvance,
  type AdvanceCreatePayload,
} from "./Services/AdvanceService";
import type { EmployeeSelectItem } from "../../Services/MasterDataService";
import Modal from "../../../../Components/Common/Modal";

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  employees: EmployeeSelectItem[];
}

// react-select saathi lagnara option cha format
interface SelectOption {
  value: number;
  label: string;
}

const AdvanceModal: React.FC<AdvanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employees,
}) => {
  // === 2. STATE MADHE BADAL ===
  // Aapan string aivaji purn selected object save karu.
  const [selectedEmployee, setSelectedEmployee] = useState<SelectOption | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [requestDate, setRequestDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // === 3. EMPLOYEE DATA LA REACT-SELECT SAATHI TAYAR KARNE ===
  // Tumchya employee list la {value, label} format madhe badalne.
  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.id,
        label: emp.fullName,
      })),
    [employees],
  );

  useEffect(() => {
    if (isOpen) {
      // Modal ughadlyavar form reset kara
      setSelectedEmployee(null); // State la null ne reset kara
      setAmount("");
      setRequestDate(new Date().toISOString().split("T")[0]);
      setReason("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // === 4. VALIDATION MADHE BADAL ===
    if (!selectedEmployee || !amount || !requestDate) {
      toast.error("Please fill Employee, Amount and Date fields.");
      setIsSaving(false); // return karavnya adhi isSaving la false kara
      return;
    }

    setIsSaving(true);
    try {
      const payload: AdvanceCreatePayload = {
        employeeID: selectedEmployee.value, // ID la selectedEmployee madhun ghya
        amount: parseFloat(amount),
        requestDate,
        reason,
      };
      await createAdvance(payload);
      toast.success("Advance record created successfully!");
      onSave();
      onClose();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Advance">
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div>
          <label
            htmlFor="employee"
            className="block text-sm font-medium text-gray-700"
          >
            Employee
          </label>
          {/* === 5. SADHYA DROPDOWN LA REACT-SELECT COMPONENT NE BADLA === */}
          <Select
            id="employee"
            options={employeeOptions}
            value={selectedEmployee}
            onChange={(selectedOption) =>
              setSelectedEmployee(selectedOption as SelectOption)
            }
            isClearable
            isSearchable
            placeholder="Search and select an employee..."
            // Hya classNames ne dropdown tumchya theme sobat match hoil
            classNames={{
              control: () =>
                "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-1 focus:outline-none focus:ring-2 focus:ring-blue-500",
              input: () => "text-sm",
              option: ({ isFocused, isSelected }) =>
                `p-2 text-sm ${isFocused ? "bg-blue-100" : ""} ${isSelected ? "bg-blue-500 text-white" : ""}`,
            }}
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Amount (₹)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="requestDate"
            className="block text-sm font-medium text-gray-700"
          >
            Date
          </label>
          <input
            type="date"
            id="requestDate"
            value={requestDate}
            onChange={(e) => setRequestDate(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700"
          >
            Reason (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
             className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 border border-transparent rounded-md shadow-sm"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdvanceModal;
