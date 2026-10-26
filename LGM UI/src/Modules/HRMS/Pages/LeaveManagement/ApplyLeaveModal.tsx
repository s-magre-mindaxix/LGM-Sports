import React, { useState, useEffect } from "react";
import { X, LoaderCircle, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import {
  getLeaveTypes,
  applyForLeave,
  type LeaveType,
  type NewLeaveRequestPayload,
} from "./LeaveService";
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../../../hooks/useAuth";

const datePickerClass = `
  w-full pl-10 p-2 border border-gray-300 rounded-md shadow-sm 
  focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm 
  text-gray-700 placeholder-gray-400
`;

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
  leaveTypeID: "",
  reason: "",
  isHalfDay: false,
  halfDayPeriod: "First Half",
};

const FormField = ({
  label,
  required = true,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth(); 

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchTypes = async () => {
        try {
          const data = await getLeaveTypes();
          setLeaveTypes(data);
        } catch {
          toast.error("Failed to load leave types.");
        }
      };
      fetchTypes();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setFormData(INITIAL_FORM_STATE);
    setFromDate(null);
    setToDate(null);
    onClose();
  };

  // const handleChange = (
  //   e: React.ChangeEvent<
  //     HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
  //   >
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleChange = (
      e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value, type } = e.target;
      const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      
      setFormData((prev) => {
          const newState = { ...prev, [name]: val };
          if (name === "isHalfDay" && val === true) {
              setToDate(fromDate);
          }
          return newState;
      });
    };

  const formatDateForApi = (date: Date | null): string => {
    if (!date) return "";
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  // const handleSubmit = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   if (!user) {
  //     toast.error("You must be logged in to apply for leave.");
  //     return;
  //   }

  //   if (
  //     !formData.leaveTypeID ||
  //     !fromDate || 
  //     !toDate ||
  //     !formData.reason
  //   ) {
  //     toast.error("Please fill in all required fields.");
  //     return;
  //   }

  //   setIsLoading(true);

  //   const payload: NewLeaveRequestPayload = {
  //     employeeID: user.employeeId,
  //     leaveTypeID: parseInt(formData.leaveTypeID, 10),
  //    fromDate: formatDateForApi(fromDate),
  //     toDate: formatDateForApi(toDate),
  //     reason: formData.reason,
  //   };

  //   try {
  //     await applyForLeave(payload);
  //     toast.success("Leave application submitted successfully!");
  //     onSuccess(); 
  //     handleClose();
  //   } catch (error: unknown) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "An unknown error occurred.";
  //     toast.error(errorMessage);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();
  
      if (!user) {
        toast.error("You must be logged in to apply for leave.");
        return;
      }
  
      if (!formData.leaveTypeID || !fromDate || (!formData.isHalfDay && !toDate) || !formData.reason) {
        toast.error("Please fill in all required fields.");
        return;
      }
  
      setIsLoading(true);
  
      const payload: NewLeaveRequestPayload = {
        employeeID: user.employeeId,
        leaveTypeID: parseInt(formData.leaveTypeID, 10),
        fromDate: formatDateForApi(fromDate),
        toDate: formData.isHalfDay ? formatDateForApi(fromDate) : formatDateForApi(toDate),
        reason: formData.reason,
        isHalfDay: formData.isHalfDay, 
        halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : null
      };
  
      try {
        await applyForLeave(payload);
        toast.success("Leave application submitted successfully!");
        onSuccess(); 
        handleClose();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex justify-between items-center border-b p-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Apply for Leave
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <FormField label="Leave Type">
              <select
                name="leaveTypeID"
                value={formData.leaveTypeID}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.leaveTypeName}
                  </option>
                ))}
              </select>
            </FormField>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="From Date">
                <div className="relative">
                  <CalendarIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                  />
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      if (toDate && date && toDate < date) {
                        setToDate(null);
                      }
                    }}
                    selectsStart
                    startDate={fromDate}
                    endDate={toDate}
                    placeholderText="Select start date"
                    className={datePickerClass}
                    dateFormat="yyyy-MM-dd"
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
              </FormField>

              <FormField label="To Date">
                <div className="relative">
                  <CalendarIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none"
                  />
                  <DatePicker
                    selected={toDate}
                    onChange={(date) => setToDate(date)}
                    selectsEnd
                    startDate={fromDate}
                    endDate={toDate}
                    minDate={fromDate || undefined} 
                    placeholderText="Select end date"
                    className={datePickerClass}
                    dateFormat="yyyy-MM-dd"
                    disabled={!fromDate} 
                    onKeyDown={(e) => e.preventDefault()}
                  />
                </div>
              </FormField>
            </div> */}

<div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isHalfDay"
                name="isHalfDay"
                checked={formData.isHalfDay}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isHalfDay" className="text-sm font-medium text-gray-700">
                Apply for Half Day
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={formData.isHalfDay ? "Date" : "From Date"}>
                <div className="relative">
                  <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={fromDate}
                    onChange={(date) => {
                      setFromDate(date);
                      if (formData.isHalfDay) setToDate(date);
                    }}
                    className={datePickerClass}
                    dateFormat="yyyy-MM-dd"
                  />
                </div>
              </FormField>

              {!formData.isHalfDay ? (
                <FormField label="To Date">
                  <div className="relative">
                    <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                    <DatePicker
                      selected={toDate}
                      onChange={(date) => setToDate(date)}
                      minDate={fromDate || undefined}
                      className={datePickerClass}
                      dateFormat="yyyy-MM-dd"
                      disabled={!fromDate}
                    />
                  </div>
                </FormField>
              ) : (
                <FormField label="Period">
                  <div className="flex gap-4 h-10 items-center">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="halfDayPeriod" 
                        value="First Half" 
                        checked={formData.halfDayPeriod === "First Half"}
                        onChange={handleChange}
                      /> First Half
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="halfDayPeriod" 
                        value="Second Half" 
                        checked={formData.halfDayPeriod === "Second Half"}
                        onChange={handleChange}
                      /> Second Half
                    </label>
                  </div>
                </FormField>
              )}
            </div>

            <FormField label="Reason">
              <textarea
                name="reason"
                rows={4}
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                placeholder="Enter reason for leave..."
              />
            </FormField>
          </div>

          <div className="flex justify-end items-center gap-3 border-t p-4 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={handleClose}
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
              {isLoading && <LoaderCircle className="animate-spin" size={16} />}
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
