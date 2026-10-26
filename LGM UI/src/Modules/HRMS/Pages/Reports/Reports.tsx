import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  FileText,
  BarChart3,
  Users,
  IndianRupee,
  ArrowLeft,
  AlertCircle,
  Download,
} from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, getDaysInMonth,  startOfMonth, endOfMonth } from "date-fns";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import apiClient from "../../../../API/apiClient";
import { useAuth } from "../../../../hooks/useAuth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// --- 1. ALL TYPE DEFINITIONS ---
type EmployeeReportType =
  | "master"
  | "headcount"
  | "attendance"
  | "leave"
  | "department";
type PayrollReportType =
  | "monthlySalary"
  | "costCenter"
  | "employerPf"
  | "bonus"
  | "bankTransfer"
  | "expenseClaim";

type ReportType = EmployeeReportType | PayrollReportType;

type DailyAttendanceRecord = {
  dayOfMonth: number;
  status: string;
  inTime: string | null;
  outTime: string | null;
  totalHours: string | null;
};
type MonthlyAttendanceReportData = {
  employeeCode: string;
  employeeName: string;
  dailyRecords: DailyAttendanceRecord[];
};

type EmployeeMaster = {
  employeeCode: string;
  fullName: string;
  emailAddress: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  isActive: boolean;
};
type Headcount = { department: string; employeeCount: number };
// type AttendanceSummary = {
//   employeeCode: string;
//   fullName: string;
//   presentDays: number;
//   absentDays: number;
//   halfDays: number;
//   onLeaveDays: number;
// };
type LeaveBalance = {
  employeeCode: string;
  fullName: string;
  leaveType: string;
  allocatedDays: number;
  availedDays: number;
  balanceDays: number;
};
type DepartmentAnalysis = { department: string; totalEmployees: number };
type MonthlySalaryRegister = {
  employeeCode: string;
  fullName: string;
  department: string;
  payableDays: number;
  lopDays: number;
  grossEarnings: number;
  totalDeductions: number;
  netSalary: number;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
};
type CostCenterAnalysis = {
  department: string;
  totalCost: number;
  employeeCount: number;
};

type BonusIncentive = {
  employeeCode: string;
  fullName: string;
  financialYear: string;
  bonusAmount: number;
  status: string;
};
type BankTransfer = {
  employeeCode: string;
  fullName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  netSalary: number;
};
type EmployerPfReport = {
  employeeCode: string;
  fullName: string;
  department: string;
  grossEarnings: number;
  employerPF: number;
};

type ExpenseClaimReport = {
  employeeCode: string;
  employeeName: string;
  expenseType: string;
  claimDate: string; // ISO string from API
  amount: number;
  status: string;
  approvedAmount?: number;
  approverName?: string;
  approvalDate?: string; // ISO string from API
  description?: string;
};

// --- 2. REUSABLE & REPORT-SPECIFIC UI COMPONENTS ---
const Spinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-4 p-10 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-12 h-12 text-red-500" />
    <p className="text-red-700 font-semibold">Failed to load report</p>
    <p className="text-sm text-red-600">{message}</p>
  </div>
);

const generateAttendancePDF = (data: MonthlyAttendanceReportData[], monthYear: { month: number; year: number }) => {
  // 1. Changed to 'portrait' to make columns compact and readable
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  
  const { month, year } = monthYear;
  const daysInMonth = getDaysInMonth(new Date(year, month - 1, 1));
  const margin = 40;
  const pageWidth = doc.internal.pageSize.width;
  
  // -- Header Section --
  doc.setFontSize(18);
  doc.setTextColor(46, 172, 179); // Teal color
  doc.setFont("helvetica", "bold");
  doc.text("Gaxce Sensors", margin, 40); // Company Name

  doc.setFontSize(12);
  doc.setTextColor(100); // Grey
  doc.setFont("helvetica", "normal");
  doc.text(`Monthly Attendance Report`, margin, 60);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Period: ${format(new Date(year, month - 1, 1), "MMMM yyyy")}`, margin, 75);

  // Line separator
  doc.setDrawColor(220);
  doc.line(margin, 85, pageWidth - margin, 85);

  let currentY = 100;

  data.forEach((emp, index) => {
    // If not the first employee, check if we need a new page
    if (index > 0) {
        doc.addPage();
        currentY = 40; // Reset Y for new page
    }

    // Employee Header
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`Employee: ${emp.employeeName.toUpperCase()} (${emp.employeeCode})`, margin, currentY);
    
    currentY += 15;

    // Table Data Preparation
    const tableHead = [['Date', 'Day', 'Status', 'In Time', 'Out Time', 'Total Hours']];
    const tableBody = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day);
      const record = emp.dailyRecords.find(r => r.dayOfMonth === day);
      return [
        format(date, "dd-MM-yyyy"),
        format(date, "EEE"),
        record?.status || "-",
        record?.inTime || "-",
        record?.outTime || "-",
        record?.totalHours || "-"
      ];
    });

    autoTable(doc, {
  startY: currentY,
  head: tableHead,
  body: tableBody,
  theme: 'striped',
  // ADD THIS LINE:
  tableWidth: 'auto', 
  styles: { 
    fontSize: 9, 
    cellPadding: 4, 
    valign: 'middle', 
    halign: 'center', 
    lineWidth: 0.1,
    lineColor: [230, 230, 230]
  },
  headStyles: { 
    fillColor: [46, 172, 179], 
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 10
  },
  // ADJUST THESE WIDTHS:
  columnStyles: {
    0: { cellWidth: 90 },  // Date (Widened)
    1: { cellWidth: 55 },  // Day (Widened)
    2: { cellWidth: 80, fontStyle: 'bold' }, // Status (Widened)
    3: { cellWidth: 95 },  // In Time (Widened)
    4: { cellWidth: 95 },  // Out Time (Widened)
    5: { cellWidth: 100 }  // Total Hours (Widened)
  },
  margin: { left: margin, right: margin },
      didDrawPage: () => {
         // Footer with Page Number
         const str = 'Page ' + doc.getNumberOfPages();
         doc.setFontSize(8);
         doc.text(str, pageWidth - margin - 20, doc.internal.pageSize.height - 30);
      }
    });

    // Update currentY for next loop iteration (though usually we addPage)
    currentY = (doc as any).lastAutoTable.finalY + 30;
  });

  doc.save(`Attendance_Report_${month}_${year}.pdf`);
};

const MonthlyAttendanceDetailReport: React.FC<{
  data: MonthlyAttendanceReportData[];
  monthYear: { month: number; year: number };
}> = ({ data, monthYear }) => {
  const { month, year } = monthYear;
  const dateForMonth = new Date(year, month - 1, 1);
  const daysInMonth = getDaysInMonth(dateForMonth);

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month - 1, day);
    const dayOfWeek = format(date, "E"); // Sun, Mon, Tue...
    return { day, dayOfWeek: dayOfWeek.substring(0, 2) };
  });

  const statusColors: Record<string, string> = {
    A: "text-red-600 font-bold",
    WO: "text-blue-600 font-semibold",
    WOP: "text-green-700 font-semibold",
    P: "text-black",
    L: "text-purple-600 font-semibold",
    HD: "text-yellow-700 font-semibold",
  };

  return (
    <div className="p-4 bg-white">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Monthly Status Report (Basic Work Duration)
        </h2>
        <p className="text-gray-600">
          {format(dateForMonth, "MMM dd, yyyy")} To{" "}
          {format(new Date(year, month - 1, daysInMonth), "MMM dd, yyyy")}
        </p>
      </div>

      <div className="flex justify-between items-center text-sm mb-4 px-2 py-1 border-y">
        <div>
          <strong>Company:</strong> Gaxce Sensor
        </div>
        {/* <div><strong>Department:</strong> Default</div> */}
        <div className="text-xs">
          <strong>Printed On:</strong>{" "}
          {format(new Date(), "MMM dd, yyyy HH:mm")}
        </div>
      </div>

      {data.map((employee) => (
        <div key={employee.employeeCode} className="mb-8">
          <div className="flex justify-between items-baseline mb-2 px-1 text-sm">
            <p>
              <span className="font-semibold text-gray-700">Emp. Code:</span>{" "}
              <span className="font-mono">{employee.employeeCode}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-700">Emp. Name:</span>{" "}
              <span className="font-semibold">{employee.employeeName}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-separate border-spacing-0 text-xs text-center font-mono">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-400 p-1 font-semibold w-24 text-left pl-2 text-black">
                    Days
                  </th>
                  {dayHeaders.map(({ day, dayOfWeek }) => (
                    <th
                      key={day}
                      className="border border-gray-400 p-1 font-semibold min-w-[50px] text-black"
                    >
                      <div>{day}</div>
                      <div className="font-normal">{dayOfWeek}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Status", "InTime", "OutTime", "Total"].map((rowType) => (
                  <tr key={rowType}>
                    <td className="border border-gray-400 p-1 font-semibold text-left pl-2 text-black">
                      {rowType}
                    </td>
                    {dayHeaders.map(({ day }) => {
                      const record = employee.dailyRecords.find(
                        (r) => r.dayOfMonth === day,
                      );
                      let content = "";
                      let cellClass =
                        "border border-gray-400 border-l-gray-400/50 border-l-dotted p-1";

                      switch (rowType) {
                        case "Status":
                          content = record?.status || "";
                          cellClass += ` ${statusColors[content] || ""}`;
                          break;
                        case "InTime":
                          content = record?.inTime || "";
                          break;
                        case "OutTime":
                          content = record?.outTime || "";
                          break;
                        case "Total":
                          content = record?.totalHours || "";
                          break;
                      }
                      return (
                        <td key={day} className={cellClass}>
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- All Individual Report Components (Employee & Payroll) ---
const EmployeeMasterReport: React.FC<{ data: EmployeeMaster[] }> = ({
  data,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Code</th>
          <th className="p-3 font-semibold">Full Name</th>
          <th className="p-3 font-semibold">Email / Department</th>
          <th className="p-3 font-semibold">Designation</th>
          <th className="p-3 font-semibold">Joining Date</th>
          <th className="p-3 font-semibold text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((emp) => (
          <tr key={emp.employeeCode} className="border-b hover:bg-gray-50">
            <td className="p-3">{emp.employeeCode}</td>
            <td className="p-3 font-medium text-gray-800">{emp.fullName}</td>
            <td className="p-3">
              <div>{emp.emailAddress}</div>
              <div className="text-gray-500">{emp.department}</div>
            </td>
            <td className="p-3">{emp.designation}</td>
            <td className="p-3">
              {format(new Date(emp.dateOfJoining), "dd MMM, yyyy")}
            </td>
            <td className="p-3 text-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  emp.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {emp.isActive ? "Active" : "Inactive"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const HeadcountAnalysisReport: React.FC<{ data: Headcount[] }> = ({ data }) => {
  const chartHeight = Math.max(400, data.length * 35);
  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        label: "Employee Count",
        data: data.map((d) => d.employeeCount),
        backgroundColor: "rgba(129, 165, 249, 1)",
        borderColor: "rgba(59, 130, 246, 1)",
        barPercentage: 0.4,
      },
    ],
  };
  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
        ticks: {
          callback: function (value: any) {
            if (Math.floor(value) === value) {
              return value;
            }
          },
        },
      },
      y: { grid: { display: false } },
    },
  };
  return (
    <div className="p-4 md:p-6">
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
// const AttendanceSummaryReport: React.FC<{ data: AttendanceSummary[] }> = ({
//   data,
// }) => (
//   <div className="overflow-x-auto">
//     <table className="min-w-full bg-white text-sm">
//       <thead className="bg-gray-100 text-left">
//         <tr>
//           <th className="p-3 font-semibold">Employee</th>
//           <th className="p-3 font-semibold text-center text-green-600">
//             Present
//           </th>
//           <th className="p-3 font-semibold text-center text-red-600">Absent</th>
//           <th className="p-3 font-semibold text-center text-yellow-600">
//             Half Day
//           </th>
//           <th className="p-3 font-semibold text-center text-blue-600">
//             On Leave
//           </th>
//         </tr>
//       </thead>
//       <tbody>
//         {data.map((att) => (
//           <tr key={att.employeeCode} className="border-b hover:bg-gray-50">
//             <td className="p-3">
//               <div className="font-medium text-gray-800">{att.fullName}</div>
//               <div className="text-gray-500">{att.employeeCode}</div>
//             </td>
//             <td className="p-3 font-bold text-center">{att.presentDays}</td>
//             <td className="p-3 font-bold text-center">{att.absentDays}</td>
//             <td className="p-3 font-bold text-center">{att.halfDays}</td>
//             <td className="p-3 font-bold text-center">{att.onLeaveDays}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// );
const LeaveBalanceReport: React.FC<{ data: LeaveBalance[] }> = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Employee</th>
          <th className="p-3 font-semibold">Leave Type</th>
          <th className="p-3 font-semibold text-center">Allocated</th>
          <th className="p-3 font-semibold text-center">Availed</th>
          <th className="p-3 font-semibold text-center">Balance</th>
        </tr>
      </thead>
      <tbody>
        {data.map((lb, index) => (
          <tr
            key={`${lb.employeeCode}-${index}`}
            className="border-b hover:bg-gray-50"
          >
            <td className="p-3">
              <div className="font-medium text-gray-800">{lb.fullName}</div>
              <div className="text-gray-500">{lb.employeeCode}</div>
            </td>
            <td className="p-3">{lb.leaveType}</td>
            <td className="p-3 font-medium text-center">{lb.allocatedDays}</td>
            <td className="p-3 font-medium text-center">{lb.availedDays}</td>
            <td className="p-3 font-bold text-lg text-center text-blue-600">
              {lb.balanceDays}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const DepartmentWiseAnalysisReport: React.FC<{
  data: DepartmentAnalysis[];
}> = ({ data }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
    {data.map((dep) => (
      <div
        key={dep.department}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
      >
        <p className="font-semibold text-blue-800">{dep.department}</p>
        <p className="text-3xl font-bold text-blue-900 mt-2">
          {dep.totalEmployees}
        </p>
        <p className="text-xs text-blue-600">Employees</p>
      </div>
    ))}
  </div>
);
const MonthlySalaryRegisterReport: React.FC<{
  data: MonthlySalaryRegister[];
}> = ({ data }) => {
  const earningsHeaders = useMemo(
    () =>
      Array.from(new Set(data.flatMap((item) => Object.keys(item.earnings)))),
    [data],
  );
  const deductionsHeaders = useMemo(
    () =>
      Array.from(new Set(data.flatMap((item) => Object.keys(item.deductions)))),
    [data],
  );

  // Helper for currency formatting
  const formatCurrency = (value: number | undefined) => (value ?? 0).toFixed(2);

  return (
    <div className="overflow-x-auto p-4">
      <table className="min-w-full bg-white text-sm">
        {" "}
        {/* Increased font size slightly */}
        <thead className="bg-gray-100 text-left">
          <tr>
            {/* FIX: Increased z-index for sticky header */}
            <th className="p-3 font-semibold sticky left-0 bg-gray-100 z-20">
              Employee
            </th>
            <th className="p-3 font-semibold text-center">Payable Days</th>
            {earningsHeaders.map((header) => (
              <th key={header} className="p-3 font-semibold text-right">
                {header}
              </th>
            ))}
            <th className="p-3 font-semibold text-right bg-green-100">
              Gross Earnings
            </th>
            {deductionsHeaders.map((header) => (
              <th key={header} className="p-3 font-semibold text-right">
                {header}
              </th>
            ))}
            <th className="p-3 font-semibold text-right bg-red-100">
              Total Deductions
            </th>
            <th className="p-3 font-semibold text-right bg-blue-100">
              Net Salary
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            // FIX: Added 'group' class to make sticky background change on row hover
            <tr
              key={item.employeeCode}
              className="border-b group hover:bg-gray-50"
            >
              {/* FIX: Ensured sticky cell background changes with the group-hover */}
              <td className="p-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                <div className="font-semibold text-gray-800">
                  {item.fullName}
                </div>
                <div className="text-gray-500 text-xs">{item.employeeCode}</div>
              </td>
              {/* FIX: Centered payable days */}
              <td className="p-3 text-center">{item.payableDays}</td>

              {/* FIX: Right-aligned all numeric data cells */}
              {earningsHeaders.map((header) => (
                <td key={header} className="p-3 text-right font-mono">
                  {formatCurrency(item.earnings[header])}
                </td>
              ))}
              <td className="p-3 text-right font-bold bg-green-100 font-mono">
                {formatCurrency(item.grossEarnings)}
              </td>

              {deductionsHeaders.map((header) => (
                <td key={header} className="p-3 text-right font-mono">
                  {formatCurrency(item.deductions[header])}
                </td>
              ))}
              <td className="p-3 text-right font-bold bg-red-100 font-mono">
                {formatCurrency(item.totalDeductions)}
              </td>

              <td className="p-3 text-right font-bold bg-blue-100 font-mono">
                {formatCurrency(item.netSalary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EmployerPfReport: React.FC<{ data: EmployerPfReport[] }> = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Employee</th>
          <th className="p-3 font-semibold">Department</th>
          <th className="p-3 font-semibold text-right">Gross Earnings</th>
          <th className="p-3 font-semibold text-right">
            Employer PF Contribution
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.employeeCode} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <div className="font-medium text-gray-800">{item.fullName}</div>
              <div className="text-gray-500">{item.employeeCode}</div>
            </td>
            <td className="p-3">{item.department}</td>
            <td className="p-3 text-right font-mono">
              {item.grossEarnings.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </td>
            <td className="p-3 text-right font-bold font-mono">
              {item.employerPF.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BonusIncentiveReport: React.FC<{ data: BonusIncentive[] }> = ({
  data,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Employee</th>
          <th className="p-3 font-semibold">Financial Year</th>
          <th className="p-3 font-semibold">Status</th>
          <th className="p-3 font-semibold text-right">Bonus Amount</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.employeeCode} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <div className="font-medium text-gray-800">{item.fullName}</div>
              <div className="text-gray-500">{item.employeeCode}</div>
            </td>
            <td className="p-3">{item.financialYear}</td>
            <td className="p-3">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="p-3 text-right font-bold">
              {item.bonusAmount.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const BankTransferSummaryReport: React.FC<{ data: BankTransfer[] }> = ({
  data,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Employee</th>
          <th className="p-3 font-semibold">Bank Details</th>
          <th className="p-3 font-semibold text-right">Amount to Transfer</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.employeeCode} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <div className="font-medium text-gray-800">{item.fullName}</div>
              <div className="text-gray-500">{item.employeeCode}</div>
            </td>
            <td className="p-3">
              <div>
                <strong>Bank:</strong> {item.bankName ?? "N/A"}
              </div>
              <div>
                <strong>A/C:</strong> {item.accountNumber ?? "N/A"}
              </div>
              <div>
                <strong>IFSC:</strong> {item.ifscCode ?? "N/A"}
              </div>
            </td>
            <td className="p-3 text-right font-bold">
              {item.netSalary.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
const CostCenterAnalysisReport: React.FC<{ data: CostCenterAnalysis[] }> = ({
  data,
}) => {
  const chartHeight = Math.max(400, data.length * 40);
  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        label: "Total Cost",
        data: data.map((d) => d.totalCost),
        backgroundColor: "rgba(22, 163, 74, 0.7)",
        borderColor: "rgba(22, 163, 74, 1)",
        barPercentage: 0.4,
      },
    ],
  };
  const chartOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.x !== null) {
              label += new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(context.parsed.x);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return Number(value).toLocaleString("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            });
          },
        },
      },
      y: { grid: { display: false } },
    },
  };
  return (
    <div className="p-4 md:p-6">
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const ExpenseClaimReportComponent: React.FC<{ data: ExpenseClaimReport[] }> = ({ data }) => (
  <div className="overflow-x-auto p-2">
    <table className="min-w-full bg-white text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-3 font-semibold">Employee</th>
          <th className="p-3 font-semibold">Expense Type</th>
          <th className="p-3 font-semibold">Claim Date</th>
          <th className="p-3 font-semibold">Status</th>
          <th className="p-3 font-semibold text-right">Amount</th>
          <th className="p-3 font-semibold text-right">Approved Amt.</th>
          <th className="p-3 font-semibold">Approver</th>
          <th className="p-3 font-semibold">Approval Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={`${item.employeeCode}-${index}`} className="border-b hover:bg-gray-50">
            <td className="p-3">
              <div className="font-medium text-gray-800">{item.employeeName}</div>
              <div className="text-gray-500">{item.employeeCode}</div>
            </td>
            <td className="p-3">{item.expenseType}</td>
            <td className="p-3">{format(new Date(item.claimDate), "dd MMM, yyyy")}</td>
            <td className="p-3">
               <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="p-3 text-right font-mono">
              {item.amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}
            </td>
            <td className="p-3 text-right font-mono font-semibold">
              {item.approvedAmount?.toLocaleString("en-IN", { style: "currency", currency: "INR" }) ?? 'N/A'}
            </td>
            <td className="p-3">{item.approverName ?? 'N/A'}</td>
            <td className="p-3">
              {item.approvalDate ? format(new Date(item.approvalDate), "dd MMM, yyyy") : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- 3. MAIN REPORT VIEWER COMPONENT (Handles all reports) ---
const ReportViewer: React.FC<{
  activeReport: ReportType;
  onBack: () => void;
}> = ({ activeReport, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  // const [dateRange] = useState({
  //   start: format(new Date(), "yyyy-MM-dd"),
  //   end: format(new Date(), "yyyy-MM-dd"),
  // });
    const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });
  const [monthYear, setMonthYear] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [financialYear, setFinancialYear] = useState(
    `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(
      -2,
    )}`,
  );
    const [searchTerm] = useState("");

  const reportDetails = useMemo(
    () => ({
      master: { title: "Employee Master Report", icon: <FileText /> },
      headcount: { title: "Headcount Analysis", icon: <BarChart3 /> },
      attendance: { title: "Attendance Summary", icon: <Calendar /> },
      leave: { title: "Leave Balance Report", icon: <FileText /> },
      department: { title: "Department Wise Analysis", icon: <Users /> },
      monthlySalary: {
        title: "Monthly Salary Register",
        icon: <IndianRupee />,
      },
      costCenter: { title: "Cost Center Analysis", icon: <BarChart3 /> },
      // employerPf: { title: "Employer PF Report", icon: <IndianRupee /> },
      bonus: { title: "Bonus & Incentive Report", icon: <IndianRupee /> },
      bankTransfer: { title: "Bank Transfer Summary", icon: <FileText /> },
      expenseClaim: { title: "Expense Claim Report", icon: <IndianRupee /> },

    }),
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let params: any = {};
        const baseUrl = API_ENDPOINTS.EmployeeReports;
        // if (activeReport === "attendance")
        //   params = { startDate: dateRange.start, endDate: dateRange.end };
        // else if (activeReport === "leave")
        //   params = { financialYear: financialYear.split("-")[0] };
        // else if (activeReport === "bonus") params = { financialYear };
        // else if (
        //   ["monthlySalary", "costCenter", "employerPf", "bankTransfer"].includes(
        //     activeReport
        //   )
        // ) {
        //   params = { month: monthYear.month, year: monthYear.year };
        // }

        if (
          [
            "monthlySalary",
            "costCenter",
            "employerPf",
            "bankTransfer",
            "attendance",
          ].includes(activeReport)
        ) {
          params = { month: monthYear.month, year: monthYear.year };
        } else if (activeReport === "leave") {
          params = { financialYear: financialYear.split("-")[0] };
        } else if (activeReport === "bonus") {
          params = { financialYear };
        }
        else if (activeReport === 'expenseClaim') {
            params = { startDate: dateRange.start, endDate: dateRange.end };
        }
         if (user?.role?.toLowerCase() === 'employee' && activeReport === 'attendance' && user.employeeId) {
          params.employeeId = user.employeeId;
        }

        const endpointMap: Record<ReportType, string> = {
          master: "/master",
          headcount: "/headcount",
          attendance: "/detailed-attendance-report",
          leave: "/leave-balance",
          department: "/department-wise-analysis",
          monthlySalary: "/monthly-salary-register",
          costCenter: "/cost-center-analysis",
          employerPf: "/employer-pf-report",
          bonus: "/bonus-incentive-report",
          bankTransfer: "/bank-transfer-summary",
          expenseClaim: "/expense-claim-report",
        };
        const response = await apiClient.get(
          `${baseUrl}${endpointMap[activeReport]}`,
          { params },
        );
        setData(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeReport, monthYear, financialYear,dateRange,user]);

   const filteredData = useMemo(() => {
       if (!searchTerm) return data;
    if (activeReport === "attendance") {
      return data.filter(item => 
        item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    else if (activeReport === "leave") {
      return data.filter(item => 
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  }, [data, searchTerm, activeReport]);

  const handleExport = async () => {
    try {
      const baseUrl = API_ENDPOINTS.EmployeeReports;
      let downloadUrl = "";
      let params: any = {};
      const endpointMap: Record<string, string> = {
        master: "/master/download",
        attendance: "/attendance-summary/download",
        leave: "/leave-balance/download",
        monthlySalary: "/monthly-salary-register/download",
        employerPf: "/employer-pf-report/download",
        bonus: "/bonus-incentive-report/download",
        bankTransfer: "/bank-transfer-summary/download",
        expenseClaim: "/expense-claim-report/download",

      };
      if (!endpointMap[activeReport]) {
        console.error("Export not configured for this report:", activeReport);
        return;
      }
      downloadUrl = `${baseUrl}${endpointMap[activeReport]}`;
      if (activeReport === "attendance")
        params = { startDate: dateRange.start, endDate: dateRange.end };
      else if (activeReport === "leave")
        params = { financialYear: financialYear.split("-")[0] };
      else if (activeReport === "bonus") params = { financialYear };
      else if (
        ["monthlySalary", "employerPf", "bankTransfer"].includes(activeReport)
      ) {
        params = { month: monthYear.month, year: monthYear.year };
      }
       else if (activeReport === 'expenseClaim') {
        params = { startDate: dateRange.start, endDate: dateRange.end };
      }
      const response = await apiClient.get(downloadUrl, {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `${activeReport}-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

    const handlePdfDownload = () => {
    if (activeReport === "attendance" && filteredData.length > 0) {
      generateAttendancePDF(filteredData, monthYear);
    }
  };

  const renderReport = () => {
    if (loading) return <Spinner />;
    if (error) return <ErrorDisplay message={error} />;
    if (!data || data.length === 0)
      return (
        <p className="text-center p-10 text-gray-500">
          No data available for the selected period.
        </p>
      );
    switch (activeReport) {
      case "master":
        return <EmployeeMasterReport data={data} />;
      case "headcount":
        return <HeadcountAnalysisReport data={data} />;
      case "attendance":
        return (
          <MonthlyAttendanceDetailReport data={data} monthYear={monthYear} />
        );
      case "leave":
        return <LeaveBalanceReport data={data} />;
      case "department":
        return <DepartmentWiseAnalysisReport data={data} />;
      case "monthlySalary":
        return <MonthlySalaryRegisterReport data={data} />;
      case "costCenter":
        return <CostCenterAnalysisReport data={data} />;
      case "employerPf":
        return <EmployerPfReport data={data} />;
      case "bonus":
        return <BonusIncentiveReport data={data} />;
      case "bankTransfer":
        return <BankTransferSummaryReport data={data} />;
          case "expenseClaim":
        return <ExpenseClaimReportComponent data={data} />;
      default:
        return null;
    }
  };

  const renderFilters = () => {
    // if (activeReport === "attendance") {
    //   return (
    //     <div className="flex items-center gap-2 flex-wrap">
    //       <input
    //         type="date"
    //         value={dateRange.start}
    //         onChange={(e) =>
    //           setDateRange((prev) => ({ ...prev, start: e.target.value }))
    //         }
    //         className="p-2 border rounded-md text-sm"
    //       />
    //       <span className="text-gray-500">to</span>
    //       <input
    //         type="date"
    //         value={dateRange.end}
    //         onChange={(e) =>
    //           setDateRange((prev) => ({ ...prev, end: e.target.value }))
    //         }
    //         className="p-2 border rounded-md text-sm"
    //       />
    //     </div>
    //   );
    // }

    if (activeReport === "expenseClaim") {
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
            className="p-2 border rounded-md text-sm"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
            className="p-2 border rounded-md text-sm"
          />
        </div>
      );
    }

    if (activeReport === "leave" || activeReport === "bonus") {
      const currentYear = new Date().getFullYear();
      return (
        <select
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
          className="p-2 border rounded-md text-sm bg-white"
        >
          {[...Array(5)].map((_, i) => {
            const year = currentYear - i;
            const fy = `${year}-${String(year + 1).slice(-2)}`;
            return (
              <option key={fy} value={fy}>
                FY {fy}
              </option>
            );
          })}
        </select>
      );
    }
    if (
      [
        "monthlySalary",
        "costCenter",
        "employerPf",
        "bankTransfer",
        "attendance",
      ].includes(activeReport)
    ) {
      return (
        <input
          type="month"
          value={`${monthYear.year}-${String(monthYear.month).padStart(
            2,
            "0",
          )}`}
          onChange={(e) => {
            const [year, month] = e.target.value.split("-").map(Number);
            setMonthYear({ month, year });
          }}
          className="p-2 border rounded-md text-sm"
        />
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-blue-600">
              {reportDetails[activeReport as keyof typeof reportDetails].icon}
            </span>
            <h2 className="text-lg font-bold text-gray-800">
              {reportDetails[activeReport as keyof typeof reportDetails]?.title}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {renderFilters()}
          {data &&
            data.length > 0 &&
            activeReport !== "headcount" &&
            activeReport !== "department" &&
            activeReport !== "costCenter" &&
             activeReport !== "attendance" &&  (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600 text-white font-semibold px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                <Download size={16} /> Export Excel
              </button>
            )}
               {activeReport === "attendance" && filteredData.length > 0 && (
            <button
              onClick={handlePdfDownload}
              className="flex items-center gap-2 bg-red-600 text-white font-semibold px-3 py-2 rounded-lg hover:bg-red-700 text-sm"
            >
              <FileText size={16} /> Export PDF
            </button>
          )}
        </div>
      </div>
      {renderReport()}
    </div>
  );
};

// --- 4. MAIN DASHBOARD COMPONENT ---
const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
      const { user } = useAuth();


  const employeeReports = [
    {
      id: "master",
      label: "Employee Master Report",
      icon: <FileText size={20} />,
      color: "blue",
    },
    {
      id: "headcount",
      label: "Headcount Analysis",
      icon: <BarChart3 size={20} />,
      color: "blue",
    },
    {
      id: "attendance",
      label: "Attendance Summary",
      icon: <Calendar size={20} />,
      color: "blue",
    },
    {
      id: "leave",
      label: "Leave Balance Report",
      icon: <FileText size={20} />,
      color: "blue",
    },
    {
      id: "department",
      label: "Department Wise Analysis",
      icon: <Users size={20} />,
      color: "blue",
    },
  ];

  const payrollReports = [
    {
      id: "monthlySalary",
      label: "Monthly Salary Register",
      icon: <IndianRupee size={20} />,
      color: "green",
    },
    {
      id: "costCenter",
      label: "Cost Center Analysis",
      icon: <BarChart3 size={20} />,
      color: "green",
    },
      {
      id: "expenseClaim",
      label: "Expense Claim Report",
      icon: <IndianRupee size={20} />,
      color: "green",
    },
    // {
    //   id: "employerPf",
    //   label: "Employer PF Report",
    //   icon: <IndianRupee size={20} />,
    //   color: "green",
    // },
    {
      id: "bonus",
      label: "Bonus & Incentive Report",
      icon: <IndianRupee size={20} />,
      color: "green",
    },
    {
      id: "bankTransfer",
      label: "Bank Transfer Summary",
      icon: <FileText size={20} />,
      color: "green",
    },
  ];

  // --- UPDATED: ReportItem Component with Color Props ---
  const ReportItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    color: "blue" | "green";
    onClick: () => void;
  }> = ({ label, icon, color, onClick }) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        hoverBg: "hover:bg-blue-50",
        hoverBorder: "hover:border-blue-400",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        hoverBg: "hover:bg-green-50",
        hoverBorder: "hover:border-green-400",
      },
    };
    const selectedColor = colorClasses[color];

    return (
      <button
        onClick={onClick}
        className={`group w-full flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg text-left transition-all duration-200 ${selectedColor.hoverBg} ${selectedColor.hoverBorder}`}
      >
        <div
          className={`shrink-0 h-10 w-10 flex items-center justify-center rounded-full ${selectedColor.bg} ${selectedColor.text}`}
        >
          {icon}
        </div>
        {/* The text color no longer needs a hover class, as it looks good on the new light background */}
        <span className={`font-semibold text-sm text-gray-700`}>{label}</span>
      </button>
    );
  };

  if (activeReport) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <ReportViewer
          activeReport={activeReport}
          onBack={() => setActiveReport(null)}
        />
      </div>
    );
  }

  // --- UPDATED: Main Dashboard Return JSX with New Styling ---
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Reports Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
                            {user?.role?.toLowerCase() === 'employee' 
                                ? "View your personal reports" 
                                : "Generate comprehensive payroll and employee reports"
                            }
                        </p>
          </div>
        </div>

          {user?.role?.toLowerCase() === 'employee' ? (
                    // IF USER IS AN EMPLOYEE, SHOW ONLY THEIR ATTENDANCE REPORT OPTION
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl shadow-sm border border-t-4 border-t-blue-500 p-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-2"><Users size={24} className="text-blue-500"/> My Reports</h2>
                            <p className="text-sm text-gray-500 mb-5">View your personal reports and analytics</p>
                            <div className="space-y-3">
                                <ReportItem 
                                    key="attendance" 
                                    label="My Attendance Report" 
                                    icon={<Calendar size={20} />} 
                                    color="blue"
                                    onClick={() => setActiveReport("attendance" as ReportType)} 
                                />
                            </div>
                        </div>
                    </div>
                ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee Reports Card */}
          <div className="bg-white rounded-xl shadow-sm border border-t-4 border-t-blue-500 p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-2">
              <Users size={24} className="text-blue-500" /> Employee Reports
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Employee-related reports and analytics
            </p>
            <div className="space-y-3">
              {employeeReports.map((item) => (
                <ReportItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  color={item.color as "blue" | "green"}
                  onClick={() => setActiveReport(item.id as ReportType)}
                />
              ))}
            </div>
          </div>
          {/* Payroll Reports Card */}
          <div className="bg-white rounded-xl shadow-sm border border-t-4 border-t-green-500 p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-2">
              <IndianRupee size={24} className="text-green-500" /> Payroll
              Reports
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Salary and payroll analytics
            </p>
            <div className="space-y-3">
              {payrollReports.map((item) => (
                <ReportItem
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  color={item.color as "blue" | "green"}
                  onClick={() => setActiveReport(item.id as ReportType)}
                />
              ))}
            </div>
          </div>
        </div>
            )}
      </div>
    </div>
  );
};

export default Reports;
