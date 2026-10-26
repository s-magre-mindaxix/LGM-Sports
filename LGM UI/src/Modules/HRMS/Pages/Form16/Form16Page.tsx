import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import autoTable from "jspdf-autotable";
import {
  FileText,
  UploadCloud,
  CheckCircle,
  Users,
  Send,
  Download,
  Search,
  Loader2,
  AlertCircle,
  Settings2,
  FileUp,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../../../hooks/useAuth";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import jsPDF from "jspdf";
import LogoLoader from "../../../../Components/Common/LogoLoader";

interface Form16Summary {
  totalEmployees: number;
  partAUploaded: number;
  partBGenerated: number;
  published: number;
}
interface Form16Status {
  id: number;
  employeeId: number;
  employeeCode: string;
  name: string;
  pan: string;
  partAStatus: "Pending" | "Uploaded";
  partBStatus: "Pending" | "Generated";
  finalStatus: "Pending" | "Published";
}
interface Form16Dashboard {
  summary: Form16Summary;
  employeeStatusList: Form16Status[];
}
interface EmployeeForm16View {
  financialYear: string;
  status: "Published" | "Not Available";
  downloadId: number | null;
}

interface HeaderInfo {
  certificateNo: string;
  lastUpdatedOn: string;
  assessmentYear: string;
  periodFrom: string;
  periodTo: string;
}
interface EmployerInfo {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  pan: string;
  tan: string;
  citTdsAddress: string;
}
interface EmployeeInfo {
  fullName: string;
  address: string;
  pan: string;
  isOptingOutOf115BAC: boolean;
}
interface SalaryDetails {
  grossSalarySec17_1: number;
  perquisitesSec17_2: number;
  profitsInLieuOfSalarySec17_3: number;
  totalGrossSalary: number;
  salaryFromOtherEmployers: number;
  hraSec10_13A: number;
  totalExemptAllowances: number;
  totalSalaryAfterExemptions: number;
  standardDeduction16_ia: number;
  entertainmentAllowance16_ii: number;
  professionalTax16_iii: number;
  totalDeductionsSec16: number;
  incomeFromSalaries: number;
  incomeFromHouseProperty: number;
  incomeFromOtherSources: number;
  totalOtherIncome: number;
  grossTotalIncome: number;
  deduction80C: number;
  deduction80D: number;
  totalChapterVIADeductions: number;
  totalTaxableIncome: number;
}
interface TaxComputation {
  taxOnTotalIncome: number;
  rebate87A: number;
  surcharge: number;
  healthAndEducationCess: number;
  taxPayable: number;
  relief89: number;
  tdsDeductedByEmployer: number;
  netTaxPayable: number;
}
interface VerificationInfo {
  signatoryName: string;
  signatorySonDaughterOf: string;
  signatoryDesignation: string;
  place: string;
  date: string;
}
interface Form16Data {
  header: HeaderInfo;
  employer: EmployerInfo;
  employee: EmployeeInfo;
  salaryBreakdown: SalaryDetails;
  taxCalculation: TaxComputation;
  verification: VerificationInfo;
}

const generatePdf = (data: Form16Data) => {
  const doc = new jsPDF("p", "pt", "a4");
  const {
    header,
    employer,
    employee,
    salaryBreakdown,
    taxCalculation,
    verification,
  } = data;
  const formatCurrency = (value: number) =>
    value != null ? value.toFixed(2) : "0.00";
  let lastY = 0; // To track the bottom of the last table/element

  // --- Page Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("TDS TRACES\nCentralized Processing Cell", 40, 45);
  doc.text(
    "Government of India\nIncome Tax Department",
    doc.internal.pageSize.width - 40,
    45,
    { align: "right" },
  );
  doc.setFontSize(12);
  doc.text("FORM NO. 16\nPART B", doc.internal.pageSize.width / 2, 45, {
    align: "center",
  });
  doc.setLineWidth(0.5);
  doc.line(40, 70, doc.internal.pageSize.width - 40, 70);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on salary...",
    doc.internal.pageSize.width / 2,
    85,
    { align: "center" },
  );

  // --- Employer/Employee Info Table ---
  autoTable(doc, {
    startY: 95,
    margin: { left: 40, right: 40 },
    theme: "grid",
    tableWidth: "auto",
    styles: { fontSize: 8, cellPadding: 5, lineColor: "#333", lineWidth: 0.5 },
    body: [
      [
        {
          content: `Certificate No. ${header.certificateNo}`,
          colSpan: 2,
          styles: { fontStyle: "normal" },
        },
        {
          content: `Last updated on ${header.lastUpdatedOn}`,
          styles: { halign: "right", fontStyle: "normal" },
        },
      ],
      [
        {
          content: "Name and address of the Employer",
          styles: { fontStyle: "bold" },
        },
        {
          content: "Name and address of the Employee",
          styles: { fontStyle: "bold" },
        },
      ],
      [
        `${employer.companyName}\n${employer.companyAddress}\n${employer.companyEmail}`,
        `${employee.fullName}\n${employee.address}`,
      ],
      [
        {
          content: `PAN of the Deductor\n${employer.pan}`,
          styles: { fontStyle: "bold" },
        },
        {
          content: `TAN of the Deductor\n${employer.tan}`,
          styles: { fontStyle: "bold" },
        },
      ],
      [
        {
          content: `CIT (TDS)\n${employer.citTdsAddress}`,
          styles: { fontStyle: "bold" },
        },
        {
          content: `PAN of the Employee\n${employee.pan}`,
          styles: { fontStyle: "bold" },
        },
      ],
      [
        {
          content: `Assessment Year\n${header.assessmentYear}`,
          styles: { fontStyle: "bold" },
        },
        {
          content: `Period with the Employer\nFrom ${header.periodFrom} To ${header.periodTo}`,
          styles: { fontStyle: "bold" },
        },
      ],
    ],
    didParseCell: (data) => {
      if (data.cell.raw?.toString().includes("\n")) {
        data.cell.styles.fontStyle = "normal"; // Regular text for multiline content
      }
    },
  });
  lastY = (doc as any).lastAutoTable.finalY + 15;

  // --- Main Salary and Tax Details Table ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "Details of Salary Paid and any other income and tax deducted",
    40,
    lastY,
  );
  lastY += 5;

  autoTable(doc, {
    startY: lastY,
    margin: { left: 40, right: 40 },
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 4, lineColor: "#ccc" },
    headStyles: {
      fillColor: false,
      textColor: "#333",
      fontStyle: "bold",
      halign: "right",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 35 },
      1: { halign: "left" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    head: [["", "", "Rs.", "Rs."]],
    body: [
      [
        { content: "A.", styles: { fontStyle: "bold" } },
        {
          content: "Whether opting out of taxation u/s 115BAC(1A)?",
          styles: { fontStyle: "bold" },
        },
        {
          content: employee.isOptingOutOf115BAC ? "Yes" : "No",
          colSpan: 2,
          styles: { halign: "right", fontStyle: "bold" },
        },
      ],
      [
        { content: "1.", styles: { fontStyle: "bold" } },
        { content: "Gross Salary", styles: { fontStyle: "bold" } },
        "",
        "",
      ],
      [
        "(a)",
        "Salary as per provisions contained in section 17(1)",
        formatCurrency(salaryBreakdown.grossSalarySec17_1),
        "",
      ],
      [
        "(d)",
        "Total",
        "",
        {
          content: formatCurrency(salaryBreakdown.totalGrossSalary),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "2.", styles: { fontStyle: "bold" } },
        {
          content: "Less: Allowances to the extent exempt under section 10",
          styles: { fontStyle: "bold" },
        },
        "",
        "",
      ],
      [
        "(i)",
        "Total amount of exemption claimed under section 10",
        "",
        {
          content: formatCurrency(salaryBreakdown.totalExemptAllowances),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "3.", styles: { fontStyle: "bold" } },
        {
          content:
            "Total amount of salary received from current employer [1(d)-2(i)]",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(salaryBreakdown.totalSalaryAfterExemptions),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "4.", styles: { fontStyle: "bold" } },
        {
          content: "Less: Deductions under section 16",
          styles: { fontStyle: "bold" },
        },
        "",
        "",
      ],
      [
        "(a)",
        "Standard deduction under section 16(ia)",
        formatCurrency(salaryBreakdown.standardDeduction16_ia),
        "",
      ],
      [
        { content: "5.", styles: { fontStyle: "bold" } },
        {
          content: "Total amount of deductions under section 16",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(salaryBreakdown.totalDeductionsSec16),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "6.", styles: { fontStyle: "bold" } },
        {
          content: "Income chargeable under the head 'Salaries'",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(salaryBreakdown.incomeFromSalaries),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "7.", styles: { fontStyle: "bold" } },
        {
          content: "Add: Any other income reported by the employee",
          styles: { fontStyle: "bold" },
        },
        "",
        "",
      ],
      [
        "(b)",
        "Income under the head Other Sources",
        formatCurrency(salaryBreakdown.incomeFromOtherSources),
        "",
      ],
      [
        { content: "9.", styles: { fontStyle: "bold" } },
        { content: "Gross total income (6+8)", styles: { fontStyle: "bold" } },
        "",
        {
          content: formatCurrency(salaryBreakdown.grossTotalIncome),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "10.", styles: { fontStyle: "bold" } },
        {
          content: "Deductions under Chapter VI-A",
          styles: { fontStyle: "bold" },
        },
        "",
        "",
      ],
      [
        { content: "11.", styles: { fontStyle: "bold" } },
        {
          content: "Aggregate of deductible amount under Chapter VI-A",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(salaryBreakdown.totalChapterVIADeductions),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "12.", styles: { fontStyle: "bold" } },
        {
          content: "Total taxable income (9-11)",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(salaryBreakdown.totalTaxableIncome),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "13.", styles: { fontStyle: "bold" } },
        { content: "Tax on total income", styles: { fontStyle: "bold" } },
        "",
        {
          content: formatCurrency(taxCalculation.taxOnTotalIncome),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "14.", styles: { fontStyle: "bold" } },
        {
          content: "Rebate under section 87A, if applicable",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(taxCalculation.rebate87A),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "16.", styles: { fontStyle: "bold" } },
        { content: "Health and education cess", styles: { fontStyle: "bold" } },
        "",
        {
          content: formatCurrency(taxCalculation.healthAndEducationCess),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "17.", styles: { fontStyle: "bold" } },
        { content: "Tax payable", styles: { fontStyle: "bold" } },
        "",
        {
          content: formatCurrency(taxCalculation.taxPayable),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "19.", styles: { fontStyle: "bold" } },
        {
          content: "Less: Tax deducted at source",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(taxCalculation.tdsDeductedByEmployer),
          styles: { fontStyle: "bold" },
        },
      ],
      [
        { content: "21.", styles: { fontStyle: "bold" } },
        {
          content: "Net tax payable (17-18-19-20)",
          styles: { fontStyle: "bold" },
        },
        "",
        {
          content: formatCurrency(taxCalculation.netTaxPayable),
          styles: { fontStyle: "bold" },
        },
      ],
    ],
  });
  lastY = (doc as any).lastAutoTable.finalY;

  // --- Verification Section ---
  const verificationY = lastY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "Verification",
    doc.internal.pageSize.width / 2,
    verificationY + 15,
    { align: "center" },
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const verificationText = `I, ${verification.signatoryName}, son/daughter of ${verification.signatorySonDaughterOf}. Working in the capacity of ${verification.signatoryDesignation} do hereby certify that the information given above is true, complete and correct and is based on the books of account, documents, TDS statements, and other available records.`;
  const splitText = doc.splitTextToSize(
    verificationText,
    doc.internal.pageSize.width - 100,
  );
  doc.text(splitText, 50, verificationY + 30);

  const signatureY = verificationY + 80;
  doc.text(`Place: ${verification.place}`, 50, signatureY);
  doc.text(
    `Date: ${verification.date}`,
    doc.internal.pageSize.width / 2 - 50,
    signatureY,
  );
  doc.text(
    `${verification.signatoryName}\n(Signature of person responsible for deduction of tax)`,
    doc.internal.pageSize.width - 50,
    signatureY,
    { align: "right" },
  );
  doc.rect(40, verificationY, doc.internal.pageSize.width - 80, 120); // Border

  // --- Footer with Page Numbers ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 20,
      { align: "center" },
    );
  }

  return doc;
};

const StatCard = ({
  title,
  value,
  icon,
  bgColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}) => (
  <div
    className={`${bgColor} p-5 rounded-xl text-white flex items-center justify-between transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
  >
    <div>
      <p className="text-sm opacity-90">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">{icon}</div>
  </div>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Uploaded":
    case "Generated":
    case "Published":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  showCancel?: boolean;
  type?: "success" | "error";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  showCancel = false, // Default to false for simple alerts
  type = "success",
}) => {
  if (!isOpen) return null;

  const icon = {
    success: <CheckCircle size={32} className="text-green-500" />,
    error: <AlertTriangle size={32} className="text-red-500" />,
  }[type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
              className="px-6 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Form16Page: React.FC = () => {
  // Component State
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardData, setDashboardData] = useState<Form16Dashboard | null>(
    null,
  );
  const [employeeViewData, setEmployeeViewData] =
    useState<EmployeeForm16View | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "success" as "success" | "error",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();
  const [selectedFy, setSelectedFy] = useState(
    `${currentYear - 1}-${currentYear}`,
  );
  const financialYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1}-${year}`);
    }
    return years;
  }, [currentYear]);

  // Data Fetching Callbacks
  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Form16Dashboard>(
        `${API_ENDPOINTS.Form16}/dashboard/${selectedFy}`,
      );
      setDashboardData(response.data);
    } catch (err) {
      setError("Failed to load Form 16 dashboard data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFy]);
  const loadEmployeeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<EmployeeForm16View>(
        `${API_ENDPOINTS.Form16}/employee-view/${selectedFy}`,
      );
      setEmployeeViewData(response.data);
    } catch (err) {
      setError("Failed to load your Form 16 status.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFy]);

  // Initial Data Load
  useEffect(() => {
    if (user?.role === "Admin" || user?.role === "HR") loadAdminData();
    else if (user?.role === "Employee") loadEmployeeData();
  }, [user, selectedFy, loadAdminData, loadEmployeeData]);

  // Event Handlers
  const handleGeneratePartB = async (employeeId: number, statusId: number) => {
    if (processingId) return;
    setProcessingId(statusId);
    try {
      await apiClient.post(`${API_ENDPOINTS.Form16}/generate-part-b`, {
        employeeId,
        financialYear: selectedFy,
      });
      setModalState({
        isOpen: true,
        title: "Success",
        message: "Part B has been generated successfully!",
        type: "success",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
      await loadAdminData();
    } catch (error: any) {
      setModalState({
        isOpen: true,
        title: "Generation Failed",
        message: error.response?.data?.message || error.message,
        type: "error",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
    } finally {
      setProcessingId(null);
    }
  };
  const handlePublish = async (statusId: number) => {
    if (processingId) return;
    setProcessingId(statusId);
    try {
      await apiClient.post(`${API_ENDPOINTS.Form16}/publish`, {
        form16StatusId: statusId,
      });
      setModalState({
        isOpen: true,
        title: "Published",
        message:
          "Form 16 has been published successfully and is now visible to the employee.",
        type: "success",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
      await loadAdminData();
    } catch (error: any) {
      setModalState({
        isOpen: true,
        title: "Publishing Failed",
        message: error.response?.data?.message || error.message,
        type: "error",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleUploadButtonClick = () => fileInputRef.current?.click();
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
    event.target.value = "";
  };
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.Form16}/upload-part-a/${selectedFy}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setModalState({
        isOpen: true,
        title: "Upload Successful",
        message:
          response.data.message || "Part A files processed successfully!",
        type: "success",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
      await loadAdminData();
    } catch (error: any) {
      setModalState({
        isOpen: true,
        title: "Upload Failed",
        message:
          error.response?.data?.message ||
          "Please check the file and try again.",
        type: "error",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
      console.error("Upload error details:", error.response?.data || error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (statusId: number, employeeName: string) => {
    if (processingId) return;
    setProcessingId(statusId);
    try {
      // 1. Fetch JSON data from the `/data/{id}` endpoint
      const response = await apiClient.get<Form16Data>(
        `${API_ENDPOINTS.Form16}/data/${statusId}`,
      );

      // 2. Validate the data from the API
      if (!response.data || !response.data.header) {
        throw new Error(
          "Received invalid or empty data from server. Cannot generate PDF.",
        );
      }

      // 3. Generate the PDF document using the jsPDF helper
      const doc = generatePdf(response.data);

      // 4. Trigger download
      const fileName = `Form16_${employeeName.replace(
        /\s+/g,
        "_",
      )}_${selectedFy}.pdf`;
      doc.save(fileName);
    } catch (error: any) {
      console.error("Download failed:", error);
      setModalState({
        isOpen: true,
        title: "Download Failed",
        message: error.message || "Could not generate the PDF file.",
        type: "error",
        onConfirm: () => setModalState({ ...modalState, isOpen: false }),
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredEmployees = dashboardData?.employeeStatusList.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.pan.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- RENDER LOGIC ---
  if (isLoading)
    return (
      <div className="p-6 flex justify-center items-center h-full">
       {<LogoLoader />}
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-red-100 text-red-800 rounded-lg flex items-center gap-4">
        <AlertCircle /> {error}
      </div>
    );

  // --- ADMIN & HR VIEW ---
  if ((user?.role === "Admin" || user?.role === "HR") && dashboardData) {
    const { summary } = dashboardData;
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Form 16 Generation
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and distribute Form 16 for your employees.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm font-semibold bg-white"
            >
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>{`FY ${fy}`}</option>
              ))}
            </select>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".zip"
              className="hidden"
            />
            <button
              onClick={handleUploadButtonClick}
              className="flex items-center gap-2 bg-[#f07837] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#0d3357] disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <FileUp size={18} /> Upload Part A (Bulk)
                </>
              )}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Employees"
            value={summary.totalEmployees.toString()}
            bgColor="bg-[#2eacb3]"
            icon={<Users size={20} className="text-blue-600" />}
          />
          <StatCard
            title="Part A Uploaded"
            value={`${summary.partAUploaded} / ${summary.totalEmployees}`}
            bgColor="bg-[#f7c343]"
            icon={<UploadCloud size={20} className="text-green-600" />}
          />
          <StatCard
            title="Part B Generated"
            value={`${summary.partBGenerated} / ${summary.totalEmployees}`}
            bgColor="bg-[#386487]"
            icon={<Settings2 size={20} className="text-red-600" />}
          />
          <StatCard
            title="Published"
            value={`${summary.published} / ${summary.totalEmployees}`}
            bgColor="bg-[#87b6a7]"
            icon={<Send size={20} className="text-purple-600" />}
          />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Employee Status
              </h2>
              <p className="text-sm text-gray-500">
                View and manage individual Form 16 generation.
              </p>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, code, PAN..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white uppercase text-xs">
                <tr>
                  {[
                    "Employee",
                    "PAN",
                    "Part A",
                    "Part B",
                    "Final Status",
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
                {filteredEmployees?.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {emp.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {emp.employeeCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{emp.pan}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          emp.partAStatus,
                        )}`}
                      >
                        {emp.partAStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          emp.partBStatus,
                        )}`}
                      >
                        {emp.partBStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          emp.finalStatus,
                        )}`}
                      >
                        {emp.finalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleGeneratePartB(emp.employeeId, emp.id)
                          }
                          disabled={
                            processingId === emp.id ||
                            emp.partAStatus === "Pending" ||
                            emp.partBStatus === "Generated"
                          }
                          className="text-blue-600 hover:text-blue-800 disabled:text-gray-300 disabled:cursor-not-allowed text-xs font-semibold w-20 text-left"
                        >
                          {processingId === emp.id ? (
                            <Loader2 className="animate-spin inline-block" />
                          ) : (
                            "GENERATE B"
                          )}
                        </button>
                        <button
                          onClick={() => handlePublish(emp.id)}
                          disabled={
                            processingId === emp.id ||
                            emp.partBStatus === "Pending" ||
                            emp.finalStatus === "Published"
                          }
                          className="text-green-600 hover:text-green-800 disabled:text-gray-300 disabled:cursor-not-allowed text-xs font-semibold w-16 text-left"
                        >
                          {processingId === emp.id ? (
                            <Loader2 className="animate-spin inline-block" />
                          ) : (
                            "PUBLISH"
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(emp.id, emp.name)}
                          disabled={
                            processingId === emp.id ||
                            emp.finalStatus !== "Published"
                          }
                          className="text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed"
                          title="Download"
                        >
                          {processingId === emp.id ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Download size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE VIEW ---
  if (user?.role === "Employee" && employeeViewData) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Form 16</h1>
            <p className="text-gray-600 mt-1">Download your tax certificate.</p>
          </div>
          <select
            value={selectedFy}
            onChange={(e) => setSelectedFy(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm font-semibold bg-white"
          >
            {financialYears.map((fy) => (
              <option key={fy} value={fy}>{`FY ${fy}`}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-8 border text-center">
          {employeeViewData.status === "Published" &&
          employeeViewData.downloadId ? (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                Your Form 16 is Ready!
              </h2>
              <p className="mt-2 text-gray-600">
                Your tax certificate for FY {selectedFy} is available for
                download.
              </p>
              <button
                onClick={() =>
                  handleDownload(
                    employeeViewData.downloadId!,
                    user.name ?? "User",
                  )
                }
                disabled={processingId === employeeViewData.downloadId}
                className="mt-6 flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processingId === employeeViewData.downloadId ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download size={20} />
                )}
                {processingId === employeeViewData.downloadId
                  ? "Preparing..."
                  : "Download Form 16"}
              </button>
            </>
          ) : (
            <>
              <FileText className="mx-auto h-16 w-16 text-gray-400" />
              <h2 className="mt-4 text-xl font-semibold text-gray-800">
                Form 16 Not Yet Available
              </h2>
              <p className="mt-2 text-gray-600">
                Your tax certificate for FY {selectedFy} has not been published
                yet. Please check back later.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      You do not have permission to view this page or data is unavailable.
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        type={modalState.type}
        confirmText="OK"
      >
        <p>{modalState.message}</p>
      </Modal>
    </div>
  );
};

export default Form16Page;
