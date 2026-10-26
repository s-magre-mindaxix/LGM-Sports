import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFilePdf,
   FaFileInvoiceDollar,
  FaToggleOn,
  FaToggleOff,
  FaFileExcel,
} from "react-icons/fa";
import { toast } from "sonner";

import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions";
import {
  getProformaInvoices,
  deleteProformaInvoice,
  getProformaInvoiceById,
  getProformaInvoicePdfData,
  getDataForDummyInvoice,
  toggleProformaInvoiceStatus,
  getDummyInvoices,
  checkDummyExists,
  getDummyInvoicePdfData, 
  downloadProformaInvoiceExcel,
} from "./Services/ProformaInvoiceService";
import type {
  ProformaInvoice,
  ProformaInvoiceListItem,
  ProformaInvoicePdfData,
  DummyInvoice,
} from "./Services/types";

import ProformaInvoiceWizard from "./ProformaInvoiceWizard";
import DummyInvoiceWizard from "./DummyInvoiceWizard";
import PIViewModal from "./PIViewModal";
import ProformaInvoicePDFModal from "./ProformaInvoicePDFModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const ProformaInvoicePage: React.FC = () => {
  const [list, setList] = useState<ProformaInvoiceListItem[]>([]);
  const [viewMode, setViewMode] = useState<"Original" | "Dummy">("Original"); // New Toggle State
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editData, setEditData] = useState<ProformaInvoice | null>(null);
  const [viewData, setViewData] = useState<ProformaInvoice | null>(null);
  const [pdfData, setPdfData] = useState<ProformaInvoicePdfData | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");

  const [showDummyForm, setShowDummyForm] = useState(false);
  const [dummyInvoiceData, setDummyInvoiceData] = useState<DummyInvoice | null>(
    null,
  );

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("ProformaInvoice", "CanAdd");
  const canEdit = hasPermission("ProformaInvoice", "CanEdit");
  const canDelete = hasPermission("ProformaInvoice", "CanDelete");

  const options = useEnquiryOptions();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data =
        viewMode === "Original"
          ? await getProformaInvoices()
          : await getDummyInvoices();
      if (viewMode === "Dummy") {
  const mappedData = (data || []).map((x: any) => ({
    ...x,
    dummyInvoiceId: x.dummyInvoiceId,
    originalProformaInvoiceId: x.originalProformaInvoiceId,
    originalProformaInvoiceNo: x.originalProformaInvoiceNo,
  }));

  setList(mappedData);
}
else {
  setList(Array.isArray(data) ? data : []);
}
    } catch {
      toast.error(`Failed to load ${viewMode} invoices`);
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
  }, [viewMode]);

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleProformaInvoiceStatus(id);
      toast.success("Status updated successfully");
      loadData(); // Refresh the list
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDownloadPdf = async (id: number) => {
    const promise = getProformaInvoicePdfData(id);
    toast.promise(promise, {
      loading: "Generating PDF data...",
      success: (data) => {
        setPdfData(data);
        return "PDF is ready to download!";
      },
      error: "Could not fetch PDF details.",
    });
  };

  
 const handleDownloadDummyPdf = async (dummyInvoiceId: number) => {
    // Use the exact same pattern as handleDownloadPdf
    const promise = getDummyInvoicePdfData(dummyInvoiceId); // Use the new service function

    toast.promise(promise, {
      loading: "Generating Dummy PDF data...",
      success: (data) => {
        setPdfData(data); // This triggers the same modal with dummy data
        return "Dummy PDF is ready to download!";
      },
      error: "Could not fetch Dummy PDF details.",
    });
  };

  const handleDownloadExcel = async (
  proformaInvoiceId: number
) => {
  try {
    await downloadProformaInvoiceExcel(
      proformaInvoiceId
    );

    toast.success("Excel downloaded successfully");
  } catch {
    toast.error("Failed to download Excel");
  }
};

  const handleView = async (id: number) => {
    try {
      const data = await getProformaInvoiceById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch details for viewing");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const data = await getProformaInvoiceById(id);
      setEditData(data);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Could not fetch details for editing");
    }
  };

  const getStatusBadge = (status: string) => {
    const isActive = status === "Active";
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleCreateDummy = async (id: number) => {
    try {
      const exists = await checkDummyExists(id);
      if (exists) {
        toast.error("Dummy invoice already created for this Proforma Invoice");
        return;
      }
      const promise = getDataForDummyInvoice(id);

      toast.promise(promise, {
        loading: "Fetching invoice data...",
        success: (data) => {
          setDummyInvoiceData(data);
          setShowDummyForm(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return "Data loaded for dummy invoice!";
        },
        error: "Could not fetch data for dummy invoice.",
      });
    } catch {
      toast.error("Error checking dummy invoice");
    }
  };

  const columns: TableColumn<ProformaInvoiceListItem>[] = [
    {
      name: "Sr.No",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    {
      name: viewMode === "Original" ? "PI Number" : "Dummy Number",
      selector: (row: any) =>
        viewMode === "Original" ? row.proformaInvoiceNo : row.dummyInvoiceNo,
      sortable: true,
      width: "180px",
      style: { fontWeight: "bold", color: "#0b2c52" },
    },
    {
      name: "Created Date",
      selector: (row) => row.createdDate,
      sortable: true,
      width: "140px",
      cell: (row) => new Date(row.createdDate).toLocaleDateString("en-GB"),
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 2,
      style: { fontWeight: "bold" },
    },
   {
  name: "Date",
  // Selector now points to the correct property 'date' for the dummy view
  selector: (row) => (viewMode === "Original" ? row.createdDate : row.date),
  sortable: true,
  cell: (row) => {
    // For "Original", we still need to format the full timestamp
    if (viewMode === "Original") {
      return new Date(row.createdDate).toLocaleDateString("en-GB");
    }
    // For "Dummy Invoices", we directly return the pre-formatted string from the API
    return row.date;
  },
},
    ...(viewMode === "Original"
      ? [
          {
            name: "Status",
            width: "140px",
            cell: (row: any) => (
              <div className="flex items-center gap-2">
                {getStatusBadge(row.status)}
                {canEdit && (
                  <button
                    onClick={() => handleToggleStatus(row.proformaInvoiceId)}
                  >
                    {row.status === "Active" ? (
                      <FaToggleOn className="text-emerald-600" size={20} />
                    ) : (
                      <FaToggleOff className="text-gray-400" size={20} />
                    )}
                  </button>
                )}
              </div>
            ),
          },
        ]
      : [
          {
            name: "Ref Original",
            selector: (row: any) => row.originalProformaInvoiceNo,
            width: "150px",
          },
        ]),
    {
      name: "Total Amount",
       selector: (row) => row.totalAmount ?? row.grandTotal,
      sortable: true,
      width: "180px",
      style: { fontWeight: "bold" },
       cell: (row) =>
    `${row.currencySymbol} ${(row.totalAmount ?? row.grandTotal).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <div className="flex gap-3">
          {viewMode === "Original" ? (
            <>
              <button
                onClick={() => handleDownloadPdf(row.proformaInvoiceId)}
                className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
                title="Download PDF"
              >
                <FaFilePdf size={16} />
              </button>
              <button
                onClick={() => handleView(row.proformaInvoiceId)}
                className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                title="View"
              >
                <FaEye size={16} />
              </button>
              {canEdit && (
                <button
                  onClick={() => handleEdit(row.proformaInvoiceId)}
                  className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                  title="Edit"
                >
                  <FaEdit size={16} />
                </button>
              )}
              {canAdd && (
                <button
                  onClick={() => handleCreateDummy(row.proformaInvoiceId)}
                  disabled={row.hasDummy}
                  className={`${actionButtonStyles.base} bg-teal-600 hover:bg-teal-700 text-white ${
                    row.hasDummy ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={
                    row.hasDummy
                      ? "Dummy already created"
                      : "Create Dummy Invoice"
                  }
                >
                  <FaFileInvoiceDollar  size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setDeleteId(row.proformaInvoiceId)}
                  className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                  title="Delete"
                >
                  <FaTrash size={16} />
                </button>
              )}
            </>
          ) : (
            <>
            <button
              onClick={() => handleDownloadDummyPdf(row.dummyInvoiceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
              title="Download Dummy PDF"
            >
              <FaFilePdf size={16} />
            </button>

            <button
              onClick={() =>
                handleDownloadExcel(
                  row.originalProformaInvoiceId
                )
              }
             className={`${actionButtonStyles.base} bg-green-100 text-green-700 hover:bg-green-200`}
              title="Download Excel"
            >
              <FaFileExcel size={16} />
            </button>
          </>
          )}
        </div>
      ),
      width: "160px",
    },
  ];

  const filteredItems = list.filter(
    (item) =>
      (item.proformaInvoiceNo || item.dummyInvoiceNo || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()) ||
      (item.customerName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()),
  );

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* --- Wizard / Edit Form --- */}
      {showForm && (
        <ProformaInvoiceWizard
          editData={editData}
          options={options}
          onCancel={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditData(null);
            loadData();
          }}
        />
      )}

      {showDummyForm && dummyInvoiceData && (
        <DummyInvoiceWizard
          initialData={dummyInvoiceData}
          onCancel={() => {
            setShowDummyForm(false);
            setDummyInvoiceData(null);
          }}
          onSuccess={() => {
            setShowDummyForm(false);
            setDummyInvoiceData(null);
          }}
        />
      )}

      {/* --- VIEW MODAL --- */}
      {viewData && (
        <PIViewModal
          data={viewData}
          options={options}
          onClose={() => setViewData(null)}
        />
      )}

      {pdfData && (
        <ProformaInvoicePDFModal
          data={pdfData}
          onClose={() => setPdfData(null)}
        />
      )}

      {/* --- Main Table Container --- */}
      <div className="relative">
        {/* --- Toggle Buttons positioned perfectly next to Create Button --- */}
        <div className="absolute top-[30px] right-[200px] z-15 hidden lg:flex">
          <div className="bg-gray-100/50 p-1 rounded-lg border border-gray-200 flex gap-1 scale-90 origin-right">
            <button
              onClick={() => setViewMode("Original")}
              className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "Original"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              Original PI
            </button>
            <button
              onClick={() => setViewMode("Dummy")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === "Dummy"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              Customer Proforma Invoice
            </button>
          </div>
        </div>

        <ListingLayout<ProformaInvoiceListItem>
          title={
            viewMode === "Original"
              ? "Listing of Proforma Invoices"
              : "Listing of Dummy Invoices"
          }
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          filterText={filterText}
          onFilterChange={setFilterText}
          // Only show Create button in Original mode
          onCreate={
            canAdd && viewMode === "Original" ? handleCreateNew : undefined
          }
          createLabel="+ Create Invoice"
        />
      </div>

      {/* --- Delete Confirmation --- */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteProformaInvoice(deleteId);
              toast.success("Deleted successfully");
              loadData();
            } catch {
              toast.error("Failed to delete invoice");
            } finally {
              setDeleteId(null);
            }
          }
        }}
        title="Delete Invoice"
        message="Are you sure you want to delete this Proforma Invoice? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProformaInvoicePage;
