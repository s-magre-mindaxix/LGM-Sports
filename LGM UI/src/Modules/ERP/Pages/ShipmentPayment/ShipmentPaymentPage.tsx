import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye, FaCalendarDay } from "react-icons/fa";
import { toast } from "sonner";
import { getShipmentPayments, deleteShipmentPayment, getShipmentPaymentById } from "./Services/ShipmentPaymentService";
import type { ShipmentPaymentListDto } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ShipmentPaymentWizard from "./ShipmentPaymentWizard";
import ShipmentPaymentViewModal from "./ShipmentPaymentViewModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const ShipmentPaymentPage: React.FC = () => {
  const [data, setData] = useState<ShipmentPaymentListDto[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getShipmentPayments();
      setData(res);
    } catch {
      toast.error("Failed to load shipment payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = async (id: number) => {
    try {
        const details = await getShipmentPaymentById(id);
        setEditData(details);
        setShowWizard(true);
    } catch {
        toast.error("Error fetching payment details");
    }
  };

  const columns: TableColumn<ShipmentPaymentListDto>[] = [
    { 
        name: "Shipment No", 
        selector: (row) => row.shipmentNo, 
        sortable: true,
        cell: (row) => <span className="font-bold text-blue-900">{row.shipmentNo}</span>
    },
    { name: "Customer", selector: (row) => row.customerName, sortable: true },
    { 
        name: "Delivered", 
        selector: (row) => row.deliveredDate, 
        sortable: true,
        cell: (row) => <span>{new Date(row.deliveredDate).toLocaleDateString()}</span>
    },
    { 
        name: "Aging", 
        selector: (row) => row.pendingDays, 
        sortable: true,
        cell: (row) => (
            <div className="flex items-center gap-1">
                <FaCalendarDay className={row.paymentCompleted ? 'text-slate-400' : 'text-red-500'} />
                <span className={`font-bold ${!row.paymentCompleted && row.pendingDays > 30 ? 'text-red-600' : ''}`}>
                    {row.pendingDays} Days
                </span>
            </div>
        )
    },
    {
      name: "Status",
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.paymentCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={async () => setViewData(await getShipmentPaymentById(row.shipmentPaymentId))} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye /></button>
          <button onClick={() => handleEdit(row.shipmentPaymentId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row.shipmentPaymentId })} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {showWizard && <ShipmentPaymentWizard editData={editData} onSuccess={() => { setShowWizard(false); loadData(); }} onCancel={() => setShowWizard(false)} />}
      {viewData && <ShipmentPaymentViewModal data={viewData} onClose={() => setViewData(null)} />}

      <ListingLayout
        title="Shipment Payment Tracking"
        columns={columns}
        data={data.filter(x => 
            x.shipmentNo.toLowerCase().includes(filterText.toLowerCase()) || 
            x.customerName.toLowerCase().includes(filterText.toLowerCase()) ||
            x.invoiceNo.toLowerCase().includes(filterText.toLowerCase())
        )}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => { setEditData(null); setShowWizard(true); }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await deleteShipmentPayment(deleteModal.id);
          toast.success("Record Deleted");
          loadData();
          setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Delete Payment Record"
        message="Are you sure you want to delete this payment tracking record?"
      />
    </div>
  );
};

export default ShipmentPaymentPage;