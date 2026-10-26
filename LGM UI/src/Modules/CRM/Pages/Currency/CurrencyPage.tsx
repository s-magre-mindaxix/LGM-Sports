import React, { useEffect, useState } from "react";
import {
  getCurrencies,
  saveCurrency,
  deleteCurrency,
} from "./Services/CurrencyService";

import CurrencyForm from "./CurrencyForm";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import type { Currency } from "./Services/types";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const CurrencyPage: React.FC = () => {
  const [data, setData] = useState<Currency[]>([]);
  const [filterText, setFilterText] = useState("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<Currency | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setisLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Currency", "CanAdd");
  const canEdit = hasPermission("Currency", "CanEdit");
  const canDelete = hasPermission("Currency", "CanDelete");

  const loadData = async () => {
    setisLoading(true);
    try {
      const res = await getCurrencies();
      setData(Array.isArray(res) ? res : []);
    } finally {
      setisLoading(false);
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

  const handleSave = async (item: Currency) => {
    try {
      await saveCurrency(item);
      toast.success("Success");
      setShowForm(false);
      setEditData(null);
      loadData();
    } catch {
      toast.error("Error");
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      await deleteCurrency(selectedId);
      toast.success("Deleted");
      loadData();
    }
  };

  const columns: TableColumn<Currency>[] = [
    {
      name: "Sr. No.",
      selector: (_, i) => (i ?? 0) + 1,
      width: "80px",
      sortable: true,
    },
    { name: "Currency", selector: (row) => row.currencyName, sortable: true },
    { name: "Symbol", selector: (row) => row.currencySymbol, width: "100px" },
    {
      name: "Exchange Value",
      selector: (row) => row.currencyValue,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          {canEdit && (
            <button
              onClick={() => {
                setEditData(row);
                setShowForm(true);
              }}
              className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            >
              <FaEdit size={16} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setSelectedId(row.id);
                setIsDeleteModalOpen(true);
              }}
              className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            >
              <FaTrash size={16} />
            </button>
          )}
        </div>
      ),
      width: "100px",
    },
  ];

  const filteredItems = data.filter((x) =>
    x.currencyName.toLowerCase().includes(filterText.toLowerCase()),
  );

  const handleCreateNew = () => {
    setEditData(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen">
      {showForm && (
        <CurrencyForm
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditData(null);
          }}
          editData={editData}
        />
      )}
      <ListingLayout
        title="Listing of Currencies"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? handleCreateNew : undefined}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Currency"
        message="Are you sure?"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default CurrencyPage;
