import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaCheckCircle,FaWarehouse  } from "react-icons/fa";
import { toast } from "sonner";
import {
  getTransits,
  deleteTransit,
  closeTransit,
  getTransitById,
  addToInventory
} from "./Services/ShipmentUnderTransitService";
import type { ShipmentUnderTransitListDto } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import TransitWizard from "./ShipmentundertransitWizard";
import TransitViewModal from "./ShipmentundertransitViewModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const ShipmentUnderTransitPage: React.FC = () => {
  const [data, setData] = useState<ShipmentUnderTransitListDto[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [closeModal, setCloseModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getTransits();
      setData(res);
    } catch {
      toast.error("Failed to load transit data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = async (id: number) => {
    const details = await getTransitById(id);
    setEditData(details);
    setShowWizard(true);
  };

  const handleAddToInventory = async (id: number) => {
    try {
        await addToInventory(id);
        toast.success("Items added to Quality Assurance.");
        loadData();
    } catch (err: any) {
        toast.error(err.response?.data || "Failed to add inventory.");
    }
};

  const columns: TableColumn<ShipmentUnderTransitListDto>[] = [
    { name: "Shipment No", selector: (row) => row.shipmentNo, sortable: true },
    { name: "Customer", selector: (row) => row.customerName, sortable: true },
  
    {
      name: "Exp. Arrival",
      selector: (row) =>
        row.expectedArrivalDate
          ? new Date(row.expectedArrivalDate).toLocaleDateString()
          : "N/A",
    },
    {
  name: "Status",
  cell: (row) => (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
        row.status?.toLowerCase() === "delivered"
          ? "bg-green-200 text-green-700"
          : row.status?.toLowerCase() === "in transit"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {row.status}
    </span>
  ),
},
    {
      name: "Actions",
     cell: (row) => (
    <div className="flex gap-1 flex-wrap">

        <button
            onClick={async () =>
                setViewData(await getTransitById(row.shipmentUnderTransitId))
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}
            title="View"
        >
            <FaEye />
        </button>

        <button
            onClick={() => handleEdit(row.shipmentUnderTransitId)}
            className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}
            title="Edit"
        >
            <FaEdit />
        </button>

        {row.status !== "Delivered" && (
            <button
                onClick={() =>
                    setCloseModal({
                        isOpen: true,
                        id: row.shipmentUnderTransitId,
                    })
                }
                className={`${actionButtonStyles.base} bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border-emerald-200`}
                title="Mark Delivered"
            >
                <FaCheckCircle />
            </button>
        )}

       {row.showAddInventoryButton && (
            <button
                onClick={() =>
                    handleAddToInventory(row.shipmentUnderTransitId)
                }
                className={`${actionButtonStyles.base} bg-violet-50 text-violet-600 hover:bg-violet-600 hover:text-white border-violet-200`}
                title="Add To Inventory"
            >
                <FaWarehouse  />
            </button>
        )}

        <button
            onClick={() =>
                setDeleteModal({
                    isOpen: true,
                    id: row.shipmentUnderTransitId,
                })
            }
            className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}
            title="Delete"
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
        <TransitWizard
          editData={editData}
          onSuccess={() => {
            setShowWizard(false);
            loadData();
          }}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {viewData && (
        <TransitViewModal data={viewData} onClose={() => setViewData(null)} />
      )}

      <ListingLayout
        title="Shipments Under Transit"
        columns={columns}
        data={data.filter(
          (x) =>
            x.shipmentNo.toLowerCase().includes(filterText.toLowerCase()) ||
            x.customerName.toLowerCase().includes(filterText.toLowerCase()),
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
          await deleteTransit(deleteModal.id);
          toast.success("Record Deleted");
          loadData();
          setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Delete Transit Record"
        message="Are you sure? This will remove the tracking information for this shipment."
      />

      <ConfirmationModal
        isOpen={closeModal.isOpen}
        onClose={() => setCloseModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await closeTransit(closeModal.id);
          toast.success("Shipment Closed Successfully");
          loadData();
          setCloseModal({ isOpen: false, id: 0 });
        }}
        title="Close Shipment"
        message="Mark this shipment as Delivered and Closed?"
      />
    </div>
  );
};

export default ShipmentUnderTransitPage;
