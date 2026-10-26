import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";
import { FaFileInvoice, FaMoneyBillWave, FaCalendarAlt, FaStickyNote } from "react-icons/fa";
import { getEligibleCHAShipments, createCHABill, updateCHABill } from "./Services/CHABillService";

const CHABillWizard: React.FC<{ editData: any; onSuccess: () => void; onCancel: () => void; }> = ({ editData, onSuccess, onCancel }) => {
  const [shipmentOptions, setShipmentOptions] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    chaBillId: 0,
    shipmentInitiateId: 0,
    shipmentAgencyAssignmentId: 0,
    billNo: "",
    billDate: "",
    billAmount: 0,
    gstAmount: 0,
    receivingDate: "",
    paymentDate: "",
    remarks: "",
    ...editData,
  });

  useEffect(() => {
    if (!editData) {
      getEligibleCHAShipments().then((data) => {
        setShipmentOptions(
          data.map((x: any) => ({
            value: x.shipmentInitiateId,
            label: `${x.shipmentNo} - ${x.agencyName}`,
            assignmentId: x.shipmentAgencyAssignmentId,
          }))
        );
      });
    }
  }, [editData]);

  const handleSave = async () => {
    try {
      if (!formData.shipmentInitiateId) return toast.error("Select a shipment");

      const payload = {
        ...formData,
        billDate: formData.billDate || null,
        receivingDate: formData.receivingDate || null,
        paymentDate: formData.paymentDate || null,
      };

      if (editData) await updateCHABill(payload);
      else await createCHABill(payload);

      toast.success("CHA Bill saved successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data || "Operation failed");
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 duration-300">
      <div className="bg-[#1e293b] px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-md font-bold uppercase tracking-wider flex items-center gap-2">
          <FaFileInvoice /> {editData ? `Edit CHA Bill: ${editData.billNo}` : "Create CHA Bill"}
        </h2>
        <button onClick={onCancel} className="text-sm hover:underline text-slate-300">Close</button>
      </div>

      <div className="p-6 space-y-6">
        {!editData && (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase">Select Shipment & CHA Agency</label>
            <Select
              options={shipmentOptions}
              value={shipmentOptions.find((x) => x.value === formData.shipmentInitiateId)}
              onChange={(opt: any) =>
                setFormData({
                  ...formData,
                  shipmentInitiateId: opt.value,
                  shipmentAgencyAssignmentId: opt.assignmentId,
                })
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 border-b pb-1 uppercase flex items-center gap-2"><FaFileInvoice /> Basic Info</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Number</label>
              <input className="w-full h-10 border rounded-lg px-3 text-sm" value={formData.billNo} onChange={(e) => setFormData({ ...formData, billNo: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Date</label>
              <input type="date" className="w-full h-10 border rounded-lg px-3 text-sm" value={formData.billDate?.split("T")[0]} onChange={(e) => setFormData({ ...formData, billDate: e.target.value })} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-blue-500 border-b pb-1 uppercase flex items-center gap-2"><FaMoneyBillWave /> Financial Details</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Bill Amount</label>
              <input type="number" className="w-full h-10 border rounded-lg px-3 text-sm" value={formData.billAmount} onChange={(e) => setFormData({ ...formData, billAmount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">GST Amount</label>
              <input type="number" className="w-full h-10 border rounded-lg px-3 text-sm" value={formData.gstAmount} onChange={(e) => setFormData({ ...formData, gstAmount: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <span className="text-[10px] font-bold text-blue-400 uppercase">Total Payable</span>
              <p className="text-lg font-black text-blue-700">{(formData.billAmount + formData.gstAmount).toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-emerald-500 border-b pb-1 uppercase flex items-center gap-2"><FaCalendarAlt /> Processing</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Receiving Date</label>
              <input type="date" className="w-full h-10 border rounded-lg px-3 text-sm" value={formData.receivingDate?.split("T")[0]} onChange={(e) => setFormData({ ...formData, receivingDate: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Payment Date</label>
              <input type="date" className="w-full h-10 border border-emerald-200 bg-emerald-50 rounded-lg px-3 text-sm" value={formData.paymentDate?.split("T")[0]} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2"><FaStickyNote /> Remarks</label>
          <textarea className="w-full border rounded-lg p-3 text-sm h-20" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button onClick={onCancel} className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition">Discard</button>
          <button onClick={handleSave} className="px-10 py-2.5 bg-green-600 text-white rounded-lg font-normal text-sm hover:bg-green-700 transition">
            {editData ? "Update CHA Bill" : "Save CHA Bill"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CHABillWizard;