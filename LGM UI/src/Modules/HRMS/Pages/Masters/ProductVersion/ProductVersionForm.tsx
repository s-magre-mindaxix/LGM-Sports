import React, { useState, useEffect } from "react";
import type { ProductVersion } from "./Services/types";
import { saveProductVersion } from "./Services/ProductVersionService";
import { toast } from "sonner";

interface Props {
  onCancel: () => void;
  onSave: (data: ProductVersion) => void; 
  editData: ProductVersion | null;
}

const ProductVersionForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false); // Fix for "Cannot find name setIsSaving"

  useEffect(() => {
    setName(editData ? editData.versionName : "");
  }, [editData]);

//   const handleSubmit = async (e: React.FormEvent) => {

//     e.preventDefault();
//     if (!name.trim()) return toast.error("Please enter a version name");

//     setIsSaving(true);
//     try {
//       // Prepare payload
//       const payload = { id: editData?.id || 0, versionName: name.trim() };
      
//       // 1. Actually call the API to save to SQL Database
// await saveProductVersion(payload);

//       toast.success("Version saved successfully");
      
//       // 2. Trigger the refresh in ProductWizard or VersionPage
//       onSave({
//   ...payload,
//   id: editData?.id || payload.id
// });
//     } catch (error) {
//       toast.error("Failed to save version to database");
//       console.error(error);
//     } finally {
//       setIsSaving(false);
//     }
//   };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!name.trim()) {
    return toast.error("Please enter a version name");
  }

  if (isSaving) return;

  setIsSaving(true);

  try {
    // Prepare payload
    const payload = {
      id: editData?.id || 0,
      versionName: name.trim(),
    };

    // Save to database
    await saveProductVersion(payload);

    toast.success(
      editData
        ? "Version updated successfully"
        : "Version saved successfully"
    );

    // Refresh parent list only
    onSave(payload);

  } catch (error) {
    toast.error("Failed to save version to database");
    console.error(error);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
      <div className="border-b bg-gray-50 px-6 py-3">
        <h3 className="font-bold text-gray-700">
            {editData ? "Edit Version" : "Add New Version"}
        </h3>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="max-w-xl">
            <label className="block text-sm font-medium text-gray-600 mb-2">Version Name</label>
            <input
              autoFocus
              className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:border-blue-500 transition"
              placeholder="Enter Version"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
        </div>
        
        <div className="flex justify-start gap-3 mt-6">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 transition shadow-md disabled:bg-gray-400"
          >
            {isSaving ? "Saving..." : (editData ? "Update" : "Add")}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-gray-600 transition shadow-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductVersionForm;