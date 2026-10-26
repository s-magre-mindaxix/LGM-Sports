import React, { useEffect, useState } from "react";
import {
  getProductTypes,
  saveProductType,
  deleteProductType,
} from "./Services/ProductTypeService";

import ProductTypeForm from "./ProductTypeForm";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import type { ProductType } from "./Services/types";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

const ProductTypePage: React.FC = () => {
  const [data, setData] = useState<ProductType[]>([]);
  const [, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProductType | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getProductTypes();
      setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (item: ProductType) => {
    try {
      await saveProductType(item);
      toast.success(
        item.id > 0 ? "Updated successfully" : "Added successfully",
      );
      setShowForm(false);
      setEditData(null);
      loadData();
    } catch {
      toast.error("Error saving data");
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      try {
        await deleteProductType(selectedId);
        toast.success("Deleted successfully");
        loadData();
      } catch {
        toast.error("Error deleting");
      }
    }
  };

  const columns: TableColumn<ProductType>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "100px",
      sortable: true,
    },
    {
      name: "Product Type",
      selector: (row) => row.productTypeName,
      sortable: true,
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
            onClick={() => {
              setSelectedId(row.id);
              setIsDeleteModalOpen(true);
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
          >
            <FaTrash size={16} />
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
    rows: { style: { minHeight: "48px" } },
  };

  const filteredItems = data.filter((x) =>
    x.productTypeName.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen">
      {showForm && (
        <ProductTypeForm
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
            Product Type Listing
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
        title="Delete Product Type"
        message={`Are you sure you want to delete this product type?`}
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProductTypePage;
