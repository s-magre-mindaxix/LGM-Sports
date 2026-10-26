import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Loader2,
  User,
  FileText,
  Landmark,
  FileUp,
  Download,
  Paperclip,
  MapPin,
  GraduationCap,
  Briefcase,
  Building,
} from "lucide-react";
import {
  getEmployeeFullDetails,
  type EmployeeFullDetail,
  type ViewDocument,
} from "../../../CRM/Pages/Employee/Services/EmployeeService";
import { downloadDocument } from "../../../CRM/Pages/Employee/Services/EmployeeDocumentService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

interface ViewEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number | null;
}

const SectionHeader: React.FC<{ icon: React.ElementType; title: string }> = ({
  icon: Icon,
  title,
}) => (
  <div className="flex items-center gap-2 pb-2 border-b border-gray-100 mb-4 mt-6 first:mt-0">
    <div className="bg-[#133561] p-1.5 rounded-lg text-white">
      <Icon size={16} />
    </div>
    <h3 className="font-bold text-[#133561] uppercase text-xs tracking-wider">
      {title}
    </h3>
  </div>
);

const DetailItem: React.FC<{
  label: string;
  value?: string | number | null;
}> = ({ label, value }) => (
  <div className="bg-gray-50/50 p-2 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
      {label}
    </p>
    <p className="text-sm font-semibold text-[#133561] truncate">
      {value || "—"}
    </p>
  </div>
);

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
  isOpen,
  onClose,
  employeeId,
}) => {
  const [employee, setEmployee] = useState<EmployeeFullDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

  useEffect(() => {
    if (isOpen && employeeId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await getEmployeeFullDetails(employeeId);
          setEmployee(data);
        } catch {
          toast.error("Failed to load employee details.");
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, employeeId, onClose]);

  const handleDownloadDocument = async (doc: ViewDocument) => {
  try {
    const blob = await downloadDocument(doc.id);

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // Get extension from the uploaded file path
    const extension = doc.filePath
      ? doc.filePath.substring(doc.filePath.lastIndexOf("."))
      : "";

    // If document name already contains extension,
    // keep it exactly as it is.
    const hasExtension =
      doc.documentName.includes(".") &&
      doc.documentName.lastIndexOf(".") >
        doc.documentName.lastIndexOf(" ");

    const downloadFileName = hasExtension
      ? doc.documentName
      : `${doc.documentName}${extension}`;

    link.download = downloadFileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Download failed.");
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Section */}
        <div className="bg-[#133561] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl border-4 border-white/20 overflow-hidden bg-white shadow-lg">
              {employee?.photoPath ? (
                <img
                  src={`${FILE_BASE_URL}${employee.photoPath}`}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-[#133561]">
                  <User size={40} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {employee?.firstName} {employee?.lastName}
              </h2>
              <p className="opacity-80 text-sm font-medium">
                {employee?.designationName} • {employee?.employeeCode}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${employee?.isActive ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"}`}
              >
                {employee?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <div className="overflow-y-auto p-8 grid grid-cols-12 gap-8">
          {isLoading ? (
            <div className="col-span-full flex flex-col justify-center items-center h-96 text-blue-600">
              <Loader2 className="animate-spin mb-2" size={40} />
              <p className="font-bold">Loading Employee Profile...</p>
            </div>
          ) : employee ? (
            <>
              {/* LEFT COLUMN: Basic & Statutory */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div>
                  <SectionHeader icon={Building} title="Organization" />
                  <div className="grid grid-cols-1 gap-3">
                    <DetailItem label="Company" value={employee.companyName} />
                    <DetailItem
                      label="Department"
                      value={employee.departmentName}
                    />
                    <DetailItem
                      label="Work Location"
                      value={employee.workLocationName}
                    />
                    <DetailItem
                      label="Reporting To"
                      value={employee.reportingToName}
                    />
                  </div>
                </div>

                <div>
                  <SectionHeader icon={FileText} title="Statutory Info" />
                  <div className="grid grid-cols-1 gap-3">
                    <DetailItem
                      label="Aadhaar Number"
                      value={employee.statutoryDetails?.aadhaarNumber}
                    />
                    <DetailItem
                      label="PAN Number"
                      value={employee.statutoryDetails?.panNumber}
                    />
                    <DetailItem
                      label="UAN Number"
                      value={employee.statutoryDetails?.uanNo}
                    />
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: Addresses & Contacts */}
              <div className="col-span-12 lg:col-span-4 space-y-6 border-x border-gray-100 px-4">
                <div>
                  <SectionHeader icon={MapPin} title="Current Address" />
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {employee.curFlatNo}, {employee.curPremisesName},{" "}
                    {employee.curRoadName},<br />
                    {employee.curLocality}, {employee.curTownDistrict} -{" "}
                    {employee.curPinNo}
                  </p>
                  <div className="mt-4 space-y-2">
                    <DetailItem
                      label="Primary Mobile"
                      value={employee.mobileNumber}
                    />
                    <DetailItem label="Email" value={employee.emailAddress} />
                  </div>
                </div>

                <div>
                  <SectionHeader icon={Landmark} title="Bank Account" />
                  {employee.bankDetails ? (
                    <div className="space-y-3">
                      <DetailItem
                        label="Account Holder"
                        value={employee.bankDetails.accountHolderName}
                      />
                      <DetailItem
                        label="Bank Name"
                        value={employee.bankDetails.bankName}
                      />
                      <DetailItem
                        label="Account No."
                        value={employee.bankDetails.accountNumber}
                      />
                      <DetailItem
                        label="IFSC Code"
                        value={employee.bankDetails.ifscCode}
                      />
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-400">
                      No bank details found.
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Exp, Qual & Docs */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div>
                  <SectionHeader icon={GraduationCap} title="Qualifications" />
                  <div className="space-y-3">
                    {employee.qualifications?.map((q, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-blue-500 pl-3 py-1"
                      >
                        <p className="text-sm font-bold text-gray-800">
                          {q.degree}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {q.university} • {q.passingYear}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeader icon={Briefcase} title="Past Experience" />
                  <div className="space-y-3">
                    {employee.experiences?.map((ex, i) => (
                      <div
                        key={i}
                        className="border-l-2 border-green-500 pl-3 py-1"
                      >
                        <p className="text-sm font-bold text-gray-800">
                          {ex.designation}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {ex.companyName} • {ex.location}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <SectionHeader icon={FileUp} title="Attachments" />
                  <div className="space-y-2">
                    {employee.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip size={14} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-600 truncate">
                            {doc.documentName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;

// import React, { useState, useEffect } from "react";
// import { toast } from "sonner";
// import {
//   X,
//   Loader2,
//   User,
//   FileText,
//   Landmark,
//   FileUp,
//   Download,
//   Paperclip,
// } from "lucide-react";
// import {
//   getEmployeeFullDetails,
//   type EmployeeFullDetail,
//   type ViewDocument,
// } from "../../../CRM/Pages/Employee/Services/EmployeeService";
// import { downloadDocument } from "../../../CRM/Pages/Employee/Services/EmployeeDocumentService";

// interface ViewEmployeeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   employeeId: number | null;
// }

// const DetailItem: React.FC<{ label: string; value?: string | null }> = ({
//   label,
//   value,
// }) => (
//   <div>
//     <p className="text-xs font-medium text-gray-500">{label}</p>
//     <p className="text-sm text-gray-800">{value || "N/A"}</p>
//   </div>
// );

// const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({
//   isOpen,
//   onClose,
//   employeeId,
// }) => {
//   const [employee, setEmployee] = useState<EmployeeFullDetail | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen && employeeId) {
//       const fetchData = async () => {
//         setIsLoading(true);
//         try {
//           const data = await getEmployeeFullDetails(employeeId);
//           setEmployee(data);
//         } catch {
//           toast.error("Failed to load employee details.");
//           onClose();
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchData();
//     }
//   }, [isOpen, employeeId, onClose]);

//   const handleDownloadDocument = async (doc: ViewDocument) => {
//     try {
//       const blob = await downloadDocument(doc.id);
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       const extension = doc.filePath.split(".").pop();
//       const downloadFileName = extension
//         ? `${doc.documentName}.${extension}`
//         : doc.documentName;
//       link.setAttribute("download", downloadFileName);
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode?.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error: unknown) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to download document.";
//       toast.error(msg);
//     }
//   };

//   const formatFullName = (
//     firstName: string,
//     middleName: string | undefined | null,
//     lastName: string,
//   ) => {
//     return [firstName, middleName, lastName]
//       .filter((part) => part && part !== "null" && part.trim() !== "")
//       .join(" ");
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
//         <div className="flex justify-between items-center border-b p-4">
//           <h2 className="text-xl font-semibold text-gray-800">
//             Employee Details
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-1 rounded-full hover:bg-gray-100"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="overflow-y-auto p-6 space-y-6">
//           {isLoading ? (
//             <div className="flex justify-center items-center h-96">
//               <Loader2 className="animate-spin" size={32} />
//             </div>
//           ) : employee ? (
//             <>
//               {/* Personal Details Section */}
//               <div className="border rounded-lg p-4">
//                 <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
//                   <User size={18} /> Personal Information
//                 </h3>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <div className="col-span-full flex items-center gap-4">
//                     <div className="text-lg font-bold">
//                       {formatFullName(
//                         employee.firstName,
//                         employee.middleName,
//                         employee.lastName,
//                       )}
//                     </div>
//                     <span
//                       className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                         employee.isActive
//                           ? "bg-green-100 text-green-800"
//                           : "bg-red-100 text-red-800"
//                       }`}
//                     >
//                       {employee.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                   <DetailItem
//                     label="Employee Code"
//                     value={employee.employeeCode}
//                   />
//                   <DetailItem
//                     label="Email Address"
//                     value={employee.emailAddress}
//                   />
//                   <DetailItem
//                     label="Mobile Number"
//                     value={employee.mobileNumber}
//                   />
//                   <DetailItem
//                     label="Date of Birth"
//                     value={
//                       employee.dateOfBirth
//                         ? new Date(employee.dateOfBirth).toLocaleDateString()
//                         : "N/A"
//                     }
//                   />
//                   <DetailItem
//                     label="Date of Joining"
//                     value={
//                       employee.dateOfJoining
//                         ? new Date(employee.dateOfJoining).toLocaleDateString()
//                         : "N/A"
//                     }
//                   />
//                   <DetailItem label="Gender" value={employee.gender} />
//                   <DetailItem
//                     label="Work Location"
//                     value={employee.workLocationName}
//                   />
//                   <DetailItem
//                     label="Department"
//                     value={employee.departmentName}
//                   />
//                   <DetailItem
//                     label="Designation"
//                     value={employee.designationName}
//                   />
//                   <DetailItem
//                     label="Reporting To"
//                     value={employee.reportingToName}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Statutory Details Section */}
//                 <div className="border rounded-lg p-4">
//                   <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
//                     <FileText size={18} /> Statutory Details
//                   </h3>
//                   {employee.statutoryDetails ? (
//                     <div className="space-y-3">
//                       <DetailItem
//                         label="Aadhaar Number"
//                         value={employee.statutoryDetails.aadhaarNumber}
//                       />
//                       <DetailItem
//                         label="PAN Number"
//                         value={employee.statutoryDetails.panNumber}
//                       />
//                       <DetailItem
//                         label="UAN Number"
//                         value={employee.statutoryDetails.uanNo}
//                       />
//                       <DetailItem
//                         label="PF Number"
//                         value={employee.statutoryDetails.pfNo}
//                       />
//                       <DetailItem
//                         label="ESI Number"
//                         value={employee.statutoryDetails.esiNo}
//                       />
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">Not provided.</p>
//                   )}
//                 </div>

//                 {/* Bank Details Section */}
//                 <div className="border rounded-lg p-4">
//                   <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
//                     <Landmark size={18} /> Bank Details
//                   </h3>
//                   {employee.bankDetails ? (
//                     <div className="space-y-3">
//                       <DetailItem
//                         label="Beneficiary Name"
//                         value={employee.bankDetails.accountHolderName}
//                       />
//                       <DetailItem
//                         label="Bank Name"
//                         value={employee.bankDetails.bankName}
//                       />
//                       <DetailItem
//                         label="Account Number"
//                         value={employee.bankDetails.accountNumber}
//                       />
//                       <DetailItem
//                         label="IFSC Code"
//                         value={employee.bankDetails.ifscCode}
//                       />
//                     </div>
//                   ) : (
//                     <p className="text-sm text-gray-500">Not provided.</p>
//                   )}
//                 </div>
//               </div>

//               {/* Documents Section */}
//               <div className="border rounded-lg p-4">
//                 <h3 className="flex items-center gap-2 font-semibold text-gray-700 mb-4">
//                   <FileUp size={18} /> Documents
//                 </h3>
//                 {employee.documents.length > 0 ? (
//                   <ul className="space-y-2">
//                     {employee.documents.map((doc) => (
//                       <li
//                         key={doc.id}
//                         className="flex justify-between items-center p-2 border rounded-md bg-gray-50"
//                       >
//                         <div className="flex items-center gap-3">
//                           <Paperclip className="h-5 w-5 text-gray-500" />
//                           <p className="font-medium text-gray-800">
//                             {doc.documentName}
//                           </p>
//                         </div>
//                         <button
//                           onClick={() => handleDownloadDocument(doc)}
//                           className="p-2 text-gray-500 hover:text-blue-600"
//                           title="Download"
//                         >
//                           <Download size={18} />
//                         </button>
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     No documents uploaded.
//                   </p>
//                 )}
//               </div>
//             </>
//           ) : (
//             <p className="text-center text-gray-500 py-10">
//               Employee details could not be loaded.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewEmployeeModal;
