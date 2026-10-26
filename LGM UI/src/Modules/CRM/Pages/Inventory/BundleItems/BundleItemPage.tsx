
import React, { useEffect, useState } from "react";
import {
  getBundleItems,
  deleteBundleItem,
  getBundleItemById,
} from "./Services/BundleItemService";
import type {
  BundleItem,
  BundleItemListItem,
} from "./Services/types";
import BundleItemWizard from "./BundleItemWizard";
import BundleItemViewModal from "./BundleItemViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

const BundleItemPage: React.FC = () => {
  const [items, setItems] = useState<BundleItemListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<BundleItem | null>(null);
  const [viewData, setViewData] = useState<BundleItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("BundleItem", "CanAdd");
  const canEdit = hasPermission("BundleItem", "CanEdit");
  const canDelete = hasPermission("BundleItem", "CanDelete");

  // Load bundle items
  const loadItems = async () => {
    setIsLoading(true);

    try {
      setItems(await getBundleItems());
    } catch (error) {
      console.error("Failed to load bundle items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();

    window.addEventListener("app-refresh", refresh);

    return () => {
      window.removeEventListener("app-refresh", refresh);
    };
  }, []);

  // View bundle item
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      setViewData(await getBundleItemById(id));
    } catch (error) {
      console.error("Failed to load bundle item:", error);
      window.alert("Could not load bundle item details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit bundle item
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      setEditData(await getBundleItemById(id));
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to load bundle item for editing:",
        error
      );
      window.alert("Could not load bundle item for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete bundle item
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this bundle item?"
      )
    ) {
      return;
    }

    try {
      await deleteBundleItem(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete bundle item:", error);
      window.alert("Could not delete bundle item.");
    }
  };

  // Table columns
  const columns: TableColumn<BundleItemListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "Item ID",
      selector: (row) => row.bundleItemId,
      sortable: true,
      width: "100px",
    },
    {
      name: "Bundle ID",
      selector: (row) => row.bundleId,
      sortable: true,
      width: "115px",
    },
    {
      name: "Accessory ID",
      selector: (row) => row.accessoriesId ?? "N/A",
      sortable: true,
      width: "125px",
    },
    {
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
      width: "100px",
    },
    {
      name: "Pricing Type",
      selector: (row) => row.pricingType,
      sortable: true,
      grow: 1.3,
    },
    {
      name: "Allocated Price",
      cell: (row) => Number(row.allocatedPrice).toFixed(2),
      sortable: true,
      right: true,
      width: "145px",
    },
    {
      name: "Optional",
      cell: (row) => (row.isOptional ? "Yes" : "No"),
      sortable: true,
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            title="View"
            onClick={() => void handleView(row.bundleItemId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() => void handleEdit(row.bundleItemId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => void handleDelete(row.bundleItemId)}
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

  // Filter bundle items
  const filteredItems = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* Create / Edit Wizard */}
      {showWizard && (
        <BundleItemWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            setEditData(null);
            void loadItems();
          }}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {/* View Modal */}
      {viewData && (
        <BundleItemViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* Listing */}
      <ListingLayout
        title="Listing of Bundle Items"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={
          canAdd
            ? () => {
                setEditData(null);
                setShowWizard(true);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            : undefined
        }
      />
    </div>
  );
};

export default BundleItemPage;
