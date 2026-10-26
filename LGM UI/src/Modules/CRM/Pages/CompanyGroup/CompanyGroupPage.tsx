import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";

// Services & Types
import {
  getCompanyGroups,
  deleteCompanyGroup,
} from "./Services/CompanyGroupService";
import type { CompanyGroup } from "./Services/types";

// Components
import CompanyGroupForm from "./CompanyGroupForm";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const CompanyGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<CompanyGroup | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getCompanyGroups();
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load company groups");
      setGroups([]);
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

  const handleEdit = (group: CompanyGroup) => {
    setEditData(group);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    try {
      await deleteCompanyGroup(deleteModal.id);
      toast.success("Group deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting group");
    }
  };

  const columns: TableColumn<CompanyGroup>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    {
      name: "Company Group Name",
      selector: (row) => row.companyGroupName,
      sortable: true,
      grow: 2,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleEdit(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row.id })}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
      width: "120px",
      center: true,
    },
  ];

  const filteredItems = useMemo(() => {
    return groups.filter((item) =>
      (item.companyGroupName || "")
        .toLowerCase()
        .includes(filterText.toLowerCase()),
    );
  }, [groups, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showForm && (
        <CompanyGroupForm
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
      )}

      <ListingLayout
        title="Listing of Company Groups"
        columns={columns}
        isLoading={isLoading}
        data={filteredItems}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => {
          setEditData(null);
          setShowForm(true);
        }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Company Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CompanyGroupPage;
