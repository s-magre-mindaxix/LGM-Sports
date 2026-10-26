// /Masters/ShipmentMode/ShipmentModeViewModal.tsx

import React from "react";
import { FaTimes } from "react-icons/fa";
import type { ShipmentMode } from "./Services/types";

interface Props {
    mode: ShipmentMode;
    onClose: () => void;
}

const ShipmentModeViewModal: React.FC<Props> = ({ mode, onClose }) => {
    return (
           <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-in zoom-in-75 duration-300">
                <div className="flex justify-between items-center p-4 border-b bg-[#f07837] text-white rounded-t-lg">
                    <h3 className="text-lg font-semibold">Shipment Mode Details</h3>
                    <button onClick={onClose} className="hover:text-red-500 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="font-semibold text-gray-600">Mode Name:  {mode.modeName}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-600">Mode Code: {mode.modeCode}</p>
                    </div>
                </div>
                 <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="px-10 py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition shadow-lg">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipmentModeViewModal;