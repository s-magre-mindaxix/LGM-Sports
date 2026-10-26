import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  FaTimes,
  FaPlusCircle,
  FaCoins,
  FaInfoCircle,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import {
  getInvoiceDropdown,
  getInvoiceForDebitNote,
  createDebitNote,
  updateDebitNote,
  getDebitNoteById,
  getLastDebitNoteNo,
} from "./Services/DebitNoteService";
import type { DebitNoteDto } from "./Services/types";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
  editData?: any;
}

const DebitNoteWizard: React.FC<Props> = ({
  onCancel,
  onSuccess,
  editData,
}) => {
  const [invoiceOptions, setInvoiceOptions] = useState<any[]>([]);
  const [selectedInvoiceData, setSelectedInvoiceData] =
    useState<DebitNoteDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [debitReason, setDebitReason] = useState<string>("");
  const [debitNoteNo, setDebitNoteNo] = useState("");
  const loadLastDebitNoteNo = async () => {
    try {
      const no = await getLastDebitNoteNo();
      setDebitNoteNo(no);
    } catch {}
  };

  useEffect(() => {
    loadDropdown();

    if (editData) {
      loadDebitNoteForEdit();
    } else {
      loadLastDebitNoteNo();
    }
  }, [editData]);

  const loadDebitNoteForEdit = async () => {
    const data = await getDebitNoteById(editData.debitNoteId);

    setSelectedInvoiceData(data);
    setDebitNoteNo(data.debitNoteNo ?? "");
    setAdjustAmount(data.adjustAmount);
    setDebitReason(data.debitReason);
  };

  const loadDropdown = async () => {
    try {
      const data = await getInvoiceDropdown();
      setInvoiceOptions(
        data.map((x) => ({ value: x.invoiceId, label: x.invoiceNo })),
      );
    } catch {
      toast.error("Failed to load invoice list");
    }
  };

  const handleInvoiceSelect = async (opt: any) => {
    if (!opt) {
      setSelectedInvoiceData(null);
      return;
    }
    const toastId = toast.loading("Fetching invoice data...");
    try {
      const data = await getInvoiceForDebitNote(opt.value);
      setSelectedInvoiceData(data);
      if (!editData) {
        setAdjustAmount(0);
        loadLastDebitNoteNo();
      }
      toast.dismiss(toastId);
    } catch {
      toast.dismiss(toastId);
      toast.error("Failed to load invoice details");
    }
  };

  const handleSave = async () => {
    if (!selectedInvoiceData) return;
    if (adjustAmount < 0) return toast.error("Enter a valid amount");
    if (!debitReason.trim())
      return toast.error("Please enter a reason for debit");

    try {
      setLoading(true);
      const payload = {
        invoiceId: selectedInvoiceData.invoiceId,
        debitNoteNo: debitNoteNo,
        adjustAmount: adjustAmount,
        debitReason: debitReason,
      };
      editData
        ? await updateDebitNote(editData.debitNoteId, payload)
        : await createDebitNote(payload);
      toast.success(editData ? "Updated Successfully" : "Created Successfully");
      onSuccess();
    } catch {
      toast.error("Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1";
  const readOnlyInput =
    "w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 text-gray-600 h-[38px] flex items-center outline-none";

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 text-left animate-in slide-in-from-top-4 duration-500">
      <div className="bg-[#1e293b] text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FaPlusCircle /> {editData ? "Edit Debit Note" : "Create Debit Note"}
        </h2>
        <button
          onClick={onCancel}
          className="bg-white/10 hover:bg-red-500 p-2 px-4 rounded-lg flex items-center gap-2 text-xs uppercase font-bold transition"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-8">
        {/* DROPDOWN SECTION */}
        <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl shadow-inner">
          <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-indigo-900">
            SYNC DATA FROM INVOICE
          </label>
          <Select
            options={invoiceOptions}
            value={
              selectedInvoiceData
                ? {
                    value: selectedInvoiceData.invoiceId,
                    label: selectedInvoiceData.invoiceNo,
                  }
                : null
            }
            onChange={handleInvoiceSelect}
            isDisabled={!!editData}
            placeholder="Search Invoice..."
            isClearable
            menuPortalTarget={document.body}
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </div>

        {selectedInvoiceData && (
          <div className="animate-in fade-in duration-500">
            {/* METADATA GRID (3 COLUMNS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <label className={labelClass}>Debit Note No.</label>

                <input
                  type="text"
                  value={debitNoteNo}
                  onChange={(e) => setDebitNoteNo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-[38px] outline-none"
                />
              </div>
              <div>
                <label className={labelClass}>Group</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.productGroupName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Company</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.companyName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Vendor</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.vendorName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Company Group</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.companyGroupName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Customer Company</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.customerName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.currencyName} (
                  {selectedInvoiceData.currencySymbol})
                </div>
              </div>
              <div>
                <label className={labelClass}>Place of Supply</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.placeOfSupplyName}
                </div>
              </div>
              <div>
                <label className={labelClass}>Invoice No.</label>
                <div className="w-full border border-indigo-200 rounded-lg p-2 text-sm bg-indigo-50 text-indigo-700 font-bold h-[38px] flex items-center">
                  {selectedInvoiceData.invoiceNo}
                </div>
              </div>
              <div>
                <label className={labelClass}>Invoice Date</label>
                <div className={readOnlyInput}>
                  {new Date(selectedInvoiceData.invoiceDate).toLocaleDateString(
                    "en-GB",
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>Invoice Due Date</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.invoiceDueDate
                    ? new Date(
                        selectedInvoiceData.invoiceDueDate,
                      ).toLocaleDateString("en-GB")
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className={labelClass}>Customer PO</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.customerPo || "N/A"}
                </div>
              </div>
              <div>
                <label className={labelClass}>Customer PO Date</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.companyPoDate
                    ? new Date(
                        selectedInvoiceData.companyPoDate,
                      ).toLocaleDateString("en-GB")
                    : "N/A"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Delivery Name & Address</label>
                <div className={`${readOnlyInput} h-auto min-h-[38px] py-2`}>
                  {selectedInvoiceData.consigneeNameAddress || "N/A"}
                </div>
              </div>
              <div>
                <label className={labelClass}>Description of Work</label>
                <div className={readOnlyInput}>
                  {selectedInvoiceData.description || "N/A"}
                </div>
              </div>
            </div>

            {/* PRODUCT TABLE */}
            <div className="border rounded-xl overflow-hidden mb-10 shadow-sm border-gray-300">
              <table className="w-full text-left table-fixed min-w-[1000px]">
                <thead className="bg-[#1e293b] text-white text-[12px] tracking-wider">
                  <tr>
                    <th className="p-3 w-[5%] text-center">#</th>
                    <th className="p-3 w-[55%]">Item & Description</th>
                    <th className="p-3 w-[10%] text-center">Qty</th>
                    <th className="p-3 w-[15%] text-right">Rate</th>
                    <th className="p-3 w-[15%] text-right">Final Amt</th>
                  </tr>
                </thead>
                <tbody className="text-sm bg-white">
                  {selectedInvoiceData.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3 text-center font-bold text-gray-400 border-r">
                        {i + 1}
                      </td>
                      <td className="p-3 border-r">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border bg-indigo-100 text-indigo-800 border-indigo-200 mb-1 inline-block">
                          {item.itemType}
                        </span>
                        <div className="font-bold text-[#1e293b] uppercase">
                          {item.description}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1">
                          HSN/SAC: {item.hsnSacCode}
                        </div>
                      </td>
                      <td className="p-3 text-center border-r font-semibold">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right border-r font-medium">
                        {selectedInvoiceData.currencySymbol}{" "}
                        {item.rate.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-black text-indigo-700 text-lg">
                        {selectedInvoiceData.currencySymbol}{" "}
                        {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* REASON & TOTALS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl shadow-sm">
                  <label className="text-[11px] font-black text-blue-900 uppercase mb-3 flex items-center gap-2">
                    <FaInfoCircle /> Reason for Debit Note
                  </label>
                  <textarea
                    className="w-full border border-blue-200 rounded-xl p-4 text-sm h-36 outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
                    placeholder="Rate Difference, Supplementary charges, etc..."
                    value={debitReason}
                    onChange={(e) => setDebitReason(e.target.value)}
                  />
                </div>
                <div className={readOnlyInput}>
                  <FaBuilding className="mr-2 text-gray-400" />
                  Bank: {selectedInvoiceData.bankName} | Acc:{" "}
                  {selectedInvoiceData.accountNo}
                </div>
              </div>

              <div className="bg-gray-100 p-8 rounded-3xl border border-gray-300 shadow-inner space-y-6">
                <div className="flex justify-between font-bold text-gray-500 uppercase text-[12px]">
                  <span>Invoice Grand Total</span>
                  <span className="font-mono text-xl">
                    {selectedInvoiceData.currencySymbol}{" "}
                    {selectedInvoiceData.grandTotal.toLocaleString()}
                  </span>
                </div>
                <div className="border-t-2 border-dashed border-gray-300 pt-6">
                  <div className="flex justify-between items-center text-indigo-700">
                    <label className="uppercase text-[12px] font-black flex items-center gap-2">
                      <FaCoins /> Additional Debit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        {selectedInvoiceData.currencySymbol}
                      </span>
                      <input
                        type="number"
                        className="border-2 border-indigo-200 p-3 pl-10 w-48 text-right text-2xl rounded-xl font-mono font-black text-indigo-700 outline-none"
                        value={adjustAmount}
                        onChange={(e) =>
                          setAdjustAmount(Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-4xl font-black text-[#1e293b] border-t-2 border-gray-400 pt-6">
                  <span className="text-sm uppercase">Updated Balance</span>
                  <span className="font-mono">
                    {selectedInvoiceData.currencySymbol}{" "}
                    {(
                      selectedInvoiceData.grandTotal + adjustAmount
                    ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-12 pt-8 border-t">
              <button onClick={onCancel} className={buttonStyles.cancel}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`bg-green-600 text-white px-6 py-2 rounded-lg transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading
                  ? "Processing..."
                  : editData
                    ? "Update Debit Note"
                    : "Generate Debit Note"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebitNoteWizard;
