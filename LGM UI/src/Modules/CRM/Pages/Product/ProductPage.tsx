import React, { useEffect, useMemo, useState, useRef } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileUpload,
  FaFileDownload,
} from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getProducts,
  deleteProduct,
  getProductById,
  importProductsExcel,
  downloadProductsExcel,
} from "./Services/ProductService";
import type { ProductListItem, Product } from "./Services/types";
import { useProductDropdowns } from "./Hooks/useProductDropdowns";

// Components
import ProductWizard from "./ProductWizard";
import ProductViewModal from "./ProductViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  actionButtonStyles,
  buttonStyles,
} from "../../../../Components/Common/buttonStyles";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Product | null>(null);
  const [viewData, setViewData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { options } = useProductDropdowns();

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Product", "CanAdd");
  const canEdit = hasPermission("Product", "CanEdit");
  const canDelete = hasPermission("Product", "CanDelete");

  // 1. Load Data Function
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts();
      setProducts(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleRefresh = () => {
      loadData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  // 2. Action Handlers
  const handleView = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getProductById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch product details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getProductById(id);
      setEditData(data);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching product details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteModal.id);
      toast.success("Product deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting product");
    }
  };

  // --- NEW HANDLERS FOR IMPORT/DOWNLOAD ---

  const handleDownloadExcel = async () => {
    const toastId = toast.loading("Preparing download...");
    try {
      const blob = await downloadProductsExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `Products_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Products Excel downloaded successfully!", { id: toastId });
    } catch (error) {
      toast.error("Failed to download Excel file.", { id: toastId });
      console.error(error);
    }
  };

  const handleImportClick = () => {
    // Trigger the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading and processing Excel file...");
    try {
      await importProductsExcel(file);
      toast.success("Products imported successfully!", { id: toastId });
      loadData(); // Refresh the data grid
    } catch (error) {
      toast.error("An error occurred during import.", { id: toastId });
      console.error(error);
    } finally {
      // Reset the file input value to allow re-uploading the same file
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  // 3. DataTable Column Definitions
  const columns: TableColumn<ProductListItem>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "Product Image",
      cell: (row) => (
        <div className="w-10 h-10 rounded border overflow-hidden bg-gray-50 my-1 flex items-center justify-center">
          {row.productImagePath ? (
            <img
              src={`${FILE_BASE_URL}${row.productImagePath}`}
              alt="product"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[8px] text-gray-400 uppercase font-bold">
              No Image
            </span>
          )}
        </div>
      ),
      width: "130px",
    },
    {
      name: "Product Code",
      cell: (row) => (
        <div className="leading-tight">
          <div>{row.productCode || "N/A"}</div>
          {row.partNo && (
            <div className="text-sm text-gray-500">({row.partNo})</div>
          )}
        </div>
      ),
      sortable: true,
      width: "180px",
    },
    {
      name: "Product Name",
      selector: (row) => row.productName || "",
      sortable: true,
      grow: 2,
      width: "170px",
      wrap: true,
    },
    {
      name: "Vendor",
      selector: (row) =>
        row.vendorName ? `${row.vendorName} (${row.vendorCode || ""})` : "N/A",
      sortable: true,
      width: "220px",
      wrap: true,
    },
    {
      name: "Company Name",
      selector: (row) => row.companyNameOfProduct || "N/A",
      sortable: true,
      width: "180px",
      wrap: true,
    },
    {
      name: "Sale Price",
      selector: (row) => {
        const symbol = row.currencyPrices?.[0]?.currencySymbol || "₹";
        return `${symbol}${(row.salePrice || 0).toLocaleString()}`;
      },
      sortable: true,
      width: "180px",
    },
    {
      name: "Available Qty",
      selector: (row) => row.availableQuantity ?? 0,
      sortable: true,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={() => handleView(row.productId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.productId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() =>
                setDeleteModal({ isOpen: true, id: row.productId })
              }
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "180px",
    },
  ];

  // 4. Search & Filter Logic
  const filteredItems = useMemo(() => {
    return products.filter(
      (item) =>
        (item.productName || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        (item.partNo || "").toLowerCase().includes(filterText.toLowerCase()) ||
        (item.productCode || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()),
    );
  }, [products, filterText]);

  const subHeaderComponent = useMemo(
    () => (
      <div className="flex items-center justify-end w-full mb-2">
        <label className="text-gray-600 mr-2 text-sm font-semibold">
          Search:
        </label>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-1.5 w-72 bg-white outline-none focus:border-blue-500 transition"
          placeholder="Search by name or code..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
    ),
    [filterText],
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {/* ADD THIS HIDDEN FILE INPUT ELEMENT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />

      {/* WIZARD FORM */}
      {showWizard && (
        <div className="animate-in slide-in-from-top duration-500">
          <ProductWizard
            editData={editData}
            onSuccess={() => {
              setShowWizard(false);
              loadData();
              setEditData(null);
            }}
            onCancel={() => {
              setShowWizard(false);
              setEditData(null);
            }}
          />
        </div>
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <ProductViewModal
          product={viewData}
          onClose={() => setViewData(null)}
          options={options}
        />
      )}

      {/* LISTING TABLE */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-[#0b2c52] border-b-2 border-[#0b2c52] pb-1">
            Listing of Products
          </h2>

          {/* CORRECTED CONDITIONAL WRAPPER */}
          {!showWizard && (
            <div className="flex items-center gap-3">
              {canAdd && (
                <button
                  onClick={handleImportClick}
                  className={buttonStyles.import}
                  title="Import from Excel"
                >
                  <FaFileUpload /> Import
                </button>
              )}
              <button
                onClick={handleDownloadExcel}
                className={buttonStyles.export}
                title="Download as Excel"
              >
                <FaFileDownload /> Export
              </button>
              {canAdd && (
                <button
                  onClick={() => {
                    setEditData(null);
                    setShowWizard(true);
                  }}
                  className={buttonStyles.create}
                >
                  + Create New
                </button>
              )}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          striped
          highlightOnHover
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          customStyles={listingTableStyles}
          // subHeader
          subHeader={subHeaderComponent}
          persistTableHead
        />
      </div>

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProductPage;
