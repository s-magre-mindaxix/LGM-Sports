import React, { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  saveCategory,
  deleteCategory,
} from "./Services/CategoryService";
import CategoryForm from "./CategoryForm";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import type { Category } from "./Services/types";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

const CategoryPage: React.FC = () => {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<Category | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const result = await getCategories();
      setData(result);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (category: Category) => {
    try {
      await saveCategory(category);
      toast.success(category.id > 0 ? "Category updated" : "Category added");
      setShowForm(false);
      setEditData(null);
      loadData();
    } catch {
      toast.error("Error saving category");
    }
  };

  const confirmDelete = (id: number) => {
    setSelectedDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedDeleteId) {
      try {
        await deleteCategory(selectedDeleteId);
        toast.success("Category deleted successfully");
        loadData();
      } catch {
        toast.error("Could not delete category");
      }
    }
  };

  const columns: TableColumn<Category>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "100px",
      sortable: true,
    },
    {
      name: "Category Name",
      selector: (row) => row.categoryName,
      sortable: true,
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditData(row);
              setShowForm(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => confirmDelete(row.id)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
      width: "150px",
    },
  ];

  // Filter Logic
  const filteredItems = data.filter((item) =>
    item.categoryName.toLowerCase().includes(filterText.toLowerCase()),
  );

  // Search Component
  const subHeaderComponent = useMemo(
    () => (
      <div className="flex items-center justify-end w-full">
        <label className="text-gray-600 mr-2 text-sm">Search:</label>
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-1.5 w-64 bg-white outline-none focus:border-blue-500"
          placeholder="Search category..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
    ),
    [filterText],
  );

  // Same styling as Company Master
  const tableStyles = useMemo(
    () => ({
      headRow: { style: { backgroundColor: "#143463", minHeight: "52px" } },
      headCells: {
        style: {
          color: "#ffffff",
          fontWeight: 700,
          fontSize: "13px",
          borderRight: "1px solid #2a4a7a",
        },
      },
      cells: { style: { borderRight: "1px solid #b6bcc6" } },
      rows: { style: { minHeight: "48px", borderBottom: "1px solid #d9dde5" } },
    }),
    [],
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen">
      {/* Inline Form Section */}
      {showForm && (
        <div className="mb-6 animate-in fade-in duration-300">
          <CategoryForm
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditData(null);
            }}
            editData={editData}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-900 border-b-2 border-[#143463] pb-1">
            Category Listing
          </h2>
          {!showForm && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="bg-[#f07837] text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#0d3357] transition"
            >
              + Create New
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          striped
          highlightOnHover
          subHeader={subHeaderComponent}
          customStyles={tableStyles}
          progressPending={isLoading}
        />
      </div>

      {/* Standard Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${data.find((x) => x.id === selectedDeleteId)?.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CategoryPage;
