import React, { useState, useEffect } from "react";
import type { Currency } from "./Services/types";
import { saveCurrency } from "./Services/CurrencyService";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface Props {
  onCancel: () => void;
  onSave: (data: Currency) => void;
  editData: Currency | null;
}

const CurrencyForm: React.FC<Props> = ({ onCancel, onSave, editData }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    currencyName: "",
    currencySymbol: "",
    currencyValue: "",
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        currencyName: editData.currencyName,
        currencySymbol: editData.currencySymbol,
        currencyValue: editData.currencyValue.toString(),
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currencyName || !formData.currencyValue)
      return toast.error("Missing fields");

    setIsSaving(true);
    try {
      const payload = {
        id: editData?.id || 0,
        currencyName: formData.currencyName,
        currencySymbol: formData.currencySymbol,
        currencyValue: parseFloat(formData.currencyValue),
      };
      await saveCurrency(payload);
      toast.success("Currency saved");
      onSave(payload);
    } catch (error) {
      toast.error("Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
      <h3 className="font-bold text-gray-700 mb-6">
        {editData ? "Edit Currency" : "Add Currency"}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Currency Name
            </label>
            <input
              className="w-full border p-2.5 rounded-lg"
              value={formData.currencyName}
              onChange={(e) =>
                setFormData({ ...formData, currencyName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Symbol
            </label>
            <input
              className="w-full border p-2.5 rounded-lg"
              value={formData.currencySymbol}
              onChange={(e) =>
                setFormData({ ...formData, currencySymbol: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Exchange Value
            </label>
            <input
              type="number"
              className="w-full border p-2.5 rounded-lg"
              value={formData.currencyValue}
              onChange={(e) =>
                setFormData({ ...formData, currencyValue: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className={buttonStyles.cancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={buttonStyles.save}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CurrencyForm;
