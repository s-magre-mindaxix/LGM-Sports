import React from "react";
import type { FaultReport } from "./Services/types";
import {
  FaTimes,
  FaUser,
  FaMicrochip,
  FaCogs,
  FaTools,
  FaCheckCircle,
  FaTimesCircle,
  FaCommentDots,
  FaHashtag,
} from "react-icons/fa";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { FaFileAlt, FaEye, FaFileUpload } from "react-icons/fa";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
  report: FaultReport;
  onClose: () => void;
}

const FaultReportViewModal: React.FC<ViewModalProps> = ({
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

  const DataItem = ({
    label,
    value,
    fullWidth = false,
  }: {
    label: string;
    value?: string | number | null;
    fullWidth?: boolean;
  }) => (
    <div
      className={`flex flex-col border-b border-gray-100 py-2.5 ${fullWidth ? "col-span-full" : ""}`}
    >
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#154068] wrap-break-word whitespace-pre-wrap leading-relaxed">
        {value || "N/A"}
      </span>
    </div>
  );

  const BooleanItem = ({ label, value }: { label: string; value: boolean }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 col-span-full sm:col-span-1">
      <span className="text-sm font-semibold text-gray-600">{label}</span>
      {value ? (
        <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
          <FaCheckCircle /> Yes
        </span>
      ) : (
        <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
          <FaTimesCircle /> No
        </span>
      )}
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-2 mb-2 mt-8 first:mt-0">
      <Icon className="text-[#154068] text-lg" />
      <h3 className="text-sm font-extrabold text-[#154068] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">
        {title}
      </h3>
    </div>
  );

  const isImage = (filename: string) => {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
};

const renderUploadedFiles = (uploadedFiles?: string) => {
  if (!uploadedFiles)
    return <p className="text-xs text-gray-400 italic">No files attached.</p>;

  const fileList = uploadedFiles.split(/[;,]/).filter(Boolean);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-3 mt-3">
      {fileList.map((file, index) => {
        const fullUrl = `${FILE_BASE_URL}${file.startsWith("/") ? "" : "/"}${file}`;
        const fileName = file.split(/[\\/]/).pop() || "File";
        const imageFile = isImage(fileName);

        return (
          <div
            key={index}
          className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
          <div className="h-24 w-full flex items-center justify-center bg-gray-50">
              {imageFile ? (
                <img src={fullUrl} className="w-full h-full object-cover" />
              ) : (
                <FaFileAlt className="text-gray-300 text-2xl" />
              )}
            </div>

            <div className="p-2 border-t border-gray-50">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
               className="flex items-center justify-center gap-1 w-full py-1 bg-[#f07837] text-white text-[9px] font-bold uppercase rounded"
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

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 backdrop-transparent-sm p-4">
      <div className="bg-white w-full max-w-5xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-2 rounded-lg">
              <FaTools className="text-2xl text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold ">
                Fault Report Analysis
              </h2>
              <p className="text-xs text-blue-200 font-mono tracking-widest">
                {report.device} | {report.serialNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 bg-gray-50/30">
          <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <SectionHeader icon={FaUser} title="Primary Information" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-2">
              <DataItem label="Customer Name" value={report.customerName} />
              <DataItem label="Device Model" value={report.device} />
              <DataItem label="Serial Number" value={report.serialNumber} />
              <DataItem
                label="Report Date"
                value={formatDate(report.reportDate)}
              />
            </div>
          </section>

          <section className="bg-white p-6 mt-6 rounded-xl border border-gray-100 shadow-sm">
            <SectionHeader
              icon={FaMicrochip}
              title="Hardware & Power Details"
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-2">
              <DataItem label="Power Source" value={report.powerSource} />
              <DataItem label="Voltage" value={report.voltage} />
              <DataItem
                label="Internal Battery"
                value={report.internalBattery}
              />
              <DataItem label="GPS Battery" value={report.gpsBattery} />
              <DataItem
                label="Modules Connected"
                value={report.modulesConnected}
              />
              <DataItem
                label="Modules Firmware"
                value={report.modulesFirmware}
              />
              <DataItem
                label="Cables Connected"
                value={report.cabelsConnected}
              />
              <DataItem label="LED Status" value={report.led} />
            </div>
          </section>

          <section className="bg-white p-6 mt-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionHeader icon={FaCogs} title="Software & Configuration" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <DataItem label="Software" value={report.software} />
                  <DataItem label="Version" value={report.softwareVersion} />
                  <DataItem label="Firmware" value={report.firmware} />
                  <DataItem label="Special SW" value={report.specialSoftware} />
                </div>
                <DataItem
                  label="Configuration"
                  value={report.configuration}
                  fullWidth
                />
              </div>
              <div>
                <SectionHeader icon={FaTools} title="Diagnostic Outcomes" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <BooleanItem
                    label="Cold Started"
                    value={report.coldStarted}
                  />
                  <BooleanItem
                    label="Default Reset"
                    value={report.defaultReset}
                  />
                  <BooleanItem
                    label="Settings Checked"
                    value={report.settingChecked}
                  />
                  <BooleanItem
                    label="Firmware Updated"
                    value={report.firmwareUpdated}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 mt-6 rounded-xl border border-gray-100 shadow-sm">
            <SectionHeader icon={FaCommentDots} title="Notes & Comments" />
            <div className="space-y-2">
              <DataItem
                label="Technician Notes"
                value={report.notes}
                fullWidth
              />
              <DataItem
                label="Final Comments"
                value={report.comments}
                fullWidth
              />
            </div>
          </section>

          <section className="bg-white p-6 mt-6 rounded-xl border border-gray-100 shadow-sm">
          <SectionHeader icon={FaFileUpload} title="Attachments / Images" />
          {renderUploadedFiles(report.uploadedFiles)}
        </section>
        </div>

        <div className="bg-white border-t border-gray-100 p-5 flex justify-end items-center gap-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto flex items-center gap-2">
            <FaHashtag /> Internal Fault Document
          </p>
          <button
            onClick={onClose}
            className={buttonStyles.cancel}
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaultReportViewModal;
