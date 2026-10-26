import React, { useEffect, useState } from "react";
import {
  deleteCategory,
  getCategories,
  getCategoryById,
} from "./Services/CategoryServices";
import type { Category, CategoryListItem } from "./Services/types";
import CategoryWizard from "./CategoryWizard";
import CategoryViewModal from "./CategoryViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Category | null>(null);
  const [viewData, setViewData] = useState<CategoryListItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Category", "CanAdd");
  const canEdit = hasPermission("Category", "CanEdit");
  const canDelete = hasPermission("Category", "CanDelete");

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setCategories(await getCategories());
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();

    const handleRefresh = () => {
      void loadCategories();
    };

    window.addEventListener("app-refresh", handleRefresh);
    return () => window.removeEventListener("app-refresh", handleRefresh);
  }, []);

  const handleCreateNew = () => {
    setEditData(null);
    setShowWizard(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setViewData(await getCategoryById(categoryId));
    } catch (error) {
      console.error("Failed to load category details:", error);
      alert("Could not load category details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (categoryId: number) => {
    try {
      setIsLoading(true);
      setEditData(await getCategoryById(categoryId));
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Failed to load category for editing:", error);
      alert("Could not load category details for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(categoryId);
      await loadCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Could not delete category.");
    }
  };

  const handleSuccess = () => {
    setShowWizard(false);
    setEditData(null);
    void loadCategories();
  };

  const columns: TableColumn<CategoryListItem>[] = [
    {
      name: "Sr. No.",
      cell: (_row, index) => (index ?? 0) + 1,
      width: "80px",
    },
    {
      name: "Category Code",
      selector: (row) => row.code,
      sortable: true,
      grow: 1,
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName,
      sortable: true,
      wrap: true,
      grow: 1.5,
    },
    {
      name: "Parent Category",
      selector: (row) => row.parentCategoryName || "None",
      sortable: true,
      wrap: true,
      grow: 1.5,
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      wrap: true,
      grow: 2,
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
            onClick={() => void handleView(row.categoryId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
            type="button"
          >
            <FaEye size={16} />
          </button>
          {canEdit && (
            <button
              onClick={() => void handleEdit(row.categoryId)}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
              title="Edit"
              type="button"
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => void handleDelete(row.categoryId)}
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

  const filteredItems = categories.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
      {showWizard && (
        <CategoryWizard
          editData={editData}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowWizard(false);
            setEditData(null);
          }}
        />
      )}

      {viewData && (
        <CategoryViewModal
          category={viewData}
          onClose={() => setViewData(null)}
        />
      )}

      <ListingLayout
        title="Listing of Categories"
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

export default CategoryPage;

