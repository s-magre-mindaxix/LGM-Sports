import React from "react";
import type { InstallationReport } from "./Services/types";
import {
  FaTimes,
  FaBuilding,
  FaUserFriends,
  FaInfoCircle,
} from "react-icons/fa";

interface ViewModalProps {
  report: InstallationReport;
  onClose: () => void;
}

const InstallationReportViewModal: React.FC<ViewModalProps> = ({
  report,
  onClose,
}) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const DataItem = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value?: string | null;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex flex-col border-b border-gray-100 py-3 ${fullWidth ? "col-span-full" : ""}`}
    >
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#154068] wrap-break-word whitespace-pre-wrap leading-relaxed">
        {value || "N/A"}
      </span>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-3 mb-5 mt-8 first:mt-0">
      <div className="bg-[#f07837] p-2 rounded-lg">
        <Icon className="text-white text-base" />
      </div>
      <h3 className="text-sm font-extrabold text-[#154068] uppercase tracking-wider grow border-b border-gray-200 pb-1">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 backdrop-transparent-sm p-4">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header UI */}
        <div className="bg-[#f07837] text-white px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight">
                Installation Report View
              </h2>
            </div>
            <div className="h-8 w-px bg-white/20 hidden md:block"></div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-8 bg-gray-50/50">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <SectionHeader icon={FaBuilding} title="Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <DataItem label="Company Name" value={report.companyName} />
                <DataItem label="Customer Name" value={report.customerName} />
                <DataItem
                  label="Customer Address"
                  value={report.customerAddress}
                  fullWidth
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <SectionHeader
                icon={FaInfoCircle}
                title="Installation Information"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                <DataItem
                  label="Install Date"
                  value={formatDate(report.installationDate)}
                />
                <DataItem label="Service Location" value={report.place} />
                <DataItem
                  label="Product & Equipment Info"
                  value={report.productInformation}
                  fullWidth
                />
                <DataItem
                  label="Inspection Summary"
                  value={report.inspectionSummary}
                  fullWidth
                />
                <DataItem
                  label="Customer Feedback / Notes"
                  value={report.customerNotes}
                  fullWidth
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <SectionHeader icon={FaUserFriends} title="Authorized Contacts" />
              {report.contacts?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                  {report.contacts.map((contact, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-4 bg-gray-50 rounded-xl border-l-4 border-[#154068] hover:shadow-md transition-shadow"
                    >
                      <span className="text-[18px] font-bold text-[#154068]">
                        {contact.name}
                      </span>
                      <span className="text-[12px] text-gray-500 font-semibold uppercase mt-1">
                        {contact.designation}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic py-4">
                  No contact information available for this record.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallationReportViewModal;
