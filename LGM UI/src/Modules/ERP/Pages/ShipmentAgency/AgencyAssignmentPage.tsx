import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import {
  getAssignments,
  deleteAssignment,
} from "./Services/AgencyAssignmentService";
import type { ShipmentAgencyAssignment } from "./Services/types";
import AssignmentWizard from "./AssignmentWizard";
import AssignmentViewModal from "./AssignmentViewModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const AgencyAssignmentPage: React.FC = () => {
  const [data, setData] = useState<ShipmentAgencyAssignment[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ShipmentAgencyAssignment | null>(
    null,
  );
  const [viewData, setViewData] = useState<ShipmentAgencyAssignment | null>(
    null,
  );
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAssignments();
      setData(res);
    } catch {
      toast.error("Failed to load assignments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: TableColumn<ShipmentAgencyAssignment>[] = [
    {
      name: "Shipment No",
      selector: (row) => row.shipmentNo || "",
      sortable: true,
    },
    {
      name: "Agency Name",
      selector: (row) => row.agencyName || "",
      sortable: true,
    },
    {
      name: "Agency Type",
      selector: (row) => row.agencyType || "",
      sortable: true,
    },
    {
      name: "Assigned Date",
      selector: (row) => new Date(row.assignedDate).toLocaleDateString(),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => setViewData(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye />
          </button>
          <button
            onClick={() => {
              setEditData(row);
              setShowWizard(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() =>
              setDeleteModal({
                isOpen: true,
                id: row.shipmentAgencyAssignmentId,
              })
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {showWizard && (
        <AssignmentWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            loadData();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
      {viewData && (
        <AssignmentViewModal
          data={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Agency Assignments"
        columns={columns}
        data={data.filter(
          (x) =>
            x.shipmentNo?.toLowerCase().includes(filterText.toLowerCase()) ||
            x.agencyName?.toLowerCase().includes(filterText.toLowerCase()),
        )}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => {
          setEditData(null);
          setShowWizard(true);
        }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await deleteAssignment(deleteModal.id);
          toast.success("Assignment Removed");
          loadData();
          setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Remove Assignment"
        message="Are you sure you want to remove this agency from the shipment?"
      />
    </div>
  );
};

export default AgencyAssignmentPage;
