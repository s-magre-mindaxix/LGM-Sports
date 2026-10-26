import React from "react";
import {
  X,
  Calendar,
  MessageSquare,
  User,
  Tag,
  FileText,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";
import type { ExpenseClaimView } from "./expenseClaimService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

interface ClaimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: ExpenseClaimView | null;
}

// The DetailRow component does not need any changes
const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  isStatus?: boolean;
  statusType?: string;
}> = ({ icon, label, value, isStatus = false, statusType = "Pending" }) => {
  const getStatusBadgeClass = (status: string) =>
    ({
      Pending: "bg-yellow-100 text-yellow-800",
      Approved: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
    }[status] || "bg-gray-100 text-gray-800");

  return (
    <div className="flex items-start py-2">
      <div className="shrink-0 w-8 pt-1 text-gray-500">{icon}</div>
      <div className="grow">
        <p className="text-sm text-gray-500">{label}</p>
        {isStatus ? (
          <span
            className={`px-2 py-0.5 text-sm font-semibold rounded-full ${getStatusBadgeClass(
              statusType
            )}`}
          >
            {value}
          </span>
        ) : (
          <p className="text-md font-semibold text-gray-800">
            {value || "N/A"}
          </p>
        )}
      </div>
    </div>
  );
};

const ClaimDetailsModal: React.FC<ClaimDetailsModalProps> = ({
  isOpen,
  onClose,
  claim,
}) => {
  if (!isOpen || !claim) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Expense Claim Details (EXP{claim.id.toString().padStart(3, "0")})
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- START: Main Layout Change --- */}
        <div className="space-y-4">
          {/* Two-column grid for the main details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow
              icon={<User size={18} />}
              label="Employee"
              value={`${claim.employeeName} (${claim.employeeCode})`}
            />
            <DetailRow
              icon={<Tag size={18} />}
              label="Expense Type"
              value={claim.expenseTypeName}
            />
            <DetailRow
              icon={<IndianRupee size={18} />}
              label="Claimed Amount"
              value={`₹${claim.amount.toLocaleString("en-IN")}`}
            />
            {claim.status === "Approved" && claim.approvedAmount && (
              <DetailRow
                icon={<CheckCircle2 size={18} className="text-green-600" />}
                label="Approved Amount"
                value={`₹${claim.approvedAmount.toLocaleString("en-IN")}`}
              />
            )}
            <DetailRow
              icon={<MessageSquare size={18} />}
              label="Status"
              value={claim.status}
              isStatus
              statusType={claim.status}
            />
            <DetailRow
              icon={<Calendar size={18} />}
              label="Claim Date"
              value={new Date(claim.claimDate).toLocaleDateString()}
            />
            <DetailRow
              icon={<Calendar size={18} />}
              label="Applied Date"
              value={new Date(claim.appliedDate).toLocaleDateString()}
            />

            {claim.status !== "Pending" && (
              <DetailRow
                icon={<User size={18} />}
                label="Processed By"
                value={claim.approverName}
              />
            )}
          </div>

          {/* Full-width section for descriptions and remarks */}
          <div className="space-y-3 pt-2">
            {claim.managerRemarks && (
              <div
                className={`p-3 border rounded-lg ${
                  claim.status === "Rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <p
                  className={`text-sm font-semibold ${
                    claim.status === "Rejected"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  Manager Remarks:
                </p>
                <p
                  className={`text-md italic ${
                    claim.status === "Rejected"
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}
                >
                  "{claim.managerRemarks}"
                </p>
              </div>
            )}

            {claim.description && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">
                  Employee Description:
                </p>
                <p className="text-md text-gray-700">{claim.description}</p>
              </div>
            )}
          </div>
          {/* --- END: Main Layout Change --- */}

          {claim.receiptFilePath && (
            <a
              // href={`https://localhost:44363${claim.receiptFilePath}`}
              href={`${API_ENDPOINTS.BaseUrl.replace("/api", "")}${claim.receiptFilePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline mt-4"
            >
              <FileText size={18} /> View Attached Receipt
            </a>
          )}
        </div>

        <div className="flex justify-end mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsModal;
