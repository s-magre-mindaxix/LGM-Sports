import React, { useEffect, useState } from "react";
import { X, Loader2, Banknote, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  applyForLoan,
  type LoanApplicationCreatePayload,
} from "./LoanApplicationService";
import { getLoanMasters } from "../Masters/LoanMaster/LoanMasterService";
import { useAuth } from "../../../../hooks/useAuth";

interface ApplyLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
interface LoanTypeOption {
  id: number;
  loanTypeName: string;
}

const ApplyLoanModal: React.FC<ApplyLoanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [loanAmount, setLoanAmount] = useState("");
  const [tenure, setTenure] = useState("");
  const [loanTypes, setLoanTypes] = useState<LoanTypeOption[]>([]);
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

   const fetchLoanTypes = async () => {
  try {
    const res = await getLoanMasters(false);

    const normalized: LoanTypeOption[] = res.data.map((x) => ({
      id: x.id,
      loanTypeName: x.loanTypeName,
    }));

    setLoanTypes(normalized);
  } catch {
    toast.error("Failed to load loan types.");
  }
};



    fetchLoanTypes();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setLoanAmount("");
    setTenure("");
    setSelectedLoanTypeId("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return toast.error("Not logged in.");
    if (!selectedLoanTypeId) return toast.error("Please select a loan type.");

    const amount = Number(loanAmount);
    const months = Number(tenure);

    if (!amount || amount <= 0) return toast.error("Enter valid loan amount.");
    if (!months || months < 1 || months > 120)
      return toast.error("Tenure must be 1-120 months.");

    setIsLoading(true);

    try {
      const payload: LoanApplicationCreatePayload = {
        employeeId: user.employeeId,
        loanAmount: amount,
        tenureInMonths: months,
        loanTypeId: Number(selectedLoanTypeId),
      };

      await applyForLoan(payload);

      toast.success("Loan application submitted.");
      onSuccess();
      handleClose();
    } catch {
      toast.error("Failed to submit application.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold">Apply for Loan</h3>
            <button type="button" onClick={handleClose}>
              <X />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Loan Type
              </label>
              <select
                value={selectedLoanTypeId}
                onChange={(e) =>
                  setSelectedLoanTypeId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full p-2 border rounded"
              >
                <option value="">Select Loan Type</option>
                {loanTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.loanTypeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Loan Amount
              </label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  type="number"
                  className="w-full pl-10 p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Tenure (months)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  type="number"
                  className="w-full pl-10 p-2 border rounded"
                />
              </div>
            </div>

            {Number(loanAmount) > 0 && Number(tenure) > 0 && (
              <div className="p-3 bg-blue-50 border rounded text-center">
                <div className="text-sm text-gray-600">Estimated EMI</div>
                <div className="font-bold text-blue-600">
                  ₹
                  {Math.round(
                    Number(loanAmount) / Number(tenure)
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t">
            <button
              type="button"
              className="px-4 py-2 border rounded"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-[#2eacb3] hover:bg-teal-800 text-white rounded"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLoanModal;
