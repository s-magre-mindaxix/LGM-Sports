import React from "react";
import type { AgencyTabProps, AgencyBankDetail } from "../Services/types";
import { FaTrashAlt } from "react-icons/fa";
import { buttonStyles } from "../../../../../Components/Common/buttonStyles";

const AgencyBankDetailsTab: React.FC<AgencyTabProps> = ({ data, setData }) => {
  const inputStyle = "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle = "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const addBank = () => {
    setData({ ...data, bankDetails: [...(data.bankDetails || []), {} as AgencyBankDetail] });
  };

  const removeBank = (index: number) => {
    setData({ ...data, bankDetails: data.bankDetails.filter((_, i) => i !== index) });
  };

  const updateBank = (idx: number, field: keyof AgencyBankDetail, val: string) => {
    const updated = [...(data.bankDetails || [])];
    updated[idx] = { ...updated[idx], [field]: val };
    setData({ ...data, bankDetails: updated });
  };

  const banks = data.bankDetails?.length > 0 ? data.bankDetails : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3 border-b pb-3">
        <span className="text-2xl text-[#0b2c52]">🏦</span>
        <h3 className="text-lg font-bold text-[#0b2c52] uppercase tracking-tight">Bank Details</h3>
      </div>
      <div className="space-y-6">
        {banks.map((bank, idx) => (
          <div key={idx} className="relative border p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 shadow-sm">
            {data.bankDetails?.length > 1 && (
              <button type="button" onClick={() => removeBank(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition" title="Remove Bank">
                <FaTrashAlt />
              </button>
            )}
            <div className="flex flex-col"><label className={labelStyle}>Bank Name</label><input className={inputStyle} value={bank.bankName || ""} onChange={(e) => updateBank(idx, "bankName", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Bank Address</label><input className={inputStyle} value={bank.bankAddress || ""} onChange={(e) => updateBank(idx, "bankAddress", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Email Address</label><input className={inputStyle} value={bank.emailAddress || ""} onChange={(e) => updateBank(idx, "emailAddress", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Account No.</label><input className={inputStyle} value={bank.accountNo || ""} onChange={(e) => updateBank(idx, "accountNo", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>IFSC Code</label><input className={inputStyle} value={bank.ifscCode || ""} onChange={(e) => updateBank(idx, "ifscCode", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Account Holder</label><input className={inputStyle} value={bank.accountHolderName || ""} onChange={(e) => updateBank(idx, "accountHolderName", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>Swift Code</label><input className={inputStyle} value={bank.swiftCode || ""} onChange={(e) => updateBank(idx, "swiftCode", e.target.value)} /></div>
            <div className="flex flex-col"><label className={labelStyle}>IBAN No.</label><input className={inputStyle} value={bank.ibanNo || ""} onChange={(e) => updateBank(idx, "ibanNo", e.target.value)} /></div>
          </div>
        ))}
      </div>
      <button type="button" onClick={addBank} className={buttonStyles.addmore}>+ Add Bank Detail</button>
    </div>
  );
};

export default AgencyBankDetailsTab;