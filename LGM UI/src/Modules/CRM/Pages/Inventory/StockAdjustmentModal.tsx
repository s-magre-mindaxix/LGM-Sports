import { useState } from "react";
import { adjustStock } from "./Services/InventoryService";
import { toast } from "sonner";
import {
  FaPlusCircle,
  FaMinusCircle,
  FaBox,
  FaTimes,
  FaEdit,
} from "react-icons/fa";

const StockAdjustmentModal = ({ row, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    action: "Add" as "Add" | "Subtract",
    remarks: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (formData.quantity <= 0)
      return toast.error("Quantity must be at least 1");
    setIsSubmitting(true);
    try {
      await adjustStock({
        itemId: row.itemId,
        itemType: row.itemType,
        quantity: formData.quantity,
        action: formData.action,
        remarks: formData.remarks,
      });
      toast.success(`Inventory Synchronized Successfully`);
      onSave();
      onClose();
    } catch {
      toast.error("Failed to update inventory");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#143463] text-white p-6 flex justify-between items-center border-b-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
              <FaEdit size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-widest text-white">
                Stock Adjustment Protocol
              </h3>
              <p className="text-[14px] text-blue-200 font-bold tracking-widest">
                System Syncronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-blue-50 p-8 rounded-3xl border-2 border-blue-100 flex flex-col justify-center h-full">
              <p className="text-[12px] font-black text-blue-400 tracking-widest mb-1">
                Target Item
              </p>
              <h2 className="text-3xl font-black text-[#0b2c52] leading-tight">
                {row.name}
              </h2>
              <p className="text-sm font-bold text-gray-400 mt-2">
                CODE: {row.code}
              </p>{" "}
              {/* FAINT TEXT */}
              <div className="mt-6 flex items-center gap-3 text-[#143463] font-black text-lg bg-white w-fit px-6 py-3 rounded-2xl border border-blue-100 shadow-md">
                <FaBox className="text-blue-400" /> Current: {row.currentStock}{" "}
                Units
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                Select Action
              </label>
              <div className="flex bg-gray-100 p-2 rounded-2xl gap-3">
                <button
                  onClick={() => setFormData({ ...formData, action: "Add" })}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-black rounded-xl transition-all duration-300 ${formData.action === "Add" ? "bg-green-600 text-white shadow-xl scale-105" : "text-gray-500 hover:bg-gray-200"}`}
                >
                  <FaPlusCircle /> STOCK IN
                </button>
                <button
                  onClick={() =>
                    setFormData({ ...formData, action: "Subtract" })
                  }
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-black rounded-xl transition-all duration-300 ${formData.action === "Subtract" ? "bg-orange-600 text-white shadow-xl scale-105" : "text-gray-500 hover:bg-gray-200"}`}
                >
                  <FaMinusCircle /> STOCK OUT
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">
                Adjustment Quantity
              </label>
              <input
                type="number"
                className="w-full border-2 border-gray-200 rounded-2xl p-5 text-4xl font-black outline-none focus:border-blue-500 transition text-[#0b2c52]"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2">
                Internal Remarks
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-2xl p-5 h-24 text-base font-medium text-gray-500 outline-none focus:border-blue-500 transition resize-none"
                placeholder="Reason for change..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full py-3 text-white rounded-lg text-base font-black shadow-xl transition tracking-widest ${formData.action === "Add" ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {isSubmitting ? "Syncing..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StockAdjustmentModal;
