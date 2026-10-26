import React from "react";
import { FaTimes, FaMoneyCheckAlt, FaInfoCircle, FaCalendarCheck, FaUser } from "react-icons/fa";
import type { ShipmentPaymentDetailsDto } from "./Services/types";

const ShipmentPaymentViewModal: React.FC<{ data: ShipmentPaymentDetailsDto; onClose: () => void }> = ({ data, onClose }) => {
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
            <FaMoneyCheckAlt className="text-2xl text-emerald-400" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Payment Detail: {data.shipmentNo}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${data.paymentCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                {data.paymentCompleted ? "Payment Received" : "Payment Pending"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-all p-2"><FaTimes /></button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaUser /> Customer</h3>
            <DataItem label="Customer Name" value={data.customerName} />
            <DataItem label="Shipment No" value={data.shipmentNo} />
            <DataItem label="Invoice No" value={data.invoiceNo} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-emerald-900 border-b-2 border-emerald-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaInfoCircle /> Delivery Info</h3>
            <DataItem label="Delivered Date" value={data.deliveredDate ? new Date(data.deliveredDate).toLocaleDateString() : ""} />
            <DataItem label="Aging (Days)" value={`${data.pendingDays} Days`} color="text-red-600 font-black" />
            <DataItem label="Status" value={data.status} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-purple-900 border-b-2 border-purple-100 pb-1 mb-4 uppercase flex items-center gap-2"><FaCalendarCheck /> Completion</h3>
            <DataItem label="Payment Completed" value={data.paymentCompleted ? "YES" : "NO"} />
            <DataItem label="Completion Date" value={data.paymentCompletedDate ? new Date(data.paymentCompletedDate).toLocaleDateString() : "PENDING"} color="text-blue-600" />
          </div>

          <div className="col-span-full bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
             <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Finance Remarks</label>
             <p className="text-xs text-slate-600 italic">{data.financeRemarks || "No finance remarks recorded."}</p>
          </div>
        </div>

        <div className="bg-slate-50 border-t p-4 flex justify-end">
          <button onClick={onClose} className="px-10 py-2.5 bg-slate-800 text-white text-xs font-black uppercase rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentPaymentViewModal;