import React from "react";
import type {
  InstallationReportTabProps,
  InstallationContact,
} from "../Services/types";
import { FaTrashAlt } from "react-icons/fa";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

const ContactsTab: React.FC<InstallationReportTabProps> = ({
  data,
  setData,
}) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const addContact = () => {
    const newContact: InstallationContact = {
      id: 0,
      name: "",
      designation: "",
    };
    setData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), newContact],
    }));
  };

  const removeContact = (index: number) => {
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const updateContact = (
    idx: number,
    field: keyof InstallationContact,
    val: string,
  ) => {
    setData((prev) => {
      const updated = [...(prev.contacts || [])];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, contacts: updated };
    });
  };

  const contacts =
    data.contacts && data.contacts.length > 0
      ? data.contacts
      : [{} as InstallationContact];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">👤</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
          Associated Contacts
        </h3>
      </div>

      <div className="space-y-6">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm"
          >
            {data.contacts?.length > 1 && (
              <button
                type="button"
                onClick={() => removeContact(idx)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
                title="Remove Contact"
              >
                <FaTrashAlt />
              </button>
            )}
            <div className="flex flex-col md:col-span-1">
              <label className={labelStyle}>Person Name</label>
              <input
                className={inputStyle}
                value={contact.name || ""}
                onChange={(e) => updateContact(idx, "name", e.target.value)}
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className={labelStyle}>Designation</label>
              <input
                className={inputStyle}
                value={contact.designation || ""}
                onChange={(e) =>
                  updateContact(idx, "designation", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addContact} className={buttonStyles.add}>
        + Add New Contact
      </button>
    </div>
  );
};

export default ContactsTab;
