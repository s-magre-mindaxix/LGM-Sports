import React, { useEffect, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaPlus, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";
import { getPOs, deletePO, getPOById } from "./Services/PurchaseOrderService";
import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions";
import { printPurchaseOrderPDF } from "./Services/PurchaseOrderPrintService";

import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import PurchaseOrderWizard from "./PurchaseOrderWizard";
import PurchaseOrderViewModal from "./PurchaseOrderViewModal";
import { listingTableStyles } from "../../../../Components/Common/listingTableStyles";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import LogoLoader from "../../../../Components/Common/LogoLoader";

const PurchaseOrderPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("PurchaseOrder", "CanAdd");
  const canEdit = hasPermission("PurchaseOrder", "CanEdit");
  const canDelete = hasPermission("PurchaseOrder", "CanDelete");

  const options = useEnquiryOptions();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getPOs();
      setList(data);
    } catch {
      toast.error("Failed to load records");
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

  const columns: TableColumn<any>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "60px",
    },
    {
      name: "PO Number",
      selector: (row) => row.purchaseOrderNo,
      sortable: true,
      width: "200px",
      style: { fontWeight: "bold", color: "#0b2c52" },
    },
    {
      name: "PO Date",
      selector: (row) =>
        row.purchaseOrderDate
          ? new Date(row.purchaseOrderDate).toLocaleDateString("en-GB")
          : "N/A",
      sortable: true,
      width: "120px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            row.status === "FINAL"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {row.status || "DRAFT"}
        </span>
      ),
      width: "100px",
    },
    {
      name: "Total Amount",
      selector: (row) => {
        const symbol = row.currencySymbol || "₹";
        const amount = (row.grandTotal || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `${symbol} ${amount}`;
      },
      sortable: true,
      grow: 1,
      right: true,
      style: { fontWeight: "bold", color: "#154068" },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
              <button
        title="Print PO"
        onClick={() => {
          toast.loading("Generating PDF...");

          printPurchaseOrderPDF(row.purchaseOrderId)
            .then(() => {
              toast.dismiss();
            })
            .catch(() => {
              toast.dismiss();
              toast.error("PDF Failed");
            });
        }}
        className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
      >
        <FaFilePdf size={16} />
      </button>
          <button
            title="View"
            onClick={async () =>
              setViewData(await getPOById(row.purchaseOrderId))
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              title="Edit"
              onClick={async () => {
                setEditData(await getPOById(row.purchaseOrderId));
                setShowForm(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              title="Delete"
              onClick={() => setDeleteId(row.purchaseOrderId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "120px",
    },
  ];

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6 text-left">
      {showForm && (
        <PurchaseOrderWizard
          editData={editData}
          options={options}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-[#154068] pb-1">
            Listing of Purchase Orders
          </h2>
          {!showForm && canAdd && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="bg-[#f07837] text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#0d3357] transition flex items-center gap-2"
            >
              <FaPlus /> New Purchase Order
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={list.filter((i) =>
            (i.purchaseOrderNo + i.customerName)
              .toLowerCase()
              .includes(filterText.toLowerCase()),
          )}
          pagination
          customStyles={listingTableStyles}
          persistTableHead
          striped
          highlightOnHover
          progressPending={isLoading}
          progressComponent={<LogoLoader />}
          subHeader={
            <div className="flex items-center justify-end w-full">
              <label className="text-gray-600 mr-2">Search:</label>
              <input
                type="text"
                className="border border-gray-300 rounded-md px-3 py-2 w-72 bg-white"
                placeholder="Search purchase order..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          }
        />
      </div>

      {viewData && (
        <PurchaseOrderViewModal
          data={viewData}
          options={options}
          onClose={() => setViewData(null)}
        />
      )}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deletePO(deleteId);
            loadData();
            setDeleteId(null);
          }
        }}
        title="Delete PO"
        message="Are you sure?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default PurchaseOrderPage;
