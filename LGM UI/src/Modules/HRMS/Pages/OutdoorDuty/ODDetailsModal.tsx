import React from "react";
import { X, Calendar, MessageSquare, User, Clock } from "lucide-react";
import type { OutdoorDutyView } from "./outdoorDutyService";

interface ODDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  odRequest: OutdoorDutyView | null;
}

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

const ODDetailsModal: React.FC<ODDetailsModalProps> = ({
  isOpen,
  onClose,
  odRequest,
}) => {
  if (!isOpen || !odRequest) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Outdoor Duty Details (OD{odRequest.id.toString().padStart(3, "0")})
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DetailRow
              icon={<User size={18} />}
              label="Employee"
              value={`${odRequest.employeeName} (${odRequest.employeeCode})`}
            />
            <DetailRow
              icon={<Calendar size={18} />}
              label="From Date"
              value={new Date(odRequest.fromDate).toLocaleDateString()}
            />

            {/* To Date */}
            <DetailRow
              icon={<Calendar size={18} />}
              label="To Date"
              value={new Date(odRequest.toDate).toLocaleDateString()}
            />

            {/* Duration */}
            <DetailRow
              icon={<Clock size={18} />}
              label="Total Duration"
              value={`${odRequest.totalDays} Day${
                odRequest.totalDays > 1 ? "s" : ""
              }`}
            />
            
            <DetailRow
              icon={<MessageSquare size={18} />}
              label="Status"
              value={odRequest.status}
              isStatus
              statusType={odRequest.status}
            />
            <DetailRow
              icon={<Calendar size={18} />}
              label="Applied Date"
              value={new Date(odRequest.appliedDate).toLocaleDateString()}
            />

            {odRequest.status !== "Pending" && (
              <DetailRow
                icon={<User size={18} />}
                label="Processed By"
                value={odRequest.approverName}
              />
            )}
          </div>

          <div className="space-y-3 pt-2">
            {odRequest.status === "Rejected" && odRequest.managerRemarks && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">
                  Rejection Reason:
                </p>
                <p className="text-md text-red-700 italic">
                  "{odRequest.managerRemarks}"
                </p>
              </div>
            )}

            {odRequest.description && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">
                  Employee Purpose / Description:
                </p>
                <p className="text-md text-gray-700">{odRequest.description}</p>
              </div>
            )}
          </div>
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

export default ODDetailsModal;
