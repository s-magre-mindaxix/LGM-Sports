import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";

import {
  getCustomers,
  deleteCustomer,
  getCustomerById,
} from "./Services/CustomerService";
import type { Customer } from "./Services/types";

import CustomerWizard from "./CustomerWizard";
import CustomerViewModal from "./CustomerViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const CustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Customer | null>(null);
  const [viewData, setViewData] = useState<Customer | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Customer", "CanAdd");
  const canEdit = hasPermission("Customer", "CanEdit");
  const canDelete = hasPermission("Customer", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load customers");
      setCustomers([]);
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
      const data = await getCustomerById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch customer details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await getCustomerById(id);
      setEditData(data);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching customer details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteModal.id);
      toast.success("Customer deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting customer");
    }
  };

  const getFullAddress = (c: Customer) => {
    const a =
      c.addresses?.find((addr) => addr.addressType === "Correspondence") ||
      c.addresses?.[0];
    if (!a) return "N/A";
    return [a.flatBlockNo, a.premisesName, a.area, a.town]
      .filter(Boolean)
      .join(", ");
  };

  const columns: TableColumn<Customer>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "60px",
      sortable: true,
    },
    {
      name: "Company Group",
      selector: (row) => row.companyGroupName || "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Company Name",
      selector: (row) => row.customerName,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: "Branch",
      selector: (row) => row.branch || "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Company Code",
      selector: (row) => row.customerCode || "N/A",
      sortable: true,
      grow: 2,
    },
    {
      name: "Vendor Code",
      selector: (row) => row.vendorCode || "N/A",
      sortable: true,
      width: "140px",
    },
    {
      name: "Address",
      selector: (row) => getFullAddress(row),
      grow: 3,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
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
    const search = filterText.toLowerCase();

    return customers.filter((item) => {
      return (
        (item.customerName || "").toLowerCase().includes(search) ||
        (item.customerCode || "").toLowerCase().includes(search) ||
        (item.vendorCode || "").toLowerCase().includes(search) ||
        (item.companyGroupName || "").toLowerCase().includes(search) ||
        (item.branch || "").toLowerCase().includes(search)
      );
    });
  }, [customers, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showWizard && (
        <div className="animate-in slide-in-from-top duration-500">
          <CustomerWizard
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
        <CustomerViewModal
          customer={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Customers"
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
              }
            : undefined
        }
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CustomerPage;
