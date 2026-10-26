import React, { useState } from "react";
import { Lock, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { changePassword } from "../Modules/HRMS/Pages/Auth/AuthService";
import { toast } from "sonner";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  id,
  value,
  onChange,
  show,
  onToggle,
}) => (
  <div>
    <label htmlFor={id} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Lock className="h-5 w-5 text-gray-400" />
      </span>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        required
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
      >
        {show ? (
          <EyeOff className="h-5 w-5 text-gray-400" />
        ) : (
          <Eye className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  </div>
);

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetState = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await changePassword({ oldPassword, newPassword });
      toast.success(response.message);

      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Change Password
          </h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Old Password"
            id="old-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            show={showOld}
            onToggle={() => setShowOld(!showOld)}
          />
          <PasswordInput
            label="New Password"
            id="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          <PasswordInput
            label="Confirm New Password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {isLoading && (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
