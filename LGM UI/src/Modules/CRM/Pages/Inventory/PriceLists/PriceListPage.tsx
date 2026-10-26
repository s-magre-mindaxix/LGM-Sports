
import React, { useEffect, useState } from "react";
import {
  getPriceLists,
  deletePriceList,
  getPriceListById,
} from "./Services/PriceListService";
import type {
  PriceList,
  PriceListListItem,
} from "./Services/types";
import PriceListWizard from "./PriceListWizard";
import PriceListViewModal from "./PriceListViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

const PriceListPage: React.FC = () => {
  const [items, setItems] = useState<PriceListListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<PriceList | null>(null);
  const [viewData, setViewData] = useState<PriceList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("PriceList", "CanAdd");
  const canEdit = hasPermission("PriceList", "CanEdit");
  const canDelete = hasPermission("PriceList", "CanDelete");

  // Load price lists
  const loadItems = async () => {
    setIsLoading(true);

    try {
      setItems(await getPriceLists());
    } catch (error) {
      console.error("Failed to load price lists:", error);
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

  // View price list
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      setViewData(await getPriceListById(id));
    } catch (error) {
      console.error("Failed to load price list:", error);
      window.alert("Could not load price list details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit price list
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      setEditData(await getPriceListById(id));
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to load price list for editing:",
        error
      );
      window.alert("Could not load price list for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete price list
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this price list?"
      )
    ) {
      return;
    }

    try {
      await deletePriceList(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete price list:", error);
      window.alert("Could not delete price list.");
    }
  };

  // Table columns
  const columns: TableColumn<PriceListListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "ID",
      selector: (row) => row.priceListId,
      sortable: true,
      width: "80px",
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      width: "140px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      grow: 1.6,
      wrap: true,
    },
    {
      name: "Customer Channel",
      selector: (row) => row.customerChannelType,
      sortable: true,
      grow: 1.2,
    },
    {
      name: "Currency ID",
      selector: (row) => row.id,
      sortable: true,
      width: "110px",
    },
    {
      name: "Effective From",
      selector: (row) => row.effectiveFrom?.slice(0, 10) || "N/A",
      sortable: true,
      width: "140px",
    },
    {
      name: "Effective To",
      selector: (row) => row.effectiveTo?.slice(0, 10) || "—",
      sortable: true,
      width: "140px",
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
      width: "105px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            title="View"
            onClick={() => void handleView(row.priceListId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() => void handleEdit(row.priceListId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => void handleDelete(row.priceListId)}
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

  // Filter price lists
  const filteredItems = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* Create / Edit Wizard */}
      {showWizard && (
        <PriceListWizard
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
        <PriceListViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* Listing */}
      <ListingLayout
        title="Listing of Price Lists"
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

export default PriceListPage;
