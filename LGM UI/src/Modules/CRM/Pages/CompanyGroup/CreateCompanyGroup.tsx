import React, { useState } from "react";
import type { CompanyGroup } from "./Services/types";
import { createCompanyGroup } from "./Services/CompanyGroupService";
import { toast } from "sonner";

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateCompanyGroup: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name is required");
    try {
      // FIX: Using the CompanyGroup type here to clear the TS warning
      const payload: CompanyGroup = {
        id: 0,
        companyGroupName: name,
      };

      await createCompanyGroup(payload);
      toast.success("Group created successfully");
      onSuccess();
    } catch {
      toast.error("Failed to create group");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      {/* Header mimicking the tab bar design */}
      <div className="bg-[#f07837] p-2 rounded-full mb-6">
        <div className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold w-max shadow-md">
          Company Group Details
        </div>
      </div>

      {/* Inner Light Gray Container */}
      <div className="bg-gray-50 p-8 rounded-lg min-h-[150px]">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-8 uppercase tracking-tight">
          <span className="text-2xl">🏢</span> Create New Group
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input with Overlapping Label Design */}
          <div className="relative border border-gray-300 rounded-xl px-4 py-2 bg-white h-12 flex items-center shadow-sm">
            <label className="absolute -top-2.5 left-4 bg-white px-1 text-[10px] font-bold text-gray-500 uppercase z-10 tracking-wide">
              Company Group Name
            </label>
            <input
              className="w-full outline-none text-sm text-gray-700 bg-transparent"
              placeholder="Enter group name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pill-Shaped Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          className="bg-red-500 text-white px-8 py-2 rounded-full font-bold text-sm shadow-md hover:bg-red-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-[#f07837] text-white px-8 py-2 rounded-full font-bold text-sm shadow-md hover:bg-blue-900 transition"
        >
          Save Group
        </button>
      </div>
    </div>
  );
};

export default CreateCompanyGroup;
