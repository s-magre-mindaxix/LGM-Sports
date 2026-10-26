import React, { useState, useEffect } from "react";
import type { Category } from "./Services/types";
import { saveCategory } from "./Services/CategoryService";
import { toast } from "sonner";

interface Props {
  onCancel: () => void;
  onSave: (data: Category) => void;
  editData: Category | null;
}

const CategoryForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false); // <--- ADD THIS

  useEffect(() => {
    setName(editData ? editData.categoryName : "");
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, categoryName: name.trim() };
      await saveCategory(payload);
      toast.success("Saved successfully");
      onSave(payload);
    } catch (error) {
      toast.error("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
       <h3 className="font-bold text-gray-700 mb-4">{editData ? "Edit Category" : "Add New Category"}</h3>
       <form onSubmit={handleSubmit}>
          <input autoFocus className="w-full border p-2.5 rounded-lg" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={isSaving} className="bg-green-700 text-white px-8 py-2 rounded-lg">{isSaving ? "Saving..." : "Add"}</button>
            <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-8 py-2 rounded-lg">Cancel</button>
          </div>
       </form>
    </div>
  );
};
export default CategoryForm;