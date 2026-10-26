

import React from 'react';
import type { CustomerTabProps } from '../Services/types';
import { FaEye } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../../../API/apiConfig';

interface ExtendedTabProps extends CustomerTabProps {
  errors?: { [key: string]: string[] };
}

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const OtherInfoTab: React.FC<ExtendedTabProps> = ({ data, setData, errors = {} }) => {
    const inputStyle = (hasError: boolean) =>
        `w-full border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm`;
    const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData({ ...data, attachmentFile: e.target.files[0] });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-3 border-b pb-3">
                <span className="text-2xl text-[#0b2c52]">📄</span>
                <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">Other Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div className="flex flex-col">
                    <label className={labelStyle}>Customer PAN</label>
                    <input 
                        className={inputStyle(!!errors.customerPAN)} 
                        value={data.customerPAN || ""} 
                        onChange={(e) => setData({ ...data, customerPAN: e.target.value.toUpperCase() })} 
                    />
                    {errors.customerPAN && (
                        <p className="mt-1 text-sm text-red-500">{errors.customerPAN[0]}</p>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className={labelStyle}>Customer TAN</label>
                    <input 
                        className={inputStyle(false)} 
                        value={data.customerTAN || ""} 
                        onChange={(e) => setData({ ...data, customerTAN: e.target.value.toUpperCase() })} 
                    />
                </div>
                <div className="flex flex-col">
                    <label className={labelStyle}>GSTIN No.</label>
                    <input 
                        className={inputStyle(!!errors.gstin)} 
                        value={data.gstin || ""} 
                        onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })} 
                    />
                    {errors.gstin && (
                        <p className="mt-1 text-sm text-red-500">{errors.gstin[0]}</p>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className={labelStyle}>CIN No.</label>
                    <input 
                        className={inputStyle(!!errors.cin)} 
                        value={data.cin || ""} 
                        onChange={(e) => setData({ ...data, cin: e.target.value.toUpperCase() })} 
                    />
                    {errors.cin && (
                        <p className="mt-1 text-sm text-red-500">{errors.cin[0]}</p>
                    )}
                </div>
                <div className="flex flex-col">
                    <label className={labelStyle}>MSME No.</label>
                    <input 
                        className={inputStyle(false)} 
                        value={data.msmeNo || ""} 
                        onChange={(e) => setData({ ...data, msmeNo: e.target.value })} 
                    />
                </div>
            </div>
            <div className="lg:col-span-2">
                <label className={labelStyle}>Document Attachment</label>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white h-[46px]">
                    <span className="px-4 text-gray-500 text-sm truncate flex-1 font-medium italic">
                        {data.attachmentFile ? data.attachmentFile.name : typeof data.docsAttachment === 'string' && data.docsAttachment ? data.docsAttachment.split(/[\\/]/).pop() : "No file selected"}
                    </span>
                    {typeof data.docsAttachment === 'string' && data.docsAttachment && (
                        <a href={`${FILE_BASE_URL}${data.docsAttachment}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 px-3 h-full flex items-center justify-center border-l" title="View Document"><FaEye size={18} /></a>
                    )}
                    <input type="file" id="customer-doc-attach" className="hidden" onChange={handleFileChange} />
                    <label htmlFor="customer-doc-attach" className="bg-[#f07837] text-white px-4 h-full flex items-center rounded-r-lg cursor-pointer hover:bg-[#0d3357] text-xs font-bold">Browse</label>
                </div>
            </div>
        </div>
    );
};

export default OtherInfoTab;