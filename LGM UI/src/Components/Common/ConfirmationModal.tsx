// src/components/common/ConfirmationModal.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: "danger" | "primary";
  children?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonVariant = "primary",
  children,
}) => {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClasses = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    primary: "bg-green-700  focus:ring-blue-500",
  };

  return (
    <div
      className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 text-left shadow-xl transition-all">
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <AlertTriangle
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="ml-4 grow text-left">
            <h3
              className="text-lg font-semibold leading-6 text-gray-900"
              id="modal-title"
            >
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{message}</p>
            </div>
            {children}
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors sm:w-auto ${confirmButtonClasses[confirmButtonVariant]}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
          <button
            type="button"
             className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            onClick={onClose}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
