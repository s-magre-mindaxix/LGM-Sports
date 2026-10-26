import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getVendors,
  deleteVendor,
  getVendorById,
} from "./Services/VendorService";
import type { Vendor } from "./Services/types";

// Components
import VendorWizard from "./VendorWizard";
import VendorViewModal from "./VendorViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const VendorPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Vendor | null>(null);
  const [viewData, setViewData] = useState<Vendor | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Vendor", "CanAdd");
  const canEdit = hasPermission("Vendor", "CanEdit");
  const canDelete = hasPermission("Vendor", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load vendors");
      setVendors([]);
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
      const data = await getVendorById(id);
      setViewData(data);
    } catch {
      toast.error("Could not fetch vendor details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await getVendorById(id);
      setEditData(data);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Error fetching vendor details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVendor(deleteModal.id);
      toast.success("Vendor deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting vendor");
    }
  };

  const columns: TableColumn<Vendor>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "60px" },
    {
      name: "Vendor Name",
      selector: (row) => row.vendorName,
      sortable: true,
      grow: 2,
      wrap: true,
    },
    {
      name: "Res Person Name",
      selector: (row) => row.principalContacts?.[0]?.personName || "N/A",
      grow: 2,
      sortable: true,
    },
    {
      name: "Vendor Code",
      selector: (row) => row.vendorCode || "N/A",
      grow: 1.5,
      sortable: true,
    },
    {
      name: "Mobile No.",
      selector: (row) => row.addresses?.[0]?.mobileNo || "N/A",
      grow: 1.5,
      sortable: true,
    },
    {
      name: "Email Address",
      selector: (row) => row.addresses?.[0]?.emailAddress || "N/A",
      sortable: true,
      grow: 1,
      width: "180px",
      wrap: true,
    },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
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
    return vendors.filter(
      (item) =>
        (item.vendorName || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        (item.vendorCode || "")
          .toLowerCase()
          .includes(filterText.toLowerCase()),
    );
  }, [vendors, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showWizard && (
        <div className="animate-in slide-in-from-top duration-500">
          <VendorWizard
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
        <VendorViewModal vendor={viewData} onClose={() => setViewData(null)} />
      )}

      <ListingLayout
        title="Listing of Vendors"
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
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default VendorPage;
