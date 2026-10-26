import { useState, useRef } from "react";
import { updateState } from "./Services/StateService";
import type { Country } from "../Country/Services/CountryService";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

const EditStateModal = ({ state, countries, onClose, onSuccess }: any) => {
  const [name, setName] = useState(state.stateName);
  const [countryId, setCountryId] = useState(state.countryId);
  const [saving, setSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!name || !countryId) return toast.error("Fill all fields");
    setSaving(true);
    try {
      await updateState(state.id, { stateName: name, countryId });
      toast.success("Updated successfully");
      onSuccess();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Close when clicking outside
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
    >
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-xl shadow-xl w-96 relative"
      >
        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit State</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 mb-3 w-full rounded"
          placeholder="State Name"
        />

        <select
          value={countryId}
          onChange={(e) => setCountryId(Number(e.target.value))}
          className="border p-2 mb-4 w-full rounded"
        >
          {countries.map((c: Country) => (
            <option key={c.id} value={c.id}>
              {c.countryName}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
           className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
             className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStateModal;
