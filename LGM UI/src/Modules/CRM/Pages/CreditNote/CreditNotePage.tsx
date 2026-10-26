import React, { useEffect, useState } from "react";
import { type TableColumn } from "react-data-table-component";
import { FaEye, FaEdit, FaTrash,FaFileExcel,FaFilePdf   } from "react-icons/fa";
import ListingLayout from "../../../../Components/Common/ListingLayout";
import CreditNoteWizard from "./CreditNoteWizard";
import CreditNoteViewModal from "./CreditNoteViewModal";
import CreditNotePDFModal from "./CreditNotePDFModal";
import { getAllCreditNotes, getCreditNoteById, deleteCreditNote, downloadCreditNoteExcel, getCreditNotePdfData } from "./Services/CreditNoteService";
import type { CreditNoteListDto, CreditNoteDto } from "./Services/types";
import { actionButtonStyles } from "../../../../Components/Common/buttonStyles";
import { toast } from "sonner";
import ConfirmationModal from "../../../../Components/Common/ConfirmationModal";

const CreditNotePage: React.FC = () => {
    const [data, setData] = useState<CreditNoteListDto[]>([]); // Initialized as empty array
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [viewData, setViewData] = useState<CreditNoteDto | null>(null);
     const [pdfData, setPdfData] = useState<any>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filterText, setFilterText] = useState("");

    const loadData = async () => {
        setLoading(true);
        try {
            const result = await getAllCreditNotes();
            // Safety: Ensure result is an array before setting state
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load credit notes");
            setData([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleView = async (id: number) => {
        try {
            const result = await getCreditNoteById(id);
            setViewData(result);
        } catch (error) {
            toast.error("Error fetching details");
        }
    };

    const handleEdit = async (id: number) => {
        try {
            const result = await getCreditNoteById(id);
            setEditData(result);
            setShowForm(true);
        } catch (error) {
            toast.error("Error fetching details");
        }
    };


      const handleDownloadPdf = async (id: number) => {
        try {
            const result = await getCreditNotePdfData(id);
            setPdfData(result); // This triggers the CreditNotePDFModal to generate and download
        } catch (error) {
            toast.error("Failed to fetch PDF data");
        }
    };

    const handleDownloadExcel = async (id: number) => {
    try {
        await downloadCreditNoteExcel(id);
        toast.success("Excel downloaded successfully");
    } catch {
        toast.error("Failed to download Excel");
    }
};

    const columns: TableColumn<CreditNoteListDto>[] = [
        { 
            name: "Credit Note No", 
            selector: row => row.creditNoteNo || "", 
            sortable: true, 
            style: { fontWeight: 'bold', color: '#b33939' } 
        },
        { 
            name: "Date", 
            selector: row => row.creditNoteDate ? new Date(row.creditNoteDate).toLocaleDateString('en-GB') : "", 
            sortable: true 
        },
        { name: "Invoice No", selector: row => row.invoiceNo || "", sortable: true },
        { 
            name: "Amount", 
           selector: row => row.remainingBalanceAmount ?? 0,
            sortable: true, 
            cell: row => (
                <span className="font-bold text-red-600">
                    ₹{(row.remainingBalanceAmount ?? 0).toLocaleString()}
                </span>
            )
        },
        // { name: "Reason", selector: row => row.creditReason || "", width: '200px' },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadPdf(row.creditNoteId)}
                         className={`${actionButtonStyles.base} ${actionButtonStyles.pdf}`}
                        title="Download PDF"
                    >
                        <FaFilePdf />
                    </button>
                    <button onClick={() => handleView(row.creditNoteId)} className={`${actionButtonStyles.base} ${actionButtonStyles.view}`} title="View"><FaEye/></button>
                    <button onClick={() => handleEdit(row.creditNoteId)} className={`${actionButtonStyles.base} ${actionButtonStyles.edit}`} title="Edit"><FaEdit/></button>
                   
                    <button
                        onClick={() => handleDownloadExcel(row.creditNoteId)}
                       className={`${actionButtonStyles.base} bg-green-100 text-green-700 hover:bg-green-200`}
                        title="Download Excel"
                    >
                        <FaFileExcel />
                    </button>
                    <button onClick={() => setDeleteId(row.creditNoteId)} className={`${actionButtonStyles.base} ${actionButtonStyles.delete}`} title="Delete"><FaTrash/></button>
                </div>
            )
        }
    ];

    // Added safety check (data || []) before calling filter
    const filteredItems = (data || []).filter(x => 
        JSON.stringify(x).toLowerCase().includes(filterText.toLowerCase())
    );

    return (
        <div className="p-4 bg-[#f5f6fa] min-h-screen space-y-6">
            {showForm && (
                <CreditNoteWizard 
                    editData={editData} 
                    onCancel={() => { setShowForm(false); setEditData(null); }} 
                    onSuccess={() => { setShowForm(false); setEditData(null); loadData(); }} 
                />
            )}

            <ListingLayout
                title="Credit Note Listing"
                columns={columns}
                data={filteredItems}
                isLoading={loading}
                filterText={filterText}
                onFilterChange={setFilterText}
                onCreate={() => setShowForm(true)}
                createLabel="+ Create Credit Note"
            />

            {viewData && <CreditNoteViewModal data={viewData} onClose={() => setViewData(null)} />}
            {pdfData && <CreditNotePDFModal data={pdfData} onClose={() => setPdfData(null)} />}

            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                title="Delete Credit Note"
                message="Are you sure you want to delete this credit note record?"
                onConfirm={async () => {
                    if (deleteId) {
                        try {
                            await deleteCreditNote(deleteId);
                            toast.success("Deleted successfully");
                            loadData();
                        } catch {
                            toast.error("Delete failed");
                        } finally {
                            setDeleteId(null);
                        }
                    }
                }}
            />
        </div>
    );
};

export default CreditNotePage;