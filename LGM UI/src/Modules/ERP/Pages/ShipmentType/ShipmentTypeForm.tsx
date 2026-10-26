// /Masters/ShipmentType/ShipmentTypeForm.tsx

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { createShipmentType, updateShipmentType } from "./Services/ShipmentTypeService";
import { getShipmentModes } from "../ShipmentMode/Services/ShipmentModeService";
import type { ShipmentType } from "./Services/types";
import type { ShipmentMode } from "../ShipmentMode/Services/types";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface FormProps {
    editData: ShipmentType | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const initialFormState: ShipmentType = {
    id: 0,
    shipmentModeId: 0,
    typeName: "",
    typeCode: "",
};

const ShipmentTypeForm: React.FC<FormProps> = ({ editData, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState<ShipmentType>(initialFormState);
    const [shipmentModes, setShipmentModes] = useState<ShipmentMode[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Fetch shipment modes for the dropdown
        const fetchModes = async () => {
            try {
                const modes = await getShipmentModes();
                setShipmentModes(modes);
            } catch (error) {
                toast.error("Failed to load shipment modes.");
            }
        };
        fetchModes();
    }, []);

    useEffect(() => {
        if (editData) {
            setFormData(editData);
        } else {
            setFormData(initialFormState);
        }
    }, [editData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'shipmentModeId' ? parseInt(value, 10) : value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.shipmentModeId) {
            toast.error("Shipment Mode is required.");
            return false;
        }
        if (!formData.typeName.trim()) {
            toast.error("Type Name is required.");
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
            shipmentModeId: formData.shipmentModeId,
            typeName: formData.typeName,
            typeCode: formData.typeCode,
        };

        try {
            if (formData.id > 0) {
                await updateShipmentType(payload);
                toast.success("Shipment Type updated successfully!");
            } else {
                const { id, ...createData } = payload;
                await createShipmentType(createData);
                toast.success("Shipment Type created successfully!");
            }
            onSuccess();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to save Shipment Type.";
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="p-8">
                <h2 className="text-xl font-bold text-gray-700 mb-6">
                    {editData ? "Edit Shipment Type" : "Create Shipment Type"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="shipmentModeId" className="block text-sm font-medium text-gray-700 mb-1">Shipment Mode</label>
                            <select
                                id="shipmentModeId"
                                name="shipmentModeId"
                                value={formData.shipmentModeId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            >
                                <option value="">Select a Mode</option>
                                {shipmentModes.map(mode => (
                                    <option key={mode.id} value={mode.id}>
                                        {mode.modeName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="typeName" className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                            <input
                                id="typeName"
                                name="typeName"
                                type="text"
                                value={formData.typeName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="typeCode" className="block text-sm font-medium text-gray-700 mb-1">Type Code</label>
                            <input
                                id="typeCode"
                                name="typeCode"
                                type="text"
                                value={formData.typeCode}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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

export default ShipmentTypeForm;