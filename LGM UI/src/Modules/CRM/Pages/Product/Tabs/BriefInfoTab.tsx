import React from 'react';
import type { TabProps } from '../Services/types';
import { SearchableSelect } from './SearchableSelect';
const BriefInfoTab: React.FC<TabProps> = ({ data, setData, options, onAddMaster }) => {
    const inputStyle = "w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500";

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-[#0b2c52] border-b pb-2">📝 Product Brief Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Product Description</label>
                    <textarea rows={3} className={inputStyle} value={data.productDescription} onChange={(e) => setData({...data, productDescription: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Specification</label>
                    <textarea rows={3} className={inputStyle} value={data.specification} onChange={(e) => setData({...data, specification: e.target.value})} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SearchableSelect label="Select Variant" options={options.variants} value={data.variantId} onChange={(v) => setData({...data, variantId: v})} onAdd={() => onAddMaster('variant')} />
                <SearchableSelect label="Select Version" options={options.versions} value={data.versionId} onChange={(v) => setData({...data, versionId: v})} onAdd={() => onAddMaster('version')} />
                
                {/* <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Select Part Unique</label>
                    <input className={inputStyle} value={data.partUnique} onChange={(e) => setData({...data, partUnique: e.target.value})} />
                </div> */}


                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Manufacturing Date</label>
                    <input type="date" className={inputStyle} value={data.manufacturingDate?.split('T')[0]} onChange={(e) => setData({...data, manufacturingDate: e.target.value})} />
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                    <input type="date" className={inputStyle} value={data.expiryDate?.split('T')[0]} onChange={(e) => setData({...data, expiryDate: e.target.value})} />
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1">Warranty Period</label>
                    <input className={inputStyle} placeholder="e.g. 1 Year" value={data.warrantyPeriod} onChange={(e) => setData({...data, warrantyPeriod: e.target.value})} />
                </div>
            </div>
        </div>
    );
};
export default BriefInfoTab;