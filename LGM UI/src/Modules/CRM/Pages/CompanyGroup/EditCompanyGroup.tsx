import React, { useState } from 'react';
import type { CompanyGroup } from './Services/types';
import { updateCompanyGroup } from './Services/CompanyGroupService';
import { toast } from 'sonner';

interface Props {
    data: CompanyGroup;
    onSuccess: () => void;
    onCancel: () => void;
}

const EditCompanyGroup: React.FC<Props> = ({ data, onSuccess, onCancel }) => {
    const [name, setName] = useState(data.companyGroupName);

    const handleUpdate = async () => {
        if (!name.trim()) return toast.error("Name is required");
        try {
            await updateCompanyGroup(data.id, { ...data, companyGroupName: name });
            toast.success("Group updated successfully");
            onSuccess();
        } catch {
            toast.error("Failed to update group");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Header mimicking the tab bar design */}
            <div className="bg-[#f07837] p-2 rounded-full mb-6">
                <div className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold w-max shadow-md">
                    Update Mode
                </div>
            </div>

            {/* Inner Light Gray Container */}
            <div className="bg-gray-50 p-8 rounded-lg min-h-[150px]">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-8 uppercase tracking-tight">
                    <span className="text-2xl">📝</span> Edit Company Group
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input with Overlapping Label Design */}
                    <div className="relative border border-gray-300 rounded-xl px-4 py-2 bg-white h-12 flex items-center shadow-sm">
                        <label className="absolute -top-2.5 left-4 bg-white px-1 text-[10px] font-bold text-gray-500 uppercase z-10 tracking-wide">
                            Company Group Name
                        </label>
                        <input 
                            className="w-full outline-none text-sm text-gray-700 bg-transparent" 
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
                    onClick={handleUpdate} 
                    className="bg-[#f07837] text-white px-8 py-2 rounded-full font-bold text-sm shadow-md hover:bg-blue-900 transition"
                >
                    Update Group
                </button>
            </div>
        </div>
    );
};

export default EditCompanyGroup;