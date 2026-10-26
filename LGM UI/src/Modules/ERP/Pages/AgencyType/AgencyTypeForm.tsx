import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createAgencyType, updateAgencyType } from "./Services/AgencyTypeService";
import type { AgencyType } from "./Services/types";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface FormProps {
    editData: AgencyType | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialFormState: AgencyType = {
    id: 0,
    agencyTypeName: "",
};

const AgencyTypeForm: React.FC<FormProps> = ({ editData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<AgencyType>(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editData) {
            setFormData(editData);
        } else {
            setFormData(initialFormState);
        }
    }, [editData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.agencyTypeName.trim()) {
            toast.error("Agency Type Name is required.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        const payload = {
            id: formData.id,
            agencyTypeName: formData.agencyTypeName,
        };

        try {
            if (formData.id > 0) {
                await updateAgencyType(payload);
                toast.success("Agency Type updated successfully!");
            } else {
                const { id, ...createData } = payload;
                await createAgencyType(createData);
                toast.success("Agency Type created successfully!");
            }
            onSuccess();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to save Agency Type.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-700 mb-6">
                    {editData ? "Edit Agency Type" : "Create Agency Type"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="agencyTypeName" className="block text-sm font-medium text-gray-700 mb-1">Agency Type Name</label>
                        <input
                            id="agencyTypeName"
                            name="agencyTypeName"
                            type="text"
                            value={formData.agencyTypeName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            placeholder="e.g., Freight Forwarder"
                        />
                    </div>
                </form>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t">
                <button type="button" onClick={onCancel} className={buttonStyles.cancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className={buttonStyles.save}
                >
                    {isSaving ? "Saving..." : editData ? "Update" : "Save"}
                </button>
            </div>
        </div>
    );
};

export default AgencyTypeForm;