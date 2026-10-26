// // EditSalaryRecordForm.tsx
// import React, { useState, useMemo } from "react";
// import { Loader2 } from "lucide-react";

// // Matches the C# DTOs
// interface MonthlySalaryComponentDetailDto {
//   id: number;
//   componentName: string;
//   componentType: "Earning" | "Deduction";
//   amount: number;
// }

// interface MonthlySalaryRecordDto {
//   id: number;
//   employeeName: string;
//   payableDays: number;
//   lopDays: number;
//   remarks: string | null;
//   grossEarnings: number;
//   totalDeductions: number;
//   netSalary: number;
//   componentDetails: MonthlySalaryComponentDetailDto[];
// }

// // Matches the C# Update DTO
// interface UpdateMonthlySalaryRecordDto {
//   payableDays: number;
//   lopDays: number;
//   remarks: string | null;
//   componentDetails: {
//     id: number;
//     amount: number;
//   }[];
// }

// interface EditSalaryRecordFormProps {
//   record: MonthlySalaryRecordDto;
//   onSave: (updatedData: UpdateMonthlySalaryRecordDto) => Promise<void>;
//   onClose: () => void;
//   isSaving: boolean;
// }

// const formatCurrency = (amount: number) => {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     minimumFractionDigits: 2,
//   }).format(amount);
// };

// export const EditSalaryRecordForm: React.FC<EditSalaryRecordFormProps> = ({
//   record,
//   onSave,
//   onClose,
//   isSaving,
// }) => {
//   const [formData, setFormData] = useState(record);

//   // Recalculate totals whenever component amounts change
//   const calculatedTotals = useMemo(() => {
//     const grossEarnings = formData.componentDetails
//       .filter((c) => c.componentType === "Earning")
//       .reduce((sum, c) => sum + Number(c.amount || 0), 0);

//     const totalDeductions = formData.componentDetails
//       .filter((c) => c.componentType === "Deduction")
//       .reduce((sum, c) => sum + Number(c.amount || 0), 0);

//     const netSalary = grossEarnings - totalDeductions;

//     return { grossEarnings, totalDeductions, netSalary };
//   }, [formData.componentDetails]);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleComponentAmountChange = (id: number, value: string) => {
//     // Allow empty string for typing, but treat as 0 for calculation
//     const newAmount = value === "" ? "" : parseFloat(value);

//     if (isNaN(Number(newAmount)) && newAmount !== "") return; // Prevent non-numeric input

//     setFormData((prev) => ({
//       ...prev,
//       componentDetails: prev.componentDetails.map((comp) =>
//         comp.id === id ? { ...comp, amount: Number(newAmount) } : comp,
//       ),
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const updateDto: UpdateMonthlySalaryRecordDto = {
//       payableDays: Number(formData.payableDays),
//       lopDays: Number(formData.lopDays),
//       remarks: formData.remarks,
//       componentDetails: formData.componentDetails.map((c) => ({
//         id: c.id,
//         amount: Number(c.amount),
//       })),
//     };
//     onSave(updateDto);
//   };

//   const earnings = formData.componentDetails.filter(
//     (c) => c.componentType === "Earning",
//   );
//   const deductions = formData.componentDetails.filter(
//     (c) => c.componentType === "Deduction",
//   );

//   return (
//     <form onSubmit={handleSubmit}>
//       <div className="space-y-6">
//         {/* Top section for days and remarks */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Payable Days
//             </label>
//             <input
//               type="number"
//               name="payableDays"
//               step="0.5"
//               value={formData.payableDays}
//               onChange={handleInputChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               LOP Days
//             </label>
//             <input
//               type="number"
//               name="lopDays"
//               step="0.5"
//               value={formData.lopDays}
//               onChange={handleInputChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
//             />
//           </div>
//           <div className="md:col-span-3">
//             <label className="block text-sm font-medium text-gray-700">
//               Remarks
//             </label>
//             <textarea
//               name="remarks"
//               rows={2}
//               value={formData.remarks || ""}
//               onChange={handleInputChange}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
//             />
//           </div>
//         </div>

//         {/* Components and Totals */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//           {/* Earnings */}
//           <div>
//             <h3 className="font-semibold text-lg text-gray-800 mb-2">
//               Earnings
//             </h3>
//             <div className="space-y-2">
//               {earnings.map((comp) => (
//                 <div key={comp.id} className="flex items-center gap-2">
//                   <label className="w-1/2 text-gray-600">
//                     {comp.componentName}
//                   </label>
//                   <input
//                     type="number"
//                     value={comp.amount}
//                     onChange={(e) =>
//                       handleComponentAmountChange(comp.id, e.target.value)
//                     }
//                     className="block w-1/2 rounded-md border-gray-300 shadow-sm sm:text-sm text-right p-2"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Deductions */}
//           <div>
//             <h3 className="font-semibold text-lg text-gray-800 mb-2">
//               Deductions
//             </h3>
//             <div className="space-y-2">
//               {deductions.map((comp) => (
//                 <div key={comp.id} className="flex items-center gap-2">
//                   <label className="w-1/2 text-gray-600">
//                     {comp.componentName}
//                   </label>
//                   <input
//                     type="number"
//                     value={comp.amount}
//                     onChange={(e) =>
//                       handleComponentAmountChange(comp.id, e.target.value)
//                     }
//                     className="block w-1/2 rounded-md border-gray-300 shadow-sm sm:text-sm text-right p-2"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Totals Summary */}
//         <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
//           <div className="flex justify-between items-center py-2 border-b">
//             <span className="font-semibold text-gray-700">Gross Earnings</span>
//             <span className="font-bold text-green-600">
//               {formatCurrency(calculatedTotals.grossEarnings)}
//             </span>
//           </div>
//           <div className="flex justify-between items-center py-2 border-b">
//             <span className="font-semibold text-gray-700">
//               Total Deductions
//             </span>
//             <span className="font-bold text-red-600">
//               {formatCurrency(calculatedTotals.totalDeductions)}
//             </span>
//           </div>
//           <div className="flex justify-between items-center pt-2">
//             <span className="font-bold text-xl text-gray-800">Net Salary</span>
//             <span className="font-bold text-xl text-blue-600">
//               {formatCurrency(calculatedTotals.netSalary)}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="mt-8 flex justify-end gap-3 border-t pt-4">
//         <button
//           type="button"
//           onClick={onClose}
//            className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           disabled={isSaving}
//           className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
//         >
//           {isSaving && <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />}
//           {isSaving ? "Saving..." : "Save Changes"}
//         </button>
//       </div>
//     </form>
//   );
// };

// EditSalaryRecordForm.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";

/* ================= TYPES ================= */
interface MonthlySalaryComponentDetailDto {
  id: number;
  componentName: string;
  componentType: "Earning" | "Deduction";
  amount: number;
  isProrated: boolean;
  originalMonthlyAmount?: number;
}

interface MonthlySalaryRecordDto {
  id: number;
  employeeName: string;
  payableDays: number;
  lopDays: number;
  presentDays: number;
  weeklyOffAndHolidays: number;
  casualLeaveDays: number;
  totalDaysInMonth: number;
  remarks: string | null;
  componentDetails: MonthlySalaryComponentDetailDto[];
}

interface UpdateMonthlySalaryRecordDto {
  presentDays: number;
  weeklyOffAndHolidays: number;
  casualLeaveDays: number;
  payableDays: number;
  lopDays: number;
  remarks: string | null;
  componentDetails: { id: number; amount: number }[];
}

interface Props {
  record: any;
  onSave: (data: UpdateMonthlySalaryRecordDto) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

/* ================= HELPERS ================= */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const normalizeRecord = (apiRecord: any): MonthlySalaryRecordDto => {
  if (!apiRecord) return {} as MonthlySalaryRecordDto;
  
  return {
    id: apiRecord.id,
    employeeName: apiRecord.employeeName || "",
    totalDaysInMonth: Number(apiRecord.totalDaysInMonth || 30),
    // Map these from the API response (ensure backend uses camelCase or matches these keys)
    presentDays: Number(apiRecord.presentDays || 0),
    weeklyOffAndHolidays: Number(apiRecord.weeklyOffAndHolidays || 0),
    casualLeaveDays: Number(apiRecord.casualLeaveDays || 0),
    payableDays: Number(apiRecord.payableDays || 0),
    lopDays: Number(apiRecord.lopDays || 0),
    remarks: apiRecord.remarks || "",
    componentDetails: (apiRecord.componentDetails || []).map((c: any) => ({
      id: c.id,
      componentName: c.componentName,
      componentType: c.componentType,
      amount: Number(c.amount || 0),
      isProrated: Boolean(c.isProrated),
      originalMonthlyAmount: c.originalMonthlyAmount !== undefined ? Number(c.originalMonthlyAmount) : undefined,
    })),
  };
};

/* ================= COMPONENT ================= */
export const EditSalaryRecordForm: React.FC<Props> = ({ record, onSave, onClose, isSaving }) => {
  const [formData, setFormData] = useState<MonthlySalaryRecordDto>(() => normalizeRecord(record));

  // Update form if record prop changes
  useEffect(() => {
    if (record) {
      setFormData(normalizeRecord(record));
    }
  }, [record]);

  const calculatedTotals = useMemo(() => {
    const gross = formData.componentDetails
      .filter((c) => c.componentType.toLowerCase() === "earning")
      .reduce((sum, c) => sum + c.amount, 0);
    const deduction = formData.componentDetails
      .filter((c) => c.componentType.toLowerCase() === "deduction")
      .reduce((sum, c) => sum + c.amount, 0);
    return { grossEarnings: gross, totalDeductions: deduction, netSalary: gross - deduction };
  }, [formData.componentDetails]);

  const handleAttendanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value === "" ? 0 : parseFloat(value);
    if (isNaN(val)) return;

    setFormData((prev) => {
      // 1. Update the specific field (presentDays, weeklyOffAndHolidays, or casualLeaveDays)
      const updatedForm = { ...prev, [name]: val };

      // 2. Calculate New Payable Days
      const newPayable = updatedForm.presentDays + updatedForm.weeklyOffAndHolidays + updatedForm.casualLeaveDays;
      updatedForm.payableDays = Number(newPayable.toFixed(2));
      
      // 3. Calculate LOP
      updatedForm.lopDays = Number((updatedForm.totalDaysInMonth - newPayable).toFixed(2));

      // 4. Recalculate Pro-rated Earnings
      updatedForm.componentDetails = updatedForm.componentDetails.map((comp) => {
        if (comp.isProrated && comp.componentType.toLowerCase() === "earning" && comp.originalMonthlyAmount) {
          const newAmount = (comp.originalMonthlyAmount / updatedForm.totalDaysInMonth) * updatedForm.payableDays;
          return { ...comp, amount: Number(newAmount.toFixed(2)) };
        }
        return comp;
      });

      return updatedForm;
    });
  };

  const handleComponentAmountChange = (id: number, value: string) => {
    const newAmount = value === "" ? 0 : parseFloat(value);
    if (isNaN(newAmount)) return;
    setFormData((prev) => ({
      ...prev,
      componentDetails: prev.componentDetails.map((c) =>
        c.id === id ? { ...c, amount: newAmount } : c
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      presentDays: formData.presentDays,
      weeklyOffAndHolidays: formData.weeklyOffAndHolidays,
      casualLeaveDays: formData.casualLeaveDays,
      payableDays: formData.payableDays,
      lopDays: formData.lopDays,
      remarks: formData.remarks,
      componentDetails: formData.componentDetails.map((c) => ({
        id: c.id,
        amount: c.amount,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Attendance Inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Pres. Days</label>
          <input
            type="number" name="presentDays" step="0.5" value={formData.presentDays}
            onChange={handleAttendanceChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">W.Off + PH</label>
          <input
            type="number" name="weeklyOffAndHolidays" step="0.5" value={formData.weeklyOffAndHolidays}
            onChange={handleAttendanceChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-gray-500">Casual Leave</label>
          <input
            type="number" name="casualLeaveDays" step="1" value={formData.casualLeaveDays}
            onChange={handleAttendanceChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-indigo-600">Total Paid Days</label>
          <div className="mt-1 p-2 w-full bg-indigo-50 border border-indigo-200 rounded-md font-bold text-indigo-700">
            {formData.payableDays}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <h3 className="font-bold text-gray-700 border-b pb-1">Earnings</h3>
          {formData.componentDetails
            .filter((c) => c.componentType.toLowerCase() === "earning")
            .map((comp) => (
              <div key={comp.id} className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                   {comp.componentName} {comp.isProrated && <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded ml-1">Pro-rated</span>}
                </span>

                <input
                  type="number" 
                  value={comp.amount}
                  readOnly={comp.isProrated}
                  onChange={(e) => handleComponentAmountChange(comp.id, e.target.value)}
                  className={`w-36 text-right p-1 border rounded-md ${
                    comp.isProrated ? "bg-gray-100 cursor-not-allowed text-gray-600" : "bg-white"
                  }`}
                />
              </div>
            ))}
        </div>
        <div>
          <h3 className="font-bold text-gray-700 border-b pb-1">Deductions</h3>
          {formData.componentDetails
            .filter((c) => c.componentType.toLowerCase() === "deduction")
            .map((comp) => (
              <div key={comp.id} className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">{comp.componentName}</span>
                <input
                  type="number" value={comp.amount}
                  onChange={(e) => handleComponentAmountChange(comp.id, e.target.value)}
                  className="w-36 text-right p-1 border rounded-md"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="p-4 bg-indigo-50 rounded-lg space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span>Gross Earnings:</span>
          <span className="font-mono font-semibold">{formatCurrency(calculatedTotals.grossEarnings)}</span>
        </div>
        <div className="flex justify-between text-sm text-red-600">
          <span>Total Deductions:</span>
          <span className="font-mono font-semibold">-{formatCurrency(calculatedTotals.totalDeductions)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2 text-indigo-900">
          <span>Net Salary:</span>
          <span>{formatCurrency(calculatedTotals.netSalary)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700">
          {isSaving && <Loader2 className="animate-spin" size={16} />}
          Update Record
        </button>
      </div>
    </form>
  );
};