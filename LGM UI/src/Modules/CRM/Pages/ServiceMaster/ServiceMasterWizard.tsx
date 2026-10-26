import { useState } from "react";
import { FaTools, FaTimes, FaTag, FaRupeeSign } from "react-icons/fa";
import { toast } from "sonner";
import { saveService } from "./Services/ServiceMasterService";
import type { ServiceMaster } from "./Services/types";

const ServiceMasterWizard = ({ editData, onCancel, onSuccess }: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<ServiceMaster>(
    editData || {
      serviceId: 0,
      serviceDescription: "",
      servicePartNo: "",
      servicePrice: 0,
    },
  );

  const handleSave = async () => {
    if (!data.serviceDescription.trim())
      return toast.error("Description is required");

    setIsSaving(true);
    try {
      await saveService(data);
      toast.success("Service saved successfully");
      onSuccess();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl shadow-2xl bg-white overflow-hidden animate-in zoom-in duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 bg-linear-to-r from-[#154068] to-[#1f5f99] text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FaTools />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {data.serviceId > 0 ? "Edit Service" : "New Service"}
              </h2>
              <p className="text-xs text-white/70">
                Manage your service details
              </p>
            </div>
          </div>

          <button onClick={onCancel} className="hover:text-red-300">
            <FaTimes size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {/* Part Number */}
          <div className="bg-slate-50 border rounded-xl p-4">
            <label className="text-sm font-semibold text-slate-600">
              Service Part No
            </label>
            <p className="text-xs font-bold text-[#154068] mt-1">
              {data.servicePartNo || "Auto Generated on Save"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Service Description
            </label>
            <div className="relative">
              <FaTag className="absolute top-4 left-3 text-slate-400" />
              <textarea
                className="w-full pl-10 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Enter service description..."
                value={data.serviceDescription}
                onChange={(e) =>
                  setData({ ...data, serviceDescription: e.target.value })
                }
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              Service Price
            </label>
            <div className="relative">
              <FaRupeeSign className="absolute top-4 left-3 text-slate-400" />
              <input
                type="number"
                className="w-full pl-10 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Enter price"
                value={data.servicePrice}
                onChange={(e) =>
                  setData({
                    ...data,
                    servicePrice: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 mb-2 block">
              SAC Code
            </label>
            <div className="relative">
              <FaTag className="absolute top-4 left-3 text-slate-400" />
              <input
                type="text"
                className="w-full pl-10 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Enter SAC code"
                value={data.sacCode}
                onChange={(e) => setData({ ...data, sacCode: e.target.value })}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>

            <button
              disabled={isSaving}
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-linear-to-r from-[#154068] to-[#1f5f99] text-white font-semibold shadow-md hover:opacity-90 transition"
            >
              {isSaving ? "Saving..." : "Save Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceMasterWizard;
