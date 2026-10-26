import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import ProductAccessoryRuleWizard from "./ProductAccessoryRuleWizard";
import ProductAccessoryRuleViewModal from "./ProductAccessoryRuleViewModal";
import {
  deleteProductAccessoryRule,
  getProductAccessoryRuleById,
  getProductAccessoryRules,
} from "./Services/ProductAccessoryRuleService";
import type { ProductAccessoryRule, ProductAccessoryRuleListItem } from "./Services/types";

const ProductAccessoryRulePage: React.FC = () => {
  const [items, setItems] = useState<ProductAccessoryRuleListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ProductAccessoryRule | null>(null);
  const [viewData, setViewData] = useState<ProductAccessoryRuleListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ProductAccessoryRule", "CanAdd");
  const canEdit = hasPermission("ProductAccessoryRule", "CanEdit");
  const canDelete = hasPermission("ProductAccessoryRule", "CanDelete");

  const loadItems = async () => {
    setIsLoading(true);
    try {
      setItems(await getProductAccessoryRules());
    } catch (error) {
      console.error("Failed to load product accessory rules:", error);
      window.alert(error instanceof Error ? error.message : "Could not load product accessory rules.");
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
      setViewData(await getProductAccessoryRuleById(id));
    } catch (error) {
      console.error("Failed to load product accessory rule:", error);
      window.alert(error instanceof Error ? error.message : "Could not load rule details.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setEditData(await getProductAccessoryRuleById(id));
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load product accessory rule for editing:", error);
      window.alert(error instanceof Error ? error.message : "Could not load rule for editing.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product accessory rule?")) return;
    try {
      await deleteProductAccessoryRule(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete product accessory rule:", error);
      window.alert(error instanceof Error ? error.message : "Could not delete rule.");
    }
  };

  const columns: TableColumn<ProductAccessoryRuleListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "75px" },
    { name: "Product", selector: (row) => row.productName || `Product ${row.productId}`, sortable: true, grow: 1.4 },
    { name: "Accessory", selector: (row) => row.accessoryName || `Accessory ${row.accessoriesId}`, sortable: true, grow: 1.4 },
    { name: "Quantity", selector: (row) => row.quantity, sortable: true, width: "95px" },
    { name: "Requirement", selector: (row) => row.mandatoryOptional, sortable: true, width: "130px" },
    { name: "Pricing Type", selector: (row) => row.pricingType, sortable: true, grow: 1.1 },
    { name: "Default Price", cell: (row) => Number(row.defaultPrice).toFixed(2), sortable: true, right: true, width: "130px" },
    { name: "Effective From", selector: (row) => row.effectiveFrom?.slice(0, 10) || "N/A", sortable: true, width: "130px" },
    { name: "Status", cell: (row) => <span className={row.active ? "rounded bg-green-100 px-2 py-1 text-green-700" : "rounded bg-gray-100 px-2 py-1 text-gray-600"}>{row.active ? "Active" : "Inactive"}</span>, width: "105px" },
    {
      name: "Actions",
      cell: (row) => <div className="flex justify-center gap-4">
        <button type="button" title="View" onClick={() => void handleView(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye size={16} /></button>
        {canEdit && <button type="button" title="Edit" onClick={() => void handleEdit(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit size={16} /></button>}
        {canDelete && <button type="button" title="Delete" onClick={() => void handleDelete(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash size={16} /></button>}
      </div>,
      width: "140px",
    },
  ];

  const filteredItems = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()));

  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <ProductAccessoryRuleWizard
      editData={editData}
      onSuccess={() => { setShowWizard(false); setEditData(null); void loadItems(); }}
      onCancel={() => { setShowWizard(false); setEditData(null); }}
    />}
    {viewData && <ProductAccessoryRuleViewModal item={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout
      title="Product Accessory Rules"
      columns={columns}
      data={filteredItems}
      isLoading={isLoading}
      filterText={filterText}
      onFilterChange={setFilterText}
      onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined}
    />
  </div>;
};

export default ProductAccessoryRulePage;
