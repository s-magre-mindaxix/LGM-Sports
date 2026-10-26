import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateLoanMaster, type LoanMaster } from "./LoanMasterService";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  loanMaster: LoanMaster;
}

const EditLoanMasterModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loanMaster
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(loanMaster.loanTypeName);
      setDescription(loanMaster.description || "");
      setIsDeleted(loanMaster.isDeleted);
    }
  }, [isOpen, loanMaster]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty.");

    setIsSaving(true);
    try {
      await updateLoanMaster(loanMaster.id, {
        loanTypeName: name,
        description,
        isDeleted
      });

      toast.success("Loan type updated successfully!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">

        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Edit Loan Type</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            <div>
              <label className="text-sm font-medium">Loan Type Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            {/* NEW: Toggle IsDeleted */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isDeleted}
                onChange={() => setIsDeleted(!isDeleted)}
              />
              <span className="text-sm">Mark as Deleted</span>
            </div>

          </div>

          <div className="flex justify-end gap-3 border-t p-4 bg-gray-50">
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
              className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditLoanMasterModal;
