import React from "react";
import type { Agency } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { FaTimes, FaBuilding, FaMapMarkerAlt, FaInfoCircle, FaUniversity, FaUserAlt, FaPhoneAlt, FaEnvelope, FaDownload } from 'react-icons/fa';

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
    agency: Agency;
    onClose: () => void;
}

const AgencyViewModal: React.FC<ViewModalProps> = ({ agency, onClose }) => {
    
    const DataItem = ({ label, value }: { label: string; value?: string | number | null;}) => (
        <div className="flex flex-col border-b border-gray-100 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            <span className="text-sm font-semibold text-[#0b2c52] break-words">{value || "N/A"}</span>
        </div>
    );

    const SectionHeader = ({ icon: Icon, title }: any) => (
        <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
            <Icon className="text-[#0b2c52] text-lg" />
            <h3 className="text-sm font-extrabold text-[#0b2c52] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">{title}</h3>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-[#f07837] text-white p-2 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1 rounded-lg w-18 h-12 flex items-center justify-center overflow-hidden shadow-inner">
                            {typeof agency.agencyLogo === 'string' && agency.agencyLogo ? <img src={`${FILE_BASE_URL}${agency.agencyLogo}`} alt="Logo" className="max-h-full object-contain" /> : <FaBuilding className="text-gray-300 text-3xl" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight uppercase tracking-tight">{agency.agencyName}</h2>
                            <p className="text-xs text-blue-200 font-mono tracking-widest">Code: {agency.agencyCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full">
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        <div className="xl:col-span-8 space-y-10">
                            <section>
                                <SectionHeader icon={FaInfoCircle} title="Agency Information" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                                    <DataItem label="Agency Type" value={agency.agencyTypeName || `ID: ${agency.agencyTypeId}`} />
                                    <DataItem label="Short Name" value={agency.agencyShortName} />
                                    <DataItem label="PAN Number" value={agency.panNo} />
                                    <DataItem label="TAN Number" value={agency.tanNo} />
                                    <DataItem label="GSTIN" value={agency.gstin} />
                                    <DataItem label="CIN Number" value={agency.cinNo} />
                                    <DataItem label="IATA Code" value={agency.iataCode} />
                                    <DataItem label="FMC Code" value={agency.fmcCode} />
                                    <DataItem label="License No" value={agency.licenseNo} />
                                    <DataItem label="Website" value={agency.website} />
                                </div>
                            </section>

                            {agency.addresses.map((addr, idx) => (
                                <section key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <SectionHeader icon={FaMapMarkerAlt} title={`${addr.addressType || 'Address'} Details`} />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                        <DataItem label="Flat/Block No" value={addr.flatBlockNo} />
                                        <DataItem label="Premises" value={addr.premises} />
                                        <DataItem label="Road/Street" value={addr.roadStreetLane} />
                                        <DataItem label="Area/Locality" value={addr.area} />
                                        <DataItem label="Town/City" value={addr.townCity} />
                                        <DataItem label="Pincode" value={addr.pincode} />
                                        <DataItem label="Country" value={addr.countryName} />
                                        <DataItem label="State" value={addr.stateName} />
                                        <DataItem label="Mobile" value={addr.mobileNo} />
                                        <DataItem label="Alt Mobile" value={addr.alternateMobileNo} />
                                        <DataItem label="Email" value={addr.emailAddress} />
                                        <DataItem label="Alt Email" value={addr.alternateEmailAddress} />
                                    </div>
                                </section>
                            ))}
                        </div>

                        <div className="xl:col-span-4 space-y-10">
                            <section>
                                <SectionHeader icon={FaUniversity} title="Bank Accounts" />
                                {agency.bankDetails.length > 0 ? agency.bankDetails.map((bank, i) => (
                                    <div key={i} className="mb-6 p-5 bg-white border-l-4 border-blue-500 rounded-r-xl shadow-sm space-y-3">
                                        <div className="pb-2 border-b"><p className="text-sm font-extrabold text-[#0b2c52]">{bank.bankName}</p></div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <DataItem label="Account Holder" value={bank.accountHolderName} />
                                            <DataItem label="Account No" value={bank.accountNo} />
                                            <DataItem label="IFSC Code" value={bank.ifscCode} />
                                            <DataItem label="Swift Code" value={bank.swiftCode} />
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No bank details</p>}
                            </section>

                            <section>
                                <SectionHeader icon={FaUserAlt} title="Contacts" />
                                {agency.contacts.length > 0 ? agency.contacts.map((contact, i) => (
                                    <div key={i} className="mb-6 p-5 bg-[#f07837] text-white rounded-xl shadow-md">
                                        <div className="mb-3">
                                            <p className="text-base font-bold">{contact.personName}</p>
                                            <p className="text-[10px] text-blue-300 font-bold uppercase">{contact.designation}</p>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs"><FaPhoneAlt className="text-blue-300" /> {contact.mobileNo || "N/A"}</div>
                                            <div className="flex items-center gap-2 text-xs"><FaEnvelope className="text-blue-300" /> {contact.emailAddress || "N/A"}</div>
                                        </div>
                                        {typeof contact.docsAttachment === 'string' && contact.docsAttachment && (
                                            <a href={`${FILE_BASE_URL}${contact.docsAttachment}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">
                                                <FaDownload /> View Document
                                            </a>
                                        )}
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No contacts provided</p>}
                            </section>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-t p-5 flex justify-end">
                    <button onClick={onClose} className="px-10 py-2.5 bg-gray-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition shadow-lg">Close</button>
                </div>
            </div>
        </div>
    );
};

export default AgencyViewModal;