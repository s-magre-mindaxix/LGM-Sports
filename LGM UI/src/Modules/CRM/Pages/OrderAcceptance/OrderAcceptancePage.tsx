import React, { useEffect, useState, useMemo, useRef } from "react";
import { type TableColumn } from "react-data-table-component";

import { FaEdit, FaTrash, FaEye, FaFilePdf, FaFileExcel } from "react-icons/fa";

import { toast } from "sonner";
import { getOAs, deleteOA, getOAById } from "./Services/OrderAcceptanceService";
import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions";
import OrderAcceptanceWizard from "./OrderAcceptanceWizard";
import OrderAcceptanceViewModal from "./OrderAcceptanceViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import type { OrderAcceptance } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { printAcceptancePDF } from "./Services/AcceptancePrintService";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";
import { printAcceptanceExcel } from "./Services/AcceptanceExcelService";

const OrderAcceptancePage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<OrderAcceptance | null>(null);
  const [viewData, setViewData] = useState<OrderAcceptance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const options = useEnquiryOptions();

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("OrderAcceptance", "CanAdd");
  const canEdit = hasPermission("OrderAcceptance", "CanEdit");
  const canDelete = hasPermission("OrderAcceptance", "CanDelete");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleTableScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;
    setShowLeftArrow(hasHorizontalScrollbar && el.scrollLeft > 0);
    setShowRightArrow(
      hasHorizontalScrollbar &&
        el.scrollLeft < el.scrollWidth - el.clientWidth - 1,
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleTableScroll();
    }, 200);

    window.addEventListener("resize", handleTableScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleTableScroll);
    };
  }, [list]);

  const scrollTable = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getOAs();
      setList(Array.isArray(data) ? data : []);
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
      sortable: true,
    },

    {
      name: "Order No",
      selector: (row) => row.gaxcePurchaseOrderNo || "N/A",
      sortable: true,
      width: "200px",
      style: { fontWeight: "bold", color: "#0b2c52" },
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      width: "200px",
    },
    // {
    //   name: "Offer No",
    //   selector: (row) => row.offerNo || "N/A",
    //   sortable: true,
    //   width: "200px",
    // },
    {
      name: "Type",
      selector: (row) => row.source || "PRODUCT",
      sortable: true,
      width: "110px",
      cell: (row) => {
        const source = row.source?.toUpperCase() || "PRODUCT";

        return (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              source.includes("SERVICE")
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {source}
          </span>
        );
      },
    },
    {
      name: "Currency",
      selector: (row) => row.currencyName || "INR",
      sortable: true,
      width: "80px",
    },

    {
      name: "Status",
      selector: (row) => row.status || "DRAFT",
      sortable: true,
      width: "110px",
      cell: (row) => {
        const status = row.status?.toUpperCase() || "DRAFT";

        return (
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              status === "FINAL"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },

    {
      name: "TotalAmount",
      selector: (row) => {
        const symbol = row.currencySymbol || "₹";
        const amount = (row.grandTotal || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `${symbol} ${amount}`;
      },
      sortable: true,
      width: "160px",
      style: { fontWeight: "bold", color: "#143463" },
    },

    {
      name: "Created Date",
      selector: (row) =>
        row.orderDate ? new Date(row.orderDate).toLocaleDateString() : "-",
      sortable: true,
      width: "130px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          {row.currencyName === "GBP" && (
            <button
              onClick={() => printAcceptanceExcel(row.orderAcceptanceId)}
              className={`${actionButtonStyles.base} bg-green-100 text-green-700 hover:bg-green-200`}
              title="Export Excel"
            >
              <FaFileExcel size={16} />
            </button>
          )}
                <button
          onClick={() => {
            toast.loading("Generating PDF...");

            printAcceptancePDF(row.orderAcceptanceId)
              .then(() => {
                toast.dismiss();
              })
              .catch(() => {
                toast.dismiss();
                toast.error("PDF Failed");
              });
          }}
          className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
          title="Print"
        >
          <FaFilePdf size={16} />
        </button>
          <button
            onClick={async () =>
              setViewData(await getOAById(row.orderAcceptanceId))
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={async () => {
                setEditData(await getOAById(row.orderAcceptanceId));
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
              onClick={() => setDeleteId(row.orderAcceptanceId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "160px",
    },
  ];

  const filteredItems = useMemo(() => {
    return list.filter((i) =>
      (
        (i.gaxcePurchaseOrderNo || "") +
        (i.offerNo || "") +
        (i.customerName || "") +
        (i.source || "")
      )
        .toLowerCase()
        .includes(filterText.toLowerCase()),
    );
  }, [list, filterText]);

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6 text-left">
      {showForm && (
        <OrderAcceptanceWizard
          editData={editData}
          options={options}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      {viewData && (
        <OrderAcceptanceViewModal
          data={viewData}
          options={options}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Order Acceptances"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
        scrollContainerRef={scrollContainerRef}
        onTableScroll={handleTableScroll}
        showLeftArrow={showLeftArrow}
        showRightArrow={showRightArrow}
        onScrollClick={scrollTable}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (deleteId) {
            await deleteOA(deleteId);
            loadData();
            setDeleteId(null);
          }
        }}
        title="Delete Order"
        message="Are you sure?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default OrderAcceptancePage;
