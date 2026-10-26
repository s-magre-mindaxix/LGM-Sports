import React, { useEffect, useMemo, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { getAgencies, deleteAgency, getAgencyById } from "./Services/AgencyService";
import type { Agency } from "./Services/types";
import AgencyWizard from "./AgencyWizard";
import AgencyViewModal from "./AgencyViewModal";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../hooks/usePermissions";

const AgencyPage: React.FC = () => {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Agency | null>(null);
  const [viewData, setViewData] = useState<Agency | null>(null);
  const [filterText, setFilterText] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Replace 'Agency' with your actual module name for permissions
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Agency", "CanAdd");
  const canEdit = hasPermission("Agency", "CanEdit");
  const canDelete = hasPermission("Agency", "CanDelete");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAgencies();
      setAgencies(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load agencies");
      setAgencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleView = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await getAgencyById(id);
      setViewData(data);
    } catch { toast.error("Could not fetch agency details"); } 
    finally { setIsLoading(false); }
  };

  const handleEdit = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await getAgencyById(id);
      setEditData(data);
      setShowWizard(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { toast.error("Error fetching agency details"); } 
    finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteAgency(deleteModal.id);
      toast.success("Agency deleted successfully");
      loadData();
      setDeleteModal({ isOpen: false, id: 0 });
    } catch {
      toast.error("Error deleting agency");
    }
  };

  const columns: TableColumn<Agency>[] = [
    { name: "Sr. No.", cell: (_, index) => (index ?? 0) + 1, width: "60px" },
    { name: "Agency Name", selector: (row) => row.agencyName, sortable: true, grow: 2 },
    { name: "Agency Code", selector: (row) => row.agencyCode, sortable: true },
    { name: "Contact Person", selector: (row) => row.contacts?.[0]?.personName || "N/A", sortable: true, grow: 1.5 },
    { name: "Mobile No.", selector: (row) => row.addresses?.[0]?.mobileNo || "N/A" },
    { name: "Email", selector: (row) => row.addresses?.[0]?.emailAddress || "N/A", grow: 1.5 },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex justify-center gap-3 w-full">
          <button onClick={() => handleView(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`} title="View"><FaEye size={16} /></button>
          {canEdit && <button onClick={() => handleEdit(row.id)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`} title="Edit"><FaEdit size={16} /></button>}
          {canDelete && <button onClick={() => setDeleteModal({ isOpen: true, id: row.id })} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`} title="Delete"><FaTrash size={16} /></button>}
        </div>
      ),
      width: "120px",
    },
  ];

  const filteredItems = useMemo(() => agencies.filter((item) =>
    (item.agencyName || "").toLowerCase().includes(filterText.toLowerCase()) ||
    (item.agencyCode || "").toLowerCase().includes(filterText.toLowerCase())
  ), [agencies, filterText]);

  return (
    <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
      {showWizard && (
        <AgencyWizard
          editData={editData}
          onSuccess={() => { setShowWizard(false); loadData(); setEditData(null); }}
          onCancel={() => { setShowWizard(false); setEditData(null); }}
        />
      )}
      {viewData && <AgencyViewModal agency={viewData} onClose={() => setViewData(null)} />}
      <ListingLayout
        title="Listing of Agencies"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        filterText={filterText}
        onFilterChange={setFilterText}
        onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); } : undefined}
      />
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Agency"
        message="Are you sure you want to delete this agency? This action cannot be undone."
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default AgencyPage;