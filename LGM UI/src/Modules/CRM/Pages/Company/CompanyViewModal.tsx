import React, { useEffect, useState } from "react";
import type { Company } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { 
    FaTimes, FaDownload, FaBuilding, FaMapMarkerAlt, 
    FaInfoCircle, FaUniversity, FaUserAlt, FaPhoneAlt, FaEnvelope, FaGlobe 
} from 'react-icons/fa';

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace(/\/api\/?$/i, "").replace(/\/$/, "");

const getFileUrl = (path?: string | null): string => {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/i.test(path)) return path;

    const normalizedPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${FILE_BASE_URL}/${normalizedPath}`;
};

interface ViewModalProps {
    company: Company;
    onClose: () => void;
}

const CompanyViewModal: React.FC<ViewModalProps> = ({ company, onClose }) => {
    const [logoFailed, setLogoFailed] = useState(false);
    const logoUrl = getFileUrl(company.logoPath);

    useEffect(() => {
        setLogoFailed(false);
    }, [company.logoPath]);
    
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
        // <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        // <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-transparent p-4">
        

  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 p-4">

            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-[#f07837] text-white p-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1 rounded-lg w-14 h-14 flex items-center justify-center overflow-hidden shadow-inner">
                          {logoUrl && !logoFailed ? (
                                <img
                                    src={logoUrl}
                                    alt={`${company.companyName} logo`}
                                    className="max-h-full max-w-full object-contain"
                                    onError={() => setLogoFailed(true)}
                                />
                            ) : <FaBuilding className="text-gray-300 text-3xl" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight uppercase tracking-tight">{company.companyName}</h2>
                            <div className="flex gap-4">
                                <p className="text-xs text-blue-200 font-mono tracking-widest">Company Code: {company.companyCode}</p>
                                {company.companyShortName && <p className="text-xs text-blue-200 font-mono tracking-widest">Short Name: {company.companyShortName}</p>}
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
                        
                        {/* LEFT CONTENT (Info & Addresses) */}
                        <div className="xl:col-span-8 space-y-10">
                            
                            {/* General Information */}
                            <section>
                                <SectionHeader icon={FaInfoCircle} title="Statutory Information" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
                                    <DataItem label="PAN Number" value={company.pan} />
                                    <DataItem label="TAN Number" value={company.tan} />
                                    <DataItem label="GSTIN" value={company.gstin} />
                                    <DataItem label="CIN Number" value={company.cin} />
                                </div>
                            </section>

                            {/* Addresses Section */}
                            {company.addresses.map((addr, idx) => (
                                <section key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                    <SectionHeader icon={FaMapMarkerAlt} title={`${addr.addressType} Address`} />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                                        <DataItem label="Flat/Block No" value={addr.flatBlock} />
                                        <DataItem label="Premises" value={addr.premises} />
                                        <DataItem label="Road/Strt" value={addr.road} />
                                        <DataItem label="Area" value={addr.area} />
                                        <DataItem label="Town/District" value={addr.town} />
                                        <DataItem label="Pin Code" value={addr.pinCode} />
                                        <DataItem label="Country" value={addr.country} />
                                        <DataItem label="State" value={addr.state} />
                                        <DataItem label="Mobile No" value={addr.mobileNo} />
                                        <DataItem label="Alt Mobile" value={addr.altMobileNo} />
                                        <DataItem label="Email Address" value={addr.email} />
                                        <DataItem label="Alt Email" value={addr.altEmail} />
                                    </div>
                                </section>
                            ))}
                        </div>

                        {/* RIGHT CONTENT (Finance & Directors) */}
                        <div className="xl:col-span-4 space-y-10">
                            
                            {/* Bank Details */}
                            <section>
                                <SectionHeader icon={FaUniversity} title="Bank Accounts" />
                                {company.bankDetails.length > 0 ? company.bankDetails.map((bank, i) => (
                                    <div key={i} className="mb-6 p-5 bg-white border-l-2 border-blue-500 rounded-r-xl shadow-sm space-y-3">
                                        <DataItem label="Bank Name" value={bank.bankName} />
                                        <DataItem label="Account Holder" value={bank.accountHolderName} />
                                        <DataItem label="Account No" value={bank.accountNo} />
                                        <DataItem label="IFSC Code" value={bank.ifsc} />
                                        <DataItem label="Swift Code" value={bank.swiftCode} />
                                        <DataItem label="IBAN No" value={bank.iban} />
                                        <DataItem label="Bank Address" value={bank.bankAddress} />
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No bank details provided</p>}
                            </section>

                            {/* Directors */}
                            <section>
                                <SectionHeader icon={FaUserAlt} title="Company Directors" />
                                {company.directors.length > 0 ? company.directors.map((dir, i) => (
                                    <div key={i} className="mb-6 p-5 bg-[#f07837] text-white rounded-xl shadow-md">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="text-base font-bold tracking-tight">{dir.directorName}</p>
                                                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">{dir.designation}</p>
                                            </div>
                                            <FaUserAlt className="text-blue-400/30 text-xl" />
                                        </div>
                                        
                                        <div className="space-y-2 mb-4 border-t border-white/10 pt-3">
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaPhoneAlt className="text-blue-300" /> {dir.mobileNo || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaEnvelope className="text-blue-300" /> {dir.email || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <FaGlobe className="text-blue-300" /> {dir.website || "N/A"}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {dir.docsAttachmentPath && (
                                                <a 
                                                    href={getFileUrl(dir.docsAttachmentPath)} 
                                                    target="_blank" rel="noreferrer"
                                                    className="flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[9px] font-bold transition-all uppercase"
                                                >
                                                    <FaDownload /> Document
                                                </a>
                                            )}
                                            {dir.presentationPPTPath && (
                                                <a 
                                                    href={getFileUrl(dir.presentationPPTPath)} 
                                                    target="_blank" rel="noreferrer"
                                                    className="flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[9px] font-bold transition-all uppercase"
                                                >
                                                    <FaDownload /> PPT
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )) : <p className="text-xs text-gray-400 italic">No directors provided</p>}
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-white border-t border-gray-100 p-5 flex justify-end items-center gap-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto">Official Company Profile</p>
                    <button 
                        onClick={onClose} 
                        className="px-10 py-2.5 bg-[#f07837] text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors shadow-lg"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyViewModal;


