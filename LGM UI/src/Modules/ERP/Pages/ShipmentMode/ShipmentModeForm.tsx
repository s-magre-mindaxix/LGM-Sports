// /Masters/ShipmentMode/ShipmentModeForm.tsx

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { ShipmentMode } from "./Services/types";
import { createShipmentMode, updateShipmentMode } from "./Services/ShipmentModeService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface FormProps {
    editData: ShipmentMode | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialFormState: ShipmentMode = {
    id: 0,
    modeName: "",
    modeCode: "",
};

const ShipmentModeForm: React.FC<FormProps> = ({ editData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<ShipmentMode>(initialFormState);
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!formData.modeName.trim()) {
            toast.error("Mode Name is required.");
            return false;
        }
        if (!formData.modeCode.trim()) {
            toast.error("Mode Code is required.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        try {
            if (formData.id > 0) {
                await updateShipmentMode(formData);
                toast.success("Shipment Mode updated successfully!");
            } else {
                const { id, ...createData } = formData;
                await createShipmentMode(createData);
                toast.success("Shipment Mode created successfully!");
            }
            onSuccess();
        } catch (error: any) {
            // Display specific error from backend if available
            const errorMessage = error.response?.data?.message || "Failed to save Shipment Mode.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-700 mb-6">
                    {editData ? "Edit Shipment Mode" : "Create Shipment Mode"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="modeName" className="block text-sm font-medium text-gray-700 mb-1">Mode Name</label>
                            <input
                                id="modeName"
                                name="modeName"
                                type="text"
                                value={formData.modeName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="modeCode" className="block text-sm font-medium text-gray-700 mb-1">Mode Code</label>
                            <input
                                id="modeCode"
                                name="modeCode"
                                type="text"
                                value={formData.modeCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
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

export default ShipmentModeForm;