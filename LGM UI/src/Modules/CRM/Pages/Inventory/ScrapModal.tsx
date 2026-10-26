import { useState } from "react";
import { moveToScrap } from "./Services/InventoryService";
import { toast } from "sonner";
import {
  FaTrashAlt,
  FaExclamationTriangle,
  FaBoxes,
  FaTimes,
} from "react-icons/fa";

const ScrapModal = ({ row, onClose, onSave }: any) => {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScrap = async () => {
    if (qty > row.currentStock)
      return toast.error("Quantity exceeds available stock!");
    if (qty <= 0) return toast.error("Quantity must be at least 1");
    if (!reason.trim())
      return toast.error("Please provide a reason for scrapping.");

    setIsSubmitting(true);
    try {
      await moveToScrap({
        itemId: row.itemId,
        itemType: row.itemType,
        quantity: qty,
        reason,
      });
      toast.success("Item moved to Scrap History successfully!");
      onSave();
      onClose();
    } catch {
      toast.error("Scrap failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-[#143463] text-white p-6 flex justify-between items-center border-b-4 border-black">
          <div className="flex items-center gap-4">
            <div className="bg-white text-red-700 p-3 rounded-xl shadow-lg">
              <FaTrashAlt size={24} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold  tracking-widest flex items-center gap-3">
                <FaExclamationTriangle className="text-yellow-400 animate-pulse" />
                Inventory Scrap Protocol
              </h3>
              <p className="text-[16px] text-red-100 font-bold tracking-widest ">
                Permanent Removal
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
            <div className="bg-red-50 p-8 rounded-3xl border-2 border-red-100 h-full flex flex-col justify-center text-left">
              <p className="text-[12px] font-black text-red-400  tracking-widest mb-1">
                Scrap Target
              </p>
              <h2 className="text-3xl font-black text-red-900  leading-tight">
                {row.name}
              </h2>
              <p className="text-sm font-bold text-red-300 mt-2  tracking-tighter italic">
                Warning: This action cannot be undone.
              </p>{" "}
              {/* FAINT TEXT */}
              <div className="mt-8 flex items-center gap-3 text-red-700 font-black text-lg bg-white w-fit px-6 py-3 rounded-2xl border border-red-200 shadow-md">
                <FaBoxes /> Available: {row.currentStock} Units
              </div>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                Quantity to Scrap
              </label>
              <input
                type="number"
                className="w-full border-2 border-red-100 bg-red-50/20 rounded-2xl p-5 text-4xl font-black text-red-600 outline-none focus:border-red-500 transition"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase ml-2 tracking-widest">
                Reason for Scrapping
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-2xl p-5 h-32 text-base font-medium text-gray-500 outline-none focus:border-red-500 transition resize-none bg-white"
                placeholder="Describe damage or expiration..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              onClick={handleScrap}
              disabled={isSubmitting}
              className="w-full py-3 bg-red-700 text-white rounded-2xl text-base font-black shadow-xl hover:bg-red-800 transition tracking-widest"
            >
              {isSubmitting ? "Processing..." : "Confirm Permanent Scrap"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScrapModal;
