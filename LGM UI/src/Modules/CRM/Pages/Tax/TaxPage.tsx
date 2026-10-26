import React, { useEffect, useState } from "react";
import {
  getTaxes,
  deleteTax,
  getTaxById,
} from "./Services/TaxService";
import type { Tax, TaxListItem } from "./Services/types";
import TaxWizard from "./TaxWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import TaxViewModal from "./TaxViewModel";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const normalizeTax = (item: any): Tax => ({
  taxId: item?.taxId ?? item?.TaxId ?? 0,
  code: item?.code ?? item?.Code ?? "",
  name: item?.name ?? item?.Name ?? "",
  rate: Number(item?.rate ?? item?.Rate ?? 0),
  taxType: item?.taxType ?? item?.TaxType ?? "",
  effectiveFrom: item?.effectiveFrom ?? item?.EffectiveFrom ?? "",
  effectiveTo: item?.effectiveTo ?? item?.EffectiveTo ?? "",
  isActive: item?.isActive ?? item?.IsActive ?? true,
});

const formatDate = (value: string) => {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
};

const TaxPage: React.FC = () => {
  const [taxes, setTaxes] = useState<TaxListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Tax | null>(null);
  const [viewData, setViewData] = useState<Tax | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Tax", "CanAdd");
  const canEdit = hasPermission("Tax", "CanEdit");
  const canDelete = hasPermission("Tax", "CanDelete");

  const loadTaxes = async () => {
    try {
      setIsLoading(true);
      const data = await getTaxes();
      setTaxes(Array.isArray(data) ? data.map(normalizeTax) : []);
    } catch (error) {
      console.error("Failed to load taxes:", error);
      setTaxes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTaxes();

    const handleRefresh = () => {
      void loadTaxes();
    };

    window.addEventListener("app-refresh", handleRefresh);
    return () => window.removeEventListener("app-refresh", handleRefresh);
  }, []);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (taxId: number) => {
    try {
      setIsLoading(true);
      const tax = await getTaxById(taxId);
      setViewData(normalizeTax(tax));
    } catch (error) {
      console.error("Failed to load tax details:", error);
      alert("Could not load tax details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (taxId: number) => {
    try {
      setIsLoading(true);
      const tax = await getTaxById(taxId);
      setEditData(normalizeTax(tax));
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load tax for editing:", error);
      alert("Could not load tax details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taxId: number) => {
    if (!window.confirm("Are you sure you want to delete this tax?")) {
      return;
    }

    try {
      await deleteTax(taxId);
      await loadTaxes();
    } catch (error) {
      console.error("Failed to delete tax:", error);
      alert("Could not delete tax.");
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadTaxes();
  };

  const columns: TableColumn<TaxListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "80px",
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      grow: 1,
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Rate (%)",
      selector: (row) => row.rate,
      sortable: true,
      width: "110px",
    },
    {
      name: "Tax Type",
      selector: (row) => row.taxType,
      sortable: true,
      grow: 1,
    },
    {
      name: "Effective From",
      cell: (row) => formatDate(row.effectiveFrom),
      sortable: true,
      grow: 1,
    },
    {
      name: "Effective To",
      cell: (row) => formatDate(row.effectiveTo),
      sortable: true,
      grow: 1,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={
            row.isActive
              ? "rounded bg-green-100 px-2 py-1 text-green-700"
              : "rounded bg-gray-100 px-2 py-1 text-gray-600"
          }
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
      width: "110px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => void handleView(row.taxId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => void handleEdit(row.taxId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => void handleDelete(row.taxId)}
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

  const filteredItems = taxes.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <TaxWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {viewData && (
        <TaxViewModal
          tax={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Taxes"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
      />
    </div>
  );
};

export default TaxPage;