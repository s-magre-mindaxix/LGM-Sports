
import React, { useEffect, useState } from "react";
import {
  getBranches,
  deleteBranch,
  getBranchById,
} from "./Services/BranchService";
import type { Branch, BranchListItem } from "./Services/types";
import BranchWizard from "../Branch/BranchWizard";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import BranchViewModal from "../Branch/BranchViewModel";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const BranchPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchListItem[]>([]);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [editData, setEditData] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [viewData, setViewData] = useState<Branch | null>(null);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Branch", "CanAdd");
  const canEdit = hasPermission("Branch", "CanEdit");
  const canDelete = hasPermission("Branch", "CanDelete");

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();

    const handleRefresh = () => {
      void loadBranches();
    };

    window.addEventListener("app-refresh", handleRefresh);

    return () => {
      window.removeEventListener("app-refresh", handleRefresh);
    };
  }, []);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (branchId: number) => {
    try {
      setIsLoading(true);
      const fullBranchData = await getBranchById(branchId);
      setViewData(fullBranchData);
    } catch (error) {
      console.error("Failed to load branch details:", error);
      alert("Could not load branch details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (branchId: number) => {
    try {
      setIsLoading(true);
      const fullBranchData = await getBranchById(branchId);
      setEditData(fullBranchData);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load branch for editing:", error);
      alert("Could not load branch details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (branchId: number) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await deleteBranch(branchId);
        await loadBranches();
      } catch (error) {
        console.error("Failed to delete branch:", error);
        alert("Could not delete branch.");
      }
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadBranches();
  };

  const columns: TableColumn<BranchListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "70px",
    },
    {
      name: "Company ID",
      selector: (row) => row.companyId,
      sortable: true,
      width: "110px",
    },
    {
      name: "Branch Code",
      selector: (row) => row.branchCode,
      sortable: true,
      grow: 1.5,
    },
    {
      name: "Branch Name",
      selector: (row) => row.branchName,
      sortable: true,
      wrap: true,
      grow: 2,
    },
    {
      name: "Address",
      selector: (row) => row.address || "N/A",
      wrap: true,
      grow: 2.5,
    },
    {
      name: "Contact",
      selector: (row) => row.contact || "N/A",
      grow: 1.5,
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
            onClick={() => handleView(row.branchId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
            type="button"
          >
            <FaEye size={16} />
          </button>

          {canEdit && (
            <button
              onClick={() => handleEdit(row.branchId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
              type="button"
            >
              <FaEdit size={16} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => handleDelete(row.branchId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
              title="Delete"
              type="button"
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "140px",
    },
  ];

  const filteredItems = branches.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {/* ADD / EDIT FORM */}
      {showWizard && (
        <BranchWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <BranchViewModal
          branch={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      {/* BRANCH LIST */}
      <ListingLayout
        title="Listing of Branches"
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

export default BranchPage;
