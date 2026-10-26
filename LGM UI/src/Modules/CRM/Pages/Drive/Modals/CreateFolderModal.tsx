import React, { useEffect, useRef } from "react";
import { FolderPlus, X } from "lucide-react";
import MotionWrapper from "./MotionWrapper";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  value: string;
  onChange: (val: string) => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <MotionWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#f07837] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <FolderPlus size={22} />
            <h3 className="text-lg font-bold">Create New Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter folder name..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) onConfirm(value);
            }}
            className="w-[468px] h-[38px] rounded-lg border border-gray-200 px-3 text-[14px] text-gray-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(value)}
            className="rounded-lg bg-[#f07837] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a467e] disabled:opacity-50 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default CreateFolderModal;
