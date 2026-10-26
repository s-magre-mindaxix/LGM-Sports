import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { getTransporterBills, deleteTransporterBill, getTransporterBillById } from "./Services/TransporterBillService";
import type { TransporterBillListDto } from "./Services/types";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import TransporterBillWizard from "./TransporterBillWizard";
import TransporterBillViewModal from "./TransporterBillViewModal";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";

const TransporterBillPage: React.FC = () => {
  const [data, setData] = useState<TransporterBillListDto[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [viewData, setViewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getTransporterBills();
      setData(res);
    } catch {
      toast.error("Failed to load Transporter bills");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = async (id: number) => {
    try {
        const details = await getTransporterBillById(id);
        setEditData(details);
        setShowWizard(true);
    } catch (error) {
        toast.error("Error fetching bill details");
    }
  };

  const columns: TableColumn<TransporterBillListDto>[] = [
    { name: "Bill No", selector: (row) => row.billNo || "N/A", sortable: true },
    { name: "Shipment No", selector: (row) => row.shipmentNo, sortable: true },
    { name: "Transporter", selector: (row) => row.agencyName, sortable: true },
    { name: "Total Amount", selector: (row) => row.totalAmount.toLocaleString(), sortable: true },
    {
      name: "Status",
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.paymentStatus === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
          {row.paymentStatus}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-1">
          <button onClick={async () => setViewData(await getTransporterBillById(row.transporterBillId))} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye /></button>
          <button onClick={() => handleEdit(row.transporterBillId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, id: row.transporterBillId })} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {showWizard && <TransporterBillWizard editData={editData} onSuccess={() => { setShowWizard(false); loadData(); }} onCancel={() => setShowWizard(false)} />}
      {viewData && <TransporterBillViewModal data={viewData} onClose={() => setViewData(null)} />}

      <ListingLayout
        title="Transporter Bills"
        columns={columns}
        data={data.filter(x => x.billNo?.toLowerCase().includes(filterText.toLowerCase()) || x.shipmentNo.toLowerCase().includes(filterText.toLowerCase()))}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={() => { setEditData(null); setShowWizard(true); }}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: 0 })}
        onConfirm={async () => {
          await deleteTransporterBill(deleteModal.id);
          toast.success("Transporter Bill Deleted");
          loadData();
          setDeleteModal({ isOpen: false, id: 0 });
        }}
        title="Delete Transporter Bill"
        message="Are you sure you want to delete this transporter bill record?"
      />
    </div>
  );
};

export default TransporterBillPage;