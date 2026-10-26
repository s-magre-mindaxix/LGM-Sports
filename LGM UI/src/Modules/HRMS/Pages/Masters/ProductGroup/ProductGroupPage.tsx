import React, { useEffect, useState } from "react";
import {
  getProductGroups,
  saveProductGroup,
  deleteProductGroup,
} from "./Services/ProductGroupService";

import ProductGroupForm from "./ProductGroupForm";
import DataTable, { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import ConfirmationModal from "../../../../../Components/Common/ConfirmationModal";
import type { ProductGroup } from "./Services/types";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";

const ProductGroupPage: React.FC = () => {
  const [data, setData] = useState<ProductGroup[]>([]);
  const [, setIsLoading] = useState<boolean>(false);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<ProductGroup | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getProductGroups();
      setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (pg: ProductGroup) => {
    try {
      await saveProductGroup(pg);
      toast.success("Success!");
      setShowForm(false);
      setEditData(null);
      loadData();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      await deleteProductGroup(selectedId);
      toast.success("Deleted");
      loadData();
    }
  };

  const columns: TableColumn<ProductGroup>[] = [
    { name: "Sr. No.", selector: (_, i) => (i ?? 0) + 1, width: "100px" },
    { name: "Group Name", selector: (row) => row.groupName, sortable: true },
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
    headCells: { style: { color: "#ffffff", fontWeight: 700 } },
    rows: { style: { minHeight: "48px" } },
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen">
      {showForm && (
        <ProductGroupForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          editData={editData}
        />
      )}
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold border-b-2 border-[#143463]">
            Product Group Listing
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
          data={data.filter((x) =>
            x.groupName.toLowerCase().includes(filterText.toLowerCase()),
          )}
          pagination
          customStyles={tableStyles}
            subHeader={
            <input
              type="text"
              placeholder="Search..."
              className="border p-2 rounded w-64"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          }
        />
      </div>
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Group"
        message="Are you sure?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ProductGroupPage;
