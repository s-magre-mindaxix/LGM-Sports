
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";

import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

import type { Supplier } from "./Services/types";
import {
  deleteSupplier,
  getSuppliers,
  getSupplierById,
} from "./Services/SupplierService";

import SupplierWizard from "./SupplierWizard";
import SupplierViewModal from "./SupplierViewModal";

const normalizeSupplier = (item: any): Supplier => ({
  supplierId: item?.supplierId ?? item?.SupplierId ?? 0,
  branchId: item?.branchId ?? item?.BranchId ?? 0,
  supplierCode: item?.supplierCode ?? item?.SupplierCode ?? "",
  supplierName: item?.supplierName ?? item?.SupplierName ?? "",
  supplierGSTIN: item?.supplierGSTIN ?? item?.SupplierGSTIN ?? "",
  supplierContact: item?.supplierContact ?? item?.SupplierContact ?? "",
  supplierAddress: item?.supplierAddress ?? item?.SupplierAddress ?? "",
  paymentTerms: item?.paymentTerms ?? item?.PaymentTerms ?? "",
  isActive: item?.isActive ?? item?.IsActive ?? true,
  createdAt: item?.createdAt ?? item?.CreatedAt ?? "",
});

const SupplierPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Supplier | null>(null);
  const [viewData, setViewData] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("Supplier", "CanAdd");
  const canEdit = hasPermission("Supplier", "CanEdit");
  const canDelete = hasPermission("Supplier", "CanDelete");
  const canView = hasPermission("Supplier", "CanView");

  const loadSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await getSuppliers();

      console.log("Supplier records:", result);

      setSuppliers(
        Array.isArray(result) ? result.map(normalizeSupplier) : []
      );
    } catch (error: any) {
      console.error(
        "Failed to load suppliers:",
        error?.response?.data ?? error
      );

      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Failed to load suppliers."
      );

      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSuppliers();

    const handleRefresh = () => {
      void loadSuppliers();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, [loadSuppliers]);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (supplierId: number) => {
    try {
      setIsLoading(true);

      const result = await getSupplierById(supplierId);
      const supplier = normalizeSupplier(result);

      if (!supplier.supplierId) {
        throw new Error("Supplier details were not returned by the API.");
      }

      setViewData(supplier);
    } catch (error) {
      console.error("Failed to load supplier details:", error);
      toast.error("Could not load supplier details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (supplierId: number) => {
    try {
      setIsLoading(true);

      const result = await getSupplierById(supplierId);
      const supplier = normalizeSupplier(result);

      if (!supplier.supplierId) {
        throw new Error("Supplier details were not returned by the API.");
      }

      setEditData(supplier);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load supplier for editing:", error);
      toast.error("Could not load supplier for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete supplier "${supplier.supplierName}"?`
    );

    if (!confirmed) return;

    try {
      await deleteSupplier(supplier.supplierId);

      toast.success("Supplier deleted successfully.");

      await loadSuppliers();
    } catch (error: any) {
      console.error(
        "Failed to delete supplier:",
        error?.response?.data ?? error
      );

      toast.error(
        error?.response?.data?.message ??
          error?.response?.data?.title ??
          "Failed to delete supplier."
      );
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadSuppliers();
  };

  const columns: TableColumn<Supplier>[] = useMemo(
    () => [
      {
        name: "Sr. No.",
        cell: (_row, index) => (index ?? 0) + 1,
        width: "80px",
      },
      {
        name: "Supplier ID",
        selector: (row) => row.supplierId,
        sortable: true,
        width: "110px",
      },
      {
        name: "Supplier Code",
        selector: (row) => row.supplierCode,
        sortable: true,
        grow: 1.2,
        wrap: true,
      },
      {
        name: "Supplier Name",
        selector: (row) => row.supplierName,
        sortable: true,
        grow: 2,
        wrap: true,
      },
      {
        name: "GSTIN",
        selector: (row) => row.supplierGSTIN || "-",
        sortable: true,
        grow: 1.5,
        wrap: true,
      },
      {
        name: "Contact",
        selector: (row) => row.supplierContact || "-",
        grow: 1.5,
        wrap: true,
      },
      {
        name: "Payment Terms",
        selector: (row) => row.paymentTerms || "-",
        grow: 1.5,
        wrap: true,
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
          <div className="flex justify-center gap-3">
            {canView && (
              <button
                type="button"
                onClick={() => void handleView(row.supplierId)}
                className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
                title="View Supplier"
              >
                <FaEye size={16} />
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => void handleEdit(row.supplierId)}
                className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
                title="Edit Supplier"
              >
                <FaEdit size={16} />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => void handleDelete(row)}
                className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
                title="Delete Supplier"
              >
                <FaTrash size={16} />
              </button>
            )}
          </div>
        ),
        width: "150px",
      },
    ],
    [canView, canEdit, canDelete]
  );

  const filteredItems = useMemo(() => {
    const search = filterText.trim().toLowerCase();

    if (!search) return suppliers;

    return suppliers.filter((supplier) =>
      JSON.stringify(supplier).toLowerCase().includes(search)
    );
  }, [suppliers, filterText]);

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <SupplierWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {viewData && (
        <SupplierViewModal
          supplier={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Suppliers"
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

export default SupplierPage;
