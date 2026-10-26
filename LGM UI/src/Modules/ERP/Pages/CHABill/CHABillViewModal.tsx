import React from "react";
import { FaTimes, FaFileInvoice, FaMoneyBillWave, FaInfoCircle, FaCalendarCheck } from "react-icons/fa";
import type { CHABillDetailsDto } from "./Services/types";

const CHABillViewModal: React.FC<{ data: CHABillDetailsDto; onClose: () => void }> = ({ data, onClose }) => {
  const DataItem = ({ label, value, color }: { label: string; value?: any, color?: string }) => (
    <div className="flex flex-col py-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</span>
      <span className={`text-[13px] font-extrabold ${color || 'text-slate-800'} uppercase`}>{value || "N/A"}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-300">
        <div className="bg-[#1e293b] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaFileInvoice className="text-2xl text-blue-400" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">CHA Bill: {data.billNo}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${data.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                {data.paymentStatus}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-all p-2"><FaTimes /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaInfoCircle /> Shipment</h3>
            <DataItem label="Shipment No" value={data.shipmentNo} />
            <DataItem label="CHA Agency" value={data.agencyName} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-emerald-900 border-b-2 border-emerald-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaMoneyBillWave /> Financials</h3>
            <DataItem label="Bill Amount" value={data.billAmount.toLocaleString()} />
            <DataItem label="GST" value={data.gstAmount.toLocaleString()} />
            <DataItem label="Total Amount" value={data.totalAmount.toLocaleString()} color="text-blue-600 font-black text-lg" />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-purple-900 border-b-2 border-purple-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaCalendarCheck /> Dates</h3>
            <DataItem label="Bill Date" value={data.billDate ? new Date(data.billDate).toLocaleDateString() : ""} />
            <DataItem label="Receiving Date" value={data.receivingDate ? new Date(data.receivingDate).toLocaleDateString() : ""} />
            <DataItem label="Payment Date" value={data.paymentDate ? new Date(data.paymentDate).toLocaleDateString() : "Pending"} />
          </div>

          <div className="col-span-full bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
             <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Remarks</label>
             <p className="text-xs text-slate-600 italic">{data.remarks || "No additional remarks."}</p>
          </div>
        </div>

        <div className="bg-slate-50 border-t p-4 flex justify-end">
          <button onClick={onClose} className="px-10 py-2.5 bg-slate-800 text-white text-xs font-black uppercase rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default CHABillViewModal;