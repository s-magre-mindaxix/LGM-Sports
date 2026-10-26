
import React, { useEffect, useState } from "react";
import {
  getWarehouses,
  deleteWarehouse,
  getWarehouseById,
} from "./Services/WarehouseServices";
import type { Warehouse, WarehouseListItem } from "./Services/types";
import WarehouseWizard from "../Warehouse/WarehouseWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import WarehouseViewModal from "../Warehouse/WarehouseViewModel";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const WarehousePage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editData, setEditData] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<Warehouse | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Warehouse", "CanAdd");
  const canEdit = hasPermission("Warehouse", "CanEdit");
  const canDelete = hasPermission("Warehouse", "CanDelete");

  const loadWarehouses = async () => {
    try {
      setIsLoading(true);
      const data = await getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to load warehouses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadWarehouses();

    const handleRefresh = () => {
      void loadWarehouses();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (warehouseId: number) => {
    try {
      setIsLoading(true);
      const fullWarehouseData = await getWarehouseById(warehouseId);
      setViewData(fullWarehouseData);
    } catch (error) {
      console.error("Failed to load warehouse details:", error);
      alert("Could not load warehouse details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (warehouseId: number) => {
    try {
      setIsLoading(true);
      const fullWarehouseData = await getWarehouseById(warehouseId);
      setEditData(fullWarehouseData);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load warehouse for editing:", error);
      alert("Could not load warehouse details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (warehouseId: number) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        await deleteWarehouse(warehouseId);
        await loadWarehouses();
      } catch (error) {
        console.error("Failed to delete warehouse:", error);
        alert("Could not delete warehouse.");
      }
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadWarehouses();
  };

  const columns: TableColumn<WarehouseListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "80px",
    },
    {
      name: "Branch ID",
      selector: (row) => row.branchId,
      sortable: true,
      width: "110px",
    },
    {
      name: "Warehouse Code",
      selector: (row) => row.warehouseCode,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Warehouse Name",
      selector: (row) => row.warehouseName,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: "Type",
      selector: (row) => row.type || "N/A",
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={
            row.isActive
              ? "rounded bg-green-100 px-2 py-1 text-green-700"
              : "rounded bg-gray-100 px-2 py-1 text-gray-600"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleView(row.warehouseId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
            type="button"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              onClick={() => handleEdit(row.warehouseId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
              type="button"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => handleDelete(row.warehouseId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
              type="button"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = warehouses.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* ADD / EDIT FORM */}
      {showWizard && (
        <WarehouseWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <WarehouseViewModal
          warehouse={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* WAREHOUSE LIST */}
      <ListingLayout
        title="Listing of Warehouses"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
      />
    </div>
  );
};

export default WarehousePage;
