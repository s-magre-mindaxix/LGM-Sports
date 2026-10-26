import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";
import BundleItemViewModal from "./BundleItemViewModal";
import BundleItemWizard from "./BundleItemWizard";
import { deleteBundleItem, getBundleItemById, getBundleItems } from "./Services/BundleItemService";
import type { BundleItem, BundleItemListItem } from "./Services/types";

const BundleItemPage: React.FC = () => {
  const [items, setItems] = useState<BundleItemListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<BundleItem | null>(null);
  const [viewData, setViewData] = useState<BundleItemListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("BundleItem", "CanAdd");
  const canEdit = hasPermission("BundleItem", "CanEdit");
  const canDelete = hasPermission("BundleItem", "CanDelete");

  const loadItems = async () => {
    setIsLoading(true);
    try {
      setItems(await getBundleItems());
    } catch (error) {
      console.error("Failed to load bundle items:", error);
      window.alert(error instanceof Error ? error.message : "Could not load Bundle Items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    const refresh = () => void loadItems();
    window.addEventListener("app-refresh", refresh);
    return () => window.removeEventListener("app-refresh", refresh);
  }, []);

  const handleView = async (id: number) => {
    try {
      setViewData(await getBundleItemById(id));
    } catch (error) {
      console.error("Failed to load bundle item:", error);
      window.alert(error instanceof Error ? error.message : "Could not load Bundle Item details.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setEditData(await getBundleItemById(id));
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load bundle item for editing:", error);
      window.alert(error instanceof Error ? error.message : "Could not load Bundle Item for editing.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this Bundle Item?")) return;
    try {
      await deleteBundleItem(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete bundle item:", error);
      window.alert(error instanceof Error ? error.message : "Could not delete Bundle Item.");
    }
  };

  const getLinkedDisplay = (item: BundleItemListItem) => item.variantName || item.accessoryName || item.productName || `Item #${item.variantId ?? item.accessoriesId ?? item.productId ?? "N/A"}`;
  const columns: TableColumn<BundleItemListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "75px" },
    { name: "Bundle", selector: (row) => row.bundleName || `Bundle ${row.bundleId}`, sortable: true, grow: 1.2 },
    { name: "Item", selector: getLinkedDisplay, sortable: true, grow: 1.4 },
    { name: "Item Type", selector: (row) => row.variantId !== null ? "Variant" : row.accessoriesId !== null ? "Accessory" : "Product", sortable: true, width: "120px" },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true, width: "95px" },
    { name: "Pricing Type", selector: (row) => row.pricingType, sortable: true, grow: 1 },
    { name: "Allocated Price", cell: (row) => Number(row.allocatedPrice).toFixed(2), sortable: true, right: true, width: "140px" },
    { name: "Optional", cell: (row) => row.isOptional ? "Yes" : "No", width: "100px" },
    { name: "Deleted", cell: (row) => row.isDeleted ? "Yes" : "No", width: "90px" },
    {
      name: "Actions",
      cell: (row) => <div className="flex justify-center gap-4">
        <button type="button" title="View" onClick={() => void handleView(row.bundleItemId)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye size={16} /></button>
        {canEdit && <button type="button" title="Edit" onClick={() => void handleEdit(row.bundleItemId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit size={16} /></button>}
        {canDelete && <button type="button" title="Delete" onClick={() => void handleDelete(row.bundleItemId)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash size={16} /></button>}
      </div>,
      width: "140px",
    },
  ];

  const filteredItems = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()));

  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <BundleItemWizard editData={editData} onSuccess={() => { setShowWizard(false); setEditData(null); void loadItems(); }} onCancel={() => { setShowWizard(false); setEditData(null); }} />}
    {viewData && <BundleItemViewModal item={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout title="Listing of Bundle Items" columns={columns} data={filteredItems} isLoading={isLoading} filterText={filterText} onFilterChange={setFilterText} onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined} />
  </div>;
};

export default BundleItemPage;
