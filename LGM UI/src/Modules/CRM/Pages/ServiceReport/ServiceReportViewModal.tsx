// import React from "react";
// import type { ServiceReport } from "./Serivces/types";
// import { API_ENDPOINTS } from "../../../../API/apiConfig";
// import {
//   FaTimes,
//   FaUser,
//   FaClipboardList,
//   FaFileUpload,
//   FaFileAlt,
//   FaMicrochip,
//   FaHashtag,
//   FaEye,
// } from "react-icons/fa";
// import { buttonStyles } from "../../../../Components/Common/buttonStyles";

// // Constant for File URL (Same logic as Vendor modal)
// const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

// interface ViewModalProps {
//   report: ServiceReport;
//   onClose: () => void;
// }

// const ServiceReportViewModal: React.FC<ViewModalProps> = ({
//   report,
//   onClose,
// }) => {
//   const formatDate = (dateStr: string) => {
//     if (!dateStr) return "N/A";
//     const d = new Date(dateStr);
//     return d.toLocaleString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   // Helper to determine if file is an image
//   const isImage = (filename: string) => {
//     return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
//   };

//   const renderUploadedFiles = (uploadedFiles?: string) => {
//     if (!uploadedFiles)
//       return <p className="text-xs text-gray-400 italic">No files attached.</p>;

//     // Support both semicolon and comma separation
//     const fileList = uploadedFiles.split(/[;,]/).filter(Boolean);

//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
//         {fileList.map((file, index) => {
//           const fullUrl = `${FILE_BASE_URL}${file.startsWith("/") ? "" : "/"}${file}`;
//           const fileName = file.split(/[\\/]/).pop() || "File";
//           const imageFile = isImage(fileName);

//           return (
//             <div
//               key={index}
//               className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
//             >
//               <div className="aspect-square flex items-center justify-center bg-gray-50">
//                 {imageFile ? (
//                   <img
//                     src={fullUrl}
//                     alt="Preview"
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <FaFileAlt className="text-gray-300 text-3xl" />
//                 )}
//               </div>
//               <div className="p-2 bg-white border-t border-gray-50">
//                 <p className="text-[9px] font-bold text-gray-500 truncate mb-1">
//                   {fileName}
//                 </p>
//                 <a
//                   href={fullUrl}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="flex items-center justify-center gap-1.5 w-full py-1 bg-[#f07837] text-white text-[9px] font-bold uppercase rounded hover:bg-blue-800 transition-colors"
//                 >
//                   <FaEye size={8} /> View
//                 </a>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   };

//   // Consistent with VendorViewModal DataItem
//   const DataItem = ({
//     label,
//     value,
//     fullWidth = false,
//   }: {
//     label: string;
//     value?: string | number | null;
//     fullWidth?: boolean;
//   }) => (
//     <div
//       className={`flex flex-col border-b border-gray-100 py-2.5 ${fullWidth ? "col-span-full" : ""}`}
//     >
//       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//         {label}
//       </span>
//       <span className="text-sm font-semibold text-[#154068] wrap-break-word whitespace-pre-wrap leading-relaxed">
//         {value || "N/A"}
//       </span>
//     </div>
//   );

//   // Consistent with VendorViewModal SectionHeader
//   const SectionHeader = ({ icon: Icon, title }: any) => (
//     <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
//       <Icon className="text-[#154068] text-lg" />
//       <h3 className="text-sm font-extrabold text-[#154068] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">
//         {title}
//       </h3>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 backdrop-transparent-sm p-4">
//       <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
//         {/* Header - Styled like Vendor Header */}
//         <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-lg">
//           <div className="flex items-center gap-4">
//             <div className="bg-white/10 p-2 rounded-lg">
//               <FaClipboardList className="text-2xl text-blue-400" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold ">
//                 Service Report Analysis
//               </h2>
//               <p className="text-xs text-blue-200 font-mono tracking-widest">
//                 {report.customerName}
//               </p>
//             </div>
//             <div className="h-8 w-px bg-white/20 ml-4 hidden md:block"></div>
//           </div>
//           <button
//             onClick={onClose}
//             className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full"
//           >
//             <FaTimes className="text-2xl" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="overflow-y-auto p-8 bg-gray-50/30">
//           <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
//             {/* Left Column: Basic Info & Summaries */}
//             <div className="xl:col-span-8 space-y-8">
//               <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
//                 <SectionHeader icon={FaUser} title="Primary Information" />
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
//                   <DataItem label="Customer Name" value={report.customerName} />
//                   <DataItem label="Product Model" value={report.productName} />
//                   <DataItem
//                     label="Report Generated On"
//                     value={formatDate(report.date)}
//                   />
//                   <DataItem label="Serial Number" value={report.serialNumber} />
//                 </div>
//               </section>

//               <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
//                 <SectionHeader
//                   icon={FaClipboardList}
//                   title="Detailed Observations"
//                 />
//                 <div className="grid grid-cols-1 gap-y-2">
//                   <DataItem
//                     label="Inspection Summary"
//                     value={report.inspectionSummary}
//                     fullWidth
//                   />
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
//                     <DataItem
//                       label="Software Check"
//                       value={report.softwareCheck}
//                     />
//                     <DataItem label="Port Testing" value={report.portTesting} />
//                     <DataItem
//                       label="Firmware Check"
//                       value={report.firmwareCheck}
//                     />
//                     <DataItem
//                       label="Physical Inspection"
//                       value={report.physicalInspection}
//                     />
//                   </div>
//                 </div>
//               </section>

//               <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
//                 <SectionHeader
//                   icon={FaMicrochip}
//                   title="Technical Resolution"
//                 />
//                 <div className="space-y-2">
//                   <DataItem
//                     label="IC Replacement"
//                     value={report.icReplacement}
//                     fullWidth
//                   />
//                   <DataItem
//                     label="Final Engineer Comments"
//                     value={report.finalComments}
//                     fullWidth
//                   />
//                 </div>
//               </section>
//             </div>

//             {/* Right Column: Attachments (Mirroring Vendor's right-side sections) */}
//             <div className="xl:col-span-4">
//               <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-0">
//                 <SectionHeader icon={FaFileUpload} title="Technical Evidence" />
//                 <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 italic">
//                   Photos & Documents uploaded during service
//                 </p>
//                 {renderUploadedFiles(report.uploadedFiles)}
//               </section>
//             </div>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="bg-white border-t border-gray-100 p-5 flex justify-end items-center gap-4">
//           <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto flex items-center gap-2">
//             <FaHashtag /> Internal Service Document
//           </p>
//           <button
//             onClick={onClose}
//             className={buttonStyles.cancel}
//           >
//             Close View
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServiceReportViewModal;


import React from "react";
import type { ServiceReport } from "./Serivces/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  FaTimes,
  FaUser,
  FaClipboardList,
  FaFileUpload,
  FaFileAlt,
  FaMicrochip,
  FaHashtag,
  FaEye,
  FaBoxOpen,
  FaTools,
} from "react-icons/fa";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
  report: ServiceReport;
  onClose: () => void;
}

const ServiceReportViewModal: React.FC<ViewModalProps> = ({
  report,
  onClose,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  };

  const renderUploadedFiles = (uploadedFiles?: string) => {
    if (!uploadedFiles)
      return <p className="text-xs text-gray-400 italic">No files attached.</p>;

    const fileList = uploadedFiles.split(/[;,]/).filter(Boolean);

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        {fileList.map((file, index) => {
          const fullUrl = `${FILE_BASE_URL}${file.startsWith("/") ? "" : "/"}${file}`;
          const fileName = file.split(/[\\/]/).pop() || "File";
          const imageFile = isImage(fileName);

          return (
            <div
              key={index}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="aspect-square flex items-center justify-center bg-gray-50">
                {imageFile ? (
                  <img src={fullUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <FaFileAlt className="text-gray-300 text-2xl" />
                )}
              </div>
              <div className="p-2 border-t border-gray-50">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 w-full py-1 bg-[#f07837] text-white text-[8px] font-bold uppercase rounded"
                >
                  <FaEye size={8} /> View
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DataItem = ({ label, value, fullWidth = false }: { label: string; value?: string | number | null; fullWidth?: boolean; }) => (
    <div className={`flex flex-col border-b border-gray-100 py-2.5 ${fullWidth ? "col-span-full" : ""}`}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-semibold text-[#154068] whitespace-pre-wrap leading-relaxed">
        {value || "N/A"}
      </span>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-2 mb-4 mt-8 first:mt-0">
      <Icon className="text-[#154068] text-lg" />
      <h3 className="text-sm font-extrabold text-[#154068] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#f07837] text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <FaClipboardList className="text-3xl text-blue-400" />
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight">Service Analysis Report</h2>
              <p className="text-xs text-blue-200 font-mono tracking-widest">ID: SR-{report.id.toString().padStart(4, '0')}</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Primary Info */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader icon={FaUser} title="Customer & Header Info" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                  <DataItem label="Customer Name" value={report.customerName} />
                  <DataItem label="Main Model Reference" value={report.productName || report.accessoryName} />
                  <DataItem label="Report Date" value={formatDate(report.date)} />
                  <DataItem label="Header Serial Number" value={report.serialNumber} />
                </div>
              </section>

              {/* NEW SECTION: ITEMS LIST */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <SectionHeader icon={FaBoxOpen} title="Service Items details" />
                <div className="mt-4 border rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase">Item / Description</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">HSN</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-center">Qty</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase text-right">Final Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.items && report.items.length > 0 ? (
                        report.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className={`w-fit px-1.5 py-0.5 rounded text-[8px] font-black uppercase mb-1 ${item.itemType === 'Product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                  {item.itemType}
                                </span>
                                <span className="text-xs font-semibold text-[#154068]">{item.description}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 text-center font-mono">{item.hsnSacCode || '—'}</td>
                            <td className="px-4 py-3 text-xs font-bold text-[#154068] text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm font-bold text-[#154068] text-right font-mono">
                              ₹ {item.finalPrice?.toLocaleString() || '0.00'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-xs text-gray-400 italic">No specific items logged in table.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Checklist Area */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader icon={FaTools} title="Detailed Observations" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                   <DataItem label="Inspection Summary" value={report.inspectionSummary} fullWidth />
                   <DataItem label="Software Check" value={report.softwareCheck} />
                   <DataItem label="Port Testing" value={report.portTesting} />
                   <DataItem label="Firmware Check" value={report.firmwareCheck} />
                   <DataItem label="Physical Inspection" value={report.physicalInspection} />
                </div>
              </section>

              {/* Conclusion */}
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <SectionHeader icon={FaMicrochip} title="Final Resolution" />
                <div className="space-y-4">
                  <DataItem label="IC Replacement Details" value={report.icReplacement} fullWidth />
                  <DataItem label="Engineer's Final Comments" value={report.finalComments} fullWidth />
                  <DataItem label="Customer Reported Problem" value={report.customerReported} fullWidth />
                </div>
              </section>
            </div>

            {/* Sidebar Area */}
            <div className="lg:col-span-4 space-y-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-4">
                <SectionHeader icon={FaFileUpload} title="Technical Evidence" />
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 italic">Attachments & Photos</p>
                {renderUploadedFiles(report.uploadedFiles)}
              </section>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t p-4 flex justify-between items-center px-8">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <FaHashtag /> System Generated Service Report
           </span>
           <button onClick={onClose} className={buttonStyles.cancel}>Close Analysis View</button>
        </div>
      </div>
    </div>
  );
};

export default ServiceReportViewModal;