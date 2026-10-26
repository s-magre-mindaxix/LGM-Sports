import React from "react";
import { FaTimes, FaHandshake, FaInfoCircle } from 'react-icons/fa';
import type { ShipmentAgencyAssignment } from "./Services/types";

const AssignmentViewModal: React.FC<{ data: ShipmentAgencyAssignment, onClose: () => void }> = ({ data, onClose }) => {
    
    const DataItem = ({ label, value }: { label: string; value?: any }) => (
        <div className="flex flex-col border-b border-gray-100 py-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-[#0b2c52]">{value || "N/A"}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-[#f07837] text-white p-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <FaHandshake className="text-3xl text-blue-300" />
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight">Assignment Detail</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-all p-2 bg-white/10 rounded-full"><FaTimes /></button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-gray-50/30">
                    <div className="col-span-2 flex items-center gap-2 mb-4 border-b pb-2">
                        <FaInfoCircle className="text-[#154068]" />
                        <h3 className="text-xs font-black uppercase text-[#154068]">General Information</h3>
                    </div>
                    <DataItem label="Shipment Number" value={data.shipmentNo} />
                    <DataItem label="Assigned Date" value={new Date(data.assignedDate).toLocaleDateString()} />
                    <DataItem label="Agency Name" value={data.agencyName} />
                    <DataItem label="Agency Type" value={data.agencyType} />
                    
                    <div className="col-span-2 mt-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Remarks</label>
                        <p className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-100 mt-2 italic">
                            "{data.remarks || "No remarks provided"}"
                        </p>
                    </div>
                </div>

                <div className="bg-white border-t p-5 flex justify-end">
                    <button onClick={onClose} className="px-8 py-2 bg-gray-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-black transition">Close</button>
                </div>
            </div>
        </div>
    );
};

export default AssignmentViewModal;