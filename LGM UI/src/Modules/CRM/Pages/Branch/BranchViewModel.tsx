
import React from "react";
import type { Branch } from "./Services/types";
import {
  FaTimes,
  FaBuilding,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaPhoneAlt,
  FaHashtag,
} from "react-icons/fa";

interface BranchViewModalProps {
  branch: Branch;
  onClose: () => void;
}

const BranchViewModal: React.FC<BranchViewModalProps> = ({
  branch,
  onClose,
}) => {
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
      className={`flex flex-col border-b border-gray-100 py-3 ${
        fullWidth ? "col-span-full" : ""
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="break-words text-sm font-semibold text-[#0b2c52]">
        {value !== null && value !== undefined && value !== ""
          ? value
          : "N/A"}
      </span>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
  }: {
    icon: React.ElementType;
    title: string;
  }) => (
    <div className="mb-4 mt-2 flex items-center gap-2">
      <Icon className="text-lg text-[#0b2c52]" />
      <h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase tracking-tight text-[#0b2c52]">
        {title}
      </h3>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white shadow-inner">
              <FaBuilding className="text-3xl text-[#0b2c52]" />
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight sm:text-2xl">
                {branch.branchName || "Branch Details"}
              </h2>
              <div className="mt-1 flex flex-wrap gap-4">
                <p className="font-mono text-xs tracking-widest text-blue-200">
                  Branch Code: {branch.branchCode || "N/A"}
                </p>
                <p className="font-mono text-xs tracking-widest text-blue-200">
                  Company ID: {branch.companyId}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 transition-transform duration-300 hover:rotate-90"
            title="Close"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Branch Information */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={FaInfoCircle}
                title="Branch Information"
              />

              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <DataItem
                  label="Branch ID"
                  value={branch.branchId}
                />
                <DataItem
                  label="Company ID"
                  value={branch.companyId}
                />
                <DataItem
                  label="Branch Code"
                  value={branch.branchCode}
                />
                <DataItem
                  label="Branch Name"
                  value={branch.branchName}
                />
                <DataItem
                  label="Status"
                  value={branch.isActive ? "Active" : "Inactive"}
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    branch.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {branch.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
            </section>

            {/* Contact Information */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={FaPhoneAlt}
                title="Contact Information"
              />

              <div className="grid grid-cols-1">
                <DataItem
                  label="Contact Number"
                  value={branch.contact}
                />
              </div>
            </section>

            {/* Address */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
              <SectionHeader
                icon={FaMapMarkerAlt}
                title="Branch Address"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <DataItem
                  label="Address"
                  value={branch.address}
                  fullWidth
                />
              </div>
            </section>

            {/* Reference */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
              <SectionHeader
                icon={FaHashtag}
                title="Branch Reference"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2">
                <DataItem
                  label="Branch Code"
                  value={branch.branchCode}
                />
                <DataItem
                  label="Company ID"
                  value={branch.companyId}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-gray-400">
            Official Branch Details
          </p>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#f07837] px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-black"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchViewModal;
