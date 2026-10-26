import React from "react";
import {
  FaTimes,
  FaShippingFast,
  FaFileInvoice,
  FaCalendarCheck,
} from "react-icons/fa";
import type { DispatchDto } from "./Services/types";

const DispatchViewModal: React.FC<{
  data: DispatchDto;
  onClose: () => void;
}> = ({ data, onClose }) => {
  const DataItem = ({
    label,
    value,
    color,
  }: {
    label: string;
    value?: any;
    color?: string;
  }) => (
    <div className="flex flex-col py-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">
        {label}
      </span>
      <span
        className={`text-[13px] font-extrabold ${color || "text-slate-800"} uppercase`}
      >
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-slate-300">
        <div className="bg-[#1e293b] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaShippingFast className="text-2xl text-blue-400" />
            <div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block bg-blue-500`}
              >
                {data.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-all p-2"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2">
              <FaFileInvoice /> Customer Info
            </h3>
          
            <DataItem label="Customer" value={data.customerName} />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-emerald-900 border-b-2 border-emerald-100 pb-1 mb-4 uppercase flex items-center gap-2">
              <FaShippingFast /> Logistics
            </h3>
            <DataItem label="Docket No" value={data.docketNo} />
            <DataItem
              label="Material Dispatched"
              value={data.materialDispatch ? "YES" : "NO"}
              color={data.materialDispatch ? "text-green-600" : "text-red-600"}
            />
              <DataItem
              label="Delivered On Date"
              value={data.deliveredOnDate ? "YES" : "NO"}
              color={data.deliveredOnDate ? "text-green-600" : "text-red-600"}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-[11px] font-black text-purple-900 border-b-2 border-purple-100 pb-1 mb-4 uppercase flex items-center gap-2">
              <FaCalendarCheck /> Timeline
            </h3>
            <DataItem
              label="Dispatch Date"
              value={
                data.dispatchDate
                  ? new Date(data.dispatchDate).toLocaleDateString()
                  : "Not Dispatched"
              }
            />
            <DataItem
              label="Delivered Date"
              value={
                data.deliveredDate
                  ? new Date(data.deliveredDate).toLocaleDateString()
                  : "Pending"
              }
            />
          </div>

          <div className="col-span-full bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">
              Remarks
            </label>
            <p className="text-xs text-slate-600 italic">
              {data.remarks || "No additional remarks."}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-2.5 bg-slate-800 text-white text-xs font-black uppercase rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchViewModal;
