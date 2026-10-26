
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

import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

interface CompanyGroupLookup {
  id: number;
  name: string;
}

const getResponseArray = (response: any): any[] => {
  const result = response?.data ?? response;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.result)) return result.result;
  if (Array.isArray(result?.$values)) return result.$values;

  return [];
};

const CustomerPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyGroups, setCompanyGroups] = useState<CompanyGroupLookup[]>([]);

  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Customer | null>(null);
  const [viewData, setViewData] = useState<Customer | null>(null);

  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { hasPermission } = usePermissions();

  const canAdd = hasPermission("Customer", "CanAdd");
  const canEdit = hasPermission("Customer", "CanEdit");
  const canDelete = hasPermission("Customer", "CanDelete");

  // Load customers.
  const loadData = async () => {
    setIsLoading(true);

    try {
      const response = await getCustomers();
      setCustomers(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Company Groups separately and map their names using IDs.
  useEffect(() => {
    let cancelled = false;

    const loadCompanyGroups = async () => {
      try {
        const endpoint =
          API_ENDPOINTS.CompanyGroup || "/CompanyGroup";

        const response = await apiClient.get(endpoint);

        const groups: CompanyGroupLookup[] = getResponseArray(response)
          .map((group: any) => ({
            id: Number(
              group.companyGroupId ??
                group.CompanyGroupId ??
                group.id ??
                group.Id
            ),
            name: String(
              group.companyGroupName ??
                group.CompanyGroupName ??
                group.name ??
                group.Name ??
                ""
            ).trim(),
          }))
          .filter(
            (group) =>
              Number.isInteger(group.id) &&
              group.id > 0 &&
              group.name.length > 0
          );

        if (!cancelled) {
          setCompanyGroups(groups);
        }
      } catch (error) {
        console.error("Failed to load Company Groups:", error);
        if (!cancelled) {
          setCompanyGroups([]);
        }
      }
    };

    void loadCompanyGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load customer records and listen for refresh events.
  useEffect(() => {
    void loadData();

    const handleRefresh = () => {
      void loadData();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  // Resolve Company Group name using companyGroupId.
  const getCompanyGroupName = (
    companyGroupId?: number | null
  ): string => {
    if (companyGroupId == null || Number(companyGroupId) <= 0) {
      return "N/A";
    }

    const group = companyGroups.find(
      (item) => item.id === Number(companyGroupId)
    );

    return group?.name ?? `Company Group #${companyGroupId}`;
  };

  // View customer details.
  const handleView = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getCustomerById(id);
      setViewData(data);
    } catch (error) {
      console.error("Could not fetch customer details:", error);
      toast.error("Could not fetch customer details");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit customer.
  const handleEdit = async (id: number) => {
    setIsLoading(true);

    try {
      const data = await getCustomerById(id);

      setEditData(data);
      setShowWizard(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Error fetching customer details");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete customer.
  const handleDelete = async () => {
    try {
      await deleteCustomer(deleteModal.id);

      toast.success("Customer deleted successfully");

      setDeleteModal({
        isOpen: false,
        id: 0,
      });

      await loadData();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Error deleting customer");
    }
  };

  // Build the customer's full address.
  const getFullAddress = (customer: Customer) => {
    const address =
      customer.addresses?.find(
        (item) => item.addressType === "Correspondence"
      ) || customer.addresses?.[0];

    if (!address) return "N/A";

    return [
      address.flatBlockNo,
      address.premisesName,
      address.area,
      address.town,
    ]
      .filter(Boolean)
      .join(", ") || "N/A";
  };

  // Table columns.
  const columns: TableColumn<Customer>[] = [
    {
      name: "Sr. No.",
      selector: (_, index) => (index ?? 0) + 1,
      width: "75px",
      sortable: true,
    },
    {
      name: "Company Group",
      selector: (row) =>
        getCompanyGroupName(row.companyGroupId),
      cell: (row) => (
        <span className="font-medium text-gray-700">
          {getCompanyGroupName(row.companyGroupId)}
        </span>
      ),
      sortable: true,
      sortFunction: (a, b) =>
        getCompanyGroupName(a.companyGroupId).localeCompare(
          getCompanyGroupName(b.companyGroupId)
        ),
      grow: 2,
      wrap: true,
    },
    {
      name: "Company Name",
      selector: (row) => row.customerName || "N/A",
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
            type="button"
            onClick={() => void handleView(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => void handleEdit(row.id)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() =>
                setDeleteModal({
                  isOpen: true,
                  id: row.id,
                })
              }
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

  // Search customers by their fields and resolved Company Group name.
  const filteredItems = useMemo(() => {
    const search = filterText.trim().toLowerCase();

    if (!search) return customers;

    return customers.filter((item) => {
      return (
        (item.customerName || "").toLowerCase().includes(search) ||
        (item.customerCode || "").toLowerCase().includes(search) ||
        (item.vendorCode || "").toLowerCase().includes(search) ||
        (item.branch || "").toLowerCase().includes(search) ||
        String(item.companyGroupId ?? "").includes(search) ||
        getCompanyGroupName(item.companyGroupId)
          .toLowerCase()
          .includes(search)
      );
    });
  }, [customers, companyGroups, filterText]);

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <div className="animate-in slide-in-from-top duration-500">
          <CustomerWizard
            editData={editData}
            onSuccess={() => {
              setShowWizard(false);
              setEditData(null);
              void loadData();
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
        onClose={() =>
          setDeleteModal({
            isOpen: false,
            id: 0,
          })
        }
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CustomerPage;
