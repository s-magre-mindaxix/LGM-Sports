// /Masters/ShipmentMode/ShipmentModePage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getShipmentModes,
  deleteShipmentMode,
  getShipmentModeById,
} from "./Services/ShipmentModeService";
import type { ShipmentMode } from "./Services/types";

// Components
import ShipmentModeForm from "./ShipmentModeForm";
import ShipmentModeViewModal from "./ShipmentModeViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ShipmentModePage: React.FC = () => {
  const [shipmentModes, setShipmentModes] = useState<ShipmentMode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ShipmentMode | null>(null);
  const [viewData, setViewData] = useState<ShipmentMode | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Assuming module name is "ShipmentMode" in your permissions setup
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ShipmentMode", "CanAdd");
  const canEdit = hasPermission("ShipmentMode", "CanEdit");
  const canDelete = hasPermission("ShipmentMode", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getShipmentModes();
      setShipmentModes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load shipment modes");
      setShipmentModes([]);
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
      const data = await getShipmentModeById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch shipment mode details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getShipmentModeById(id);
      setEditData(data);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching shipment mode details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteShipmentMode(deleteModal.id);
      toast.success("Shipment Mode deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting shipment mode");
    }
  };

  const columns: TableColumn<ShipmentMode>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "80px" },
    {
      name: "Mode Name",
      selector: (row) => row.modeName,
      sortable: true,
      grow: 2,
    },
    {
      name: "Mode Code",
      selector: (row) => row.modeCode,
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
    return shipmentModes.filter(
      (item) =>
        (item.modeName || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (item.modeCode || "").toLowerCase().includes(filterText.toLowerCase())
    );
  }, [shipmentModes, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <ShipmentModeForm
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
        <ShipmentModeViewModal mode={viewData} onClose={() => setViewData(null)} />
      )}

      <ListingLayout
        title="Listing of Shipment Modes"
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
        title="Delete Shipment Mode"
        message="Are you sure you want to delete this shipment mode? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ShipmentModePage;