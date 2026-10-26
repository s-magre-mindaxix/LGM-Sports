
import React, { useEffect, useState } from "react";
import {
  getDocumentSeries,
  deleteDocumentSeries,
  getDocumentSeriesById,
} from "./Services/DocumentSeriesService";

import type {
  DocumentSeries,
  DocumentSeriesListItem,
} from "./Services/types";

import DocumentSeriesWizard from "./DocumentSeriesWizard";
import DocumentSeriesViewModal from "./DocumentSeriesViewModal";

import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

const DocumentSeriesPage: React.FC = () => {
  const [items, setItems] = useState<DocumentSeriesListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<DocumentSeries | null>(null);
  const [viewData, setViewData] = useState<DocumentSeries | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("DocumentSeries", "CanAdd");
  const canEdit = hasPermission("DocumentSeries", "CanEdit");
  const canDelete = hasPermission("DocumentSeries", "CanDelete");

  // Load document series records
  const loadItems = async () => {
    setIsLoading(true);

    try {
      const data = await getDocumentSeries();
      setItems(data);
    } catch (error) {
      console.error("Failed to load document series:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load records when the component mounts
  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();

    window.addEventListener("app-refresh", refresh);

    return () => {
      window.removeEventListener("app-refresh", refresh);
    };
  }, []);

  // View document series details
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getDocumentSeriesById(id);
      setViewData(data);
    } catch (error) {
      console.error("Failed to load document series:", error);
      window.alert("Could not load document series details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit document series
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getDocumentSeriesById(id);

      setEditData(data);
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to load document series for editing:",
        error
      );

      window.alert("Could not load document series for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete document series
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document series?"
    );

    if (!confirmed) return;

    try {
      await deleteDocumentSeries(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete document series:", error);
      window.alert("Could not delete document series.");
    }
  };

  // Table columns
  const columns: TableColumn<DocumentSeriesListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "ID",
      selector: (row) => row.documentSeriesId,
      sortable: true,
      width: "80px",
    },
    {
      name: "Document Type",
      selector: (row) => row.documentType,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Prefix",
      selector: (row) => row.prefix,
      sortable: true,
      width: "120px",
    },
    {
      name: "Next Number",
      selector: (row) => row.nextNumber,
      sortable: true,
      width: "125px",
    },
    {
      name: "Financial Year",
      selector: (row) => row.financialYear,
      sortable: true,
      width: "140px",
    },
    {
      name: "Branch ID",
      selector: (row) => row.branchId,
      sortable: true,
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            title="View"
            onClick={() => void handleView(row.documentSeriesId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() => void handleEdit(row.documentSeriesId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() => void handleDelete(row.documentSeriesId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  // Filter records
  const filteredItems = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* Create or edit document series */}
      {showWizard && (
        <DocumentSeriesWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            setEditData(null);
            void loadItems();
          }}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {/* View document series details */}
      {viewData && (
        <DocumentSeriesViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* Document series listing */}
      <ListingLayout
        title="Document Series"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={
          canAdd
            ? () => {
                setEditData(null);
                setShowWizard(true);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            : undefined
        }
      />
    </div>
  );
};

export default DocumentSeriesPage;
