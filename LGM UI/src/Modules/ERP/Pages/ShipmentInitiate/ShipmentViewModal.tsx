import React from "react";
import type { ShipmentInitiate } from "./Services/types";
import { 
    FaTimes, FaTruck, FaFileInvoice, FaBoxes, FaMapMarkerAlt, 
    FaInfoCircle, FaShip, FaWeightHanging 
} from 'react-icons/fa';

// FIX: Change shipmentId: number to shipment: ShipmentInitiate
interface ViewModalProps {
    shipment: ShipmentInitiate; 
    onClose: () => void;
}

const ShipmentViewModal: React.FC<ViewModalProps> = ({ shipment, onClose }) => {
    
    // Helper to calculate totals from the passed shipment object
    const totalGrossWeight = shipment.items?.reduce((sum, i) => sum + (Number(i.grossWeightKg) || 0), 0) || 0;
    const totalCBM = shipment.items?.reduce((sum, i) => sum + (Number(i.cbm) || 0), 0) || 0;

    const DataItem = ({ label, value, fullWidth = false }: { label: string; value?: string | number | null; fullWidth?: boolean }) => (
        <div className={`flex flex-col border-b border-gray-100 py-2 ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-[#0b2c52] break-words">
                {value !== undefined && value !== null && value !== "" ? value : "—"}
            </span>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title }: any) => (
        <div className="flex items-center gap-2 mb-4 mt-2">
            <Icon className="text-[#0b2c52] text-lg" />
            <h3 className="text-sm font-extrabold text-[#0b2c52] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">{title}</h3>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="bg-[#f07837] text-white p-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 p-3 rounded-lg">
                            <FaShip className="text-3xl text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight uppercase tracking-tight">
                                {shipment.shipmentNo}
                            </h2>
                            <div className="flex gap-3 items-center">
                                <span className="px-2 py-0.5 bg-blue-500 text-[10px] rounded font-bold uppercase tracking-wider">
                                    {shipment.status}
                                </span>
                                <span className="text-xs text-blue-200 font-mono italic">
                                    {shipment.sourceType}: {shipment.sourceDocumentNo}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full">
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 bg-gray-50/30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-8 space-y-6">
                            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <SectionHeader icon={FaInfoCircle} title="General Information" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                                    <DataItem label="Customer" value={shipment.customerName} />
                                    <DataItem label="GST Number" value={shipment.gstNo} />
                                    <DataItem label="Invoice Value" value={`${shipment.currencyName || ''} ${shipment.invoiceValue?.toLocaleString() || '0.00'}`} />
                                    <DataItem label="Shipment Mode" value={shipment.shipmentModeName} />
                                    <DataItem label="Shipment Date" value={shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : ""} />
                                    <DataItem label="Source Doc" value={shipment.sourceDocumentNo} />
                                </div>
                            </section>

                            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <SectionHeader icon={FaMapMarkerAlt} title="Address Details" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <DataItem label="Shipper Address (From)" value={shipment.shipperAddress} fullWidth />
                                    </div>
                                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                                        <DataItem label="Consignee Address (To)" value={shipment.consigneeAddress} fullWidth />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <SectionHeader icon={FaBoxes} title="Packing List Items" />
                                <div className="overflow-x-auto min-h-[150px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800 text-white text-[10px] uppercase tracking-wider">
                                                <th className="p-3 rounded-tl-lg">Box No</th>
                                                <th className="p-3 text-center">Dims (LxWxH cm)</th>
                                                <th className="p-3 text-center">CBM</th>
                                                <th className="p-3 text-center">Net Wt</th>
                                                <th className="p-3 text-center">Gross Wt</th>
                                                <th className="p-3 rounded-tr-lg">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {shipment.items?.map((item, idx) => (
                                                <tr key={idx} className="border-b hover:bg-blue-50/30 transition">
                                                    <td className="p-3 font-bold text-[#0b2c52]">{item.boxNo || `Box ${idx+1}`}</td>
                                                    <td className="p-3 text-center text-gray-600">
                                                        {item.lengthCm}×{item.widthCm}×{item.heightCm}
                                                    </td>
                                                    <td className="p-3 text-center font-mono text-blue-600">{Number(item.cbm).toFixed(3)}</td>
                                                    <td className="p-3 text-center">{item.netWeightKg}kg</td>
                                                    <td className="p-3 text-center font-semibold text-gray-800">{item.grossWeightKg}kg</td>
                                                    <td className="p-3 text-xs text-gray-500 italic">{item.remarks || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-4 space-y-6">
                            <section className="bg-[#f07837] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <SectionHeader icon={FaWeightHanging} title="Consolidated Totals" />
                                    <div className="space-y-4 mt-4">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-blue-200 text-xs uppercase">Total Boxes</span>
                                            <span className="text-xl font-bold">{shipment.items?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                            <span className="text-blue-200 text-xs uppercase">Total Volume</span>
                                            <span className="text-xl font-bold">{totalCBM.toFixed(3)} CBM</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-orange-300 text-xs uppercase font-black tracking-widest">Gross Weight</span>
                                            <span className="text-3xl font-black text-orange-400">{totalGrossWeight} Kg</span>
                                        </div>
                                    </div>
                                </div>
                                <FaTruck className="absolute -bottom-4 -right-4 text-white/5 text-9xl rotate-12" />
                            </section>

                            <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-blue-500">
                                <SectionHeader icon={FaFileInvoice} title="Billing Documents" />
                                <div className="space-y-3">
                                    <DataItem label="Invoice No" value={shipment.invoiceNo} />
                                    <DataItem label="Invoice Date" value={shipment.invoiceDate ? new Date(shipment.invoiceDate).toLocaleDateString() : ""} />
                                    <DataItem label="Import Packing List" value={shipment.importPackingList} />
                                    <DataItem label="Packing List Date" value={shipment.importPackingDate ? new Date(shipment.importPackingDate).toLocaleDateString() : ""} />
                                    <div className="mt-4 pt-4 border-t border-dashed italic text-xs text-gray-500">
                                        Remarks: {shipment.remarks || "None"}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t p-4 flex justify-end px-8">
                    <button onClick={onClose} className="px-8 py-2 bg-gray-800 text-white text-xs font-bold uppercase rounded-lg hover:bg-black transition-all shadow-md">
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipmentViewModal;