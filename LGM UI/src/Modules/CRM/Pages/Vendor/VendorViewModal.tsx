import React from "react";
import type { Vendor } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { 
    FaTimes, FaDownload, FaBuilding, FaMapMarkerAlt, 
    FaInfoCircle, FaUniversity, FaUserAlt, FaPhoneAlt, FaEnvelope 
} from 'react-icons/fa';

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
    vendor: Vendor;
    onClose: () => void;
}

const VendorViewModal: React.FC<ViewModalProps> = ({ vendor, onClose }) => {
    
    // Helper to display data with a label and value
    const DataItem = ({ label, value, fullWidth = false }: { label: string; value?: string | number | null; fullWidth?: boolean }) => (
        <div className={`flex flex-col border-b border-gray-100 py-2 ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-[#0b2c52] break-words">{value || "N/A"}</span>
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
                        <div className="bg-white p-1 rounded-lg w-18 h-12 flex items-center justify-center overflow-hidden shadow-inner">
                          {typeof vendor.vendorLogo === 'string' && vendor.vendorLogo ? (
                                <img 
                                    src={`${FILE_BASE_URL}${vendor.vendorLogo.startsWith('/') ? '' : '/'}${vendor.vendorLogo}`} 
                                    alt="Logo" 
                                    className="max-h-full object-contain" 
                                />
                            ) : <FaBuilding className="text-gray-300 text-3xl" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight uppercase tracking-tight">{vendor.vendorName}</h2>
                            <div className="flex gap-4">
                                <p className="text-xs text-blue-200 font-mono tracking-widest">Vendor Code: {vendor.vendorCode}</p>
                                {vendor.vendorShortName && <p className="text-xs text-blue-200 font-mono tracking-widest">Short Name: {vendor.vendorShortName}</p>}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full">
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        
                        {/* LEFT AND CENTER CONTENT (General Info & Addresses) */}
                        <div className="xl:col-span-8 space-y-10">
                            
                            {/* General Information */}
                            <section>
                                <SectionHeader icon={FaInfoCircle} title="Organization Information" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                                    <DataItem label="Vendor Division" value={vendor.vendorDivision} />
                                    <DataItem label="PAN Number" value={vendor.vendorPAN} />
                                    <DataItem label="TAN Number" value={vendor.vendorTAN} />
                                    <DataItem label="GSTIN" value={vendor.gstin} />
                                    <DataItem label="CIN Number" value={vendor.cin} />
                                    <DataItem label="VAT No." value={vendor.vatNo} />
                                    <DataItem label="MSME No." value={vendor.msmeNo} />
                                </div>
                            </section>

                            {/* Addresses Section */}
                            {vendor.addresses.map((addr, idx) => (
                                <section key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <SectionHeader icon={FaMapMarkerAlt} title={`${addr.addressType} Address`} />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                        <DataItem label="Flat/Dr/Block No" value={addr.flatBlockNo} />
                                        <DataItem label="Premises" value={addr.premises} />
                                        <DataItem label="Road/Strt/Lane" value={addr.roadStrLane} />
                                        <DataItem label="Area/Locality" value={addr.area} />
                                        <DataItem label="Town/District" value={addr.town} />
                                        <DataItem label="Pin Code" value={addr.pinNo} />
                                        <DataItem label="Country" value={(addr as any).countryName} />
                                        <DataItem label="State" value={(addr as any).stateName} />
                                        <DataItem label="Mobile No" value={addr.mobileNo} />
                                        <DataItem label="Alt Mobile" value={addr.altMobileNo} />
                                        <DataItem label="Email Address" value={addr.emailAddress} />
                                        <DataItem label="Alt Email" value={addr.altEmailAddress} />
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* RIGHT CONTENT (Finance & Contacts) */}
                        <div className="xl:col-span-4 space-y-10">
                            
                            {/* Bank Details */}
                            <section>
                                <SectionHeader icon={FaUniversity} title="Bank Accounts" />
                                {vendor.bankDetails.length > 0 ? vendor.bankDetails.map((bank, i) => (
                                    <div key={i} className="mb-6 p-5 bg-white border-l-4 border-blue-500 rounded-r-xl shadow-sm space-y-3">
                                        <div className="pb-2 border-b border-gray-50">
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Bank Name</p>
                                            <p className="text-sm font-extrabold text-[#0b2c52]">{bank.bankName}</p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <DataItem label="Account Holder" value={bank.accountHolderName} />
                                            <DataItem label="Account No" value={bank.accountNo} />
                                            <DataItem label="IFSC Code" value={bank.ifscCode} />
                                            <DataItem label="Swift Code" value={bank.swiftCode} />
                                            <DataItem label="IBAN No" value={bank.ibanNo} />
                                            <DataItem label="Bank Address" value={bank.bankAddress} />
                                            <DataItem label="Bank Email" value={bank.emailAddress} />
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No bank details provided</p>}
                            </section>

                            {/* Principle Contacts */}
                            <section>
                                <SectionHeader icon={FaUserAlt} title="Responsible Persons" />
                                {vendor.principalContacts.length > 0 ? vendor.principalContacts.map((contact, i) => (
                                    <div key={i} className="mb-6 p-5 bg-[#f07837] text-white rounded-xl shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-base font-bold tracking-tight">{contact.personName}</p>
                                                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">{contact.designation}</p>
                                            </div>
                                            <FaUserAlt className="text-blue-400/30 text-xl" />
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaPhoneAlt className="text-blue-300" /> {contact.mobileNo || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaEnvelope className="text-blue-300" /> {contact.emailAddress || "N/A"}
                                            </div>
                                        </div>

                                         {typeof contact.docsAttachment === 'string' && contact.docsAttachment && (
                                            <a 
                                                href={`${FILE_BASE_URL}${contact.docsAttachment.startsWith('/') ? '' : '/'}${contact.docsAttachment}`} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest"
                                            >
                                                <FaDownload /> View Identity Document
                                            </a>
                                        )}
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No contact details provided</p>}
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-gray-100 p-5 flex justify-end items-center gap-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto">Standard Vendor Profile View</p>
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

export default VendorViewModal;