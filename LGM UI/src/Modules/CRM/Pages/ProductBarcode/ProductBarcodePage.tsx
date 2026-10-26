import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import ProductBarcodeViewModal from "./ProductBarcodeViewModal";
import ProductBarcodeWizard from "./ProductBarcodeWizard";
import {
  deleteProductBarcode,
  getProductBarcodeById,
  getProductBarcodes,
} from "./Services/ProductBarcodeService";
import type { ProductBarcode, ProductBarcodeListItem } from "./Services/types";

const ProductBarcodePage: React.FC = () => {
  const [barcodes, setBarcodes] = useState<ProductBarcodeListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ProductBarcode | null>(null);
  const [viewData, setViewData] = useState<ProductBarcodeListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ProductBarcode", "CanAdd");
  const canEdit = hasPermission("ProductBarcode", "CanEdit");
  const canDelete = hasPermission("ProductBarcode", "CanDelete");

  const loadBarcodes = async () => {
    setIsLoading(true);
    try {
      setBarcodes(await getProductBarcodes());
    } catch (error) {
      console.error("Failed to load product barcodes:", error);
      window.alert("Could not load product barcodes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBarcodes();
    const handleRefresh = () => void loadBarcodes();
    window.addEventListener("app-refresh", handleRefresh);
    return () => window.removeEventListener("app-refresh", handleRefresh);
  }, []);

  const handleView = async (id: number) => {
    try {
      setViewData(await getProductBarcodeById(id));
    } catch (error) {
      console.error("Failed to load product barcode:", error);
      window.alert("Could not load product barcode details.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const item = await getProductBarcodeById(id);
      setEditData(item);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load product barcode for editing:", error);
      window.alert("Could not load product barcode for editing.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product barcode?")) return;
    try {
      await deleteProductBarcode(id);
      await loadBarcodes();
    } catch (error) {
      console.error("Failed to delete product barcode:", error);
      window.alert("Could not delete product barcode.");
    }
  };

  const columns: TableColumn<ProductBarcodeListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "80px" },
    { name: "Barcode", selector: (row) => row.barcode, sortable: true, grow: 1.2 },
    { name: "Type", selector: (row) => row.barcodeType, sortable: true, width: "130px" },
    { name: "Product", selector: (row) => row.productName || (row.productId ? `Product ${row.productId}` : "N/A"), sortable: true, grow: 1.2 },
    { name: "Variant", selector: (row) => row.variantName || (row.variantId ? `Variant ${row.variantId}` : "N/A"), sortable: true, grow: 1.2 },
    { name: "Accessory", selector: (row) => row.accessoryName || (row.accessoryId ? `Accessory ${row.accessoryId}` : "N/A"), sortable: true, grow: 1.2 },
    { name: "Primary", cell: (row) => row.isPrimary ? "Yes" : "No", width: "100px" },
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

  const filteredItems = barcodes.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <ProductBarcodeWizard
      editData={editData}
      onSuccess={() => { setShowWizard(false); setEditData(null); void loadBarcodes(); }}
      onCancel={() => { setShowWizard(false); setEditData(null); }}
    />}
    {viewData && <ProductBarcodeViewModal barcode={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout
      title="Listing of Product Barcodes"
      columns={columns}
      data={filteredItems}
      isLoading={isLoading}
      filterText={filterText}
      onFilterChange={setFilterText}
      onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined}
    />
  </div>;
};

export default ProductBarcodePage;
