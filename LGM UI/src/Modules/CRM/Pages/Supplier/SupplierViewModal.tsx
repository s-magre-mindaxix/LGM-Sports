
import React from "react";
import type { Supplier } from "./Services/types";

interface SupplierViewModalProps {
  supplier: Supplier | null;
  onClose: () => void;
}

const SupplierViewModal: React.FC<SupplierViewModalProps> = ({
  supplier,
  onClose,
}) => {
  if (!supplier) return null;

  const fieldClass = "text-sm text-gray-800 break-words";
  const labelClass =
    "mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500";

  const details = [
    { label: "Supplier Code", value: supplier.supplierCode || "-" },
    { label: "Supplier Name", value: supplier.supplierName || "-" },
    { label: "Branch ID", value: String(supplier.branchId || "-") },
    { label: "GSTIN", value: supplier.supplierGSTIN || "-" },
    { label: "Contact", value: supplier.supplierContact || "-" },
    { label: "Payment Terms", value: supplier.paymentTerms || "-" },
    { label: "Address", value: supplier.supplierAddress || "-" },
    {
      label: "Created At",
      value: supplier.createdAt
        ? new Date(supplier.createdAt).toLocaleDateString()
        : "-",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#f07837] px-6 py-4 text-white">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wide">
              Supplier Details
            </h2>
            <p className="mt-1 text-xs text-blue-100">
              View supplier information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-3 py-1 text-xl hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#154068]">
              Supplier Information
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                supplier.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {supplier.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label}>
                <span className={labelClass}>{item.label}</span>
                <p className={fieldClass}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplierViewModal;
