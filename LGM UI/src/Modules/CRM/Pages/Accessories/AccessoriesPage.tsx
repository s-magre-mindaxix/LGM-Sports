import React, { useEffect, useState, useMemo, useRef } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaHistory,
  FaFileUpload,
  FaFileDownload,
} from "react-icons/fa";
import { toast } from "sonner";
import {
  getAccessories,
  deleteAccessory,
  getAccessoryById,
  importAccessoriesExcel,
  downloadAccessoriesExcel,
} from "./Services/AccessoriesService";
import type { AccessoriesListItem, Accessories } from "./Services/types";
import AccessoriesWizard from "./AccessoriesWizard";
import AccessoriesViewModal from "./AccessoriesViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { useProductDropdowns } from "../Product/Hooks/useProductDropdowns";
import AccessoryLogModal from "./AccessoryLogModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const AccessoriesPage: React.FC = () => {
  const [data, setData] = useState<AccessoriesListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Accessories | null>(null);
  const [viewData, setViewData] = useState<Accessories | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const { options } = useProductDropdowns();
  const [logModal, setLogModal] = useState({ isOpen: false, id: 0, name: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Accessories", "CanAdd");
  const canEdit = hasPermission("Accessories", "CanEdit");
  const canDelete = hasPermission("Accessories", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAccessories();
      setData(Array.isArray(res) ? res : []);
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

  // --- NEW HANDLERS FOR IMPORT/EXPORT ---
  const handleDownloadExcel = async () => {
    const toastId = toast.loading("Preparing download...");
    try {
      const blob = await downloadAccessoriesExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Accessories_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success("Accessories Excel downloaded successfully!", {
        id: toastId,
      });
    } catch (error) {
      toast.error("Failed to download Excel file.", { id: toastId });
      console.error(error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading and processing Excel file...");
    try {
      await importAccessoriesExcel(file);
      toast.success("Accessories imported successfully!", { id: toastId });
      loadData(); // Refresh data
    } catch (error) {
      toast.error("An error occurred during import.", { id: toastId });
      console.error(error);
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleEdit = async (id: number) => {
    setIsLoading(true);
    const res = await getAccessoryById(id);
    setEditData(res);
    setShowWizard(true);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (id: number) => {
    setIsLoading(true);
    const res = await getAccessoryById(id);
    setViewData(res);
    setIsLoading(false);
  };

  const columns: TableColumn<AccessoriesListItem>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "Image",
      cell: (row) => (
        <div className="w-12 h-12 rounded border overflow-hidden flex items-center justify-center bg-gray-50 my-1">
          {row.accessoriesImagePath ? (
            <img
              src={`${FILE_BASE_URL}${row.accessoriesImagePath}`}
              alt={row.accessoriesName || "Accessory"}
              className="w-full h-full object-cover"
            />
          ) : (
          <span className="text-[10px] font-extrabold tracking-wider text-[#a6a29b]">NO IMG</span>
          )}
        </div>
      ),
      width: "110px",
    },
    {
      name: "Accessory Code",
      cell: (row) => (
        <div className="leading-tight">
          <div>{row.accessoriesCode || "N/A"}</div>
          {row.partNo && (
            <div className="text-sm text-gray-500">({row.partNo})</div>
          )}
        </div>
      ),
      sortable: true,
      width: "170px",
    },
    {
      name: "Name",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">
            {row.accessoriesName}
          </span>
          {row.accessoriesDescription && (
            <span className="text-xs text-gray-500">
              ({row.accessoriesDescription})
            </span>
          )}
        </div>
      ),
      sortable: true,
      grow: 2,
      wrap: true,
      width: "220px",
    },
    {
      name: "Vendor",
      selector: (row) =>
        row.vendorName ? `${row.vendorName} (${row.vendorCode || ""})` : "N/A",
      sortable: true,
      width: "160px",
    },
    {
      name: "Company",
      selector: (row) => row.companyNameOfProduct || "N/A",
      sortable: true,
      width: "160px",
    },
    {
      name: "Price",
      selector: (row) => {
        const symbol = row.currencyPrices?.[0]?.currencySymbol || "₹";
        return `${symbol}${(row.salePrice || 0).toLocaleString()}`;
      },
      // selector: (row) => `₹${row.salePrice.toLocaleString()}`,
      sortable: true,
      width: "130px",
    },
    {
      name: "Qty.",
      selector: (row) => row.availableQuantity,
      sortable: true,
      width: "100px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={() => handleView(row.accessoriesId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.accessoriesId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() =>
                setDeleteModal({ isOpen: true, id: row.accessoriesId })
              }
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "130px",
    },
    {
      name: "History",
      cell: (row) => (
        <button
          onClick={() =>
            setLogModal({
              isOpen: true,
              id: row.accessoriesId,
              name: row.accessoriesName,
            })
          }
          className="rounded-xl bg-[#fff0e7] p-2 text-[#c65b27] transition hover:scale-110 hover:bg-[#ffe1ce]"
          title="Stock History"
        >
          <FaHistory size={16} />
        </button>
      ),
      width: "100px",
    },
  ];

  const filteredItems = data.filter(
    (x) =>
      (x.accessoriesName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (x.partNo || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (x.accessoriesCode || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (x.vendorName || "").toLowerCase().includes(filterText.toLowerCase()),
  );

  const subHeaderComponent = useMemo(
    () => (
        <div className="mb-3 flex w-full items-center justify-end gap-2">
        <label className="mr-1 text-[11px] font-extrabold uppercase tracking-wider text-[#77766f]">
          Search:
        </label>
        <input
          type="text"
          className="w-full rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2 text-sm outline-none transition focus:border-[#f07837] focus:ring-4 focus:ring-[#f07837]/10 sm:w-72"
          placeholder="Search by name, code, or vendor..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
    ),
    [filterText],
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f7f6f2] p-4 sm:p-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept=".xlsx, .xls"
      />
      {showWizard && (
        <AccessoriesWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            loadData();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {viewData && (
        <AccessoriesViewModal
          data={viewData}
          onClose={() => setViewData(null)}
          options={options}
        />
      )}

      {logModal.isOpen && (
        <AccessoryLogModal
          accessoryId={logModal.id}
          accessoryName={logModal.name}
          onClose={() => setLogModal({ isOpen: false, id: 0, name: "" })}
        />
      )}

      <div className="rounded-3xl border border-black/[.06] bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#c65b27]">LGM Sports · Product catalog</p>
            <h1 className="text-2xl font-black tracking-tight text-[#252a2e] sm:text-3xl">Accessories</h1>
            <p className="mt-1 text-sm text-[#77766f]">Manage accessory details, stock, pricing, and vendors.</p>
          </div>

          {!showWizard && (
            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              {canAdd && (
                <button
                  onClick={handleImportClick}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#a64a1d] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#873c18]"
                  title="Import from Excel"
                >
                  <FaFileUpload /> Import
                </button>
              )}
              <button
                onClick={handleDownloadExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-[#fff0e7] px-4 py-2.5 text-sm font-semibold text-[#a64a1d] shadow-sm transition hover:bg-[#ffe1ce]"
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
                  className="rounded-xl bg-[#f07837] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dd6328]"
                >
                  + Create New
                </button>
              )}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/[.07]">
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
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await deleteAccessory(deleteModal.id);
          loadData();
        }}
        title="Delete Accessory"
        message="Confirm Delete?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AccessoriesPage;