import React, { useEffect, useMemo, useRef, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";
import {
  getEnquiries,
  deleteEnquiry,
  getEnquiryById,
} from "./Services/EnquiryService";
import { useEnquiryOptions } from "./Hooks/useEnquiryOptions";
import { printEnquiryPDF } from "./Services/EnquiryPrintService";
import EnquiryWizard from "./EnquiryWizard";
import type { Enquiry } from "./Services/types";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import EnquiryViewModal from "./EnquiryViewModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const EnquiryPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Enquiry | null>(null);
  const [viewData, setViewData] = useState<Enquiry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const options = useEnquiryOptions();

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Enquiry", "CanAdd");
  const canEdit = hasPermission("Enquiry", "CanEdit");
  const canDelete = hasPermission("Enquiry", "CanDelete");

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
      const data = await getEnquiries();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load enquiries");
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

  const handleView = async (id: number) => {
    const data = await getEnquiryById(id);
    setViewData(data);
  };

  const handleEdit = async (id: number) => {
    const data = await getEnquiryById(id);
    setEditData(data);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status: string) => {
    const isFinal = status?.toUpperCase() === "FINAL";
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          isFinal ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
        }`}
      >
        {status || "DRAFT"}
      </span>
    );
  };

  const getEntryTypeBadge = (type: string) => {
    const isVerbal = type?.toUpperCase() === "VERBAL";
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          isVerbal
            ? "bg-yellow-100 text-yellow-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {type || "ENQUIRY"}
      </span>
    );
  };

  const columns: TableColumn<any>[] = [
    {
      name: "Sr.No",
      selector: (_, i) => (i ?? 0) + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "Enquiry No",
      selector: (row) => row.enquiryNo || "N/A",
      sortable: true,
      width: "210px",
      style: { fontWeight: "bold", color: "#0b2c52" },
    },
    {
      name: "Date",
      selector: (row) => new Date(row.offerDate).toLocaleDateString(),
      sortable: true,
      width: "110px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Origin",
      cell: (row) => getEntryTypeBadge(row.entryType || ""),
      width: "110px",
    },
    {
      name: "Status",
      cell: (row) => getStatusBadge(row.status || ""),
      width: "170px",
    },
    {
      name: "Currency",
      selector: (row) => row.currencyName || "INR",
      sortable: true,
      width: "80px",
      style: { fontWeight: "600", color: "#6b7280" },
    },
    {
      name: "Total Amount",
      selector: (row) => {
        const symbol = row.currencySymbol || "₹";
        return `${symbol} ${(row.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      },
      sortable: true,
      width: "160px",
      style: { fontWeight: "bold", color: "#143463" },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-3">
          <button
            onClick={() => {
              toast.loading("Generating PDF...");
              printEnquiryPDF(row.enquiryId, options)
                .then(() => toast.dismiss())
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
            onClick={() => handleView(row.enquiryId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.enquiryId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteId(row.enquiryId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = useMemo(() => {
    return list.filter(
      (item) =>
        (item.enquiryNo || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        (item.customerName || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()),
    );
  }, [list, filterText]);

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6 text-left">
      {showForm && (
        <EnquiryWizard
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
        <EnquiryViewModal
          data={viewData}
          options={options}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Enquiries"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
        createLabel="+ Create Enquiry"
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
            await deleteEnquiry(deleteId);
            toast.success("Deleted successfully");
            loadData();
            setDeleteId(null);
          }
        }}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This will revert the inventory stock."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default EnquiryPage;
