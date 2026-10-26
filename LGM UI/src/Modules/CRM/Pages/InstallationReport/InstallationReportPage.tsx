import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";

import {
  getInstallationReports,
  deleteInstallationReport,
  getInstallationReportById,
} from "./Services/InstallationReportService";
import type { InstallationReport } from "./Services/types";

import InstallationReportWizard from "./InstallationReportWizard";
import InstallationReportViewModal from "./InstallationReportViewModal";
import InstallationReportPDFModal from "./InstallationReportPDFModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const InstallationReportPage: React.FC = () => {
  const [reports, setReports] = useState<InstallationReport[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<InstallationReport | null>(null);
  const [viewData, setViewData] = useState<InstallationReport | null>(null);
  const [pdfData, setPdfData] = useState<InstallationReport | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("InstallationReport", "CanAdd");
  const canEdit = hasPermission("InstallationReport", "CanEdit");
  const canDelete = hasPermission("InstallationReport", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getInstallationReports();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load installation reports.");
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
    setIsLoading(true);
    try {
      const data = await getInstallationReportById(id);
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
      const data = await getInstallationReportById(id);
      setPdfData(data);
    } catch {
      toast.error("Could not fetch report details for PDF generation.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const data = await getInstallationReportById(id);
      setEditData(data);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching report details.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstallationReport(deleteModal.id);
      toast.success("Report deleted successfully.");
      loadData();
    } catch {
      toast.error("Error deleting report.");
    } finally {
      setDeleteModal({ isOpen: false, id: 0 });
    }
  };

  const columns: TableColumn<InstallationReport>[] = [
    {
      name: "Sr.No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    // {
    //   name: "Company Name",
    //   selector: (row) => row.companyName,
    //   sortable: true,
    //   grow: 1,
    //   wrap: true,
    // },
    {
      name: "Customer Name",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      name: "Install Date",
      selector: (row) => {
        const date = new Date(row.installationDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "Place",
      selector: (row) => row.place,
      sortable: true,
      width: "140px",
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
    return reports
      .filter(
        (item) =>
          (item.companyName || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.customerName || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.place || "").toLowerCase().includes(filterText.toLowerCase()),
      )
      .sort((a, b) => {
        return (
          new Date(b.installationDate).getTime() -
          new Date(a.installationDate).getTime()
        );
      });
  }, [reports, filterText]);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showWizard && (
        <div className="animate-in slide-in-from-top duration-500">
          <InstallationReportWizard
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

      {viewData && (
        <InstallationReportViewModal
          report={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {pdfData && (
        <InstallationReportPDFModal
          report={pdfData}
          onClose={() => setPdfData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Installation Reports"
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
        title="Delete Report"
        message="Are you sure you want to delete this installation report? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default InstallationReportPage;
