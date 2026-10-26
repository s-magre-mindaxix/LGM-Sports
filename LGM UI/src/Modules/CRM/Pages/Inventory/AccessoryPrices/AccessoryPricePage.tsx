
import React, { useEffect, useState } from "react";

import {
  getAccessoryPrices,
  deleteAccessoryPrice,
  getAccessoryPriceById,
} from "./services/AccessoryPriceServices";

import type {
  AccessoryPrice,
  AccessoryPriceListItem,
} from "./services/types";

import AccessoryPriceWizard from "./AccessoryPriceWizard";
import AccessoryPriceViewModal from "./AccessoryPriceViewModal";

import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";

interface LookupItem {
  id: number;
  name: string;
}

const getArray = (response: any): any[] => {
  const result = response?.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;

  return [];
};

const mapLookup = (
  records: any[],
  type: "accessory" | "priceList"
): LookupItem[] =>
  records
    .map((record) => {
      const id = Number(
        type === "accessory"
          ? record.accessoryId ??
              record.AccessoryId ??
              record.accessoriesId ??
              record.AccessoriesId ??
              record.id ??
              record.Id
          : record.priceListId ??
              record.PriceListId ??
              record.id ??
              record.Id
      );

      const name =
        type === "accessory"
          ? record.accessoryName ??
            record.AccessoryName ??
            record.accessoriesName ??
            record.AccessoriesName ??
            record.name ??
            record.Name
          : record.priceListName ??
            record.PriceListName ??
            record.name ??
            record.Name;

      return {
        id,
        name: String(name ?? ""),
      };
    })
    .filter(
      (item) =>
        Number.isInteger(item.id) &&
        item.id > 0 &&
        item.name.trim() !== ""
    );

const AccessoryPricePage: React.FC = () => {
  const [items, setItems] = useState<AccessoryPriceListItem[]>([]);
  const [accessories, setAccessories] = useState<LookupItem[]>([]);
  const [priceLists, setPriceLists] = useState<LookupItem[]>([]);

  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<AccessoryPrice | null>(null);
  const [viewData, setViewData] = useState<AccessoryPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("AccessoryPrice", "CanAdd");
  const canEdit = hasPermission("AccessoryPrice", "CanEdit");
  const canDelete = hasPermission("AccessoryPrice", "CanDelete");

  // Load accessory price records.
  const loadItems = async () => {
    setIsLoading(true);

    try {
      const data = await getAccessoryPrices();
      setItems(data);
    } catch (error) {
      console.error("Failed to load accessory prices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load names used by the listing.
  useEffect(() => {
    let cancelled = false;

    const loadLookupData = async () => {
      try {
        const [priceListResponse, accessoryResponse] =
          await Promise.all([
            apiClient.get(
              API_ENDPOINTS.PriceList || "/PriceLists"
            ),
            apiClient.get(
              API_ENDPOINTS.Accessories || "/Accessories"
            ),
          ]);

        if (cancelled) return;

        setPriceLists(
          mapLookup(getArray(priceListResponse), "priceList")
        );

        setAccessories(
          mapLookup(getArray(accessoryResponse), "accessory")
        );
      } catch (error) {
        console.error(
          "Failed to load accessory and price list names:",
          error
        );
      }
    };

    void loadLookupData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load records on mount and listen for refresh events.
  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();
    window.addEventListener("app-refresh", refresh);

    return () => {
      window.removeEventListener("app-refresh", refresh);
    };
  }, []);

  const getPriceListName = (id: number) =>
    priceLists.find((item) => item.id === Number(id))?.name ??
    `Price List #${id}`;

  const getAccessoryName = (row: AccessoryPriceListItem) => {
    const id = Number(row.accessoriesId || 0);

    return (
      accessories.find((item) => item.id === id)?.name ??
      `Accessory #${id || "N/A"}`
    );
  };

  // View accessory price details.
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getAccessoryPriceById(id);
      setViewData(data);
    } catch (error) {
      console.error("Failed to load accessory price:", error);
      window.alert("Could not load accessory price details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit accessory price.
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getAccessoryPriceById(id);

      setEditData(data);
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to load accessory price for editing:",
        error
      );

      window.alert("Could not load accessory price for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete accessory price.
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this accessory price?"
    );

    if (!confirmed) return;

    try {
      await deleteAccessoryPrice(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete accessory price:", error);
      window.alert("Could not delete accessory price.");
    }
  };

  // Table columns.
  const columns: TableColumn<AccessoryPriceListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "Price List Name",
      cell: (row) => getPriceListName(row.priceListId),
      sortable: true,
      sortFunction: (a, b) =>
        getPriceListName(a.priceListId).localeCompare(
          getPriceListName(b.priceListId)
        ),
      grow: 1.3,
    },
    {
      name: "Accessory Name",
      cell: (row) => getAccessoryName(row),
      sortable: true,
      sortFunction: (a, b) =>
        getAccessoryName(a).localeCompare(getAccessoryName(b)),
      grow: 1.5,
    },
    {
      name: "Price Type",
      selector: (row) => row.priceType,
      sortable: true,
      grow: 1.2,
    },
    {
      name: "Amount",
      cell: (row) => Number(row.amount).toFixed(2),
      sortable: true,
      right: true,
      width: "130px",
    },
    {
      name: "Min Qty",
      selector: (row) => row.minQty,
      sortable: true,
      width: "100px",
    },
    {
      name: "Effective From",
      selector: (row) => row.effectiveFrom?.slice(0, 10) || "N/A",
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
            onClick={() => void handleView(row.accessoryPriceId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() => void handleEdit(row.accessoryPriceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => void handleDelete(row.accessoryPriceId)}
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

  // Search by names as well as existing record fields.
  const filteredItems = items.filter((item) => {
    const searchText = [
      JSON.stringify(item),
      getPriceListName(item.priceListId),
      getAccessoryName(item),
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(filterText.toLowerCase());
  });

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <AccessoryPriceWizard
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

      {viewData && (
        <AccessoryPriceViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Accessory Prices"
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

export default AccessoryPricePage;
