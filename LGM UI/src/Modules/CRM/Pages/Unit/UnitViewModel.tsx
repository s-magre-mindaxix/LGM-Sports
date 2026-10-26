
import React from "react";
import type { Unit } from "./Services/types";
import {
  FaTimes,
  FaRuler,
  FaInfoCircle,
  FaHashtag,
  FaCheckCircle,
} from "react-icons/fa";

interface UnitViewModalProps {
  unit: Unit | Record<string, any> | null | undefined;
  onClose: () => void;
}

const UnitViewModal: React.FC<UnitViewModalProps> = ({
  unit,
  onClose,
}) => {
  if (!unit || typeof unit !== "object") {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-xl">
          <p className="mb-4 text-gray-700">
            Unit details are not available.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#f07837] px-6 py-2 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Supports frontend camelCase and backend PascalCase properties.
  const item = unit as Record<string, any>;

  const unitId = item.unitId ?? item.UnitId ?? 0;
  const code =
    item.code ?? item.Code ?? item.unitCode ?? item.UnitCode ?? "";
  const name =
    item.name ?? item.Name ?? item.unitName ?? item.UnitName ?? "";

  const decimalAllowed =
    item.decimalAllowed ?? item.DecimalAllowed ?? false;
  const isActive = item.isActive ?? item.IsActive ?? true;
  const isDeleted = item.isDeleted ?? item.IsDeleted ?? false;

  const DataItem = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | boolean | null;
  }) => (
    <div className="flex flex-col border-b border-gray-100 py-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      <span className="break-words text-sm font-semibold text-[#0b2c52]">
        {value !== null && value !== undefined && value !== ""
          ? String(value)
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-view-title"
        className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white shadow-inner">
              <FaRuler className="text-3xl text-[#0b2c52]" />
            </div>

            <div className="min-w-0">
              <h2
                id="unit-view-title"
                className="break-words text-xl font-bold uppercase tracking-tight sm:text-2xl"
              >
                {name || "Unit Details"}
              </h2>
              <p className="mt-1 font-mono text-xs tracking-widest text-blue-200">
                Unit Code: {code || "N/A"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-3 shrink-0 rounded-full bg-white/10 p-2 transition-transform duration-300 hover:rotate-90"
            title="Close"
            aria-label="Close unit details"
          >
            <FaTimes className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Unit Information */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={FaInfoCircle}
                title="Unit Information"
              />

              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <DataItem label="Unit ID" value={unitId} />
                <DataItem label="Unit Code" value={code} />
                <DataItem label="Unit Name" value={name} />
                <DataItem
                  label="Decimal Allowed"
                  value={decimalAllowed ? "Yes" : "No"}
                />
                <DataItem
                  label="Status"
                  value={isActive ? "Active" : "Inactive"}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    decimalAllowed
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  DECIMAL: {decimalAllowed ? "YES" : "NO"}
                </span>
              </div>
            </section>

            {/* Unit Settings */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={FaCheckCircle}
                title="Unit Settings"
              />

              <DataItem
                label="Decimal Quantities"
                value={
                  decimalAllowed
                    ? "Decimal quantities are allowed"
                    : "Only whole quantities are allowed"
                }
              />

              <DataItem
                label="Unit Status"
                value={isActive ? "Enabled" : "Disabled"}
              />

              <DataItem
                label="Record Status"
                value={isDeleted ? "Deleted" : "Available"}
              />
            </section>

            {/* Unit Reference */}
            <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
              <SectionHeader
                icon={FaHashtag}
                title="Unit Reference"
              />

              <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <DataItem label="Unit ID" value={unitId} />
                <DataItem label="Unit Code" value={code} />
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-5">
          <p className="text-[10px] font-bold uppercase text-gray-400">
            Official Unit Details
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

export default UnitViewModal;
