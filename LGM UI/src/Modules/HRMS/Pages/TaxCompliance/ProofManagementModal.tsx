import React, { useState } from 'react';
import { Upload, X, Paperclip, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import apiClient from '../../../../API/apiClient';
import { API_ENDPOINTS } from '../../../../API/apiConfig';

// --- Interfaces ---
interface DocumentDto {
    id: number;
    fileName: string;
    filePath: string;
}

interface ProofManagementModalProps {
    detailId: number;
    sectionName: string;
    initialDocuments: DocumentDto[];
    onClose: () => void;
    onDocumentsUpdate: (detailId: number, documents: DocumentDto[]) => void;
}

// ===================== NEW CODE TO ADD (Confirmation Popup Component) =====================
// This is the new popup component, placed inside the same file.
interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">{message}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleConfirm}
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
// =================== END OF NEW CODE ===================


// --- API Functions (No Changes) ---
const uploadProof = async (detailId: number, file: File): Promise<DocumentDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${API_ENDPOINTS.TaxDeclarations}/details/${detailId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const deleteProof = async (documentId: number): Promise<boolean> => {
    await apiClient.delete(`${API_ENDPOINTS.TaxDeclarations}/documents/${documentId}`);
    return true;
};


// --- Main Component ---
const ProofManagementModal: React.FC<ProofManagementModalProps> = ({
    detailId,
    sectionName,
    initialDocuments,
    onClose,
    onDocumentsUpdate
}) => {
    const [documents, setDocuments] = useState<DocumentDto[]>(initialDocuments);
    const [isUploading, setIsUploading] = useState(false);
    
    // ===================== NEW CODE TO ADD (State for the popup) =====================
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
    // =================== END OF NEW CODE ===================


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a PDF, JPG, or PNG.');
            return;
        }

        setIsUploading(true);
        try {
            const newDocument = await uploadProof(detailId, file);
            const updatedDocs = [...documents, newDocument];
            setDocuments(updatedDocs);
            onDocumentsUpdate(detailId, updatedDocs);
            toast.success("Document uploaded successfully.");
        } catch  {
            toast.error("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    // ===================== MODIFIED CODE (Handle Delete Logic) =====================
    // This function now just opens the confirmation modal
    const handleDeleteClick = (documentId: number) => {
        setDocumentToDelete(documentId);
        setIsConfirmModalOpen(true);
    };

    // This function contains the actual deletion logic and is called by the confirmation modal
    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            await deleteProof(documentToDelete);
            const updatedDocs = documents.filter(doc => doc.id !== documentToDelete);
            setDocuments(updatedDocs);
            onDocumentsUpdate(detailId, updatedDocs);
            toast.success("Document deleted.");
        } catch  {
            toast.error("Failed to delete document.");
        } finally {
            setDocumentToDelete(null); // Reset the state
        }
    };
    // =================== END OF MODIFIED CODE ===================


    return (
        <>
            <div className="fixed inset-0 bg-transparent backdrop-brightness-70 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-800">Manage Proofs for {sectionName}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <div className="mb-6">
                            <label className="w-full flex items-center justify-center px-4 py-6 bg-gray-50 text-blue-600 rounded-lg border-2 border-dashed border-gray-300 hover:bg-blue-50 hover:border-blue-500 cursor-pointer transition-colors">
                                {isUploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                                <span className="ml-2 text-sm font-medium">{isUploading ? 'Uploading...' : 'Click to upload proof'}</span>
                                <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG. Max size: 5MB.</p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-600 border-b pb-2">Uploaded Documents:</h4>
                            {documents.length > 0 ? (
                                documents.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md hover:bg-gray-200">
                                        <a href={doc.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 hover:underline truncate">
                                            <Paperclip size={16} />
                                            <span className="truncate">{doc.fileName}</span>
                                        </a>
                                        {/* ===================== MODIFIED CODE (Call new handler) ===================== */}
                                        <button onClick={() => handleDeleteClick(doc.id)} className="text-red-500 hover:text-red-700 ml-2">
                                        {/* =================== END OF MODIFIED CODE =================== */}
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 text-center py-4">No documents uploaded for this section.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* ===================== NEW CODE TO ADD (Render the popup) ===================== */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Document"
                message="Are you sure you want to permanently delete this document? This action cannot be undone."
            />
            {/* =================== END OF NEW CODE =================== */}
        </>
    );
};

export default ProofManagementModal;