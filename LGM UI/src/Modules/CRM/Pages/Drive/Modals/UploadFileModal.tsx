import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import MotionWrapper from "./MotionWrapper";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
 onUpload: (files: File[]) => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files) {
    setSelectedFiles(Array.from(e.target.files));
  }
};

 const handleConfirm = () => {
  if (selectedFiles.length > 0) {
    onUpload(selectedFiles);
    setSelectedFiles([]);
  }
};

  return (
    <MotionWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#f07837] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <Upload size={22} strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-[18px]">Upload File</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex justify-center">
          <div className="w-[468px] h-[38px] flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Hidden Real Input */}
            <input
              type="file"
               multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Fake "Choose Files" Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-full px-4 bg-gray-50 border-r border-gray-200 text-[13px] text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Choose Files
            </button>

            {/* File Name Display */}
            <div className="px-3 text-[13px] text-gray-500 truncate">
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file(s) selected`
              : "No file chosen"}
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <button
            onClick={() => {
              onClose();
              setSelectedFiles([]);            
            }}
            className="rounded-lg bg-white px-6 py-2 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-[#f07837] px-8 py-2 text-sm font-bold text-white hover:bg-[#1a467e] disabled:opacity-50 transition-colors shadow-md"
          >
            Upload
          </button>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default UploadFileModal;
