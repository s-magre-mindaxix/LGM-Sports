import React from "react";
import {
  FaTimes,
  FaTruckMoving,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaGavel,
} from "react-icons/fa";
import type { ShipmentUnderTransitDetailsDto } from "./Services/types";

const TransitViewModal: React.FC<{
  data: ShipmentUnderTransitDetailsDto;
  onClose: () => void;
}> = ({ data, onClose }) => {
  
  // Helper for consistent data items
  const DataItem = ({ label, value, color }: { label: string; value?: any, color?: string }) => (
    <div className="flex flex-col py-2">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-tight mb-0.5">
        {label}
      </span>
      <span className={`text-[13px] font-extrabold ${color || 'text-[#0b2c52]'} leading-tight uppercase`}>
        {value || "N/A"}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        
        {/* HEADER */}
        <div className="bg-[#f07837] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <FaTruckMoving className="text-2xl text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                Transit Details: <span className="font-light">{data.shipmentNo}</span>
              </h2>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-600 text-white mt-1 inline-block">
                {data.status}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="hover:rotate-90 hover:bg-white/10 p-2 rounded-full transition-all duration-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-8 overflow-y-auto max-h-[75vh] bg-white">
          
          {/* TOP SECTION: 3 COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
            
            {/* Column 1: Logistics */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2">
                <FaTruckMoving className="text-blue-500" /> Logistics
              </h3>
              <DataItem label="Container No" value={data.containerNo} />
              <DataItem label="Vessel/Flight" value={data.vesselFlightNo} />
              {/* <DataItem label="B/L or AWB No" value={data.blNo || data.awbNo} /> */}
            </div>

            {/* Column 2: Route */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-500" /> Route
              </h3>
              <DataItem label="Port of Loading" value={data.portOfLoading} />
              <DataItem label="Port of Discharge" value={data.portOfDischarge} />
              <DataItem label="Destination" value={data.destination} />
            </div>

            {/* Column 3: Schedule */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-black text-blue-900 border-b-2 border-blue-100 pb-1 mb-4 uppercase flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" /> Schedule
              </h3>
              <DataItem label="Departure Date" value={data.departureDate ? new Date(data.departureDate).toLocaleDateString() : ""} />
              <DataItem label="Exp. Arrival" value={data.expectedArrivalDate ? new Date(data.expectedArrivalDate).toLocaleDateString() : ""} />
              {/* <DataItem label="Actual Arrival" value={data.actualArrivalDate ? new Date(data.actualArrivalDate).toLocaleDateString() : ""} /> */}
            </div>
          </div>

          {/* BOTTOM SECTION: Checklist Box + Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            
            {/* Checklist & BOE Container (Spans 1 column on left) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-6">
              
              {/* Checklist Section */}
              <div>
                <h4 className="text-[10px] font-black text-emerald-700 border-b border-emerald-100 pb-1 mb-3 uppercase flex items-center gap-2">
                  <FaFileInvoiceDollar /> Checklist Details
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DataItem label="Ex. Rate" value={data.checklistExchangeRate} />
                  <DataItem label="Assessable Val" value={data.checklistAssessableValue} />
                  <DataItem label="Total Duty" value={data.checklistTotalDuty} />
                  <DataItem label="GST" value={data.checklistGST} />
                  <div className="col-span-2 mt-1 pt-1 border-t border-dashed border-emerald-300">
                    <DataItem label="Total Payable" value={data.checklistTotalPayable} color="text-emerald-700" />
                  </div>
                </div>
              </div>

              {/* BOE Section */}
              <div>
                <h4 className="text-[10px] font-black text-indigo-700 border-b border-indigo-100 pb-1 mb-3 uppercase flex items-center gap-2">
                  <FaGavel /> Bill of Entry (BOE)
                </h4>
                <div className="grid grid-cols-2 gap-x-4">
                  <DataItem label="Ex. Rate" value={data.boeExchangeRate} />
                  <DataItem label="Assessable Val" value={data.boeAssessableValue} />
                  <DataItem label="Custom Duty" value={data.boeCustomDuty} />
                  <DataItem label="GST" value={data.boeGST} />
                  <div className="col-span-2 mt-1 pt-1 border-t border-dashed border-indigo-300">
                    <DataItem label="Total Payable" value={data.boeTotalPayable} color="text-indigo-700" />
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Grid (Spans the other 2 columns to the right) */}
            <div className="md:col-span-2 grid grid-cols-2 gap-10">
               <div className="space-y-4">
                  <DataItem label="Duty Payment Date" value={data.dutyPaymentDate?.split("T")[0]} />
                  <DataItem label="OOC Date" value={data.oocDate?.split("T")[0]} />
               </div>
               <div className="space-y-4">
                  <DataItem label="Final Delivery" value={data.finalDeliveryDate?.split("T")[0]} />
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Remarks</label>
                    <p className="text-xs italic text-slate-600 leading-relaxed">
                      {data.transitRemarks || "No specific remarks provided for this shipment."}
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-10 py-2.5 bg-[#f07837] text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#f07837] shadow-lg transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransitViewModal;