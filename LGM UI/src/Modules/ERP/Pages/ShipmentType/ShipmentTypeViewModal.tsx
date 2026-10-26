// /Masters/ShipmentType/ShipmentTypeViewModal.tsx

import React from "react";
import { FaTimes } from "react-icons/fa";
import type { ShipmentType } from "./Services/types";

interface Props {
    type: ShipmentType;
    onClose: () => void;
}

const ShipmentTypeViewModal: React.FC<Props> = ({ type, onClose }) => {
    return (
            <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-75 duration-300">
                <div className="flex justify-between items-center p-4 border-b bg-[#f07837] text-white rounded-t-lg">
                    <h3 className="text-lg font-semibold">Shipment Type Details</h3>
                    <button onClick={onClose} className="hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="font-semibold text-gray-600">Shipment Mode: {type.shipmentModeName  || "N/A"}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600">Type Name: {type.typeName}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600">Type Code: {type.typeCode}</p>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipmentTypeViewModal;