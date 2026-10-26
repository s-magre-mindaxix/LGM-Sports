
import React, { useState, useEffect } from "react";
import type { PartCondition } from "./Services/types";;
import { savePartCondition } from "./Services/PartConditionService";
import { toast } from "sonner";
interface Props {
  onCancel: () => void;
  onSave: (data: PartCondition) => void;
  editData: PartCondition | null;
}

const PartConditionForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false); // <--- ADD THIS LINE

  useEffect(() => {
    setName(editData ? editData.partConditionName : "");
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, partConditionName: name.trim() };
      await savePartCondition(payload);
      toast.success("Saved successfully");
      onSave(payload); // Pass payload back to refresh list
    } catch (error) {
      toast.error("Error saving");
    } finally {
      setIsSaving(false);
    }
  };
 return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="border-b bg-gray-50 px-6 py-3">
        <h3 className="font-bold text-gray-700">{editData ? "Edit Part Condition" : "Add New Part Condition"}</h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-xl">
          <label className="block text-sm font-medium text-gray-600 mb-2">Part Condition</label>
          <input
            autoFocus
            className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500"
            placeholder="Enter Part Condition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-start gap-3 mt-6">
          <button type="submit" disabled={isSaving} className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400">
            {isSaving ? "Saving..." : (editData ? "Update" : "Add")}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default PartConditionForm;