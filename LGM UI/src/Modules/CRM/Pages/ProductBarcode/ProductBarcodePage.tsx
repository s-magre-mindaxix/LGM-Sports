import React, { useEffect, useState } from "react";
import { getProductBarcodes, deleteProductBarcode, getProductBarcodeById } from "./Services/ProductBarcodeService";
import type { ProductBarcode, ProductBarcodeListItem } from "./Services/types";
import ProductBarcodeWizard from "./ProductBarcodeWizard";
import ProductBarcodeViewModal from "./ProductBarcodeViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ProductBarcodePage: React.FC = () => {
  const [items, setItems] = useState<ProductBarcodeListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ProductBarcode | null>(null);
  const [viewData, setViewData] = useState<ProductBarcode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ProductBarcode", "CanAdd");
  const canEdit = hasPermission("ProductBarcode", "CanEdit");
  const canDelete = hasPermission("ProductBarcode", "CanDelete");

  const loadItems = async () => {
    setIsLoading(true);
    try { setItems(await getProductBarcodes()); }
    catch (error) { console.error("Failed to load product barcodes:", error); }
    finally { setIsLoading(false); }
  };
  useEffect(() => {
    void loadItems();
    const refresh = () => void loadItems();
    window.addEventListener("app-refresh", refresh);
    return () => window.removeEventListener("app-refresh", refresh);
  }, []);

  const handleView = async (id: number) => {
    setIsLoading(true);
    try { setViewData(await getProductBarcodeById(id)); }
    catch (error) { console.error("Failed to load barcode:", error); window.alert("Could not load barcode details."); }
    finally { setIsLoading(false); }
  };
  const handleEdit = async (id: number) => {
    setIsLoading(true);
    try { setEditData(await getProductBarcodeById(id)); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (error) { console.error("Failed to load barcode for editing:", error); window.alert("Could not load barcode for editing."); }
    finally { setIsLoading(false); }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this barcode?")) return;
    try { await deleteProductBarcode(id); await loadItems(); }
    catch (error) { console.error("Failed to delete barcode:", error); window.alert("Could not delete barcode."); }
  };

  const columns: TableColumn<ProductBarcodeListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "75px" },
    { name: "ID", selector: (row) => row.id, sortable: true, width: "75px" },
    { name: "Barcode", selector: (row) => row.barcode, sortable: true, grow: 1.5 },
    { name: "Type", selector: (row) => row.barcodeType, sortable: true, width: "140px" },
    { name: "Product ID", selector: (row) => row.productId ?? "—", sortable: true, width: "115px" },
    { name: "Variant ID", selector: (row) => row.variantId ?? "—", sortable: true, width: "115px" },
    { name: "Accessory ID", selector: (row) => row.accessoryId ?? "—", sortable: true, width: "120px" },
    { name: "Primary", cell: (row) => row.isPrimary ? "Yes" : "No", sortable: true, width: "95px" },
    { name: "Status", cell: (row) => <span className={row.active ? "rounded bg-green-100 px-2 py-1 text-green-700" : "rounded bg-gray-100 px-2 py-1 text-gray-600"}>{row.active ? "Active" : "Inactive"}</span>, width: "105px" },
    { name: "Actions", cell: (row) => <div className="flex justify-center gap-4">
      <button type="button" title="View" onClick={() => void handleView(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye size={16} /></button>
      {canEdit && <button type="button" title="Edit" onClick={() => void handleEdit(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit size={16} /></button>}
      {canDelete && <button type="button" title="Delete" onClick={() => void handleDelete(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash size={16} /></button>}
    </div>, width: "140px" },
  ];
  const filteredItems = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()));
  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <ProductBarcodeWizard editData={editData} onSuccess={() => { setShowWizard(false); setEditData(null); void loadItems(); }} onCancel={() => { setShowWizard(false); setEditData(null); }} />}
    {viewData && <ProductBarcodeViewModal item={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout title="Listing of Product Barcodes" columns={columns} data={filteredItems} isLoading={isLoading} filterText={filterText} onFilterChange={setFilterText} onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined} />
  </div>;
};
export default ProductBarcodePage;
