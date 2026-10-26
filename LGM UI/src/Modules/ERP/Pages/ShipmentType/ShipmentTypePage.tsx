// /Masters/ShipmentType/ShipmentTypePage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getShipmentTypes,
  deleteShipmentType,
  getShipmentTypeById,
} from "./Services/ShipmentTypeService";
import type { ShipmentType } from "./Services/types";

// Components
import ShipmentTypeForm from "./ShipmentTypeForm";
import ShipmentTypeViewModal from "./ShipmentTypeViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ShipmentTypePage: React.FC = () => {
  const [shipmentTypes, setShipmentTypes] = useState<ShipmentType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ShipmentType | null>(null);
  const [viewData, setViewData] = useState<ShipmentType | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ShipmentType", "CanAdd");
  const canEdit = hasPermission("ShipmentType", "CanEdit");
  const canDelete = hasPermission("ShipmentType", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getShipmentTypes();
      setShipmentTypes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load shipment types");
      setShipmentTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleView = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getShipmentTypeById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch shipment type details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getShipmentTypeById(id);
      setEditData(data);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching shipment type details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteShipmentType(deleteModal.id);
      toast.success("Shipment Type deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting shipment type");
    }
  };

  const columns: TableColumn<ShipmentType>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "80px" },
    {
      name: "Type Name",
      selector: (row) => row.typeName,
      sortable: true,
      grow: 2,
    },
    {
      name: "Shipment Mode",
      selector: (row) => row.shipmentModeName || "N/A",
      sortable: true,
      grow: 1,
    },
    {
      name: "Type Code",
      selector: (row) => row.typeCode,
      sortable: true,
      grow: 1,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={() => handleView(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
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
    },
  ];

  const filteredItems = useMemo(() => {
    return shipmentTypes.filter(
      (item) =>
        (item.typeName || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (item.typeCode || "").toLowerCase().includes(filterText.toLowerCase()) ||
       (item.shipmentModeName || "").toLowerCase().includes(filterText.toLowerCase())
    );
  }, [shipmentTypes, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <ShipmentTypeForm
          editData={editData}
          onSuccess={() => {
            setShowForm(false);
            loadData();
            setEditData(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}

      {viewData && (
        <ShipmentTypeViewModal type={viewData} onClose={() => setViewData(null)} />
      )}

      <ListingLayout
        title="Listing of Shipment Types"
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
        title="Delete Shipment Type"
        message="Are you sure you want to delete this shipment type? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ShipmentTypePage;