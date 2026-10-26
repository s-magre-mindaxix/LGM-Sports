import React, { useEffect, useState, useMemo } from "react";
import {
  getProductVariants,
  saveProductVariant,
  deleteProductVariant,
} from "./Services/ProductVariantService";

import ProductVariantForm from "./ProductVariantForm";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import type { ProductVariant } from "./Services/types";

const ProductVariantPage: React.FC = () => {
  const [data, setData] = useState<ProductVariant[]>([]);
  const [, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProductVariant | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getProductVariants();
      // ENSURE res is an array. If not, set to empty array.
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (item: ProductVariant) => {
    try {
      await saveProductVariant(item);
      toast.success(item.id > 0 ? "Variant updated" : "Variant added");
      setShowForm(false);
      setEditData(null);
      loadData();
    } catch {
      toast.error("Error saving variant");
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await deleteProductVariant(selectedId);
        toast.success("Variant deleted");
        loadData();
      } catch {
        toast.error("Error deleting");
      }
    }
  };

  const columns: TableColumn<ProductVariant>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "100px",
      sortable: true,
    },
    {
      name: "Variant Name",
      selector: (row) => row.variantName,
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
            className="text-blue-600 hover:text-blue-800"
          >
            <FaEdit size={18} />
          </button>
          <button
            onClick={() => {
              setSelectedId(row.id);
              setIsDeleteModalOpen(true);
            }}
            className="text-red-600 hover:text-red-800"
          >
            <FaTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  const tableStyles = {
    headRow: { style: { backgroundColor: "#143463", minHeight: "52px" } },
    headCells: {
      style: { color: "#ffffff", fontWeight: 700, fontSize: "13px" },
    },
    rows: { style: { minHeight: "48px", borderBottom: "1px solid #d9dde5" } },
  };

  const filteredItems = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((x) =>
      x.variantName?.toLowerCase().includes(filterText.toLowerCase()),
    );
  }, [data, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen">
      {showForm && (
        <ProductVariantForm
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditData(null);
          }}
          editData={editData}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mt-4 border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold border-b-2 border-[#143463] pb-1">
            Product Variant Listing
          </h2>
          {!showForm && (
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="bg-[#f07837] text-white px-6 py-2 rounded-full font-semibold"
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
          customStyles={tableStyles}
          subHeader={
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Search:</label>
              <input
                type="text"
                className="border border-gray-300 p-1.5 rounded-md outline-none focus:border-blue-500 w-64"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          }
        />
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Variant"
        message={`Are you sure you want to delete this variant?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProductVariantPage;
