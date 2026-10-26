import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";

import {
  getFaultReports,
  deleteFaultReport,
  getFaultReportById,
} from "./Services/FaultReportService";
import type { FaultReport } from "./Services/types";

import FaultReportForm from "./FaultReportForm";
import FaultReportViewModal from "./FaultReportViewModal";
import FaultReportPDFModal from "./FaultReportPDFModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const FaultReportPage: React.FC = () => {
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<FaultReport | null>(null);
  const [viewData, setViewData] = useState<FaultReport | null>(null);
  const [pdfData, setPdfData] = useState<FaultReport | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("FaultReport", "CanAdd");
  const canEdit = hasPermission("FaultReport", "CanEdit");
  const canDelete = hasPermission("FaultReport", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);

    try {
      const data = await getFaultReports();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load fault reports.");
      setReports([]);
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
    try {
      setIsLoading(true);

      const data = await getFaultReportById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch report details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdf = async (id: number) => {
    toast.info("Preparing PDF, please wait...");
    try {
      const data = await getFaultReportById(id);
      setPdfData(data);
    } catch {
      toast.error("Could not fetch report details for PDF generation.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);

      const data = await getFaultReportById(id);
      setEditData(data);
      setShowForm(true);
    } catch {
      toast.error("Error fetching report details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFaultReport(deleteModal.id);
      toast.success("Fault report deleted successfully.");
      loadData();
    } catch {
      toast.error("Error deleting report.");
    } finally {
      setDeleteModal({ isOpen: false, id: 0 });
    }
  };

  const columns: TableColumn<FaultReport>[] = [
    {
      name: "Sr.No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    {
      name: "Customer",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      name: "Device",
      selector: (row) => row.device || "N/A",
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      name: "Report Date",
      selector: (row) => new Date(row.reportDate).toLocaleDateString("en-GB"),
      sortable: true,
      width: "150px",
    },
    {
      name: "Serial No.",
      selector: (row) => row.serialNumber || "N/A",
      sortable: true,
      width: "180px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={() => handleGeneratePdf(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
            title="Generate PDF"
          >
            <FaFilePdf size={16} />
          </button>
          <button
            onClick={() => handleView(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => handleEdit(row.id)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "120px",
    },
  ];

  const filteredItems = useMemo(() => {
    const today = new Date().toDateString();

    return reports
      .filter(
        (item) =>
          (item.customerName || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.device || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.serialNumber || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()),
      )
      .sort((a, b) => {
        const aDate = new Date(a.reportDate);
        const bDate = new Date(b.reportDate);

        const aIsToday = aDate.toDateString() === today;
        const bIsToday = bDate.toDateString() === today;

        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;

        return bDate.getTime() - aDate.getTime();
      });
  }, [reports, filterText]);

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <div className="animate-in slide-in-from-top duration-500">
          <FaultReportForm
            editData={editData}
            onSuccess={() => {
              setShowForm(false);
              loadData();
              setEditData(null);
            }}
            onCancel={() => {
              setShowForm(false);
              setEditData(null);
            }}
          />
        </div>
      )}

      {viewData && (
        <FaultReportViewModal
          report={viewData}
          onClose={() => setViewData(null)}
        />
      )}
      {pdfData && (
        <FaultReportPDFModal
          report={pdfData}
          onClose={() => setPdfData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Fault Reports"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Fault Report"
        message="Are you sure you want to delete this fault report? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default FaultReportPage;
