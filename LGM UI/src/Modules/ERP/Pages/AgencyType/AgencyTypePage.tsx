import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getAgencyTypes,
  deleteAgencyType,
  getAgencyTypeById,
} from "./Services/AgencyTypeService";
import type { AgencyType } from "./Services/types";

// Components
import AgencyTypeForm from "./AgencyTypeForm";
// import AgencyTypeViewModal from "./AgencyTypeViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const AgencyTypePage: React.FC = () => {
  const [agencyTypes, setAgencyTypes] = useState<AgencyType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<AgencyType | null>(null);
//   const [viewData, setViewData] = useState<AgencyType | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("AgencyType", "CanAdd");
  const canEdit = hasPermission("AgencyType", "CanEdit");
  const canDelete = hasPermission("AgencyType", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAgencyTypes();
      setAgencyTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load agency types");
      setAgencyTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

//   const handleView = async (id: number) => {
//     try {
//       setIsLoading(true);
//       const data = await getAgencyTypeById(id);
//       setViewData(data);
//     } catch {
//       toast.error("Could not fetch agency type details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getAgencyTypeById(id);
      setEditData(data);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching agency type details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteModal.id === 0) return;
    try {
      await deleteAgencyType(deleteModal.id);
      toast.success("Agency Type deleted successfully");
      loadData(); // Refresh data after delete
    } catch {
      toast.error("Error deleting agency type");
    } finally {
      setDeleteModal({ isOpen: false, id: 0 });
    }
  };

  const columns: TableColumn<AgencyType>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "80px" },
    {
      name: "Agency Type Name",
      selector: (row) => row.agencyTypeName,
      sortable: true,
      grow: 3,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          {/* <button
            onClick={() => handleView(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button> */}
          {canEdit && (
            <button
              onClick={() => handleEdit(row.id)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "120px",
      center: true,
    },
  ];

  const filteredItems = useMemo(() => {
    return agencyTypes.filter(
      (item) =>
        item.agencyTypeName.toLowerCase().includes(filterText.toLowerCase())
    );
  }, [agencyTypes, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <AgencyTypeForm
          editData={editData}
          onSuccess={() => {
            setShowForm(false);
            setEditData(null);
            loadData();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}

      {/* {viewData && (
        <AgencyTypeViewModal type={viewData} onClose={() => setViewData(null)} />
      )} */}

      <ListingLayout
        title="Listing of Agency Types"
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
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Agency Type"
        message="Are you sure you want to delete this agency type? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AgencyTypePage;