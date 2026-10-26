import React from "react";
import { FaClipboardList, FaPlus, FaTrash } from "react-icons/fa";
import type { ShipmentTabProps, ShipmentItem } from "./Services/types";

const ItemsTab: React.FC<ShipmentTabProps> = ({ data, setData }) => {
  const addItem = () => {
  const newItem: ShipmentItem = {
    shipmentItemId: 0,

    boxNo: "",
    netWeightKg: 0,
    grossWeightKg: 0,
    lengthCm: 0,
    widthCm: 0,
    heightCm: 0,
    cbm: 0,
    remarks: "",
  };

  setData(prev => ({
    ...prev,
    items: [...prev.items, newItem]
  }));
};

  const updateItem = (index: number, field: keyof ShipmentItem, value: any) => {
    const updated = [...data.items];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    const item = updated[index];

    item.cbm =
      (Number(item.lengthCm || 0) *
        Number(item.widthCm || 0) *
        Number(item.heightCm || 0)) /
      1000000;

    setData({
      ...data,
      items: updated,
    });
  };

  const removeItem = (index: number) => {
    setData({ ...data, items: data.items.filter((_, i) => i !== index) });
  };

  const totalNetWeight = data.items.reduce(
    (sum, item) => sum + Number(item.netWeightKg || 0),
    0,
  );

  const totalGrossWeight = data.items.reduce(
    (sum, item) => sum + Number(item.grossWeightKg || 0),
    0,
  );

  const totalCBM = data.items.reduce(
    (sum, item) => sum + Number(item.cbm || 0),
    0,
  );

  const updateSourceItemName = (index: number, value: string) => {
    const updatedSource = [...data.sourceItems];
    updatedSource[index] = {
      ...updatedSource[index],
      itemName: value,
    };
    setData({
      ...data,
      sourceItems: updatedSource,
    });
  };

  return (
    <div className="space-y-8">

           {/* SECTION 1: ITEM DETAILS SUMMARY (READ ONLY - Uses sourceItems) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[#0b2c52] border-b pb-2">
          <FaClipboardList className="text-blue-600" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Item Details Summary</h3>
        </div>
      <div className="border rounded-lg shadow-sm overflow-hidden">
  <div className="max-h-72 overflow-y-auto">
    <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-10">
          <tr className="text-[#0b2c52]">
              <th className="border p-2 text-left">Item Code</th>
               <th className="border p-2 text-left">Part No</th>
              <th className="border p-2 text-left">Item Name</th>
              <th className="border p-2 text-center">Type</th>
              <th className="border p-2 text-center">Qty/Unit</th>
            </tr>
          </thead>
          <tbody>
            {/* CHANGED: Mapping from sourceItems instead of items */}
            {data.sourceItems && data.sourceItems.length > 0 ? (
              data.sourceItems.map((item, idx) => (
                <tr key={`summary-${idx}`} className="bg-white hover:bg-gray-50">
                  <td className="border p-2 font-bold text-blue-800">{item.itemCode || "N/A"}</td>
                  <td className="border p-2 text-gray-600">{item.partNo || "N/A"}</td>
                   <td className="border p-1">
                        <input 
                          type="text"
                          className="w-full p-1 border-none focus:ring-1 focus:ring-blue-400 outline-none bg-transparent"
                          value={item.itemName || ""}
                          onChange={(e) => updateSourceItemName(idx, e.target.value)}
                        />
                      </td>
                  <td className="border p-2 text-center text-[10px] uppercase">{item.itemType}</td>
                  <td className="border p-2 text-center font-bold">{item.quantity} {item.unit}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border p-4 text-center text-gray-400 italic">No items fetched from source</td>
              </tr>
            )}
          </tbody>
        </table>
          </div>
</div>
      </div>
      
       <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-[#0b2c52]">Shipment Boxes</h3>
          <button
            onClick={addItem}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
          >
            <FaPlus /> Add Row
          </button>
        </div>
        <table className="w-full text-xs border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Box No</th>
              <th className="border p-2">Net Weight (Kg)</th>
              <th className="border p-2">Gross Weight (Kg)</th>
              <th className="border p-2">Length (Cm)</th>
              <th className="border p-2">Width (Cm)</th>
              <th className="border p-2">Height (Cm)</th>
              <th className="border p-2">CBM</th>
              <th className="border p-2">Remarks</th>
              <th className="border p-2"></th>
            </tr>
          </thead>
          <tbody>
            {/* Maps to actual items array which starts empty */}
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border p-1">
                  <input className="w-full p-1" value={item.boxNo} onChange={(e) => updateItem(idx, "boxNo", e.target.value)} />
                </td>
                <td className="border p-1">
                  <input type="number" className="w-full p-1" value={item.netWeightKg} onChange={(e) => updateItem(idx, "netWeightKg", e.target.value)} />
                </td>
                <td className="border p-1">
                  <input type="number" className="w-full p-1" value={item.grossWeightKg} onChange={(e) => updateItem(idx, "grossWeightKg", e.target.value)} />
                </td>
                <td className="border p-1">
                  <input type="number" className="w-full p-1" value={item.lengthCm} onChange={(e) => updateItem(idx, "lengthCm", e.target.value)} />
                </td>
                <td className="border p-1">
                  <input type="number" className="w-full p-1" value={item.widthCm} onChange={(e) => updateItem(idx, "widthCm", e.target.value)} />
                </td>
                <td className="border p-1">
                  <input type="number" className="w-full p-1" value={item.heightCm} onChange={(e) => updateItem(idx, "heightCm", e.target.value)} />
                </td>
                <td className="border p-1 bg-gray-50 text-center font-bold">{item.cbm.toFixed(4)}</td>
                <td className="border p-1">
                  <input className="w-full p-1" value={item.remarks} onChange={(e) => updateItem(idx, "remarks", e.target.value)} />
                </td>
                <td className="border p-1 text-center">
                  <button onClick={() => removeItem(idx)} className="text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-blue-50 font-bold">
              <td className="border p-2 text-right">Totals</td>
              <td className="border p-2">{totalNetWeight.toFixed(2)}</td>
              <td className="border p-2">{totalGrossWeight.toFixed(2)}</td>
              <td className="border p-2" colSpan={3}></td>
              <td className="border p-2 text-center">{totalCBM.toFixed(4)}</td>
              <td className="border p-2" colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ItemsTab;
