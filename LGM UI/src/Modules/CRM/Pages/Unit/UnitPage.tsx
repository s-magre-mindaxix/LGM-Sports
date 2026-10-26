
import React, { useEffect, useState } from "react";
import {
  getUnits,
  deleteUnit,
  getUnitById,
} from "./Services/UnitService";
import type { Unit, UnitListItem } from "./Services/types";
import UnitWizard from "./UnitWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import UnitViewModal from "./UnitViewModel";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const normalizeUnit = (item: any): Unit => ({
  unitId: item?.unitId ?? item?.UnitId ?? 0,
  code:
    item?.code ??
    item?.Code ??
    item?.unitCode ??
    item?.UnitCode ??
    "",
  name:
    item?.name ??
    item?.Name ??
    item?.unitName ??
    item?.UnitName ??
    "",
  decimalAllowed:
    item?.decimalAllowed ?? item?.DecimalAllowed ?? false,
  isActive: item?.isActive ?? item?.IsActive ?? true,
});

const UnitPage: React.FC = () => {
  const [units, setUnits] = useState<UnitListItem[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editData, setEditData] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<Unit | null>(null);

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("Unit", "CanAdd");
  const canEdit = hasPermission("Unit", "CanEdit");
  const canDelete = hasPermission("Unit", "CanDelete");

  const loadUnits = async () => {
    try {
      setIsLoading(true);

      const data = await getUnits();

      setUnits(
        Array.isArray(data)
          ? data.map((item) => normalizeUnit(item))
          : [],
      );
    } catch (error) {
      console.error("Failed to load units:", error);
      setUnits([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUnits();

    const handleRefresh = () => {
      void loadUnits();
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

  const handleView = async (unitId: number) => {
    try {
      setIsLoading(true);

      const fullUnitData = await getUnitById(unitId);
      const normalizedUnit = normalizeUnit(fullUnitData);

      if (!normalizedUnit.unitId) {
        throw new Error("Unit details were not returned by the API.");
      }

      setViewData(normalizedUnit);
    } catch (error) {
      console.error("Failed to load unit details:", error);
      alert("Could not load unit details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (unitId: number) => {
    try {
      setIsLoading(true);

      const fullUnitData = await getUnitById(unitId);

      setEditData(normalizeUnit(fullUnitData));
      setShowWizard(true);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load unit for editing:", error);
      alert("Could not load unit details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (unitId: number) => {
    if (
      window.confirm("Are you sure you want to delete this unit?")
    ) {
      try {
        await deleteUnit(unitId);
        await loadUnits();
      } catch (error) {
        console.error("Failed to delete unit:", error);
        alert("Could not delete unit.");
      }
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadUnits();
  };

  const columns: TableColumn<UnitListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "80px",
    },
    {
      name: "Unit ID",
      selector: (row) => row.unitId,
      sortable: true,
      width: "100px",
    },
    {
      name: "Unit Code",
      selector: (row) => row.code,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Unit Name",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: "Decimal Allowed",
      cell: (row) => (
        <span
          className={
            row.decimalAllowed
              ? "rounded bg-blue-100 px-2 py-1 text-blue-700"
              : "rounded bg-gray-100 px-2 py-1 text-gray-600"
          }
        >
          {row.decimalAllowed ? "Allowed" : "Not Allowed"}
        </span>
      ),
      width: "150px",
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
            onClick={() => void handleView(row.unitId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
            type="button"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              onClick={() => void handleEdit(row.unitId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
              type="button"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => void handleDelete(row.unitId)}
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

  const filteredItems = units.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* ADD / EDIT FORM */}
      {showWizard && (
        <UnitWizard
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
        <UnitViewModal
          unit={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* UNIT LIST */}
      <ListingLayout
        title="Listing of Units"
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

export default UnitPage;
