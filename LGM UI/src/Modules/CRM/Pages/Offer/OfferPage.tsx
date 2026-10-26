import React, { useEffect, useRef, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";

import { getOffers, deleteOffer, getOfferById } from "./Services/OfferService";
import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions";
import { printOfferPDF } from "./Services/OfferPrintService";
import type { Offer } from "./Services/types";

import OfferWizard from "./OfferWizard";
import OfferViewModal from "./OfferViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const OfferPage: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Offer | null>(null);
  const [viewData, setViewData] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const options = useEnquiryOptions();

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Offers", "CanAdd");
  const canEdit = hasPermission("Offers", "CanEdit");
  const canDelete = hasPermission("Offers", "CanDelete");

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
      const data = await getOffers();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load official offers");
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
    const data = await getOfferById(id);
    setViewData(data);
  };

  const handleEdit = async (id: number) => {
    const data = await getOfferById(id);
    setEditData(data);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getStatusBadge = (status?: string) => {
    const value = (status || "").toUpperCase();

    if (value === "FINAL") {
      return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
          FINAL
        </span>
      );
    }

    if (value === "OFFER ACCEPTED") {
      return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
          OFFER ACCEPTED
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
        DRAFT
      </span>
    );
  };

  const getSourceBadge = (source?: string) => {
    const src = (source || "").toUpperCase();

    if (src === "VERBAL") {
      return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-violet-100 text-violet-700">
          VERBAL
        </span>
      );
    }

    if (src === "SERVICE") {
      return (
        <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-orange-100 text-orange-700">
          SERVICE
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-sky-100 text-sky-700">
        ENQUIRY
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
      name: "Offer No",
      selector: (row) => row.offerNo || "N/A",
      sortable: true,
      grow: 2,
      style: { fontWeight: "bold", color: "#0b2c52" },
      width: "230px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.offerDate).toLocaleDateString(),
      sortable: true,
      grow: 1,
      width: "110px",
    },
    {
      name: "Customer Name",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      grow: 2,
      style: { fontWeight: "bold" },
    },
    {
      name: "Origin",
      cell: (row) => getSourceBadge(row.source),
      width: "110px",
    },
    {
      name: "Status",
      cell: (row) => getStatusBadge(row.status),
      width: "120px",
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

    printOfferPDF(row.offerId, options)
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
            onClick={() => handleView(row.offerId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.offerId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteId(row.offerId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "130px",
    },
  ];

  const filteredItems = list.filter(
    (item) =>
      (item.offerNo || "").toLowerCase().includes(filterText.toLowerCase()) ||
      (item.customerName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()),
  );

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4 text-left">
      {showForm && (
        <OfferWizard
          editData={editData}
          options={options}
          rawCustomers={options.rawCustomersList}
          onCancel={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
        />
      )}

      {viewData && (
        <OfferViewModal
          data={viewData}
          options={options}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Offers"
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
            await deleteOffer(deleteId);
            toast.success("Deleted successfully");
            loadData();
            setDeleteId(null);
          }
        }}
        title="Delete Offer"
        message="Are you sure you want to delete this official offer?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default OfferPage;
