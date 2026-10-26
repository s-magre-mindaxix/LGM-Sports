import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEye, FaEdit, FaTrash,FaFilePdf,FaFileExcel  } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import DebitNoteWizard from "./DebitNoteWizard";
import DebitNoteViewModal from "./DebitNoteViewModal";
import DebitNotePDFModal from "./DebitNotePDFModal"; 
import { getAllDebitNotes, getDebitNoteById, deleteDebitNote,getDebitNotePdfData, downloadDebitNoteExcel  } from "./Services/DebitNoteService";
import type { DebitNoteListDto, DebitNoteDto } from "./Services/types";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { toast } from "sonner";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";

const DebitNotePage: React.FC = () => {
    const [data, setData] = useState<DebitNoteListDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [viewData, setViewData] = useState<DebitNoteDto | null>(null);
    const [pdfData, setPdfData] = useState<any>(null); 
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filterText, setFilterText] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getAllDebitNotes();
            setData(result);
        } catch { toast.error("Failed to load records"); } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

      const handleDownloadPdf = async (id: number) => {
        try {
            const result = await getDebitNotePdfData(id);
            setPdfData(result);
        } catch (error) {
            toast.error("Failed to fetch PDF data");
        }
    };

    const handleDownloadExcel = async (id: number, debitNoteNo: string) => {
    try {
        toast.info("Preparing Excel file...");
        await downloadDebitNoteExcel(id, `DebitNote_${debitNoteNo || id}.xlsx`);
    } catch (error) {
        toast.error("Failed to download Excel file");
    }
};

    const columns: TableColumn<DebitNoteListDto>[] = [
        { name: "Debit Note No", selector: row => row.debitNoteNo || "", sortable: true, style: { fontWeight: 'bold', color: '#30336b' } },
        { name: "Date", selector: row => row.debitNoteDate ? new Date(row.debitNoteDate).toLocaleDateString('en-GB') : "", sortable: true },
        { name: "Invoice No", selector: row => row.invoiceNo || "", sortable: true },
        { 
            name: "Debit Amount", 
            selector: row => row.adjustAmount, 
            sortable: true,
            cell: row => <span className="font-bold text-blue-600">+ ₹{row.adjustAmount.toLocaleString()}</span>
        },
        { 
            name: "New Balance", 
            selector: row => row.updatedBalanceAmount, 
            sortable: true,
            cell: row => <span className="font-bold text-slate-800">₹{row.updatedBalanceAmount.toLocaleString()}</span>
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadPdf(row.debitNoteId)}
                        className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
                        title="Download PDF"
                    >
                        <FaFilePdf />
                    </button>
                    <button onClick={async () => setViewData(await getDebitNoteById(row.debitNoteId))} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`} title="View"><FaEye/></button>
                    <button onClick={async () => { setEditData(await getDebitNoteById(row.debitNoteId)); setShowForm(true); }} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`} title="Edit"><FaEdit/></button>
                       <button 
                    onClick={() => handleDownloadExcel(row.debitNoteId, row.debitNoteNo)} 
                     className={`${actionButtonStyles.base} bg-green-100 text-green-700 hover:bg-green-200`}
                    title="Download Excel"
                >
                    <FaFileExcel/>
                </button>
                    <button onClick={() => setDeleteId(row.debitNoteId)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`} title="Delete"><FaTrash/></button>
                </div>
            )
        }
    ];

    const filteredItems = data.filter(x => JSON.stringify(x).toLowerCase().includes(filterText.toLowerCase()));

    return (
        <div className="p-4 bg-[#f5f6fa] min-h-screen">
            {showForm && (
                <DebitNoteWizard 
                    editData={editData} 
                    onCancel={() => { setShowForm(false); setEditData(null); }} 
                    onSuccess={() => { setShowForm(false); setEditData(null); loadData(); }} 
                />
            )}

            <ListingLayout
                title="Debit Note Listing"
                columns={columns}
                data={filteredItems}
                isLoading={loading}
                filterText={filterText}
                onFilterChange={setFilterText}
                onCreate={() => setShowForm(true)}
                createLabel="+ Create Debit Note"
            />

            {viewData && <DebitNoteViewModal data={viewData} onClose={() => setViewData(null)} />}
            {pdfData && <DebitNotePDFModal data={pdfData} onClose={() => setPdfData(null)} />}

            <ConfirmationModal
                isOpen={!!deleteId} onClose={() => setDeleteId(null)}
                title="Delete Debit Note" message="Are you sure you want to delete this record?"
                onConfirm={async () => {
                    if (deleteId) {
                        try { await deleteDebitNote(deleteId); toast.success("Deleted"); loadData(); } catch { toast.error("Delete failed"); }
                        setDeleteId(null);
                    }
                }}
            />
        </div>
    );
};

export default DebitNotePage;