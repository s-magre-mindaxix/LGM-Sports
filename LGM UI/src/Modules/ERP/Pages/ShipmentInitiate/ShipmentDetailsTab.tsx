import React, { useEffect, useState } from "react";
// import type { ShipmentTabProps, ShipmentMode, ShipmentType } from "../Services/types"; // Ensure these types are exported in types.ts
import type {
  ShipmentTabProps,
  ShipmentMode,
} from "./Services/types";
import { getShipmentModes } from "./Services/ShipmentService";

const ShipmentDetailsTab: React.FC<ShipmentTabProps> = ({ data, setData }) => {
  // --- NEW: State for dynamic dropdowns ---
  const [modes, setModes] = useState<ShipmentMode[]>([]);

  // --- NEW: Fetch data on mount ---
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [modesData] = await Promise.all([
          getShipmentModes(),
         
        ]);
        setModes(modesData);
      } catch (error) {
        console.error("Error fetching shipment dropdowns:", error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none";
  const labelClass =
    "block text-[11px] font-extrabold text-[#0b2c52] uppercase tracking-wider mb-1.5";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Logistics Section */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-bold text-blue-600 uppercase border-b pb-2 mb-4">
            Logistics Information
          </h4>
        </div>

        <div>
          <label className={labelClass}>Shipment Mode</label>
          <select
            name="shipmentModeId"
            value={data.shipmentModeId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="0">Select Mode</option>
            {/* --- CHANGED: Dynamic Mapping --- */}
            {modes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.modeName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Shipment Initiate Date</label>
          <input
            type="date"
            name="shipmentDate"
            value={data.shipmentDate?.split("T")[0]}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        {/* Tracking Section
        <div className="md:col-span-3 mt-4">
          <h4 className="text-xs font-bold text-blue-600 uppercase border-b pb-2 mb-4">
            Tracking & Documents
          </h4>
        </div> */}

        {/* <div>
          <label className={labelClass}>Container No.</label>
          <input
            type="text"
            name="containerNo"
            placeholder="Enter Container No"
            value={data.containerNo}
            onChange={handleChange}
            className={inputClass}
          />
        </div> */}

        {/* <div>
          <label className={labelClass}>B/L No. / AWB No.</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="blNo"
              placeholder="BL No"
              value={data.blNo}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="text"
              name="awbNo"
              placeholder="AWB No"
              value={data.awbNo}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div> */}

        <div>
          <label className={labelClass}>Import Invoice No.</label>
          <input
            type="text"
            name="invoiceNo"
            placeholder="Enter Invoice No"
            value={data.invoiceNo}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Import Invoice Date</label>
          <input
            type="date"
            name="invoiceDate"
            value={data.invoiceDate?.split("T")[0] || ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Import Packing List</label>
          <input
            type="text"
            name="importPackingList"
            placeholder="Enter Packing List No"
            value={data.importPackingList || ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Import Packing Date</label>
          <input
            type="date"
            name="importPackingDate"
            value={data.importPackingDate?.split("T")[0] || ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

          <div>
          <label className={labelClass}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter Email Address"
            value={data.email || ""}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Remarks</label>
          <textarea
            name="remarks"
            rows={1}
            placeholder="Any additional instructions..."
            value={data.remarks}
            onChange={handleChange}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* Hint Box */}
      <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Note:</strong> Ensure the Import Invoice Date and Shipment Initiate Date match
          your physical documents.
         
        </p>
      </div>
    </div>
  );
};

export default ShipmentDetailsTab;
