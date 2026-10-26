import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { CompanyGroup } from "./Services/types";
import {
  createCompanyGroup,
  updateCompanyGroup,
} from "./Services/CompanyGroupService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface Props {
  editData: CompanyGroup | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CompanyGroupForm: React.FC<Props> = ({
  editData,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Determine if the form is in edit mode
  const isEditMode = Boolean(editData);

  // Populate form with data when in edit mode
  useEffect(() => {
    if (editData) {
      setName(editData.companyGroupName);
    } else {
      setName(""); // Clear the input for create mode
    }
  }, [editData]);

  const handleSave = async () => {
    if (!name.trim()) {
      return toast.error("Company Group Name is required.");
    }

    setIsSaving(true);
    try {
      const payload = { id: editData?.id || 0, companyGroupName: name };

      if (isEditMode) {
        await updateCompanyGroup(editData!.id, payload);
        toast.success("Group updated successfully!");
      } else {
        await createCompanyGroup(payload);
        toast.success("Group created successfully!");
      }
      onSuccess(); // Trigger reload and close form
    } catch {
      toast.error("An error occurred while saving the group.");
    } finally {
      setIsSaving(false);
    }
  };

  // Style for the input field to match the screenshot
  const inputStyle =
    "w-full text-base border-2 border-gray-300 rounded-md px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white";

  return (
    // Main container matching the screenshot's design
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-md mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Form Title */}
      <h3 className="text-xl font-bold text-gray-800 mb-5 border-b pb-3">
        {isEditMode ? "Edit Company Group" : "Add New Company Group"}
      </h3>

      {/* Input Field */}
      <div className="mb-5">
        <input
          className={inputStyle}
          placeholder="Enter company group name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          // Allow submitting with Enter key
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className={buttonStyles.cancel}>
          Cancel
        </button>
        <button
          disabled={isSaving}
          onClick={handleSave}
          className={buttonStyles.save}
        >
          {isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CompanyGroupForm;
