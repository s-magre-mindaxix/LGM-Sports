import React from "react";
import type { EmployeeFormData } from "../EmployeeWizard";

interface BankDetailsTabProps {
  formData: EmployeeFormData;
  setFormData: React.Dispatch<React.SetStateAction<EmployeeFormData>>;
}

const BankDetailsTab: React.FC<BankDetailsTabProps> = ({
  formData,
  setFormData,
}) => {

   const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition bg-white text-sm";
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";

  const fields = [
    { id: "bankName", label: "Bank Name" },
    { id: "bankAddress", label: "Bank Address" },
    { id: "sortCode", label: "Sort Code" },
    { id: "accountNumber", label: "Account No." },
    { id: "ifscCode", label: "IFSC Code" },
    { id: "accountHolderName", label: "Name of Account Holder" },
    { id: "swiftCode", label: "Swift Code" },
    { id: "ibanNo", label: "IBAN No." },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* <div className="flex items-center gap-2 text-[#0b2c52] font-bold mb-4">
        <span className="text-xl">🏦</span>
        <h3>Bank Details</h3>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        {fields.map((field) => (
          <div key={field.id} className="relative">
            <label className={labelStyle}>{field.label}</label>
            <input
              className={inputStyle}
              value={String(formData[field.id] ?? "")}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BankDetailsTab;
