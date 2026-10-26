import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Calendar,
  Upload,
  File as FileIcon,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import {
  getExpenseTypes,
  type ExpenseTypeItem,
} from "../../Services/MasterDataService";
import { createExpenseClaim } from "./expenseClaimService";
import { isAxiosError } from "axios";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  icon,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${
          icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500 
                   group-[.submitted]:invalid:focus:border-red-500`}
        {...rest}
      />
    </div>
  </div>
);

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  name: string;
  children: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  children,
  ...rest
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      className={`w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                  group-[.submitted]:invalid:border-red-500 
                  group-[.submitted]:invalid:focus:ring-red-500 
                  group-[.submitted]:invalid:focus:border-red-500`}
      {...rest}
    >
      {children}
    </select>
  </div>
);

const TextArea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    name: string;
  }
> = ({ label, name, ...rest }) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {rest.required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      className={`w-full p-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm 
                       group-[.submitted]:invalid:border-red-500 
                       group-[.submitted]:invalid:focus:ring-red-500 
                       group-[.submitted]:invalid:focus:border-red-500`}
      {...rest}
    />
  </div>
);

interface CreateExpenseClaimProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const INITIAL_FORM_STATE = {
  expenseTypeId: "",
  amount: "",
  claimDate: "",
  description: "",
  receiptFile: null as FileList | null,
};

const CreateExpenseClaim: React.FC<CreateExpenseClaimProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileName =
    formData.receiptFile && formData.receiptFile.length > 0
      ? formData.receiptFile[0].name
      : null;

  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_STATE);
      setIsSubmitted(false);

      const fetchMasterData = async () => {
        try {
          const typesData = await getExpenseTypes();
          setExpenseTypes(typesData);
        } catch {
          toast.error("Failed to load expense types for the form.");
        }
      };
      fetchMasterData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: fileInput.files }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, receiptFile: files }));
      toast.info(`File "${files[0].name}" selected.`);
    }
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
      const apiFormData = new FormData();
      apiFormData.append("ExpenseTypeID", formData.expenseTypeId);
      apiFormData.append("Amount", formData.amount);
      apiFormData.append(
        "ClaimDate",
        new Date(formData.claimDate).toISOString()
      );
      apiFormData.append("Description", formData.description);

      if (formData.receiptFile && formData.receiptFile.length > 0) {
        apiFormData.append("ReceiptFile", formData.receiptFile[0]);
      }

      await createExpenseClaim(apiFormData);
      toast.success("Expense claim submitted successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      let errorMessage = "Failed to submit claim. Please try again.";

      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            New Expense Claim
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Modal Body with Form */}
        <form
          onSubmit={handleSubmit}
          className={`group ${isSubmitted ? "submitted" : ""} overflow-y-auto`}
          noValidate
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <SelectField
              label="Expense Type"
              name="expenseTypeId"
              value={formData.expenseTypeId}
              onChange={handleChange}
              required
            >
              <option value="">Select an expense type</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.expenseTypeName}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter claim amount"
              icon={<IndianRupee size={18} />}
              value={formData.amount}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <InputField
                label="Date of Expense"
                name="claimDate"
                type="date"
                icon={<Calendar size={18} />}
                value={formData.claimDate}
                onChange={handleChange}
                required
                max={getTodayString()}
              />
            </div>

            <div className="md:col-span-2">
              <TextArea
                label="Description"
                name="description"
                rows={3}
                placeholder="Add any relevant details, like purpose of expense..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Receipt (Optional)
              </label>
              {fileName ? (
                <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <FileIcon size={16} className="text-gray-500" />
                    <span className="truncate max-w-xs">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, receiptFile: null }))
                    }
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="receiptFile"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="receiptFile"
                          name="receiptFile"
                          type="file"
                          className="sr-only"
                          onChange={handleChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end items-center gap-3 border-t p-4 shrink-0 bg-gray-50 rounded-b-lg">
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
              {isLoading ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpenseClaim;
