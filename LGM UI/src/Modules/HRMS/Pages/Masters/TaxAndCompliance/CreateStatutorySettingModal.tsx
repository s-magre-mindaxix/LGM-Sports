// In a new file: pages/Masters/CreateStatutorySettingModal.tsx
import React, { useState, useEffect } from "react";
import { X, LoaderCircle, Tag, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import apiClient from "../../../../../API/apiClient";

// --- Reusable InputField component defined locally ---
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  icon?: React.ElementType;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  icon: Icon,
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
      {Icon && (
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
          <Icon size={18} />
        </span>
      )}
      <input
        id={name}
        name={name}
        className={`w-full ${
          Icon ? "pl-10" : "pl-3"
        } pr-3 py-2 border rounded-md shadow-sm text-sm 
                   placeholder-gray-400 focus:outline-none focus:ring-1 
                   border-gray-300 focus:ring-blue-500 focus:border-blue-500
                   group-[.submitted]:invalid:border-red-500 
                   group-[.submitted]:invalid:focus:ring-red-500`}
        {...rest}
      />
    </div>
  </div>
);

// --- Main Modal Component ---
interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStatutorySettingModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [settingName, setSettingName] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettingName("");
      setSettingValue("");
      setEffectiveDate(new Date().toISOString().split("T")[0]);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (!e.currentTarget.checkValidity()) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    const payload = { settingName, settingValue, effectiveDate };

    try {
      await apiClient.post(API_ENDPOINTS.StatutorySettings, payload);
      toast.success(`Setting '${payload.settingName}' created successfully.`);
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data?.message ||
            "Failed to create setting due to a server error."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while creating the setting.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Create Statutory Setting
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className={`group p-6 space-y-4 ${isSubmitted ? "submitted" : ""}`}
          noValidate
        >
          <InputField
            label="Setting Name"
            name="settingName"
            value={settingName}
            onChange={(e) => setSettingName(e.target.value)}
            placeholder="e.g., PF_Wage_Ceiling"
            required
            icon={Tag}
          />
          <InputField
            label="Setting Value"
            name="settingValue"
            value={settingValue}
            onChange={(e) => setSettingValue(e.target.value)}
            placeholder="e.g., 15000"
            required
            icon={TrendingUp}
          />
          <InputField
            label="Effective Date"
            name="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            required
            icon={Calendar}
          />
          <div className="flex justify-end gap-3 border-t pt-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
            >
              {isSubmitting && (
                <LoaderCircle className="animate-spin" size={16} />
              )}
              {isSubmitting ? "Saving..." : "Create Setting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStatutorySettingModal;
