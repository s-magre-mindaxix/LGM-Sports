import React, { useState } from "react";
import { toast } from "sonner";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUserShield,
  FaTimes,
  FaBox,
} from "react-icons/fa";
import { updateQAStatus } from "./Services/QualityAssuranceService";
import type { QualityAssurance } from "./Services/types";

interface ModalProps {
  row: QualityAssurance;
  onClose: () => void;
  onSave: () => void;
}

const QAActionModal: React.FC<ModalProps> = ({ row, onClose, onSave }) => {
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (status: "ACCEPTED" | "REJECTED") => {
    if (!remarks.trim()) return toast.error("Please enter inspection remarks");

    setIsSubmitting(true);
    try {
      // This sends status as "ACCEPTED"
      await updateQAStatus({ id: row.id, status, remarks: remarks.trim() });
      toast.success(`Item ${status} successfully!`);
      onSave();
      onClose();
    } catch {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Horizontal Header */}
        <div className="bg-[#143463] text-white p-8 flex justify-between items-center border-b-4 border-blue-500">
          <div className="flex items-center gap-5">
            <div className="bg-blue-500 p-4 rounded-2xl shadow-lg text-white">
              <FaUserShield size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-widest">
                Quality Control Protocol
              </h3>
              <p className="text-[12px] text-blue-200 font-bold tracking-[0.3em]">
                Authentication & Verification Stage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-all hover:rotate-90"
          >
            <FaTimes size={30} />
          </button>
        </div>

        {/* Main Content - Side-by-Side Horizontal Grid */}
        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT COLUMN: ITEM DETAILS */}
          <div className="space-y-6">
            <div className="bg-blue-50 p-8 rounded-[2rem] border-2 border-blue-100 shadow-inner flex flex-col justify-center h-full">
              <p className="text-[14px] font-black text-blue-400  tracking-widest mb-2">
                Item Identity
              </p>
              <h2 className="text-3xl font-black text-[#0b2c52] ">
                {row.itemName}
              </h2>
              <p className="text-sm font-bold text-gray-400 mt-3 tracking-widest uppercase">
                CODE: {row.itemCode} | TYPE: {row.itemType}
              </p>

              <div className="mt-8 flex items-center gap-4 text-[#143463] font-black text-3xl bg-white w-fit px-8 py-5 rounded-2xl border border-blue-100 shadow-xl">
                <FaBox className="text-blue-400" size={24} />
                <span className="font-mono">{row.quantity}</span>
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">
                  Units
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIONS & REMARKS */}
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-500  ml-2 tracking-widest">
                QA Inspector Remarks
              </label>
              <textarea
                className="w-full border-2 border-gray-200 rounded-3xl p-6 h-48 text-lg font-medium text-gray-600 outline-none focus:border-blue-500 transition resize-none bg-white shadow-inner"
                placeholder="Why are you accepting or rejecting this item?"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            {/* DECISION BUTTONS */}
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => handleAction("ACCEPTED")}
                disabled={isSubmitting}
                className={"flex-1 py-3 bg-green-700 text-white rounded-2xl text-base font-black shadow-xl hover:bg-green-800 transition uppercase tracking-widest flex items-center justify-center gap-2"}
              >
                <FaCheckCircle size={20} />
                {isSubmitting ? "WAIT..." : "Accept Item"}
              </button>

              <button
                onClick={() => handleAction("REJECTED")}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-red-700 text-white rounded-2xl text-base font-black shadow-xl hover:bg-red-800 transition uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <FaTimesCircle size={20} />
                {isSubmitting ? "WAIT..." : "Reject Item"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAActionModal;
