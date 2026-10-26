import React, { useState } from "react";
import type { VendorTabProps, VendorContact } from "../Services/types";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const OtherInformationTab: React.FC<VendorTabProps> = ({ data, setData }) => {
  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (index: number, name: string, value: string) => {
    let errorMsg = "";

    if (value && value.trim() !== "") {
      if (
        name === "emailAddress" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        errorMsg = "Invalid email format.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [`${name}-${index}`]: errorMsg,
    }));
  };

  const updateContact = (
    index: number,
    field: keyof VendorContact,
    value: any,
  ) => {
    const updated = [...(data.principalContacts || [])];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, principalContacts: updated });
  };

  const addContact = () => {
    const newContact: VendorContact = {
      id: 0,
      personName: "",
      designation: "",
      mobileNo: "",
      emailAddress: "",
      docsAttachment: null,
    };
    setData({
      ...data,
      principalContacts: [...(data.principalContacts || []), newContact],
    });
  };

  const removeContact = (index: number) => {
    setData({
      ...data,
      principalContacts: data.principalContacts.filter((_, i) => i !== index),
    });
    // Clear errors for the removed row
    const newErrors = { ...errors };
    delete newErrors[`mobileNo-${index}`];
    delete newErrors[`emailAddress-${index}`];
    setErrors(newErrors);
  };

  const contacts =
    data.principalContacts && data.principalContacts.length > 0
      ? data.principalContacts
      : [{} as VendorContact];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      {/* --- TAX INFORMATION --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="text-2xl text-[#0b2c52]">📄</span>
          <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
            Tax Information
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <label className={labelStyle}>Vendor PAN</label>
            <input
              className={inputStyle}
              value={data.vendorPAN || ""}
              onChange={(e) => setData({ ...data, vendorPAN: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>Vendor TAN</label>
            <input
              className={inputStyle}
              value={data.vendorTAN || ""}
              onChange={(e) => setData({ ...data, vendorTAN: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>VAT No</label>
            <input
              className={inputStyle}
              value={data.vatNo || ""}
              onChange={(e) => setData({ ...data, vatNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>MSME No</label>
            <input
              className={inputStyle}
              value={data.msmeNo || ""}
              onChange={(e) => setData({ ...data, msmeNo: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>GSTIN No</label>
            <input
              className={inputStyle}
              value={data.gstin || ""}
              onChange={(e) => setData({ ...data, gstin: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelStyle}>CIN No</label>
            <input
              className={inputStyle}
              value={data.cin || ""}
              onChange={(e) => setData({ ...data, cin: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* --- PRINCIPLE CONTACT INFORMATION --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="text-2xl text-[#0b2c52]">👤</span>
          <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">
            Principle Contact Information
          </h3>
        </div>
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm"
          >
            {data.principalContacts?.length > 1 && (
              <button
                onClick={() => removeContact(index)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
                title="Remove Contact"
              >
                <FaTrashAlt />
              </button>
            )}
            <div className="flex flex-col">
              <label className={labelStyle}>Person Name</label>
              <input
                className={inputStyle}
                value={contact.personName || ""}
                onChange={(e) =>
                  updateContact(index, "personName", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Designation</label>
              <input
                className={inputStyle}
                value={contact.designation || ""}
                onChange={(e) =>
                  updateContact(index, "designation", e.target.value)
                }
              />
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Mobile No</label>
              <input
                className={`${inputStyle} ${errors[`mobileNo-${index}`] ? "border-red-500" : ""}`}
                value={contact.mobileNo || ""}
                onChange={(e) => {
                  updateContact(index, "mobileNo", e.target.value);
                  validate(index, "mobileNo", e.target.value);
                }}
              />
              {errors[`mobileNo-${index}`] && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors[`mobileNo-${index}`]}
                </p>
              )}
            </div>
            <div className="flex flex-col">
              <label className={labelStyle}>Email Address</label>
              <input
                className={`${inputStyle} ${errors[`emailAddress-${index}`] ? "border-red-500" : ""}`}
                value={contact.emailAddress || ""}
                onChange={(e) => {
                  updateContact(index, "emailAddress", e.target.value);
                  validate(index, "emailAddress", e.target.value);
                }}
              />
              {errors[`emailAddress-${index}`] && (
                <p className="text-red-500 text-[10px] mt-1 font-bold">
                  {errors[`emailAddress-${index}`]}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>Docs Attachment</label>
              <div className="flex items-center border border-gray-300 rounded-lg bg-white h-[46px]">
                <span className="px-4 text-gray-500 text-sm truncate flex-1 font-medium italic">
                  {contact.docsAttachment instanceof File
                    ? contact.docsAttachment.name
                    : typeof contact.docsAttachment === "string" &&
                        contact.docsAttachment
                      ? contact.docsAttachment.split(/[\\/]/).pop()
                      : "No file selected"}
                </span>
                {typeof contact.docsAttachment === "string" &&
                  contact.docsAttachment && (
                    <a
                      href={`${FILE_BASE_URL}${contact.docsAttachment}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700 px-3 h-full flex items-center justify-center border-l"
                      title="View Document"
                    >
                      <FaEye size={18} />
                    </a>
                  )}
                <input
                  type="file"
                  id={`contact-doc-${index}`}
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    updateContact(index, "docsAttachment", e.target.files[0])
                  }
                />
                <label
                  htmlFor={`contact-doc-${index}`}
                  className="bg-[#f07837] text-white px-4 h-full flex items-center rounded-r-lg cursor-pointer hover:bg-[#0d3357] text-xs font-bold"
                >
                  Browse
                </label>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addContact}
          className={buttonStyles.addmore}
        >
          + Add New
        </button>
      </div>
    </div>
  );
};

export default OtherInformationTab;
