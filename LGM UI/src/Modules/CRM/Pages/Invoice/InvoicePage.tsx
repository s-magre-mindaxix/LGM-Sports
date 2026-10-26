import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaFilePdf,FaFileExcel, FaFileInvoiceDollar,  } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import InvoiceWizard from "./InvoiceWizard";
import FinalDummyInvoiceWizard from "./FinalDummyInvoiceWizard"; 
import {
  deleteInvoice,
  getAllInvoices,
  getInvoicePdfData,
  getFinalDummyInvoices,     
  checkFinalDummyExists,     
  getDataForFinalDummyInvoice,
  getDummyInvoicePdfData,
  downloadInvoiceExcel
} from "./Services/InvoiceService";
import type { InvoiceViewData, FinalDummyInvoice  } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import InvoiceViewModal from "./InvoiceViewModal";
import InvoicePDFModal from "./InvoicePDFModal";
import { toast } from "sonner";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";



interface InvoiceListItem {
  invoiceId: number;
   finalDummyInvoiceId?: number;
  invoiceNo: string;
  totalAmount: number;
  currencyName: string;

  // --- Optional properties that may or may not exist ---
  currencyId?: number;
  customerName?: string;
  createdDate?: string;
  createdTime?: string;
  expiryDate?: string | null;
  hasDummy?: boolean;
}

const InvoicePage: React.FC = () => {
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceViewData | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editInvoice, setEditInvoice] = useState<InvoiceViewData | null>(null);
  const [invoicePdfData, setInvoicePdfData] = useState<InvoiceViewData | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<"Original" | "Dummy">("Original");
  const [showFinalDummyForm, setShowFinalDummyForm] = useState(false);
  const [finalDummyInvoiceData, setFinalDummyInvoiceData] = useState<FinalDummyInvoice | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Invoice", "CanAdd");
  const canEdit = hasPermission("Invoice", "CanEdit");
  const canDelete = hasPermission("Invoice", "CanDelete");

 const loadData = async () => {
    try {
      setLoading(true);

      const data =
        viewMode === "Original"
          ? await getAllInvoices()
          : await getFinalDummyInvoices();

      let mappedData;

      if (viewMode === "Original") {
        mappedData = (Array.isArray(data) ? data : []).map((item: any) => ({
          invoiceId: item.invoiceId,
          invoiceNo: item.invoiceNo,
          currencyId: item.currencyId,
          currencyName: item.currencyName,
          totalAmount: item.balanceAmount || 0,
          createdDate: item.invoiceDate
            ? new Date(item.invoiceDate).toLocaleDateString("en-GB")
            : "",
          createdTime: item.invoiceDate
            ? new Date(item.invoiceDate).toLocaleTimeString()
            : "",
          expiryDate: item.invoiceDueDate || null,
          hasDummy: item.hasDummy || false,
        }));
      } else {
        // This mapping for Dummy Invoices is now valid due to the updated interface
        mappedData = (Array.isArray(data) ? data : []).map((item: any) => ({
          invoiceId: item.originalInvoiceId,
          finalDummyInvoiceId: item.finalDummyInvoiceId,
          invoiceNo: item.finalDummyInvoiceNo,
          customerName: item.customerName,
          currencyName: item.currencySymbol, // ✅ FIX: Changed from currencyName to currencySymbol
          totalAmount: item.balanceAmount ,
        }));
      }

      setInvoices(mappedData);
    } catch (error) {
      toast.error(`Failed to fetch ${viewMode.toLowerCase()} invoices`);
      console.error(error);
    } finally {
      setLoading(false);
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

   const handleCreateFinalDummy = async (id: number) => {
    try {
      const exists = await checkFinalDummyExists(id);
      if (exists) {
        toast.error("Dummy invoice already created for this Invoice.");
        return;
      }
      const promise = getDataForFinalDummyInvoice(id);
      toast.promise(promise, {
        loading: "Fetching invoice data...",
        success: (data) => {
          setFinalDummyInvoiceData(data);
          setShowFinalDummyForm(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return "Data loaded for dummy invoice!";
        },
        error: "Could not fetch data for dummy invoice.",
      });
    } catch {
      toast.error("Error checking for existing dummy invoice.");
    }
  };

  const handleCreateNew = () => {
    setEditInvoice(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (id: number) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.GetInvoiceById}/${id}`);
      const data = await res.json();

      setViewInvoice(data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.GetInvoiceById}/${id}`);
      const data = await res.json();

      setEditInvoice(data);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

  const handleDownloadPdf = async (id: number) => {
    try {
      const data = await getInvoicePdfData(id);
      setInvoicePdfData(data);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleDownloadDummyPdf = async (id: number) => {
    try {
      const data = await getDummyInvoicePdfData(id);
      setInvoicePdfData(data); // Re-use the same state and modal
    } catch (error) {
      toast.error("Error generating Dummy Invoice PDF");
      console.error("Error generating PDF:", error);
    }
  };

  const columns: TableColumn<any>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "40px",
    },
    {
      name: viewMode === "Original" ? "Invoice No" : "Dummy No",
      selector: (row: any) => row.invoiceNo,
      sortable: true,
      width: "140px",
      style: { fontWeight: "bold", color: "#0b2c52" },
    },
    // Conditionally add "Customer Name" column ONLY for Dummy Invoices view
    ...(viewMode === "Dummy"
      ? [
          {
            name: "Customer Name",
            selector: (row: any) => row.customerName,
            sortable: true,
          },
        ]
      : []),
    {
      name: "Currency",
      selector: (row) => row.currencyName || "",
      sortable: true,
      width: "70px",
    },
    {
      name: "Total Amount",
      selector: (row) => row.totalAmount || 0,
      sortable: true,
    },
    // Conditionally add date columns ONLY for Original Invoices view
    ...(viewMode === "Original"
      ? [
          {
            name: "Created Date",
            selector: (row: { createdDate: any; }) => row.createdDate || "",
            sortable: true,
          },
          // {
          //   name: "Created Time",
          //   selector: (row: { createdTime: any; }) => row.createdTime || "",
          // },
          {
            name: "Expiry Date",
            selector: (row: { expiryDate: any; }) => row.expiryDate || "",
            sortable: true,
            cell: (row: { expiryDate: string | number | Date; }) =>
              row.expiryDate
                ? new Date(row.expiryDate).toLocaleDateString("en-GB")
                : "N/A",
          },
        ]
      : []),
      
    // ✅ FIX: Conditionally add the ENTIRE "Actions" column only for Original Invoices
    ...(viewMode === "Original"
      ? [
          {
            name: "Actions",
            cell: (row: any) => (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDownloadPdf(row.invoiceId)}
                  className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
                  title="PDF"
                >
                  <FaFilePdf size={16} />
                </button>
                <button
                  onClick={() => handleView(row.invoiceId)}
                  className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                  title="View"
                >
                  <FaEye size={16} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => handleEdit(row.invoiceId)}
                    className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                    title="Edit"
                  >
                    <FaEdit size={16} />
                  </button>
                )}
                {canAdd && (
                  <button
                    onClick={() => handleCreateFinalDummy(row.invoiceId)}
                    disabled={row.hasDummy}
                    className={`${actionButtonStyles.base} bg-teal-600 hover:bg-teal-700 text-white ${row.hasDummy ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={
                      row.hasDummy ? "Dummy already created" : "Create Dummy Invoice"
                    }
                  >
                    <FaFileInvoiceDollar size={14} />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeleteId(row.invoiceId)}
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
        ]
      : []),

        // Actions for Dummy Invoices
    ...(viewMode === "Dummy"
      ? [
          {
            name: "Actions",
            cell: (row: any) => (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleDownloadDummyPdf(row.finalDummyInvoiceId)}
                  className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
                  title="Download Dummy PDF"
                >
                  <FaFilePdf size={16} />
                </button>

              <button
              onClick={() => downloadInvoiceExcel(row.invoiceId)}
             className={`${actionButtonStyles.base} bg-green-100 text-green-700 hover:bg-green-200`}
              title="Download Excel"
            >
              <FaFileExcel size={14} />
              
            </button>
              </div>
            ),
            width: "140px",
          },
        ]
      : []),
  ];

  const filteredItems = invoices.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
       {showForm && <InvoiceWizard editData={editInvoice} onCancel={() => { setShowForm(false); setEditInvoice(null); }} onSuccess={() => { setShowForm(false); setEditInvoice(null); loadData(); }} />}
       
        {showFinalDummyForm && finalDummyInvoiceData && (
        <FinalDummyInvoiceWizard
          initialData={finalDummyInvoiceData}
          onCancel={() => { setShowFinalDummyForm(false); setFinalDummyInvoiceData(null); }}
          onSuccess={() => { setShowFinalDummyForm(false); setFinalDummyInvoiceData(null); /* Optionally switch view: setViewMode('Dummy'); */ loadData(); }}
        />
      )}
       <div className="relative">
        {/* --- NEW TOGGLE BUTTONS --- */}
        <div className="absolute top-[30px] right-[200px] z-15 hidden lg:flex">
          <div className="bg-gray-100/50 p-1 rounded-lg border border-gray-200 flex gap-1 scale-90 origin-right">
            <button onClick={() => setViewMode("Original")} className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "Original" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-200"}`}>
              Original Invoices
            </button>
            <button onClick={() => setViewMode("Dummy")} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "Dummy" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-200"}`}>
              Customer Invoices
            </button>
          </div>
        </div>

        <ListingLayout
          title={viewMode === "Original" ? "Listing of Invoices" : "Listing of Dummy Invoices"}
          columns={columns}
          data={filteredItems}
          isLoading={loading}
          filterText={filterText}
          onFilterChange={setFilterText}
          onCreate={canAdd && viewMode === "Original" ? handleCreateNew : undefined}
          createLabel="+ Create Invoice"
        />
      </div>


      {showViewModal && viewInvoice && (
        <InvoiceViewModal
          data={viewInvoice}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {invoicePdfData && (
        <InvoicePDFModal
          data={invoicePdfData}
          onClose={() => setInvoicePdfData(null)}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            try {
              await deleteInvoice(deleteId);
              toast.success("Invoice deleted successfully");
                 loadData();
            } catch {
              toast.error("Failed to delete invoice");
            } finally {
              setDeleteId(null);
            }
          }
        }}
        title="Delete Invoice"
        message="Are you sure you want to delete this Invoice? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default InvoicePage;
