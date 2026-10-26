import React, { useEffect, useState } from "react";
import {
  deleteProductVariant,
  getProductVariantById,
  getProductVariants,
} from "./Services/ProductVariantService";
import type { ProductVariant, ProductVariantListItem } from "./Services/types";
import ProductVariantWizard from "./ProductVariantWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ProductVariantViewModal from "./ProductVariantViewModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ProductVariantPage: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariantListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ProductVariant | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<ProductVariant | null>(null);
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ProductVariant", "CanAdd");
  const canEdit = hasPermission("ProductVariant", "CanEdit");
  const canDelete = hasPermission("ProductVariant", "CanDelete");

  const loadVariants = async () => {
    try {
      setIsLoading(true);
      setVariants(await getProductVariants());
    } catch (error) {
      console.error("Failed to load product variants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadVariants();
    const handleRefresh = () => void loadVariants();
    window.addEventListener("app-refresh", handleRefresh);
    return () => window.removeEventListener("app-refresh", handleRefresh);
  }, []);

  const handleView = async (id: number) => {
    try {
      setIsLoading(true);
      setViewData(await getProductVariantById(id));
    } catch (error) {
      console.error("Failed to load product variant:", error);
      alert("Could not load product variant details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      setEditData(await getProductVariantById(id));
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load product variant for editing:", error);
      alert("Could not load product variant for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product variant?")) return;
    try {
      await deleteProductVariant(id);
      await loadVariants();
    } catch (error) {
      console.error("Failed to delete product variant:", error);
      alert("Could not delete product variant.");
    }
  };

  const columns: TableColumn<ProductVariantListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "80px" },
    { name: "Product", selector: (row) => row.productName || `Product ${row.productId}`, sortable: true, grow: 1.5 },
    { name: "Variant Code", selector: (row) => row.variantCode, sortable: true, grow: 1 },
    { name: "Variant Name", selector: (row) => row.variantName, sortable: true, wrap: true, grow: 1.5 },
    { name: "Attributes", selector: (row) => row.attributes || "N/A", wrap: true, grow: 2 },
    {
      name: "Status",
      cell: (row) => <span className={row.active ? "rounded bg-green-100 px-2 py-1 text-green-700" : "rounded bg-gray-100 px-2 py-1 text-gray-600"}>{row.active ? "Active" : "Inactive"}</span>,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => <div className="flex justify-center gap-4">
        <button onClick={() => void handleView(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`} title="View" type="button"><FaEye size={16} /></button>
        {canEdit && <button onClick={() => void handleEdit(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`} title="Edit" type="button"><FaEdit size={16} /></button>}
        {canDelete && <button onClick={() => void handleDelete(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`} title="Delete" type="button"><FaTrash size={16} /></button>}
      </div>,
      width: "140px",
    },
  ];

  const filteredItems = variants.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <ProductVariantWizard editData={editData} onSuccess={() => { setShowWizard(false); setEditData(null); void loadVariants(); }} onCancel={() => { setShowWizard(false); setEditData(null); }} />}
    {viewData && <ProductVariantViewModal variant={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout title="Listing of Product Variants" columns={columns} data={filteredItems} isLoading={isLoading} filterText={filterText} onFilterChange={setFilterText} onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined} />
  </div>;
};

export default ProductVariantPage;
