import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { Save, Loader2, ShieldCheck, Send, Upload, Paperclip } from 'lucide-react';
import apiClient from '../../../../API/apiClient';
import { API_ENDPOINTS } from '../../../../API/apiConfig';
import type { UserRole } from './TaxDeclarationPage';
import ProofManagementModal from './ProofManagementModal';

// --- Interfaces ---
export interface DocumentDto {
    id: number;
    fileName: string;
    filePath: string;
}

export interface DeclarationDetailDto {
  id?: number;
  section: string;
  declaredAmount: number;
  approvedAmount?: number;
  approvalStatus?: string;
  remarks?: string;
  documents: DocumentDto[];
}

export interface TaxDeclarationDto {
  id?: number;
  employeeID: number;
  financialYear: string;
  taxRegime: 'Old' | 'New' | '';
  status: 'Draft' | 'Submitted';
  declarationDetails: DeclarationDetailDto[];
}

interface ApprovalPayloadDto {
    detailId: number;
    approvedAmount: number;
    approvalStatus: 'Approved' | 'Rejected';
    remarks: string;
}

// --- API Functions ---
export const getDeclaration = async (employeeId: number, financialYear: string): Promise<TaxDeclarationDto | null> => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.TaxDeclarations}/employee/${employeeId}/${financialYear}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null; // No declaration found is a valid case
    throw new Error('Failed to fetch tax declaration.');
  }
};

export const saveDeclaration = async (payload: TaxDeclarationDto): Promise<TaxDeclarationDto> => {
  const response = await apiClient.post(API_ENDPOINTS.TaxDeclarations, payload);
  return response.data;
};

export const saveApprovals = async (declarationId: number, payload: ApprovalPayloadDto[]): Promise<any> => {
    const response = await apiClient.put(`${API_ENDPOINTS.TaxDeclarations}/${declarationId}/approve`, payload);
    return response.data;
};

// --- Component Constants ---
const TAX_SECTIONS = {
  Old: [
    { code: '80C', name: 'Section 80C (LIC, PF, etc.)', limit: 150000 },
    { code: '80D', name: 'Section 80D (Health Insurance)', limit: 25000 },
    { code: 'HRA', name: 'House Rent Allowance (HRA)', limit: Infinity },
    { code: '24b', name: 'Section 24(b) (Home Loan Interest)', limit: 200000 },
    { code: 'NPS', name: 'Section 80CCD(1B) (NPS)', limit: 50000 },
  ],
  New: [
     { code: '80CCD(2)', name: 'Section 80CCD(2) (NPS by Employer)', limit: Infinity },
  ],
};

const getCurrentFinancialYear = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-indexed (January is 0)
    const currentYear = today.getFullYear();
    // Financial year starts in April (month 3)
    return currentMonth < 3 ? `${currentYear - 1}-${currentYear}` : `${currentYear}-${currentYear + 1}`;
};

interface DeclarationFormProps {
    employeeId: number;
    userRole: UserRole;
}

const DeclarationForm: React.FC<DeclarationFormProps> = ({ employeeId, userRole }) => {
    const [declaration, setDeclaration] = useState<TaxDeclarationDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [details, setDetails] = useState<DeclarationDetailDto[]>([]);
    const [approvalData, setApprovalData] = useState<Map<number, Partial<ApprovalPayloadDto>>>(new Map());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<DeclarationDetailDto | null>(null);

    const isUserAdmin = userRole === 'Admin' || userRole === 'HR';

    useEffect(() => {
        const loadData = async () => {
            if (!employeeId) return;
            setIsLoading(true);
            try {
                const data = await getDeclaration(employeeId, getCurrentFinancialYear());
                if (data) {
                    setDeclaration(data);
                    setDetails(data.declarationDetails);
                    const initialMap = new Map<number, Partial<ApprovalPayloadDto>>();
                    data.declarationDetails.forEach(detail => {
                        initialMap.set(detail.id!, {
                            approvedAmount: detail.approvedAmount ?? detail.declaredAmount,
                            remarks: detail.remarks || '',
                        });
                    });
                    setApprovalData(initialMap);
                } else {
                    setDeclaration({
                        employeeID: employeeId,
                        financialYear: getCurrentFinancialYear(),
                        taxRegime: '',
                        status: 'Draft',
                        declarationDetails: []
                    });
                    setDetails([]);
                    setApprovalData(new Map());
                }
            } catch (error) {
                toast.error('Could not load declaration data.');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [employeeId]);

    const handleDetailChange = (sectionCode: string, amount: string) => {
        const newAmount = parseFloat(amount) || 0;
        setDetails(prev => {
            const existing = prev.find(d => d.section === sectionCode);
            if (existing) {
                return prev.map(d => d.section === sectionCode ? { ...d, declaredAmount: newAmount } : d);
            }
            return [...prev, { section: sectionCode, declaredAmount: newAmount, documents: [] }];
        });
    };

    const handleSaveDeclaration = async (newStatus: 'Draft' | 'Submitted') => {
        if (!declaration?.taxRegime) {
            toast.error('Please select a tax regime before saving.');
            return;
        }
        setIsSaving(true);
        try {
            const payload: TaxDeclarationDto = {
                ...declaration,
                status: newStatus,
                declarationDetails: details
                    .filter(d => d.declaredAmount > 0)
                    .map(detail => ({
                        ...detail,
                        approvalStatus: detail.approvalStatus || 'Pending',
                        remarks: detail.remarks || '',
                    })),
            };
            const updatedDeclaration = await saveDeclaration(payload);
            setDeclaration(updatedDeclaration);
            setDetails(updatedDeclaration.declarationDetails);
            toast.success(`Declaration successfully ${newStatus === 'Draft' ? 'saved as draft' : 'submitted'}.`);
        } catch (error: any) {
            toast.error(error.response?.data || 'Failed to save declaration.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleApprovalChange = (detailId: number, field: keyof Omit<ApprovalPayloadDto, 'detailId'>, value: any) => {
        setApprovalData(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(detailId) || {};
            newMap.set(detailId, { ...current, [field]: value });
            return newMap;
        });
    };

    const handleSaveApprovals = async () => {
        if (!declaration?.id) return;
        setIsSaving(true);
        try {
            const payload: ApprovalPayloadDto[] = Array.from(approvalData.entries()).map(([detailId, data]) => ({
                detailId,
                approvedAmount: data.approvedAmount ?? 0,
                approvalStatus: (data.approvedAmount ?? 0) > 0 ? 'Approved' : 'Rejected',
                remarks: data.remarks || '',
            }));
            await saveApprovals(declaration.id, payload);
            toast.success("Approvals have been saved successfully.");
        } catch (error) {
            toast.error("Failed to save approvals.");
        } finally {
            setIsSaving(false);
        }
    };

    const openProofModal = (sectionCode: string) => {
        const detail = details.find(d => d.section === sectionCode);
        if (!detail?.id) {
            toast.error("Please save a draft with an amount for this section before adding proofs.");
            return;
        }
        setSelectedDetail(detail);
        setIsModalOpen(true);
    };

    const handleDocumentsUpdate = (detailId: number, updatedDocs: DocumentDto[]) => {
        setDetails(prevDetails =>
            prevDetails.map(detail =>
                detail.id === detailId ? { ...detail, documents: updatedDocs } : detail
            )
        );
    };

    if (isLoading) {
        return <div className="bg-white rounded-lg shadow-md flex justify-center items-center h-96"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
    }

    // ===================== EMPLOYEE VIEW =====================
    if (!isUserAdmin) {
        const employeeDeclaration = declaration!;
        const isSubmitted = employeeDeclaration.status === 'Submitted';
        const totalDeclaredAmount = details.reduce((sum, item) => sum + (item.declaredAmount || 0), 0);
        
        // --- FIX #1: Safely determine which sections to display ---
        const currentRegime = employeeDeclaration.taxRegime;
        const displayedSections = (currentRegime === 'Old' || currentRegime === 'New')
            ? TAX_SECTIONS[currentRegime]
            : [];

        // --- FIX #2: Safely get the section name for the modal ---
        const getSectionNameForModal = () => {
            if (!selectedDetail || !declaration?.taxRegime || (declaration.taxRegime !== 'Old' && declaration.taxRegime !== 'New')) {
                return selectedDetail?.section || ''; // Fallback to section code
            }
            return TAX_SECTIONS[declaration.taxRegime].find(s => s.code === selectedDetail.section)?.name || selectedDetail.section;
        };

        return (
            <>
                {isModalOpen && selectedDetail && (
                    <ProofManagementModal
                        detailId={selectedDetail.id!}
                        sectionName={getSectionNameForModal()}
                        initialDocuments={selectedDetail.documents}
                        onClose={() => setIsModalOpen(false)}
                        onDocumentsUpdate={handleDocumentsUpdate}
                    />
                )}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-800">My Investment Declaration (FY {employeeDeclaration.financialYear})</h2>
                        <p className="text-sm text-gray-500">Declare your planned investments to save tax.</p>
                    </div>

                    <div className="p-6">
                        {isSubmitted && <div className="p-4 mb-6 bg-green-50 text-green-800 rounded-md">This declaration is submitted and read-only.</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Regime</label>
                                <select
                                    value={employeeDeclaration.taxRegime}
                                    onChange={e => setDeclaration(prev => ({...prev!, taxRegime: e.target.value as any}))}
                                    className="w-full max-w-xs pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                    disabled={isSubmitted}
                                >
                                    <option value="">-- Select a Regime --</option>
                                    <option value="Old">Old Tax Regime</option>
                                    <option value="New">New Tax Regime</option>
                                </select>
                            </div>

                            {displayedSections.map(section => {
                                const detail = details.find(d => d.section === section.code);
                                return (
                                    <div key={section.code}>
                                        <label className="block text-sm font-medium text-gray-700">{section.name}</label>
                                        <p className="text-xs text-gray-500 mb-1">Max Limit: {section.limit === Infinity ? 'As per rules' : `₹${section.limit.toLocaleString('en-IN')}`}</p>
                                        <div className="flex items-center gap-2">
                                            <div className="relative grow">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={detail?.declaredAmount || ''}
                                                    onChange={e => handleDetailChange(section.code, e.target.value)}
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    disabled={isSubmitted}
                                                />
                                            </div>
                                            <button
                                                onClick={() => openProofModal(section.code)}
                                                disabled={isSubmitted || !detail?.id}
                                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={!detail?.id ? "Save draft with an amount to add proofs" : "Manage Proofs"}
                                            >
                                                <Upload size={16} />
                                                <span className="font-semibold">{detail?.documents?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-between items-center p-6 bg-gray-50 border-t rounded-b-lg">
                        <div>
                            <span className="text-sm font-medium text-gray-600">Total Declared Amount:</span>
                            <p className="text-2xl font-bold text-gray-900">₹{totalDeclaredAmount.toLocaleString('en-IN')}</p>
                        </div>
                        {!isSubmitted && <div className="flex gap-3">
                            <button onClick={() => handleSaveDeclaration('Draft')} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60">
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Save Draft
                            </button>
                            <button onClick={() => handleSaveDeclaration('Submitted')} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>} Submit Final
                            </button>
                        </div>}
                    </div>
                </div>
            </>
        );
    }

    // ===================== ADMIN/HR VIEW =====================
    if (isUserAdmin) {
        if (!declaration || declaration.status !== 'Submitted') {
            return (
                <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                    <ShieldCheck size={48} className="text-gray-400"/>
                    <h3 className="text-lg font-semibold">Awaiting Submission</h3>
                    <p>The employee has not yet submitted their final declaration for FY {getCurrentFinancialYear()}.</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Approve Investment Declaration</h3>
                    <p className="text-sm text-gray-500">For Employee ID: {employeeId} | FY: {declaration.financialYear}</p>
                </div>
                <div className="p-6 overflow-x-auto">
                    <div className="grid grid-cols-12 gap-x-4 px-4 pb-3 border-b min-w-[900px]">
                        <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase">Section</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Declared Amount</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Approved Amount</div>
                        <div className="col-span-3 text-xs font-semibold text-gray-500 uppercase">Remarks</div>
                        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Proofs</div>
                    </div>

                    <div className="space-y-2 mt-2 min-w-[900px]">
                        {declaration.declarationDetails.map(detail => (
                            <div key={detail.id} className="grid grid-cols-12 gap-x-4 items-center px-4 py-3 hover:bg-gray-50 rounded-lg">
                                <div className="col-span-3 font-medium text-gray-800 text-sm">{TAX_SECTIONS.Old.find(s => s.code === detail.section)?.name || detail.section}</div>
                                <div className="col-span-2 font-mono text-gray-900 text-sm">₹{detail.declaredAmount.toLocaleString('en-IN')}</div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={approvalData.get(detail.id!)?.approvedAmount || ''}
                                        onChange={(e) => handleApprovalChange(detail.id!, 'approvedAmount', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        placeholder="Optional"
                                        value={approvalData.get(detail.id!)?.remarks || ''}
                                        onChange={(e) => handleApprovalChange(detail.id!, 'remarks', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    {detail.documents.length > 0 ? (
                                        <div className="flex flex-col space-y-1">
                                            {detail.documents.map(doc => (
                                                <a key={doc.id} href={doc.filePath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs" title={doc.fileName}>
                                                    <Paperclip size={14} /> <span className="truncate">{doc.fileName}</span>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">None</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end p-6 bg-gray-50 border-t rounded-b-lg">
                    <button
                        onClick={handleSaveApprovals}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Save Approvals
                    </button>
                </div>
            </div>
        );
    }

    return <div>You do not have permission to view this page.</div>;
};

export default DeclarationForm;