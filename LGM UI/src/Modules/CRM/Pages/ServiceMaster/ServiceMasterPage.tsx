import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import { getServices, deleteService } from "./Services/ServiceMasterService";
import ServiceMasterWizard from "./ServiceMasterWizard";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import type { ServiceMaster } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ServiceMasterPage: React.FC = () => {
  const [list, setList] = useState<ServiceMaster[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ServiceMaster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ServiceMaster", "CanAdd");
  const canEdit = hasPermission("ServiceMaster", "CanEdit");
  const canDelete = hasPermission("ServiceMaster", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServices();
      setList(data);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  const columns: TableColumn<ServiceMaster>[] = [
    { name: "Sr. No.", selector: (_, i) => (i ?? 0) + 1, width: "80px" },
    {
      name: "Service Part No",
      selector: (row) => row.servicePartNo,
      sortable: true,
      width: "200px",
    },
    {
      name: "Service Description",
      selector: (row) => row.serviceDescription,
      sortable: true,
      grow: 2,
    },
    {
      name: "SAC Code",
      selector: (row) => row.sacCode,
      sortable: true,
      grow: 2,
    },
    {
      name: "Service Price",
      selector: (row) => row.servicePrice,
      sortable: true,
      grow: 2,
      width: "150px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => {
                setEditData(row);
                setShowForm(true);
              }}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteId(row.serviceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = list.filter((i) =>
    (i.serviceDescription + i.servicePartNo)
      .toLowerCase()
      .includes(filterText.toLowerCase()),
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6 text-left">
      {showForm && (
        <ServiceMasterWizard
          editData={editData}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      <ListingLayout
        title="Listing of Services"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={
          canAdd
            ? () => {
                setEditData(null);
                setShowForm(true);
              }
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteService(deleteId);
            loadData();
            setDeleteId(null);
            toast.success("Deleted");
          }
        }}
        title="Delete Service"
        message="Are you sure you want to delete this service definition?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ServiceMasterPage;
