import React, { useState, useEffect } from "react";
import type { ProductGroup } from "./Services/types";
import { saveProductGroup } from "./Services/ProductGroupService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

interface Props {
  onCancel: () => void;
  onSave: (data: ProductGroup) => void;
  editData: ProductGroup | null;
}

const ProductGroupForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(editData ? editData.groupName : "");
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a group name");

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, groupName: name.trim() };
      await saveProductGroup(payload);
      toast.success("Group saved successfully");
      onSave(payload);
    } catch (error) {
      toast.error("Error saving group");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="border-b bg-gray-50 px-6 py-3">
        <h3 className="font-bold text-gray-700">
          {editData ? "Edit Product Group" : "Add New Product Group"}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-xl">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Group Name
          </label>
          <input
            autoFocus
            className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500 transition"
            placeholder="Enter group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-start gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className={buttonStyles.cancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={buttonStyles.save}
          >
            {isSaving ? "Saving..." : editData ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductGroupForm;
