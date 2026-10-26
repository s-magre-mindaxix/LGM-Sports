import React from "react";
import type { Customer } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  FaTimes,
  FaDownload,
  FaBuilding,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaUserAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFileAlt,
} from "react-icons/fa";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
  customer: Customer;
  onClose: () => void;
}

const CustomerViewModal: React.FC<ViewModalProps> = ({ customer, onClose }) => {
  // Helper to display data with a label and value
  const DataItem = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value?: string | number | null;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex flex-col border-b border-gray-100 py-2 ${fullWidth ? "col-span-full" : ""}`}
    >
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#0b2c52] break-words">
        {value || "N/A"}
      </span>
    </div>
  );

  // Helper for Section Headers
  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <Icon className="text-[#0b2c52] text-lg" />
      <h3 className="text-sm font-extrabold text-[#0b2c52] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-transparent-sm p-4">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#f07837] text-white p-2 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            {/* Placeholder Icon instead of Logo */}
            <div className="bg-white p-1 rounded-lg w-18 h-12 flex items-center justify-center overflow-hidden shadow-inner">
              <FaBuilding className="text-gray-300 text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight uppercase tracking-tight">
                {customer.customerName}
              </h2>
              <div className="flex gap-4">
                <p className="text-xs text-blue-200 font-mono tracking-widest">
                  Customer Code: {customer.customerCode}
                </p>
                {customer.customerShortName && (
                  <p className="text-xs text-blue-200 font-mono tracking-widest uppercase">
                    Short Name: {customer.customerShortName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* LEFT CONTENT (General Info & Addresses) */}
            <div className="xl:col-span-8 space-y-10">
              {/* General Information */}
              <section>
                <SectionHeader
                  icon={FaInfoCircle}
                  title="Organization Information"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                  <DataItem label="Branch" value={customer.branch} />
                  <DataItem label="Plant Code" value={customer.plantCode} />
                  <DataItem
                    label="Company Group"
                    value={customer.companyGroupName}
                  />
                  <DataItem
                    label="Vendor Code"
                    value={
                      customer.vendorCode
                        ? `${customer.vendorName} (${customer.vendorCode})`
                        : "NO"
                    }
                  />
                  <DataItem label="PAN Number" value={customer.customerPAN} />
                  <DataItem label="TAN Number" value={customer.customerTAN} />
                  <DataItem label="GSTIN" value={customer.gstin} />
                  <DataItem label="CIN Number" value={customer.cin} />
                  <DataItem label="MSME No." value={customer.msmeNo} />
                </div>
              </section>

              {/* Addresses Section */}
              {customer.addresses && customer.addresses.length > 0 ? (
                customer.addresses.map((addr, idx) => (
                  <section
                    key={idx}
                    className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <SectionHeader
                      icon={FaMapMarkerAlt}
                      title={`${addr.addressType} Address`}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                      <DataItem
                        label="Flat/Dr/Block No"
                        value={addr.flatBlockNo}
                      />
                      <DataItem label="Premises" value={addr.premisesName} />
                      <DataItem label="Road/Strt/Lane" value={addr.road} />
                      <DataItem label="Area/Locality" value={addr.area} />
                      <DataItem label="Town/District" value={addr.town} />
                      <DataItem label="Pin Code" value={addr.pinNo} />
                      <DataItem label="Country" value={addr.countryName} />
                      <DataItem label="State" value={addr.stateName} />
                    </div>
                  </section>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No address information available
                </p>
              )}
            </div>

            {/* RIGHT CONTENT (Responsible Persons & Documents) */}
            <div className="xl:col-span-4 space-y-10">
              {/* Responsible Persons (Contacts) */}
              <section>
                <SectionHeader icon={FaUserAlt} title="Responsible Persons" />
                {customer.contacts && customer.contacts.length > 0 ? (
                  customer.contacts.map((contact, i) => (
                    <div
                      key={i}
                      className="mb-6 p-5 bg-[#f07837] text-white rounded-xl shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-base font-bold tracking-tight">
                            {contact.resPersonName}
                          </p>
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                            {contact.designation}{" "}
                            {contact.departmentName
                              ? `| ${contact.departmentName}`
                              : ""}
                          </p>
                        </div>
                        <FaUserAlt className="text-blue-400/30 text-xl" />
                      </div>

                      <div className="space-y-2 mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <FaPhoneAlt className="text-blue-300" />{" "}
                          {contact.mobileNo || "N/A"}
                          {contact.altMobileNo && (
                            <span className="text-blue-300/50">
                              / {contact.altMobileNo}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <FaEnvelope className="text-blue-300" />{" "}
                          {contact.emailAddress || "N/A"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No contact details provided
                  </p>
                )}
              </section>

              {/* Documents Attachment */}
              <section>
                <SectionHeader icon={FaDownload} title="Customer Documents" />
                {customer.docsAttachment ? (
                  <div className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                      Identification Doc
                    </p>
                    <a
                      href={`${FILE_BASE_URL}${customer.docsAttachment.startsWith("/") ? "" : "/"}${customer.docsAttachment}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#f07837] hover:bg-black text-white rounded-lg text-xs font-bold transition-all uppercase tracking-widest shadow-lg"
                    >
                      <FaDownload /> View Attached Document
                    </a>
                  </div>
                ) : (
                  <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                    <FaFileAlt className="mx-auto text-gray-200 text-3xl mb-2" />
                    <p className="text-xs text-gray-400 italic">
                      No documents attached
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-100 p-5 flex justify-end items-center gap-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto">
            Standard Customer Profile View
          </p>
          <button
            onClick={onClose}
            className="px-10 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-lg"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewModal;
