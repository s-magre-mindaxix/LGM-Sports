import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import {
  getDispatches,
  deleteDispatch,
  getDispatchById,
} from "./Services/DispatchService";
import type { DispatchDto } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import DispatchWizard from "./DispatchWizard";
import DispatchViewModal from "./DispatchViewModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const DispatchPage: React.FC = () => {
  const [data, setData] = useState<DispatchDto[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getDispatches();
      setData(res);
    } catch {
      toast.error("Failed to load dispatch records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: TableColumn<DispatchDto>[] = [
    {
      name: "Shipment No",
      selector: (row) => row.shipmentNo,
      sortable: true,
    },
    {
      name: "Dispatch No",
      selector: (row) =>
        row.dispatchDetails?.[0]?.dispatchNo || "N/A",
      sortable: true,
    },
    {
      name: "Customer",
     selector: (row) =>
      row.dispatchDetails?.[0]?.customerName ||
      row.customerName ||
      "N/A",
      sortable: true,
    },

    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => setViewData(row)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
          >
            <FaEye />
          </button>
          <button
            onClick={async () => {
              try {
                const dispatch = await getDispatchById(row.dispatchId);

                setEditData(dispatch);

                setShowWizard(true);
              } catch (err) {
                console.error(err);
                toast.error("Failed to load dispatch details");
              }
            }}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row.dispatchId })}
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {showWizard && (
        <DispatchWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            loadData();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}
      {viewData && (
        <DispatchViewModal data={viewData} onClose={() => setViewData(null)} />
      )}

      <ListingLayout
        title="Material Dispatch"
        columns={columns}
        data={data.filter(
          (x) =>
            (x.shipmentNo ?? "")
              .toLowerCase()
              .includes(filterText.toLowerCase()) ||
            (x.customerName ?? "")
              .toLowerCase()
              .includes(filterText.toLowerCase()),
        )}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => {
          setEditData(null);
          setShowWizard(true);
        }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await deleteDispatch(deleteModal.id);
          toast.success("Dispatch record deleted");
          loadData();
          setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Delete Dispatch"
        message="Are you sure you want to delete this dispatch entry?"
      />
    </div>
  );
};

export default DispatchPage;
