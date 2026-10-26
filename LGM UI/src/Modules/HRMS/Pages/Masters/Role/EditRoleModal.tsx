import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateRole, type Role } from "./Services/RoleService";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Role;
}

const EditRoleModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSuccess, role }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(role.name);
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Role name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      await updateRole(role.id, { name });
      toast.success("Role updated successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update role.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit Role</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end items-center gap-3 border-t p-4 bg-gray-50 rounded-b-lg">
            <button type="button" onClick={onClose} disabled={isSaving}  className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
              Cancel
            </button>
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

export default EditRoleModal;