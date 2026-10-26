import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { getShipments, deleteShipment, getShipmentById } from "./Services/ShipmentService";
import type { ShipmentInitiate } from "./Services/types";
import ShipmentWizard from "./ShipmentWizard";
import ShipmentViewModal from "./ShipmentViewModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const ShipmentPage: React.FC = () => {
  const [data, setData] = useState<ShipmentInitiate[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<ShipmentInitiate | null>(null);
  const [viewData, setViewData] = useState<ShipmentInitiate | null>(null);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getShipments();
      setData(res);
    } catch { toast.error("Failed to load shipments"); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = async (id: number) => {
    try {
      const res = await getShipmentById(id);
      setEditData(res);
      setShowWizard(true);
    } catch { toast.error("Error fetching details"); }
  };

  const handleView = async (id: number) => {
  try {
    const res = await getShipmentById(id);
    setViewData(res);
  } catch {
    toast.error("Error fetching shipment details");
  }
};

  const columns: TableColumn<ShipmentInitiate>[] = [
    { name: "Shipment No", selector: (row) => row.shipmentNo, sortable: true },
    { name: "Customer", selector: (row) => row.customerName || "N/A", sortable: true },
    { name: "Source", selector: (row) => row.sourceType, sortable: true },
    { name: "Invoice No", selector: (row) => row.invoiceNo || "N/A" },
    { name: "Date", selector: (row) => new Date(row.shipmentDate).toLocaleDateString() },
    { name: "Status", selector: (row) => row.status, cell: (row) => <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">{row.status}</span> },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
         <button onClick={() => handleView(row.shipmentInitiateId)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye /></button>
          <button onClick={() => handleEdit(row.shipmentInitiateId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row.shipmentInitiateId })} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash /></button>
        </div>
      ),
    },
  ];

  const filteredItems = data.filter(item => 
    item.shipmentNo.toLowerCase().includes(filterText.toLowerCase()) ||
    (item.customerName || "").toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6">
      {showWizard && <ShipmentWizard editData={editData} onSuccess={() => { setShowWizard(false); loadData(); }} onCancel={() => setShowWizard(false)} />}
      {viewData && (
        <ShipmentViewModal 
          shipment={viewData} 
          onClose={() => setViewData(null)} 
        />
      )}
      
      <ListingLayout
        title="Shipment Initiation"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => { setEditData(null); setShowWizard(true); }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
            await deleteShipment(deleteModal.id);
            toast.success("Deleted");
            loadData();
            setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Delete Shipment"
        message="Are you sure?"
      />
    </div>
  );
};

export default ShipmentPage;