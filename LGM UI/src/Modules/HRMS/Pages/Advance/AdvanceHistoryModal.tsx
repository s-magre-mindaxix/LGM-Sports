import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { getAdvanceHistory, type AdvanceHistory as HistoryData } from './Services/AdvanceService';
import Modal from '../../../../Components/Common/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  advanceId: number;
}

const AdvanceHistoryModal: React.FC<Props> = ({ isOpen, onClose, advanceId }) => {
    const [history, setHistory] = useState<HistoryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && advanceId) {
            const fetchHistory = async () => {
                setIsLoading(true);
                try {
                    const data = await getAdvanceHistory(advanceId);
                    setHistory(data);
                } catch {
                    toast.error("Failed to load advance history.");
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen, advanceId, onClose]);

    const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
        <div className="flex justify-between py-2 border-b">
            <span className="font-medium text-gray-600">{label}</span>
            <span className="text-gray-800">{typeof value === 'number' ? `₹ ${value.toLocaleString('en-IN')}` : value}</span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Advance History for ${history?.employeeName || ''}`}>
            {isLoading ? (
                 <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : history ? (
                <div className="text-sm">
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <InfoRow label="Original Amount" value={history.originalAmount} />
                        <InfoRow label="Total Repaid" value={history.totalRepaid} />
                        <InfoRow label="Outstanding Balance" value={history.balance} />
                        <InfoRow label="Advance Date" value={history.requestDate} />
                    </div>

                    <h3 className="font-semibold text-lg mb-2 text-gray-800">Repayment Ledger</h3>
                    <div className="overflow-y-auto max-h-60 border rounded-md">
                        <table className="w-full">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Date</th>
                                    <th className="px-4 py-2 text-right">Amount (₹)</th>
                                    <th className="px-4 py-2 text-left">Added By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.repayments.length > 0 ? (
                                    history.repayments.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2">{item.repaymentDate}</td>
                                            <td className="px-4 py-2 text-right text-green-600 font-medium">{item.repaymentAmount.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-2 text-gray-600">{item.createdByName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">No repayments made yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">Could not load history.</div>
            )}
        </Modal>
    );
};

export default AdvanceHistoryModal;