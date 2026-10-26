
import React from "react";
import { FaTag, FaTimes } from "react-icons/fa";
import type { Brand } from "./Services/types";

interface BrandViewModalProps {
    brand: Brand;
    onClose: () => void;
}

const BrandViewModal: React.FC<BrandViewModalProps> = ({
    brand,
    onClose,
}) => {
    const fields = [
        { label: "Brand ID", value: brand.brandId },
        { label: "Code", value: brand.code },
        { label: "Name", value: brand.name },
        { label: "Description", value: brand.description || "N/A" },
        { label: "Status", value: brand.isActive ? "Active" : "Inactive" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between bg-[#f07837] px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                        <FaTag className="text-xl" />
                        <h2 className="text-lg font-bold">Brand Details</h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded p-2 hover:bg-white/10"
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                    {fields.map((field) => (
                        <div
                            key={field.label}
                            className="rounded-lg border border-gray-200 p-4"
                        >
                            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                {field.label}
                            </p>
                            <p className="break-words text-sm font-medium text-gray-800">
                                {field.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end border-t bg-gray-50 p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md bg-[#f07837] px-5 py-2 text-sm font-semibold text-white hover:bg-[#103454]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BrandViewModal;
