
import React, { useEffect, useState } from "react";
import {
  getPaymentMethods,
  deletePaymentMethod,
  getPaymentMethodById,
} from "./Services/PaymentMethodService";
import type {
  PaymentMethod,
  PaymentMethodListItem,
} from "./Services/types";
import PaymentMethodWizard from "./PaymentMethodWizard";
import PaymentMethodViewModal from "./PaymentMethodViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

const PaymentMethodPage: React.FC = () => {
  const [items, setItems] = useState<PaymentMethodListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<PaymentMethod | null>(null);
  const [viewData, setViewData] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("PaymentMethod", "CanAdd");
  const canEdit = hasPermission("PaymentMethod", "CanEdit");
  const canDelete = hasPermission("PaymentMethod", "CanDelete");

  // Load payment methods
  const loadItems = async () => {
    setIsLoading(true);

    try {
      setItems(await getPaymentMethods());
    } catch (error) {
      console.error("Failed to load payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();

    const refresh = () => void loadItems();

    window.addEventListener("app-refresh", refresh);

    return () => {
      window.removeEventListener("app-refresh", refresh);
    };
  }, []);

  // View payment method
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      setViewData(await getPaymentMethodById(id));
    } catch (error) {
      console.error("Failed to load payment method:", error);
      window.alert("Could not load payment method details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit payment method
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      setEditData(await getPaymentMethodById(id));
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Failed to load payment method for editing:",
        error
      );
      window.alert("Could not load payment method for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete payment method
  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this payment method?"
      )
    ) {
      return;
    }

    try {
      await deletePaymentMethod(id);
      await loadItems();
    } catch (error) {
      console.error("Failed to delete payment method:", error);
      window.alert("Could not delete payment method.");
    }
  };

  // Table columns
  const columns: TableColumn<PaymentMethodListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "75px",
    },
    {
      name: "ID",
      selector: (row) => row.paymentMethodId,
      sortable: true,
      width: "90px",
    },
    {
      name: "Code",
      selector: (row) => row.code,
      sortable: true,
      width: "180px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      grow: 2,
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
      width: "115px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            title="View"
            onClick={() =>
              void handleView(row.paymentMethodId)
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              title="Edit"
              onClick={() =>
                void handleEdit(row.paymentMethodId)
              }
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              title="Delete"
              onClick={() =>
                void handleDelete(row.paymentMethodId)
              }
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

  // Filter payment methods
  const filteredItems = items.filter((item) =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(filterText.toLowerCase())
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* Create / Edit Wizard */}
      {showWizard && (
        <PaymentMethodWizard
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

      {/* View Modal */}
      {viewData && (
        <PaymentMethodViewModal
          item={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* Listing */}
      <ListingLayout
        title="Listing of Payment Methods"
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

export default PaymentMethodPage;
