
import React, { useEffect, useState } from "react";
import {
  getLocations,
  getLocationById,
  deleteLocation,
} from "./Services/LocationServices";
import type { Location, LocationListItem } from "./Services/types";
import LocationWizard from "./LocationWizard";
import LocationViewModal from "./LocationViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import { toast } from "sonner";

const LocationPage: React.FC = () => {
  const [locations, setLocations] = useState<LocationListItem[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editData, setEditData] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<Location | null>(null);

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("Location", "CanAdd");
  const canEdit = hasPermission("Location", "CanEdit");
  const canDelete = hasPermission("Location", "CanDelete");

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to load locations:", error);
      toast.error("Failed to load locations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();

    const handleRefresh = () => {
      void loadLocations();
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

  const handleView = async (locationId: number) => {
    try {
      setIsLoading(true);
      const fullLocationData = await getLocationById(locationId);
      setViewData(fullLocationData);
    } catch (error) {
      console.error("Failed to load location details:", error);
      toast.error("Could not load location details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (locationId: number) => {
    try {
      setIsLoading(true);
      const fullLocationData = await getLocationById(locationId);
      setEditData(fullLocationData);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load location for editing:", error);
      toast.error("Could not load location details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (locationId: number) => {
    if (!window.confirm("Are you sure you want to delete this location?")) {
      return;
    }

    try {
      await deleteLocation(locationId);
      toast.success("Location deleted successfully.");
      await loadLocations();
    } catch (error) {
      console.error("Failed to delete location:", error);
      toast.error("Could not delete location.");
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadLocations();
  };

  const columns: TableColumn<LocationListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "80px",
    },
    {
      name: "Location ID",
      selector: (row) => row.locationId,
      sortable: true,
      width: "120px",
    },
    {
      name: "Warehouse ID",
      selector: (row) => row.warehouseId,
      sortable: true,
      width: "130px",
    },
    {
      name: "Location Code",
      selector: (row) => row.code,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Zone",
      selector: (row) => row.zone || "N/A",
      sortable: true,
      grow: 1,
    },
    {
      name: "Rack",
      selector: (row) => row.rack || "N/A",
      sortable: true,
      grow: 1,
    },
    {
      name: "Shelf",
      selector: (row) => row.shelf || "N/A",
      sortable: true,
      grow: 1,
    },
    {
      name: "Bin",
      selector: (row) => row.bin || "N/A",
      sortable: true,
      grow: 1,
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
            type="button"
            onClick={() => void handleView(row.locationId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => void handleEdit(row.locationId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => void handleDelete(row.locationId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = locations.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* ADD / EDIT FORM */}
      {showWizard && (
        <LocationWizard
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
        <LocationViewModal
          location={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* LOCATION LIST */}
      <ListingLayout
        title="Listing of Locations"
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

export default LocationPage;
