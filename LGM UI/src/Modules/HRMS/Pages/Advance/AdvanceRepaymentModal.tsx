import React, { useState, useEffect } from 'react';
import { Loader2, DollarSign } from 'lucide-react';
import { addRepayment, type AdvanceRepaymentPayload } from './Services/AdvanceService';
import Modal from '../../../../Components/Common/Modal';
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  advanceId: number;
  balance: number;
  currentUserId: number;
}

const AdvanceRepaymentModal: React.FC<Props> = ({ isOpen, onClose, onSave, advanceId, balance, currentUserId }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setNotes('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const repaymentAmount = parseFloat(amount);
        if (isNaN(repaymentAmount) || repaymentAmount <= 0) {
            toast.error("Please enter a valid repayment amount.");
            return;
        }
        if (repaymentAmount > balance) {
            toast.error(`Repayment amount cannot be greater than the balance of ₹${balance.toLocaleString('en-IN')}.`);
            return;
        }
        setIsSaving(true);
        try {
            const payload: AdvanceRepaymentPayload = {
                repaymentAmount,
                repaymentDate: date,
                notes,
                createdByEmployeeId: currentUserId
            };
            await addRepayment(advanceId, payload);
            toast.success("Repayment added successfully!");
            onSave();
            onClose();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Failed to add repayment.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Repayment">
            <form onSubmit={handleSubmit} className="space-y-4 p-1">
                <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Outstanding Balance</label>
                    <input type="text" id="balance" value={`₹ ${balance.toLocaleString('en-IN')}`} disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100"/>
                </div>
                 <div>
                    <label htmlFor="repaymentAmount" className="block text-sm font-medium text-gray-700">Repayment Amount (₹)</label>
                    <input type="number" step="0.01" min="0.01" max={balance} id="repaymentAmount" value={amount} onChange={(e) => setAmount(e.target.value)} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label htmlFor="repaymentDate" className="block text-sm font-medium text-gray-700">Repayment Date</label>
                    <input type="date" id="repaymentDate" value={date} onChange={(e) => setDate(e.target.value)} required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                    <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button type="button" onClick={onClose} className="bg-gray-500 text-white px-8 py-2 rounded-lg font-semibold">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 border border-transparent rounded-md shadow-sm">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <DollarSign size={18} />}
                        {isSaving ? "Saving..." : "Add Payment"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
export default AdvanceRepaymentModal;