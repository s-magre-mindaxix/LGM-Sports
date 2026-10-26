// In a new file: pages/Masters/UpdateStatutorySettingModal.tsx
import React, { useState, useEffect } from "react";
import { X, LoaderCircle, Tag, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

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
interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  settingId: number | null;
}

const UpdateStatutorySettingModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  settingId,
}) => {
  const [settingName, setSettingName] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && settingId) {
      const fetchSetting = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get(
            `${API_ENDPOINTS.StatutorySettings}/${settingId}`
          );
          const data = response.data;
          setSettingName(data.settingName);
          setSettingValue(data.settingValue);
          setEffectiveDate(
            data.effectiveDate
              ? new Date(data.effectiveDate).toISOString().split("T")[0]
              : ""
          );
        } catch {
          toast.error("Failed to fetch setting details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchSetting();
    }
  }, [isOpen, settingId, onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settingId) return;

    setIsSubmitting(true);
    const payload = { id: settingId, settingName, settingValue, effectiveDate };

    try {
      await apiClient.put(
        `${API_ENDPOINTS.StatutorySettings}/${settingId}`,
        payload
      );
      toast.success(`Setting '${payload.settingName}' updated successfully.`);
      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        toast.error(
          error.response.data?.message ||
            "Failed to update setting due to a server error."
        );
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while updating the setting.");
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
            Edit Statutory Setting
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        {isLoading ? (
          <div className="p-6 text-center">
            <LoaderCircle className="animate-spin mx-auto text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
            <InputField
              label="Setting Name"
              name="settingName"
              value={settingName}
              onChange={(e) => setSettingName(e.target.value)}
              required
              icon={Tag}
            />
            <InputField
              label="Setting Value"
              name="settingValue"
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
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
                {isSubmitting ? "Saving..." : "Update Setting"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateStatutorySettingModal;
