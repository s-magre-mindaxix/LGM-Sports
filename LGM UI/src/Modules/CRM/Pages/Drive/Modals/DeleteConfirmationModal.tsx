import React from "react";
import MotionWrapper from "./MotionWrapper";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}) => {
  if (!isOpen) return null;

  return (
    <MotionWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="w-full max-w-[450px] bg-white rounded-lg shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-orange-200 flex items-center justify-center">
              <span className="text-orange-400 text-6xl font-light">!</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-[#595959] text-3xl font-bold mb-4">
              Are you sure?
            </h2>
            <p className="text-[#797979] text-lg mb-8">
              You want to delete{" "}
              <span className="font-semibold text-gray-700">"{itemName}"</span>?
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-[#dc3545] text-white rounded-md font-bold hover:bg-red-700 transition-colors"
            >
              Yes, delete it!
            </button>
            <button
              onClick={onClose}
              className="px-8 py-2 bg-[#3085d6] text-white rounded-md font-bold hover:bg-blue-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
};

export default DeleteConfirmationModal;
