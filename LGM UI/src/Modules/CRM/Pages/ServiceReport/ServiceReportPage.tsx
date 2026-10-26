import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaFilePdf } from "react-icons/fa";
import { toast } from "sonner";
import {
  getServiceReports,
  deleteServiceReport,
  getServiceReportById,
} from "./Serivces/ServiceReportService";
import type { ServiceReport } from "./Serivces/types";
import ServiceReportForm from "./ServiceReportForm";
import ServiceReportViewModal from "./ServiceReportViewModal";
import ServiceReportPDFModal from "./ServiceReportPDFModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const ServiceReportPage: React.FC = () => {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<ServiceReport | null>(null);
  // New state to control the form's "create from offer" mode
  const [isCreatingFromOffer, setIsCreatingFromOffer] = useState(false);

  const [viewData, setViewData] = useState<ServiceReport | null>(null);
  const [pdfData, setPdfData] = useState<ServiceReport | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getServiceReports();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load service reports.");
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
      setViewData(await getServiceReportById(id));
    } catch {
      toast.error("Could not fetch report details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdf = async (id: number) => {
    toast.info("Preparing PDF, please wait...");
    try {
      setPdfData(await getServiceReportById(id));
    } catch {
      toast.error("Could not fetch report details for PDF.");
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const data = await getServiceReportById(id);
      setEditData(data);
      setIsCreatingFromOffer(false); // Ensure this is false for editing
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching report details.");
    }
  };

  const handleCreateNew = () => {
    setEditData(null);
    setIsCreatingFromOffer(true); // Set this to true to trigger the form's wizard mode
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditData(null);
    setIsCreatingFromOffer(false); // Reset the mode on close
  };

  const handleSuccess = () => {
    handleCloseForm();
    loadData();
  };

  const handleDelete = async () => {
    try {
      await deleteServiceReport(deleteModal.id);
      toast.success("Report deleted successfully.");
      loadData();
    } catch {
      toast.error("Error deleting report.");
    } finally {
      setDeleteModal({ isOpen: false, id: 0 });
    }
  };

  const columns: TableColumn<ServiceReport>[] = [
    // Your columns remain the same
    {
      name: "Sr.No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
      {
    name: "Service Report No.",
    selector: (row) => row.reportNo || "N/A",
    sortable: true,
    width: "180px",
  },
    {
      name: "Customer Name",
      selector: (row) => row.customerName || "N/A",
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      name: "Product Name",
      selector: (row) => row.productName || "N/A",
      sortable: true,
      grow: 1,
      wrap: true,
    },
    {
      name: "Report Date",
      selector: (row) => new Date(row.date).toLocaleDateString("en-GB"),
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
        <div className="flex justify-center gap-2 w-full">
          <button
            onClick={() => handleGeneratePdf(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
            title="Generate PDF"
          >
            <FaFilePdf size={15} />
          </button>
          <button
            onClick={() => handleView(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={15} />
          </button>
          <button
            onClick={() => handleEdit(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit"
          >
            <FaEdit size={15} />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={15} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  const filteredItems = useMemo(
    () =>
      reports.filter(
        (item) =>
          (item.customerName || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.productName || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          (item.serialNumber || "")
            .toLowerCase()
            .includes(filterText.toLowerCase()),
      ),
    [reports, filterText],
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <div className="animate-in slide-in-from-top duration-500">
          <ServiceReportForm
            editData={editData}
            isCreatingFromOffer={isCreatingFromOffer}
            onSuccess={handleSuccess}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {viewData && (
        <ServiceReportViewModal
          report={viewData}
          onClose={() => setViewData(null)}
        />
      )}
      {pdfData && (
        <ServiceReportPDFModal
          report={pdfData}
          onClose={() => setPdfData(null)}
        />
      )}

      {!showForm && (
        <ListingLayout
          title="Listing of Service Reports"
          columns={columns}
          data={filteredItems}
          isLoading={isLoading}
          filterText={filterText}
          onFilterChange={setFilterText}
          onCreate={handleCreateNew}
          createButtonText="Create from Offer"
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Service Report"
        message="Are you sure you want to delete this service report? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ServiceReportPage;
