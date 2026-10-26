import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateDepartment, type Department } from "./Services/DepartmentService";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department: Department;
}

const EditDepartmentModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSuccess, department }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setName(department.departmentName);
  }, [isOpen, department]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty.");
    setIsSaving(true);
    try {
      await updateDepartment(department.id, { departmentName: name });
      toast.success("Department updated successfully!");
      onSuccess();
      onClose();
    } catch  {
      toast.error("Failed to update department.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Edit Department</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-3 border-t p-4 bg-gray-50">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>
            <button type="submit" disabled={isSaving}  className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
              {isSaving && <Loader2 className="animate-spin" size={16} />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDepartmentModal;