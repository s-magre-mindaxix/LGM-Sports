import React from "react";
import type { AgencyTabProps, AgencyContact } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const AgencyContactTab: React.FC<AgencyTabProps> = ({ data, setData }) => {
  const inputStyle = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const updateContact = (index: number, field: keyof AgencyContact, value: any) => {
    const updated = [...(data.contacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, contacts: updated });
  };

  const addContact = () => {
    const newContact: AgencyContact = {
      id: 0, personName: "", designation: "", department: "", mobileNo: "",
      alternateMobileNo: "", emailAddress: "", docsAttachment: null,
    };
    setData({ ...data, contacts: [...(data.contacts || []), newContact] });
  };

  const removeContact = (index: number) => {
    setData({ ...data, contacts: data.contacts.filter((_, i) => i !== index) });
  };

  const contacts = data.contacts?.length > 0 ? data.contacts : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">👤</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">Contact Information</h3>
      </div>
      {contacts.map((contact, index) => (
        <div key={index} className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm">
          {data.contacts?.length > 1 && (
            <button onClick={() => removeContact(index)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition" title="Remove Contact">
              <FaTrashAlt />
            </button>
          )}
          <div className="flex flex-col"><label className={labelStyle}>Person Name</label><input className={inputStyle} value={contact.personName || ""} onChange={(e) => updateContact(index, "personName", e.target.value)} /></div>
          <div className="flex flex-col"><label className={labelStyle}>Designation</label><input className={inputStyle} value={contact.designation || ""} onChange={(e) => updateContact(index, "designation", e.target.value)} /></div>
          <div className="flex flex-col"><label className={labelStyle}>Department</label><input className={inputStyle} value={contact.department || ""} onChange={(e) => updateContact(index, "department", e.target.value)} /></div>
          <div className="flex flex-col"><label className={labelStyle}>Mobile No</label><input className={inputStyle} value={contact.mobileNo || ""} onChange={(e) => updateContact(index, "mobileNo", e.target.value)} /></div>
          <div className="flex flex-col"><label className={labelStyle}>Alt. Mobile No</label><input className={inputStyle} value={contact.alternateMobileNo || ""} onChange={(e) => updateContact(index, "alternateMobileNo", e.target.value)} /></div>
          <div className="flex flex-col"><label className={labelStyle}>Email</label><input type="email" className={inputStyle} value={contact.emailAddress || ""} onChange={(e) => updateContact(index, "emailAddress", e.target.value)} /></div>
          <div className="md:col-span-3">
            <label className={labelStyle}>Docs Attachment</label>
            <div className="flex items-center border border-gray-300 rounded-lg bg-white h-[46px]">
              <span className="px-4 text-gray-500 text-sm truncate flex-1 font-medium italic">
                {contact.contactFile instanceof File ? contact.contactFile.name : typeof contact.docsAttachment === "string" && contact.docsAttachment ? contact.docsAttachment.split(/[\\/]/).pop() : "No file selected"}
              </span>
              {typeof contact.docsAttachment === "string" && contact.docsAttachment && (
                <a href={`${FILE_BASE_URL}${contact.docsAttachment}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 px-3 h-full flex items-center justify-center border-l" title="View Document">
                  <FaEye size={18} />
                </a>
              )}
              <input type="file" id={`contact-doc-${index}`} className="hidden" onChange={(e) => e.target.files && updateContact(index, "contactFile", e.target.files[0])} />
              <label htmlFor={`contact-doc-${index}`} className="bg-[#f07837] text-white px-4 h-full flex items-center rounded-r-lg cursor-pointer hover:bg-[#0d3357] text-xs font-bold">
                Browse
              </label>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={addContact} className={buttonStyles.addmore}>+ Add Contact</button>
    </div>
  );
};

export default AgencyContactTab;