import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import logo from "../../assets/TranscentoRed.png"; // Ensure this path is correct
import logo from "../../../../assets/Gaxce-Sensors-Logo.png"
import {
  Calculator,
  Save,
  Loader2,
  Calendar,
  UserX,
  FileText,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  Briefcase,
  X,
  Edit3,
  Download
} from "lucide-react";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

interface ComponentBreakdown {
  name: string;
  amount: number;
  originalAmount?: number;
}

interface FnFPreviewRequest {
  employeeId: number;
  lastWorkingDay: string;
  lopDays: number;
  unpaidLeaveDays: number;
  noticeShortfallDays: number;
}

interface FnFPreviewResponse {
  employeeId: number;
  employeeName: string;
  designation: string;
  dateOfJoining: string;
  lastWorkingDay: string;
  salary: {
    exitMonth: string;
    totalDays: number;
    paidDays: number;
    monthlyGross: number;
    payableAmount: number;
    earnedGross: number;
    totalDeductions: number;
    earningBreakdown: ComponentBreakdown[];
    deductionBreakdown: ComponentBreakdown[];
  };
  leave: {
    balanceDays: number;
    ratePerDay: number;
    amount: number;
  };
  bonus: {
    description: string;
    amount: number;
  };
  gratuityAmount: number;
  noticePeriodAmount: number; 
  netPayable: number;
}

interface EmployeeSelectOption {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

// ==========================================
// 2. PDF GENERATION LOGIC
// ==========================================

const generateFnFPDF = (
  preview: FnFPreviewResponse,
  editableValues: { salary: number; leave: number; bonus: number; gratuity: number; notice: number },
  otherDeductions: number,
  deductionRemarks: string,
  noticeRemarks: string,
  finalNetPay: number
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const margin = 40;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height; // Get full page height

  // --- 1. Header & Logo ---
  // Increased Y position for text to avoid overlap with Logo
  doc.addImage(logo, "PNG", margin, margin, 120, 60); 
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  // Aligned text to right, kept Y consistent
  doc.text("Full & Final Settlement Statement", pageWidth - margin, margin + 20, { align: "right" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated On: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, margin + 35, { align: "right" });

  // Increased gap before Employee Details starts
  let currentY = margin + 70;

  // --- 2. Employee Details Section ---
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 25;

  const leftColX = margin;
  const rightColX = pageWidth / 2 + 20;

  const drawDetail = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, x + 90, y);
  };

  drawDetail("Employee Name:", preview.employeeName, leftColX, currentY);
  drawDetail("Designation:", preview.designation, rightColX, currentY);
  currentY += 15;
  drawDetail("Date of Joining:", new Date(preview.dateOfJoining).toLocaleDateString("en-GB"), leftColX, currentY);
  drawDetail("Last Working Day:", new Date(preview.lastWorkingDay).toLocaleDateString("en-GB"), rightColX, currentY);
  currentY += 25;

  // --- 3. Salary Breakdown Table ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`1. Unpaid Salary Breakdown (${preview.salary.exitMonth})`, margin, currentY);
  currentY += 15;

  const salaryRows: any[] = [];
  const earnings = preview.salary.earningBreakdown || [];
  const deductions = preview.salary.deductionBreakdown || [];
  const maxRows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const earn = earnings[i];
    const ded = deductions[i];
    salaryRows.push([
      earn ? earn.name : "",
      earn ? earn.originalAmount?.toLocaleString('en-IN') : "",
      earn ? earn.amount.toLocaleString('en-IN') : "",
      ded ? ded.name : "",
      ded ? ded.amount.toLocaleString('en-IN') : ""
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [[
        { content: 'EARNINGS', colSpan: 3, styles: { halign: 'center', fillColor: '#2eacb3' } },
        { content: 'DEDUCTIONS', colSpan: 2, styles: { halign: 'center', fillColor: '#e74c3c' } },
    ]],
    body: [
      [{ content: 'Component', styles: { fontStyle: 'bold' } }, { content: 'Monthly', styles: { fontStyle: 'bold', halign: 'right' } }, { content: 'Earned', styles: { fontStyle: 'bold', halign: 'right' } }, { content: 'Component', styles: { fontStyle: 'bold' } }, { content: 'Amount', styles: { fontStyle: 'bold', halign: 'right' } }],
      ...salaryRows
    ],
    foot: [[
       { content: 'Total Earned', colSpan: 2, styles: { fontStyle: 'bold' } },
       { content: preview.salary.earnedGross.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right' } },
       { content: 'Total Ded.', styles: { fontStyle: 'bold' } },
       { content: preview.salary.totalDeductions.toLocaleString('en-IN'), styles: { fontStyle: 'bold', halign: 'right' } }
    ]],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { textColor: '#ffffff' },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      4: { halign: 'right' }
    }
  });

  // --- 4. Final Settlement Summary Table ---
  // Added more space (40) between tables
  let finalY = (doc as any).lastAutoTable.finalY + 40;
  
  // Check if we need a new page for the Summary table
  if (finalY > pageHeight - 150) {
      doc.addPage();
      finalY = margin + 20;
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("2. Final Settlement Summary", margin, finalY);
  finalY += 15;

  const summaryBody = [
    ["Unpaid Salary (Net)", `Paid Days: ${preview.salary.paidDays}`, editableValues.salary.toLocaleString('en-IN')],
    ["Leave Encashment", `Balance: ${preview.leave.balanceDays} Days`, editableValues.leave.toLocaleString('en-IN')],
    ["Annual Bonus", preview.bonus.description, editableValues.bonus.toLocaleString('en-IN')],
    ["Gratuity", "Statutory Calculation", editableValues.gratuity.toLocaleString('en-IN')],
    ["Notice Period Adjustment", noticeRemarks || "-", editableValues.notice.toLocaleString('en-IN')],
    ["Other Deductions", deductionRemarks || "-", `-${otherDeductions.toLocaleString('en-IN')}`]
  ];

  autoTable(doc, {
    startY: finalY,
    theme: 'striped',
    head: [['Component', 'Remarks / Basis', 'Amount (Rs)']],
    body: summaryBody,
    foot: [[
      { content: 'NET PAYABLE AMOUNT', colSpan: 2, styles: { halign: 'right', fontSize: 12, fillColor: '#2eacb3' } },
      { content: `Rs. ${finalNetPay.toLocaleString('en-IN')}`, styles: { halign: 'right', fontSize: 12, fillColor: '#2eacb3' } }
    ]],
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: '#34495e' },
    columnStyles: {
      2: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // --- 5. Footer / Signatures (Fixed at Bottom) ---
  
  // Logic: Calculate where the signatures should go relative to the bottom of the page
  let footerY = pageHeight - margin - 50; // 50pts from bottom margin

  // Check if the last table overlaps with the footer area
  const lastTableEnd = (doc as any).lastAutoTable.finalY;
  
  if (lastTableEnd > footerY - 20) {
      // If table is too long, add a new page for signatures
      doc.addPage();
      footerY = pageHeight - margin - 50; // Reset footer position on new page
  }
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // Left Signature
  doc.text("__________________________", margin, footerY);
  doc.text("Employee Signature", margin, footerY + 15);

  // Right Signature
  doc.text("__________________________", pageWidth - margin - 100, footerY);
  doc.text("Authorized Signatory", pageWidth - margin - 100, footerY + 15);

  // Center Disclaimer at very bottom
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text("This is a computer-generated document.", pageWidth / 2, pageHeight - 30, { align: "center" });

  return doc;
};

// ==========================================
// 3. API FUNCTIONS
// ==========================================

const getEmployeesForSelect = async (): Promise<EmployeeSelectOption[]> => {
  const response = await apiClient.get<any[]>(API_ENDPOINTS.Employees);
  return response.data
    .filter((e: any) => e.isActive && !e.isDeleted)
    .map((e: any) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      employeeCode: e.employeeCode
    }));
};

const getFnFPreview = async (req: FnFPreviewRequest): Promise<FnFPreviewResponse> => {
  const response = await apiClient.post<FnFPreviewResponse>(API_ENDPOINTS.FnFPreview, req);
  return response.data;
};

const finalizeFnF = async (payload: any) => {
  const response = await apiClient.post(API_ENDPOINTS.FnFFinalize, payload);
  return response.data;
};

// ==========================================
// 4. REUSABLE COMPONENTS
// ==========================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform scale-100 transition-all">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN COMPONENT
// ==========================================

const FnFManager: React.FC = () => {
  // --- State: Inputs ---
  const [employees, setEmployees] = useState<EmployeeSelectOption[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [lastWorkingDay, setLastWorkingDay] = useState<string>(new Date().toISOString().split("T")[0]);
  
  // Inputs that affect Server Calculation
  const [lopDays, setLopDays] = useState<number>(0);
  const [unpaidLeaveDays, setUnpaidLeaveDays] = useState<number>(0);
  const [noticeShortfall, setNoticeShortfall] = useState<number>(0);

  // Inputs for Manual Adjustments (Client Side)
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  const [deductionRemarks, setDeductionRemarks] = useState<string>("");
  const [noticeRemarks, setNoticeRemarks] = useState<string>("Shortfall Recovery");

  // --- State: Data ---
  const [preview, setPreview] = useState<FnFPreviewResponse | null>(null);
  
  // State for Editable Amounts
  const [editableValues, setEditableValues] = useState({
    salary: 0,
    leave: 0,
    bonus: 0,
    gratuity: 0,
    notice: 0
  });

  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployeesForSelect();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to load employees list");
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedEmpId) return toast.warning("Please select an employee");

    setIsCalculating(true);
    try {
      const data = await getFnFPreview({
        employeeId: Number(selectedEmpId),
        lastWorkingDay,
        lopDays,
        unpaidLeaveDays,
        noticeShortfallDays: noticeShortfall
      });
      setPreview(data);
      
      // Initialize editable values
      setEditableValues({
        salary: data.salary.payableAmount,
        leave: data.leave.amount,
        bonus: data.bonus.amount,
        gratuity: data.gratuityAmount,
        notice: data.noticePeriodAmount
      });

      toast.success("Settlement Preview Calculated");
      setOtherDeductions(0);
      setDeductionRemarks("");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Calculation failed";
      toast.error(msg);
    } finally {
      setIsCalculating(false);
    }
  };

  const finalNetPay = 
      editableValues.salary +
      editableValues.leave +
      editableValues.bonus +
      editableValues.gratuity +
      editableValues.notice - 
      otherDeductions;

   const totalMonthlyStructure = preview?.salary.earningBreakdown.reduce(
     (sum, item) => sum + (item.originalAmount || 0), 0
   ) || 0;

   const handleFinalizeClick = () => {
    if (!preview) return;
    setIsConfirmModalOpen(true);
  };

  const processSubmission = async () => {
    if (!preview) return;
    setIsSubmitting(true);
    try {
      const payload = {
        employeeID: preview.employeeId,
        resignationDate: new Date().toISOString(), 
        lastWorkingDay: preview.lastWorkingDay,
        exitMonth: preview.salary.exitMonth,
        totalDaysInMonth: preview.salary.totalDays,
        paidDays: preview.salary.paidDays,
        monthlyGrossSalary: preview.salary.monthlyGross,
        salaryPayable: editableValues.salary,
        encashableLeaveBalance: preview.leave.balanceDays,
        leaveEncashmentRate: preview.leave.ratePerDay,
        leaveEncashmentAmount: editableValues.leave,
        bonusAmount: editableValues.bonus,
        bonusRemarks: preview.bonus.description,
        gratuityAmount: editableValues.gratuity,
        noticePeriodAmount: editableValues.notice,
        noticePeriodRemarks: noticeRemarks,
        otherDeductions: otherDeductions,
        deductionRemarks: deductionRemarks,
        netPayableAmount: finalNetPay,
        status: "Approved"
      };

      await finalizeFnF(payload);
      toast.success("Full & Final Settlement Processed Successfully!");
      
      setPreview(null);
      setSelectedEmpId("");
      setLopDays(0);
      setUnpaidLeaveDays(0);
      setNoticeShortfall(0);
      setOtherDeductions(0);
      setIsConfirmModalOpen(false);
      loadEmployees();
    } catch (error: any) {
      const msg = error.response?.data?.title || error.response?.data?.message || "Finalization Success";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PDF GENERATION HANDLER ---
  const handleDownloadPDF = () => {
    if (!preview) return;
    setIsDownloadingPdf(true);
    try {
      // Calls the pure function defined above
      const doc = generateFnFPDF(
        preview, 
        editableValues, 
        otherDeductions, 
        deductionRemarks, 
        noticeRemarks, 
        finalNetPay
      );
      
      const fileName = `FnF_Statement_${preview.employeeName.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      toast.success("PDF Downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const EditableInput = ({ 
    value, 
    onChange 
  }: { value: number, onChange: (val: number) => void }) => (
    <div className="flex items-center justify-end">
      <input 
        type="number" 
        className="w-32 p-1.5 text-right font-bold text-gray-800 border border-gray-300 rounded focus:border-[#2eacb3] focus:ring-1 focus:ring-[#2eacb3] outline-none bg-white transition-all hover:border-gray-400"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <Edit3 size={14} className="ml-2 text-gray-400" />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserX className="text-red-500" /> Exit Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Process Full and Final (FnF) Settlements</p>
        </div>
      </div>

      {/* --- CONTROL PANEL --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4 border-b pb-2">
          1. Selection & Inputs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="col-span-1 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
            <div className="relative">
              <select 
                className="w-full p-2.5 pl-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eacb3] focus:border-transparent outline-none transition-all bg-white"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                disabled={isCalculating}
              >
                <option value="">
                  {isLoadingEmployees ? "Loading..." : "-- Choose Employee --"}
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeCode})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Working Day</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
              <input 
                type="date" 
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2eacb3] outline-none"
                value={lastWorkingDay}
                onChange={(e) => setLastWorkingDay(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 grid grid-cols-3 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">LOP Days</label>
                <input 
                  type="number" min="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#2eacb3] outline-none"
                  value={lopDays}
                  onChange={(e) => setLopDays(Number(e.target.value))}
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prev. Unpaid Leave</label>
                <input 
                  type="number" min="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#2eacb3] outline-none"
                  value={unpaidLeaveDays}
                  onChange={(e) => setUnpaidLeaveDays(Number(e.target.value))}
                />
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Notice Shortfall</label>
                <input 
                  type="number" min="0"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-[#2eacb3] outline-none"
                  value={noticeShortfall}
                  onChange={(e) => setNoticeShortfall(Number(e.target.value))}
                />
             </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleCalculate}
            disabled={isCalculating || !selectedEmpId}
            className="px-6 py-2.5 bg-green-700 text-white font-medium rounded-lg  disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isCalculating ? <Loader2 className="animate-spin" size={18} /> : <Calculator size={18} />}
            Calculate Settlement
          </button>
        </div>
      </div>

      {/* --- PREVIEW SHEET --- */}
      {preview && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
          
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b flex flex-wrap justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{preview.employeeName}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                   <Briefcase size={14}/> {preview.designation}
                </span>
                <span className="flex items-center gap-1">
                   <Calendar size={14}/> DOJ: {new Date(preview.dateOfJoining).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 font-medium text-red-600">
                   <UserX size={14}/> LWD: {new Date(preview.lastWorkingDay).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right mt-4 md:mt-0 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
              <p className="text-xs text-green-600 uppercase tracking-wide font-bold">Net Payable Amount</p>
              <p className="text-3xl font-bold text-green-700 mt-1 flex items-center justify-end gap-1">
                 <IndianRupee size={24}/>{finalNetPay.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-1/4">Component</th>
                  <th className="px-6 py-4 w-1/2">Calculation Basis / Details</th>
                  <th className="px-6 py-4 w-1/4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {/* A. SALARY - EXPANDED VIEW WITH 3-COLUMN BREAKDOWN */}
                <tr className="hover:bg-gray-50 transition-colors align-top">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                        <FileText size={16} />
                      </div>
                      Unpaid Salary
                    </div>
                    <div className="text-xs text-gray-500 ml-8">
                       Month: {preview.salary.exitMonth} <br/>
                       Paid Days: <b>{preview.salary.paidDays}</b> / {preview.salary.totalDays}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-gray-600">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs border p-3 rounded-lg bg-gray-50/50">
                        <div className="border-r border-gray-200 pr-3">
                            <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1 mb-1">
                                <div className="col-span-6 font-bold">Component</div>
                                <div className="col-span-3 text-right">Monthly</div>
                                <div className="col-span-3 text-right">Earned</div>
                            </div>
                            {preview.salary.earningBreakdown?.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 py-0.5">
                                    <div className="col-span-6 truncate" title={item.name}>{item.name}</div>
                                    <div className="col-span-3 text-right text-gray-400">{item.originalAmount?.toLocaleString()}</div>
                                    <div className="col-span-3 text-right font-medium text-gray-900">{item.amount.toLocaleString()}</div>
                                </div>
                            ))}
                            <div className="grid grid-cols-12 gap-2 border-t border-gray-200 pt-1 mt-1 font-semibold text-gray-900">
                                <span className="col-span-6">Total Earned</span>
                                <span className="col-span-3 text-right text-gray-500">{totalMonthlyStructure.toLocaleString()}</span>
                                <span className="col-span-3 text-right">{preview.salary.earnedGross?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="pl-1">
                            <p className="font-bold text-gray-700 border-b border-gray-200 pb-1 mb-2 uppercase tracking-wide text-[10px]">Deductions</p>
                            {preview.salary.deductionBreakdown?.length > 0 ? (
                                preview.salary.deductionBreakdown.map((item, i) => (
                                    <div key={i} className="flex justify-between py-0.5 text-red-600">
                                        <span>{item.name}</span>
                                        <span>-{item.amount.toLocaleString()}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-400 italic py-1">None</div>
                            )}
                            <div className="flex justify-between border-t border-gray-200 pt-1 mt-1 font-semibold text-red-700">
                                <span>Total Ded.</span>
                                <span>-{preview.salary.totalDeductions?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <EditableInput 
                      value={editableValues.salary} 
                      onChange={(val) => setEditableValues({...editableValues, salary: val})} 
                    />
                  </td>
                </tr>

                {/* B. LEAVE - EDITABLE */}
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                     <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
                        <CheckCircle size={16} />
                      </div>
                      Leave Encashment
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-col">
                       <span>Leave Balance: <b>{preview.leave.balanceDays} Days</b></span>
                       <span className="text-xs text-gray-400 mt-1">Rate: ₹{preview.leave.ratePerDay.toLocaleString()}/day</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditableInput 
                      value={editableValues.leave} 
                      onChange={(val) => setEditableValues({...editableValues, leave: val})} 
                    />
                  </td>
                </tr>

                {/* C. BONUS - EDITABLE */}
                <tr className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 font-medium text-gray-900">
                     <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-100 text-yellow-600 rounded">
                        <IndianRupee size={16} />
                      </div>
                      Annual Bonus
                    </div>
                   </td>
                  <td className="px-6 py-4 text-gray-600">Annual Bonus</td>
                  <td className="px-6 py-4 text-right">
                    <EditableInput 
                      value={editableValues.bonus} 
                      onChange={(val) => setEditableValues({...editableValues, bonus: val})} 
                    />
                  </td>
                </tr>

                {/* D. GRATUITY - EDITABLE */}
                <tr className={`hover:bg-gray-50 transition-colors ${preview.gratuityAmount > 0 ? "bg-green-50/50" : ""}`}>
                   <td className="px-6 py-4 font-medium text-gray-900">
                     <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${preview.gratuityAmount > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        <Briefcase size={16} />
                      </div>
                      Gratuity
                    </div>
                   </td>
                  <td className="px-6 py-4 text-gray-600">
                     {preview.gratuityAmount > 0 ? (
                        <span className="text-green-700 text-xs font-semibold px-2 py-1 bg-green-100 rounded-full border border-green-200">
                           Eligible 
                        </span>
                     ) : (
                        <span className="text-gray-400 italic text-xs">Not Eligible</span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditableInput 
                      value={editableValues.gratuity} 
                      onChange={(val) => setEditableValues({...editableValues, gratuity: val})} 
                    />
                  </td>
                </tr>

                {/* E. NOTICE PERIOD - EDITABLE */}
                <tr className={`hover:bg-gray-50 transition-colors ${preview.noticePeriodAmount !== 0 ? "bg-orange-50/50" : ""}`}>
                   <td className="px-6 py-4 font-medium text-gray-900">
                     <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded">
                        <AlertTriangle size={16} />
                      </div>
                      Notice Adjustment
                    </div>
                   </td>
                  <td className="px-6 py-4">
                     <div className="text-xs text-gray-500 mb-1">
                        {preview.noticePeriodAmount < 0 ? "Shortfall Recovery" : "Notice Pay"} (Auto-calculated)
                     </div>
                     <input 
                        type="text"
                        placeholder="Remarks (Optional)"
                        className="block w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-orange-300 outline-none bg-white"
                        value={noticeRemarks}
                        onChange={(e) => setNoticeRemarks(e.target.value)}
                     />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditableInput 
                      value={editableValues.notice} 
                      onChange={(val) => setEditableValues({...editableValues, notice: val})} 
                    />
                  </td>
                </tr>

                {/* F. MANUAL DEDUCTIONS */}
                <tr className="bg-red-50/40 hover:bg-red-50/60 transition-colors border-t border-red-100">
                   <td className="px-6 py-4 font-medium text-red-800">
                     <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-100 text-red-600 rounded">
                        <AlertTriangle size={16} />
                      </div>
                      Other Deductions
                    </div>
                   </td>
                  <td className="px-6 py-4">
                     <input 
                        type="text"
                        placeholder="Reason (e.g. Asset Damage, Tax Adjustment)"
                        className="w-full p-2 text-sm border border-red-200 rounded focus:border-red-400 outline-none placeholder:text-red-300 bg-white"
                        value={deductionRemarks}
                        onChange={(e) => setDeductionRemarks(e.target.value)}
                     />
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end">
                       <span className="text-red-600 font-bold mr-1">-</span>
                       <EditableInput 
                          value={otherDeductions} 
                          onChange={(val) => setOtherDeductions(val)} 
                       />
                     </div>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-gray-50 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle size={14} className="text-green-500"/>
              <span>Approving this will permanently lock financial records.</span>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="px-6 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                {isDownloadingPdf ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                Download PDF
              </button>

              <button 
                onClick={() => setPreview(null)}
                className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalizeClick}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-green-700 text-white rounded-lg font-medium  transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Finalize & Approve
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Settlement">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
          <p className="text-sm text-gray-500 mt-2">
            This will process the settlement for <span className="font-bold text-gray-800">{preview?.employeeName}</span>.
          </p>
          <div className="mt-4 bg-gray-50 p-3 rounded text-sm text-left border">
             <div className="flex justify-between mb-1">
               <span>Net Payable:</span>
               <span className="font-bold text-green-600">₹{finalNetPay.toLocaleString()}</span>
             </div>
             <p className="text-xs text-red-500 mt-2">
               ⚠️ Warning: This action will DEACTIVATE the employee and FREEZE gratuity records permanently.
             </p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={processSubmission}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              {isSubmitting ? "Processing..." : "Yes, Finalize"}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default FnFManager;