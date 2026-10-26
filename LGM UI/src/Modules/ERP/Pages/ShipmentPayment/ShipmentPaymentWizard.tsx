import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaStickyNote,
  FaCreditCard,
} from "react-icons/fa";
import {
  getEligibleTransits,
  createShipmentPayment,
  updateShipmentPayment,
} from "./Services/ShipmentPaymentService";

const ShipmentPaymentWizard: React.FC<{
  editData: any;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ editData, onSuccess, onCancel }) => {
  const [transitOptions, setTransitOptions] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    shipmentPaymentId: 0,
    shipmentUnderTransitId: 0,
    deliveredDate: "",
    paymentCompleted: false,
    paymentCompletedDate: "",
    financeRemarks: "",
    ...editData,
  });

  const pendingDays = formData.deliveredDate
    ? Math.floor(
        (new Date().getTime() - new Date(formData.deliveredDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  useEffect(() => {
    if (!editData) {
      getEligibleTransits().then((data) => {
        setTransitOptions(
          data.map((x: any) => ({
            value: x.shipmentUnderTransitId,
            label: `${x.shipmentNo} - ${x.customerName} (Inv: ${x.invoiceNo})`,
            finalDeliveryDate: x.finalDeliveryDate,
          })),
        );
      });
    }
  }, [editData]);

  const handleSave = async () => {
    try {
      if (!formData.shipmentUnderTransitId)
        return toast.error("Select a shipment");

      if (editData) {
        await updateShipmentPayment(formData);
      } else {
        await createShipmentPayment(formData);
      }

      toast.success(
        editData
          ? "Shipment Payment updated successfully."
          : "Shipment Payment created successfully.",
      );
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in zoom-in-95 duration-300">
      <div className="bg-[#1e293b] px-6 py-4 text-white flex justify-between items-center">
        <h2 className="text-md font-bold uppercase tracking-wider flex items-center gap-2">
          <FaCreditCard />{" "}
          {editData
            ? `Update Payment: ${editData.shipmentNo}`
            : "Record Delivery Payment"}
        </h2>
        <button
          onClick={onCancel}
          className="text-sm hover:underline text-slate-300"
        >
          Close
        </button>
      </div>

      <div className="p-6 space-y-6">
        {!editData && (
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase">
              Select Delivered Shipment
            </label>
            <Select
              options={transitOptions}
              onChange={(opt: any) =>
                setFormData({
                  ...formData,
                  shipmentUnderTransitId: opt.value,
                  deliveredDate: opt.finalDeliveryDate
                    ? opt.finalDeliveryDate.split("T")[0]
                    : "",
                })
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-slate-400 border-b pb-1 uppercase flex items-center gap-2">
              <FaCalendarAlt /> Delivery Status
            </h3>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Actual Delivered Date
              </label>
              <input
                type="date"
                className="w-full h-10 border rounded-lg px-3 text-sm"
                value={formData.deliveredDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, deliveredDate: e.target.value })
                }
              />
              <div
                className={`mt-2 text-sm font-semibold ${
                  formData.paymentCompleted ? "text-green-600" : "text-red-600"
                }`}
              >
                {formData.paymentCompleted
                  ? `Completed in ${pendingDays} Day(s)`
                  : `Pending Days : ${pendingDays}`}
              </div>
            </div>

            <div
              className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                formData.paymentCompleted
                  ? "bg-green-50 border-green-400"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <input
                type="checkbox"
                id="paymentCompleted"
                className="w-5 h-5 accent-emerald-600"
                checked={formData.paymentCompleted}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentCompleted: e.target.checked,
                    paymentCompletedDate: e.target.checked
                      ? new Date().toISOString().split("T")[0]
                      : "",
                  })
                }
              />
              <label
                htmlFor="paymentCompleted"
                className="text-sm font-bold text-slate-700 cursor-pointer"
              >
                {formData.paymentCompleted
                  ? "Shipment Payment Completed"
                  : "Mark Shipment Payment as Completed"}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-emerald-500 border-b pb-1 uppercase flex items-center gap-2">
              <FaCheckCircle /> Payment Settlement
            </h3>
            <div
              className={`space-y-1 ${!formData.paymentCompleted ? "opacity-40 pointer-events-none" : ""}`}
            >
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Settlement Date
              </label>
              <input
                type="date"
                className="w-full h-10 border border-emerald-200 bg-emerald-50 rounded-lg px-3 text-sm"
                value={formData.paymentCompletedDate?.split("T")[0]}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentCompletedDate: e.target.value,
                  })
                }
              />
              <p className="text-[9px] text-slate-400 italic mt-1">
                Leave blank to use current system date upon saving.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
            <FaStickyNote /> Finance Remarks
          </label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm h-24"
            placeholder="Add any internal payment notes or bank reference numbers..."
            value={formData.financeRemarks || ""}
            onChange={(e) =>
              setFormData({ ...formData, financeRemarks: e.target.value })
            }
          />
        </div>

        <div className="pt-6 border-t flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-8 py-2.5 bg-gray-500 text-white rounded-lg font-normal text-sm hover:bg-gray-600 transition"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-10 py-2.5 bg-green-600 text-white rounded-lg font-normal text-sm hover:bg-green-700 transition"
          >
            {editData ? "Update Payment Info" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentPaymentWizard;
