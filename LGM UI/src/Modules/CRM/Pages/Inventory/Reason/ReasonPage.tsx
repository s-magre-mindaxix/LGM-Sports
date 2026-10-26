import React, { useEffect, useState } from "react";
import { getReasons, deleteReason, getReasonById } from "./Services/ReasonService";
import type { Reason, ReasonListItem } from "./Services/types";
import ReasonWizard from "./ReasonWizard";
import ReasonViewModal from "./ReasonViewModal";
import { type TableColumn } from "react-data-table-component";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import ListingLayout from "../../../../../Components/Common/ListingLayout";
import { actionButtonStyles } from "../../../../../Components/Common/buttonStyles";
import { usePermissions } from "../../../../../hooks/usePermissions";

const ReasonPage: React.FC = () => {
  const [items, setItems] = useState<ReasonListItem[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [editData, setEditData] = useState<Reason | null>(null);
  const [viewData, setViewData] = useState<Reason | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("Reason", "CanAdd");
  const canEdit = hasPermission("Reason", "CanEdit");
  const canDelete = hasPermission("Reason", "CanDelete");

  const loadItems = async () => {
    setIsLoading(true);
    try { setItems(await getReasons()); }
    catch (error) { console.error("Failed to load reasons:", error); }
    finally { setIsLoading(false); }
  };
  useEffect(() => {
    void loadItems();
    const refresh = () => void loadItems();
    window.addEventListener("app-refresh", refresh);
    return () => window.removeEventListener("app-refresh", refresh);
  }, []);

  const handleView = async (id: number) => {
    setIsLoading(true);
    try { setViewData(await getReasonById(id)); }
    catch (error) { console.error("Failed to load reason:", error); window.alert("Could not load reason details."); }
    finally { setIsLoading(false); }
  };
  const handleEdit = async (id: number) => {
    setIsLoading(true);
    try { setEditData(await getReasonById(id)); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (error) { console.error("Failed to load reason for editing:", error); window.alert("Could not load reason for editing."); }
    finally { setIsLoading(false); }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this reason?")) return;
    try { await deleteReason(id); await loadItems(); }
    catch (error) { console.error("Failed to delete reason:", error); window.alert("Could not delete reason."); }
  };

  const columns: TableColumn<ReasonListItem>[] = [
    { name: "Sr. No.", cell: (_row, index) => (index ?? 0) + 1, width: "75px" },
    { name: "ID", selector: (row) => row.reasonId, sortable: true, width: "85px" },
    { name: "Code", selector: (row) => row.code, sortable: true, width: "170px" },
    { name: "Name", selector: (row) => row.name, sortable: true, grow: 1.6, wrap: true },
    { name: "Reason Type", selector: (row) => row.reasonType, sortable: true, grow: 1.2 },
    { name: "Status", cell: (row) => <span className={row.isActive ? "rounded bg-green-100 px-2 py-1 text-green-700" : "rounded bg-gray-100 px-2 py-1 text-gray-600"}>{row.isActive ? "Active" : "Inactive"}</span>, width: "110px" },
    { name: "Actions", cell: (row) => <div className="flex justify-center gap-4">
      <button type="button" title="View" onClick={() => void handleView(row.reasonId)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`}><FaEye size={16} /></button>
      {canEdit && <button type="button" title="Edit" onClick={() => void handleEdit(row.reasonId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`}><FaEdit size={16} /></button>}
      {canDelete && <button type="button" title="Delete" onClick={() => void handleDelete(row.reasonId)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`}><FaTrash size={16} /></button>}
    </div>, width: "140px" },
  ];
  const filteredItems = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filterText.toLowerCase()));
  return <div className="min-h-screen space-y-6 bg-[#f5f6fa] p-4">
    {showWizard && <ReasonWizard editData={editData} onSuccess={() => { setShowWizard(false); setEditData(null); void loadItems(); }} onCancel={() => { setShowWizard(false); setEditData(null); }} />}
    {viewData && <ReasonViewModal item={viewData} onClose={() => setViewData(null)} />}
    <ListingLayout title="Listing of Reasons" columns={columns} data={filteredItems} isLoading={isLoading} filterText={filterText} onFilterChange={setFilterText} onCreate={canAdd ? () => { setEditData(null); setShowWizard(true); window.scrollTo({ top: 0, behavior: "smooth" }); } : undefined} />
  </div>;
};
export default ReasonPage;
