import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Calendar,
  Send,
  Download,
  Search,
  Eye,
  AlertCircle,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import { useAuth } from "../../../../hooks/useAuth";
import fulllogo from "../../../../assets/GaxceFullLogo.png";
import LogoLoader from "../../../../Components/Common/LogoLoader";

// --- INTERFACES to match your DTOs ---

interface MonthlyWorkdaysDto {
  standardWorkingDays: number;
  weeklyOffs: number;
  paidHolidays: number;
  totalDays: number;
}

interface AttendanceReportDto {
  presentDays: number;
  // outdoorDutyDays: number;
  weeklyOffs: number;
  paidHolidays: number;
  //earnedLeave: number;
  casualLeave: number;
  paidDays: number;
  weeklyOffAndHolidays: number;
  compensatoryOff: number;
}

interface AdvanceBalanceDto {
  openingBalance: number;
  newAdvanceTakenThisMonth: number;
  closingBalance: number;
}

interface LeaveBalanceDto {
  leaveTypeName: string;
  openingBalance: number;
  leavesTakenThisMonth: number;
  closingBalance: number;
}

interface PayslipDto {
  companyName: string;
  companyAddress: string;
  place: string;
  payslipMonthYear: string;
  dateOfIssue: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  dateOfJoining: string;
  dateOfBirth: string;
  emailId: string;
  department: string;
  pfNumber: string;
  uanNumber: string;
  esicNumber: string;
  totalDaysInMonth: number;
  payableDays: number;
  lopDays: number;
  earnings: PayslipEarningComponent[];
  deductions: PayslipComponent[];
  employerContributions: PayslipComponent[];
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  netSalaryInWords: string;
}

interface PayslipEarningComponent {
  name: string;
  actualAmount: number;
  earnedAmount: number;
}

interface PayslipComponent {
  name: string;
  amount: number;
}

interface PayslipDetail {
  payslipId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  grossSalary: number;
  netSalary: number;
  emailSent: boolean;
  downloaded: boolean;
  pdfFilePath: string;
}

interface PayslipSummary {
  totalGenerated: number;
  emailSent: number;
  totalDownloads: number;
}

interface EmployeePayslipHistory {
  payslipId: number;
  monthYear: string;
  netSalary: number;
  downloaded: boolean;
}

// NEW: Interface for the current payroll run period
interface PayrollRun {
  id: number;
  month: number;
  year: number;
  monthName: string;
}

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  showCancel?: boolean;
  type?: "confirmation" | "success";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  showCancel = true,
  type = "confirmation",
}) => {
  if (!isOpen) return null;

  const icon =
    type === "success" ? (
      <CheckCircle size={32} className="text-green-500" />
    ) : (
      <AlertTriangle size={32} className="text-blue-500" />
    );

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">{icon}</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
          <div className="text-gray-600 mb-6">{children}</div>
        </div>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="bg-green-700 text-white px-8 py-2 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const generatePayslipPDF = (
  payslipData: PayslipDto,
  attendanceData: AttendanceReportDto,
  workdaysData: MonthlyWorkdaysDto,
  leaveBalanceData: LeaveBalanceDto[],
  advanceBalanceData: AdvanceBalanceDto,
): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 40;

  // --- Header and Company Details ---
  const logoWidth = 80;
  const logoHeight = 50;

  // Draw Logo
  doc.addImage(fulllogo, "PNG", margin, margin, logoWidth, logoHeight);

  // --- Company Name (RIGHT of logo) ---
  const textStartX = margin + logoWidth + 10;
  let currentHeaderY = margin + 15;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(payslipData.companyName, textStartX, currentHeaderY);

  // --- Address (below company name) ---
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const addressLines = doc.splitTextToSize(
    payslipData.companyAddress.replace(/\\n/g, "\n"),
    220, // width control
  );

  currentHeaderY += 15;
  doc.text(addressLines, textStartX, currentHeaderY);

  // --- Calculate bottom Y of header block ---
  const addressHeight = addressLines.length * 10;
  const headerBottomY = Math.max(
    margin + logoHeight,
    currentHeaderY + addressHeight,
  );

  const leftStartY = headerBottomY + 60;

  // --- Payslip Title and Month Block ---
  const fullTitleText = `Salary Slip For The Month of ${new Date(
    payslipData.payslipMonthYear,
  ).toLocaleString("default", { month: "long" })} - ${new Date(
    payslipData.payslipMonthYear,
  ).getFullYear()}`;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  // Calculate dimensions for the strip
  const workdaysTableWidth = 220;
  const rectHeight = 22;

  const rectWidth = workdaysTableWidth;

  const rectX = pageWidth - margin - workdaysTableWidth;
  const rectY = margin;

  // Draw the yellow strip
  doc.setFillColor("#FFC000");
  doc.rect(rectX, rectY, rectWidth, rectHeight, "F");

  // Draw the text centered inside the strip
  doc.setTextColor(0, 0, 0);
  const textY = rectY + rectHeight / 2 + 4;
  doc.text(fullTitleText, rectX + rectWidth / 2, textY, { align: "center" });

  // --- SWD / W.Off / P.H. Table ---
  autoTable(doc, {
    startY: rectY + rectHeight + 5,
    theme: "grid",
    head: [["SWD", "W. Off", "P. H.", "Total"]],
    body: [
      [
        workdaysData.standardWorkingDays.toFixed(2),
        workdaysData.weeklyOffs.toFixed(2),
        workdaysData.paidHolidays.toFixed(2),
        workdaysData.totalDays.toFixed(2),
      ],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: "#FFFFFF",
      textColor: "#000000",
      fontStyle: "bold",
    },
    margin: { left: pageWidth - margin - workdaysTableWidth },
  });

  // --- Employee Details ---
  let currentY = leftStartY;
  const rightColX = pageWidth / 2 + 30;
  doc.setFontSize(9);

  const drawDetail = (label: string, value: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, x + doc.getTextWidth(label) + 5, y);
  };

  drawDetail("Name of Employee:", payslipData.fullName, margin, currentY);
  drawDetail(
    "Date of Birth:",
    new Date(payslipData.dateOfBirth).toLocaleDateString("en-GB"),
    rightColX,
    currentY,
  );
  currentY += 15;
  drawDetail("Designation:", payslipData.designation, margin, currentY);
  drawDetail(
    "Date of Joining:",
    new Date(payslipData.dateOfJoining).toLocaleDateString("en-GB"),
    rightColX,
    currentY,
  );
  currentY += 15;
  drawDetail("E.S.I.C. No. :", payslipData.esicNumber, rightColX, currentY);
  currentY += 15;
  drawDetail("P. F. No. :", payslipData.pfNumber, rightColX, currentY);
  currentY += 15;
  drawDetail("UAN NO. :", payslipData.uanNumber, rightColX, currentY);
  currentY += 15;
  drawDetail("E-mail ID:", payslipData.emailId, rightColX, currentY);

  // --- Attendance Summary Table ---
  autoTable(doc, {
    startY: currentY + 20,
    theme: "grid",
    head: [["Pres.Days", "W.Off + PH", "Casual Leave", "Paid Days"]],
    body: [
      [
        attendanceData.presentDays.toFixed(2),
        attendanceData.weeklyOffAndHolidays.toFixed(2),
        attendanceData.casualLeave > 0
          ? attendanceData.casualLeave.toFixed(2)
          : "-",
        attendanceData.paidDays.toFixed(2),
      ],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 4,
      halign: "center",
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: "#FFFFFF",
      textColor: "#000000",
      fontStyle: "bold",
    },
  });

  let finalY = (doc as any).lastAutoTable.finalY;

  // --- Main Salary & Deductions Table ---
  const earnings = payslipData.earnings || [];
  const deductions = payslipData.deductions || [];
  const tableBody: any[] = [];
  const numRows = Math.max(earnings.length, deductions.length);
  const actualGrossTotal = earnings.reduce(
    (sum, item) => sum + (item.actualAmount || 0),
    0,
  );

  for (let i = 0; i < numRows; i++) {
    const earning = earnings[i];
    const deduction = deductions[i];
    tableBody.push([
      earning ? earning.name : "",
      earning
        ? {
            content: (earning.actualAmount || 0).toLocaleString("en-IN"),
            styles: { halign: "right" },
          }
        : "",
      earning
        ? {
            content: (earning.earnedAmount || 0).toLocaleString("en-IN"),
            styles: { halign: "right" },
          }
        : "",
      deduction ? deduction.name : "",
      deduction
        ? {
            content: (deduction.amount || 0).toLocaleString("en-IN"),
            styles: { halign: "right" },
          }
        : "",
    ]);
  }

  const tableWidth = pageWidth - margin * 2;

  autoTable(doc, {
    startY: finalY + 15,
    theme: "grid",
    head: [
      [
        {
          content: "Actual Rate of Salary",
          colSpan: 2,
          styles: { halign: "center" },
        },
        { content: "Normal Earning", styles: { halign: "center" } },
        { content: "DEDUCTIONS", colSpan: 2, styles: { halign: "center" } },
      ],
    ],
    body: tableBody,
    foot: [
      // Gross Total Row
      [
        { content: "Gross Total", styles: { fontStyle: "bold" } },
        {
          content: actualGrossTotal.toLocaleString("en-IN"),
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: payslipData.grossEarnings.toLocaleString("en-IN"),
          styles: { halign: "right", fontStyle: "bold" },
        },
        { content: "Total", styles: { fontStyle: "bold" } },
        {
          content: payslipData.totalDeductions.toLocaleString("en-IN"),
          styles: { halign: "right", fontStyle: "bold" },
        },
      ],
      // Net Salary Payable Row - THIS IS THE FIX
      [
        {
          content: "Net Salary Payable",
          colSpan: 4, // Spans the first 4 columns
          styles: {
            fontStyle: "bold",
            valign: "middle",
            halign: "left", // Aligned to the left like the image
            fillColor: "#FFFFFF", // White background
            textColor: "#333333", // Dark grey text
            fontSize: 10,
            cellPadding: { left: 4, top: 6, bottom: 6 }, // Added padding for better look
          },
        },
        {
          content: `${payslipData.netSalary.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          styles: {
            halign: "right", // Right-aligned value
            fontStyle: "bold",
            valign: "middle",
            fillColor: "#FFFF00", // Yellow background
            textColor: "#000000", // Black text
            fontSize: 10,
            cellPadding: { right: 4, top: 6, bottom: 6 },
          },
        },
      ],
    ],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      valign: "middle",
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: "#00A99D",
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "center",
    },
    footStyles: {
      fillColor: "#FFFFFF",
      textColor: "#000000",
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: tableWidth * 0.25 }, // Earning Name
      1: { cellWidth: tableWidth * 0.15, halign: "right" }, // Actual Amount
      2: { cellWidth: tableWidth * 0.15, halign: "right" }, // Earned Amount
      3: { cellWidth: tableWidth * 0.25 }, // Deduction Name
      4: { cellWidth: tableWidth * 0.2, halign: "right" }, // Deduction Amount
    },
  });

  finalY = (doc as any).lastAutoTable.finalY;

  const casualLeaveData = leaveBalanceData.find((l) =>
    l.leaveTypeName.toLowerCase().includes("casual"),
  );

  const leaveTableBody = [
    [
      "Opening Balance",
      advanceBalanceData
        ? advanceBalanceData.openingBalance.toFixed(2)
        : "0.00",
      //earnLeaveData ? earnLeaveData.openingBalance.toFixed(2) : "0.00",
      casualLeaveData ? casualLeaveData.openingBalance.toFixed(2) : "0.00",
    ],
    [
      "Current Month",
      advanceBalanceData
        ? advanceBalanceData.newAdvanceTakenThisMonth.toFixed(2)
        : "0.00",
      //earnLeaveData ? earnLeaveData.leavesTakenThisMonth.toFixed(2) : "0.00",
      casualLeaveData
        ? casualLeaveData.leavesTakenThisMonth.toFixed(2)
        : "0.00",
    ],
    [
      "Closing Balance",
      advanceBalanceData
        ? advanceBalanceData.closingBalance.toFixed(2)
        : "0.00",
      //earnLeaveData ? earnLeaveData.closingBalance.toFixed(2) : "0.00",
      casualLeaveData ? casualLeaveData.closingBalance.toFixed(2) : "0.00",
    ],
  ];

  autoTable(doc, {
    startY: finalY + 15,
    theme: "grid",
    head: [
      [
        { content: "", styles: { halign: "left" } },
        { content: "Advance", styles: { halign: "center" } },
        //{ content: "Earn Leave", styles: { halign: 'center' } },
        { content: "Casual Leave", styles: { halign: "center" } },
      ],
    ],
    body: leaveTableBody, // Use the dynamically generated body
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: "#00A99D",
      textColor: "#FFFFFF",
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: { 0: { halign: "left", cellWidth: 100 } },
  });
  finalY = (doc as any).lastAutoTable.finalY;
  const footerY = Math.max(finalY + 40, pageHeight - 80);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Left side text
  doc.text(`Place: ${payslipData.place}`, margin, footerY);

  // Right side text
  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.text(
    `FOR ${payslipData.companyName.toUpperCase()},`,
    rightX,
    footerY - 20,
    { align: "right" },
  );

  doc.setFont("helvetica", "normal");
  doc.text(
    `(THIS IS COMPUTER GENERATED COPY SIGNATURE NOT REQUIRED)`,
    rightX,
    footerY - 8,
    { align: "right" },
  );

  const dateOfIssueFormatted = new Date(
    payslipData.dateOfIssue,
  ).toLocaleDateString("en-GB");
  doc.text(`Date of Issue: ${dateOfIssueFormatted}`, rightX, footerY, {
    align: "right",
  });

  doc.setFont("helvetica", "bold");
  doc.text(`Authorized Signatory`, rightX, footerY + 15, { align: "right" });

  return doc;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  bgColor,
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{description}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const Payslips: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PayslipSummary | null>(null);
  const [payslipList, setPayslipList] = useState<PayslipDetail[]>([]);
  const [employeeHistory, setEmployeeHistory] = useState<
    EmployeePayslipHistory[]
  >([]);
  const [availableRuns, setAvailableRuns] = useState<PayrollRun[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    showCancel: true,
    type: "confirmation" as "confirmation" | "success",
  });

  const fetchAdminData = useCallback(async (runId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, listRes] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.PayslipSummary}/${runId}`),
        apiClient.get(`${API_ENDPOINTS.AllPayslipsForRun}/${runId}`),
      ]);
      setSummary(summaryRes.data);
      setPayslipList(listRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError("Could not load payslip data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEmployeeData = useCallback(async () => {
    if (!user?.employeeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const historyRes = await apiClient.get(
        `${API_ENDPOINTS.EmployeePayslipHistory}/${user.employeeId}`,
      );
      setEmployeeHistory(historyRes.data);
    } catch (err) {
      console.error("Failed to fetch employee data:", err);
      setError("Could not load your payslip history.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    const handleRefresh = async () => {
      console.log("Payslips refresh received");

      if (user?.role === "Admin" || user?.role === "HR") {
        if (selectedRunId) {
          await fetchAdminData(selectedRunId);
        }
      } else if (user?.role === "Employee") {
        await fetchEmployeeData();
      }
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [user?.role, selectedRunId, fetchAdminData, fetchEmployeeData]);

  useEffect(() => {
    const initializeAdminView = async () => {
      setIsLoading(true);
      try {
        const runsResponse = await apiClient.get<PayrollRun[]>(
          API_ENDPOINTS.AllPayrollRuns,
        );
        const allRuns = runsResponse.data;

        if (allRuns && allRuns.length > 0) {
          setAvailableRuns(allRuns);
          const latestRun = allRuns[0];
          setSelectedRunId(latestRun.id);
          const initialDate = `${latestRun.year}-${String(
            latestRun.month,
          ).padStart(2, "0")}`;
          setSelectedDate(initialDate);
          await fetchAdminData(latestRun.id);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch available payroll runs:", err);
        setError("Could not load payroll history.");
        setIsLoading(false);
      }
    };

    if (user?.role === "Admin" || user?.role === "HR") {
      initializeAdminView();
    } else if (user?.role === "Employee") {
      fetchEmployeeData();
    }
  }, [user, fetchAdminData, fetchEmployeeData]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    if (newDate) {
      const [year, month] = newDate.split("-").map(Number);
      const foundRun = availableRuns.find(
        (run) => run.year === year && run.month === month,
      );

      if (foundRun) {
        setSelectedRunId(foundRun.id);
        fetchAdminData(foundRun.id);
      } else {
        setSelectedRunId(null);
        setPayslipList([]);
        setSummary({ totalGenerated: 0, emailSent: 0, totalDownloads: 0 });
      }
    }
  };

  const handleGenerateAllPayslips = () => {
    if (!selectedRunId) return;

    // This opens the confirmation modal
    setModalState({
      isOpen: true,
      title: "Generate All Payslips",
      message:
        "Are you sure? This will generate payslips for all employees for the selected period.",
      onConfirm: () => proceedWithGeneration(),
      confirmText: "Generate",
      showCancel: true,
      type: "confirmation",
    });
  };

  const proceedWithGeneration = async () => {
    // This function runs after the user clicks "Generate" in the modal
    setModalState((prev) => ({ ...prev, isOpen: false })); // Close the modal first
    if (!selectedRunId) return;

    setIsGenerating(true);
    try {
      await apiClient.post(
        `${API_ENDPOINTS.GenerateAllPayslips}/${selectedRunId}`,
      );

      // On success, open the success modal instead of using alert()
      setModalState({
        isOpen: true,
        title: "Success",
        message:
          "Successfully started generating all payslips! The data will refresh shortly.",
        onConfirm: () => {
          setModalState((prev) => ({ ...prev, isOpen: false })); // Close success modal
          fetchAdminData(selectedRunId); // Refresh data
        },
        confirmText: "OK",
        showCancel: false,
        type: "success",
      });
    } catch (error) {
      console.error("Failed to generate all payslips:", error);
      alert("An error occurred while generating payslips."); // You can create an error modal later
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Find and REPLACE the handleDownloadPayslip function ---
  const handleDownloadPayslip = async (
    payslipId: number,
    employeeId: number,
    employeeName: string,
  ) => {
    setIsFetchingDetails(payslipId);
    try {
      // Get year and month from the payslip details first
      const payslipResponse = await apiClient.get<PayslipDto>(
        `${API_ENDPOINTS.GetPayslipDetails}/${payslipId}`,
      );
      const payslipData = payslipResponse.data;
      const payslipDate = new Date(payslipData.payslipMonthYear);
      const year = payslipDate.getFullYear();
      const month = payslipDate.getMonth() + 1;

      // Fetch all required data in parallel
      const [
        attendanceResponse,
        workdaysResponse,
        leaveBalanceResponse,
        advanceBalanceResponse,
      ] = await Promise.all([
        apiClient.get<AttendanceReportDto>(
          `${API_ENDPOINTS.GetAttendancemonthly}?employeeId=${employeeId}&year=${year}&month=${month}`,
        ),
        apiClient.get<MonthlyWorkdaysDto>(
          `${API_ENDPOINTS.GetMonthlyWorkdays}?year=${year}&month=${month}`,
        ),
        apiClient.get<LeaveBalanceDto[]>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/leave-balance?year=${year}&month=${month}`,
        ),
        apiClient.get<AdvanceBalanceDto>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/advance-balance?year=${year}&month=${month}`,
        ),
      ]);

      const attendanceData = attendanceResponse.data;
      const workdaysData = workdaysResponse.data;
      const leaveBalanceData = leaveBalanceResponse.data;
      const advanceBalanceData = advanceBalanceResponse.data;

      const doc = generatePayslipPDF(
        payslipData,
        attendanceData,
        workdaysData,
        leaveBalanceData,
        advanceBalanceData,
      );
      const fileName = `Payslip_${employeeName.replace(/ /g, "_")}_${new Date(
        payslipData.payslipMonthYear,
      ).toLocaleString("default", { month: "long" })}.pdf`;
      doc.save(fileName);

      // Mark as downloaded
      await apiClient.post(`${API_ENDPOINTS.MarkAsDownloaded}/${payslipId}`);
      if (selectedRunId) {
        await fetchAdminData(selectedRunId);
      }
    } catch (error) {
      console.error(`Failed to download payslip ${payslipId}:`, error);
      alert("Could not complete the download process. Please try again.");
    } finally {
      setIsFetchingDetails(null);
    }
  };

  // --- Find and REPLACE the handleViewPayslip function ---
  const handleViewPayslip = async (payslipId: number, employeeId: number) => {
    setIsFetchingDetails(payslipId);
    try {
      // Get year and month from the payslip details first
      const payslipResponse = await apiClient.get<PayslipDto>(
        `${API_ENDPOINTS.GetPayslipDetails}/${payslipId}`,
      );
      const payslipData = payslipResponse.data;
      const payslipDate = new Date(payslipData.payslipMonthYear);
      const year = payslipDate.getFullYear();
      const month = payslipDate.getMonth() + 1;

      // Fetch all required data in parallel
      const [
        attendanceResponse,
        workdaysResponse,
        leaveBalanceResponse,
        advanceBalanceResponse,
      ] = await Promise.all([
        apiClient.get<AttendanceReportDto>(
          `${API_ENDPOINTS.GetAttendancemonthly}?employeeId=${employeeId}&year=${year}&month=${month}`,
        ),
        apiClient.get<MonthlyWorkdaysDto>(
          `${API_ENDPOINTS.GetMonthlyWorkdays}?year=${year}&month=${month}`,
        ),
        apiClient.get<LeaveBalanceDto[]>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/leave-balance?year=${year}&month=${month}`,
        ),
        apiClient.get<AdvanceBalanceDto>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/advance-balance?year=${year}&month=${month}`,
        ),
      ]);

      const attendanceData = attendanceResponse.data;
      const workdaysData = workdaysResponse.data;
      const leaveBalanceData = leaveBalanceResponse.data;
      const advanceBalanceData = advanceBalanceResponse.data;

      // Generate PDF with all data and open in a new tab
      const doc = generatePayslipPDF(
        payslipData,
        attendanceData,
        workdaysData,
        leaveBalanceData,
        advanceBalanceData,
      );
      window.open(doc.output("bloburl"), "_blank");
    } catch (error) {
      console.error(`Failed to view payslip ${payslipId}:`, error);
      alert("Could not open the payslip for viewing.");
    } finally {
      setIsFetchingDetails(null);
    }
  };

  const handleSendSingleEmail = async (
    payslipId: number,
    employeeId: number,
    payrollRunId: number | null,
  ) => {
    if (!payrollRunId) {
      alert("Cannot send email: A payroll period must be selected.");
      return;
    }

    setSendingEmailId(payslipId);

    try {
      const payslipResponse = await apiClient.get<PayslipDto>(
        `${API_ENDPOINTS.GetPayslipDetails}/${payslipId}`,
      );
      const payslipData = payslipResponse.data;
      const payslipDate = new Date(payslipData.payslipMonthYear);
      const year = payslipDate.getFullYear();
      const month = payslipDate.getMonth() + 1;

      const [
        attendanceResponse,
        workdaysResponse,
        leaveBalanceResponse,
        advanceBalanceResponse,
      ] = await Promise.all([
        apiClient.get<AttendanceReportDto>(
          `${API_ENDPOINTS.GetAttendancemonthly}?employeeId=${employeeId}&year=${year}&month=${month}`,
        ),
        apiClient.get<MonthlyWorkdaysDto>(
          `${API_ENDPOINTS.GetMonthlyWorkdays}?year=${year}&month=${month}`,
        ),
        apiClient.get<LeaveBalanceDto[]>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/leave-balance?year=${year}&month=${month}`,
        ),
        apiClient.get<AdvanceBalanceDto>(
          `${API_ENDPOINTS.GetEmployeeLeavebalance}/${employeeId}/advance-balance?year=${year}&month=${month}`,
        ),
      ]);

      const doc = generatePayslipPDF(
        payslipData,
        attendanceResponse.data,
        workdaysResponse.data,
        leaveBalanceResponse.data,
        advanceBalanceResponse.data,
      );
      const pdfBlob = doc.output("blob");

      const formData = new FormData();
      formData.append(
        "file",
        pdfBlob,
        `Payslip_${employeeId}_${payrollRunId}.pdf`,
      );
      formData.append("payslipId", payslipId.toString());
      formData.append("employeeId", employeeId.toString());
      formData.append("payrollRunId", payrollRunId.toString());

      await apiClient.post(API_ENDPOINTS.SendPayslipEmail, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Email has been sent successfully!");

      if (selectedRunId) {
        fetchAdminData(selectedRunId);
      }
    } catch (error) {
      console.error(`Failed to send email for payslip ${payslipId}:`, error);
      alert("An error occurred while sending the email. Please try again.");
    } finally {
      setSendingEmailId(null); // This will hide the loading spinner
    }
  };

  const getBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "generated":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-green-100 text-green-800"; // Changed to green for better visual cue
      case "pending":
        return "bg-yellow-100 text-yellow-800 border"; // Changed for better visibility
      case "yes":
        return "bg-green-100 text-green-800";
      case "no":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const formatCurrency = (amount: number) =>
    `₹${amount.toLocaleString("en-IN")}`;

  const filteredPayslips = payslipList.filter(
    (p) =>
      p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="p-2 flex justify-center items-center">
        {<LogoLoader />}
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded-lg flex items-center gap-4">
        <AlertCircle /> {error}
      </div>
    );

  if (user?.role === "Admin" || user?.role === "HR") {
    const selectedRunDetails = availableRuns.find(
      (r) => r.id === selectedRunId,
    );

    return (
      <div className="p-4 md:p-4 bg-gray-50 min-h-full space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
            <p className="text-gray-600 mt-1">
              Generate and manage employee payslips
            </p>
          </div>
          <div className="flex items-center gap-4">
            {availableRuns.length > 0 && (
              <input
                type="month"
                value={selectedDate}
                onChange={handleDateChange}
                className="border border-gray-300 rounded-lg p-2 text-sm font-semibold"
              />
            )}
            <button
              onClick={handleGenerateAllPayslips}
              disabled={isGenerating}
              className={
                "flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#0d3357] disabled:bg-[#2c6eab]"
              }
            >
              {isGenerating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <FileText size={18} />
              )}
              {isGenerating ? "Generating..." : "Generate All Payslips"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Selected Period"
            value={
              selectedRunDetails
                ? `${selectedRunDetails.monthName} ${selectedRunDetails.year}`
                : "N/A"
            }
            description="Payslip period"
            bgColor="bg-[#2eacb3]"
            icon={<Calendar size={20} className="text-blue-600" />}
          />
          <StatCard
            title="Generated"
            value={summary?.totalGenerated.toString() ?? "0"}
            description="Payslips ready"
            bgColor="bg-[#f7c343]"
            icon={<FileText size={20} className="text-green-600" />}
          />
          <StatCard
            title="Sent via Email"
            value={summary?.emailSent.toString() ?? "0"}
            description="Successfully delivered"
            bgColor="bg-[#386487]"
            icon={<Send size={20} className="text-red-600" />}
          />
          <StatCard
            title="Downloads"
            value={summary?.totalDownloads.toString() ?? "0"}
            description="By employees"
            bgColor="bg-[#87b6a7]"
            icon={<Download size={20} className="text-purple-600" />}
          />
        </div>

        {/* Generation Status (now takes the full width)
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Generation Status
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Current payslip generation progress
          </p>
          <div className="space-y-4 pt-4">
            <ProgressItem
              label="Total"
              value={`${
                summary?.totalGenerated ?? 0
              }/${totalEmployees} Complete`}
              progress={generationProgress}
              isTotal
            />
          </div>
        </div> */}

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Employee Payslips
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Individual payslip management and download
          </p>
          <div className="relative w-full max-w-xs mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  {[
                    "Employee",
                    "Department",
                    "Gross Salary",
                    "Net Salary",
                    "Status",
                    "Email Sent",
                    "Downloaded",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      scope="col"
                      className="px-6 py-3 font-medium whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredPayslips.map((p) => (
                  <tr key={p.payslipId} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {p.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({p.employeeCode})
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.department}</td>
                    <td className="px-6 py-4">
                      {formatCurrency(p.grossSalary)}
                    </td>
                    <td className="px-6 py-4">{formatCurrency(p.netSalary)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                          "Generated",
                        )}`}
                      >
                        Generated
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                          p.emailSent ? "Sent" : "Pending",
                        )}`}
                      >
                        {p.emailSent ? "Sent" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                          p.downloaded ? "Yes" : "No",
                        )}`}
                      >
                        {p.downloaded ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() =>
                            handleViewPayslip(p.payslipId, p.employeeId)
                          }
                          disabled={isFetchingDetails === p.payslipId}
                          className="text-gray-500 hover:text-blue-600 disabled:text-gray-300"
                          title="View Payslip"
                        >
                          {isFetchingDetails === p.payslipId ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadPayslip(
                              p.payslipId,
                              p.employeeId,
                              p.employeeName,
                            )
                          }
                          disabled={isFetchingDetails === p.payslipId}
                          className="text-gray-500 hover:text-blue-600 disabled:text-gray-300"
                          title="Download Payslip"
                        >
                          <Download size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleSendSingleEmail(
                              p.payslipId,
                              p.employeeId,
                              selectedRunId,
                            )
                          }
                          // Disable the button if this email is being sent OR if it has already been sent
                          disabled={
                            sendingEmailId === p.payslipId || p.emailSent
                          }
                          className="text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
                          title={
                            p.emailSent
                              ? "Email has already been sent"
                              : "Send Email"
                          }
                        >
                          {/* Show a spinner if this specific email is the one being sent */}
                          {sendingEmailId === p.payslipId ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>
                        {/* <button onClick={() => handleSendSingleEmail(p.payslipId)} disabled={sendingEmailId === p.payslipId} className="text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-wait" title="Send Email">
                                                    {sendingEmailId === p.payslipId ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                                </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Modal
          isOpen={modalState.isOpen}
          onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={modalState.onConfirm}
          title={modalState.title}
          confirmText={modalState.confirmText}
          showCancel={modalState.showCancel}
          type={modalState.type}
        >
          <p>{modalState.message}</p>
        </Modal>
      </div>
    );
  }

  // --- RENDER FOR EMPLOYEE ---
  if (user?.role === "Employee") {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Payslips</h1>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold text-gray-800">
            Payslip History
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            View and download your past payslips.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Month & Year
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Net Salary
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {employeeHistory.length > 0 ? (
                  employeeHistory.map((p) => (
                    <tr key={p.payslipId} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{p.monthYear}</td>
                      <td className="px-6 py-4">
                        {formatCurrency(p.netSalary)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                            p.downloaded ? "Yes" : "No",
                          )}`}
                        >
                          {p.downloaded ? "Downloaded" : "Not Downloaded"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              handleViewPayslip(p.payslipId, user.employeeId)
                            }
                            disabled={isFetchingDetails === p.payslipId}
                            className="text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-wait"
                            title="View Payslip"
                          >
                            {isFetchingDetails === p.payslipId ? (
                              <Loader2 className="animate-spin" size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadPayslip(
                                p.payslipId,
                                user.employeeId,
                                user?.name || "payslip",
                              )
                            }
                            disabled={isFetchingDetails === p.payslipId}
                            className="text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-wait"
                            title="Download Payslip"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No payslips found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">You do not have permission to view this page.</div>
  );
};

export default Payslips;
