import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  FaTimes,
  FaUndo,
  FaCoins,
  FaInfoCircle,
  FaBuilding,
} from "react-icons/fa";
import { toast } from "sonner";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import {
  getInvoiceDropdown,
  getFullInvoiceDetails,
  createCreditNote,
  updateCreditNote,
  getLastCreditNoteNo,
} from "./Services/CreditNoteService";
import type { InvoiceViewData } from "../Invoice/Services/types";

interface Props {
  onCancel: () => void;
  onSuccess: () => void;
  editData?: any;
}

const CreditNoteWizard: React.FC<Props> = ({
  onCancel,
  onSuccess,
  editData,
}) => {
  // Fixes the TypeScript error by using any for the Select component
  const [invoiceOptions, setInvoiceOptions] = useState<any[]>([]);
  const [selectedInvoiceData, setSelectedInvoiceData] =
    useState<InvoiceViewData | null>(null);
  const [loading, setLoading] = useState(false);

  // Credit Note Specific State
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [creditReason, setCreditReason] = useState<string>("");
  const [creditNoteNo, setCreditNoteNo] = useState("");
  const loadLastCreditNoteNo = async () => {
    try {
      const no = await getLastCreditNoteNo();
      setCreditNoteNo(no);
    } catch {}
  };

  useEffect(() => {
    loadDropdown();

    if (!editData) {
      loadLastCreditNoteNo();
    }

    if (editData) {
      setCreditNoteNo(editData.creditNoteNo);
      setCreditAmount(editData.creditNoteAmount);
      setCreditReason(editData.creditReason);
      setRemainingAmount(editData.remainingBalanceAmount ?? 0);
      // Fetch full details for edit mode
      handleInvoiceSelect({
        value: editData.invoiceId,
        label: editData.invoiceNo,
      });
    }
  }, [editData]);

  const loadDropdown = async () => {
    try {
      const data = await getInvoiceDropdown();
      setInvoiceOptions(
        data.map((x: any) => ({
          value: x.invoiceId,
          label: x.invoiceNo,
        })),
      );
    } catch (error) {
      toast.error("Failed to load invoice list");
    }
  };

  const handleInvoiceSelect = async (opt: any) => {
    if (!opt) {
      setSelectedInvoiceData(null);
      return;
    }
    const toastId = toast.loading("Fetching full invoice details...");
    try {
      const data = await getFullInvoiceDetails(opt.value);
      setSelectedInvoiceData(data);
      // If not in edit mode, default credit amount to invoice grand total
      if (!editData) {
        setCreditAmount(data.grandTotal);
        setRemainingAmount(0);
      }
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Failed to load invoice details");
    }
  };

  const handleSave = async () => {
    if (!selectedInvoiceData) return;
    if (creditAmount <= 0)
      return toast.error("Please enter a valid credit amount");
    if (!creditReason.trim())
      return toast.error("Please enter a reason for credit");

    try {
      setLoading(true);
      const payload = {
        invoiceId: selectedInvoiceData.invoiceId,
        creditNoteNo: creditNoteNo,
        creditNoteAmount: creditAmount,
        creditReason: creditReason,
      };

      if (editData) {
        await updateCreditNote(editData.creditNoteId, payload);
        toast.success("Credit Note Updated Successfully");
      } else {
        await createCreditNote(payload);
        toast.success("Credit Note Created Successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Failed to save credit note");
    } finally {
      setLoading(false);
    }
  };

  const labelClass =
    "text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1";
  const readOnlyInput =
    "w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 text-gray-600 h-[38px] outline-none flex items-center";

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-visible mb-8 text-left animate-in slide-in-from-top-4 duration-500">
      {/* HEADER */}
      <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FaUndo /> {editData ? "Edit Credit Note" : "Generate Credit Note"}
        </h2>
        <button
          onClick={onCancel}
          className="bg-white/10 hover:bg-red-500 p-2 px-4 rounded-lg flex items-center gap-2 text-xs uppercase font-bold transition"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-8">
        {/* SELECT INVOICE SECTION */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-inner">
          <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-blue-900">
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
            menuPosition="fixed"
            menuShouldScrollIntoView={false}
            styles={{
              menuPortal: (base) => ({
                ...base,
                zIndex: 99999,
              }),
              menu: (base) => ({
                ...base,
                zIndex: 99999,
              }),
            }}
          />
        </div>

        {selectedInvoiceData && (
          <div className="animate-in fade-in duration-500">
            {/* HEADER GRID - MATCHES INVOICE WIZARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <label className={labelClass}>Credit Note No.</label>

                <input
                  type="text"
                  value={creditNoteNo}
                  onChange={(e) => setCreditNoteNo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-gray-100 text-gray-600 h-[38px] outline-none"
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
                <div className="w-full border border-blue-200 rounded-lg p-2 text-sm bg-blue-50 text-blue-700 font-bold h-[38px] flex items-center">
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
                <div
                  className={`${readOnlyInput} h-auto min-h-[38px] items-start py-2 leading-relaxed`}
                >
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

            {/* PRODUCT TABLE - MATCHES INVOICE DESIGN */}
            <div className="border rounded-xl overflow-hidden mb-10 shadow-sm border-gray-300">
              <table className="w-full text-left table-fixed min-w-[1000px]">
                <thead className="bg-[#f07837] text-white text-[12px] tracking-wider">
                  <tr>
                    <th className="p-3 w-[5%] text-center">#</th>
                    <th className="p-3 w-[50%]">Item & Description</th>
                    <th className="p-3 w-[10%] text-center">Qty</th>
                    <th className="p-3 w-[15%] text-right">Rate</th>
                    <th className="p-3 w-[20%] text-right">Final Amt</th>
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
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border bg-blue-100 text-blue-800 border-blue-200 mb-1 inline-block">
                          {item.itemType}
                        </span>
                        <div className="font-bold text-[#154068] uppercase">
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
                      <td className="p-3 text-right font-black text-blue-700 text-lg">
                        {selectedInvoiceData.currencySymbol}{" "}
                        {item.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* BOTTOM SECTION: REASON & FINANCIAL SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT: Reason & Notes */}
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-sm">
                  <label className="text-[11px] font-black text-red-900 uppercase mb-3 flex items-center gap-2">
                    <FaInfoCircle /> Reason for Credit Note
                  </label>
                  <textarea
                    className="w-full border border-red-200 rounded-xl p-4 text-sm h-36 outline-none focus:ring-2 focus:ring-red-400 shadow-inner"
                    placeholder="Provide details about why this credit note is being issued (e.g., Sales Return, Discount post-billing, Rate Difference)..."
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                  />
                </div>
                <div className={readOnlyInput}>
                  <FaBuilding className="mr-2 text-gray-400" />
                  Bank: {selectedInvoiceData.bankName} | Acc:{" "}
                  {selectedInvoiceData.accountNo}
                </div>
              </div>

              {/* RIGHT: FINANCIAL SUMMARY */}
              <div className="bg-gray-100 p-8 rounded-3xl border border-gray-300 shadow-inner space-y-6">
                <div className="flex justify-between font-bold text-gray-500 uppercase text-[12px]">
                  <span>Invoice Grand Total</span>
                  <span className="font-mono text-xl">
                    {selectedInvoiceData.currencySymbol}{" "}
                    {selectedInvoiceData.grandTotal.toLocaleString()}
                  </span>
                </div>

                <div className="border-t-2 border-dashed border-gray-300 pt-6">
                  <div className="flex justify-between items-center text-red-600">
                    <label className="uppercase text-[12px] font-black flex items-center gap-2">
                      <FaCoins /> Credit Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                        {selectedInvoiceData.currencySymbol}
                      </span>
                      <input
                        type="number"
                        className="border-2 border-red-200 p-3 pl-10 w-48 text-right text-2xl rounded-xl font-mono font-black text-red-700 outline-none focus:border-red-500 transition-all bg-white shadow-sm"
                        value={creditAmount}
                        onChange={(e) => {
                          const amount = Number(e.target.value);

                          setCreditAmount(amount);

                          setRemainingAmount(
                            selectedInvoiceData.grandTotal - amount,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-right text-gray-400 mt-2 italic font-medium">
                    * Adjust the amount if only a partial credit is being
                    issued.
                  </p>
                </div>

                <div className="flex justify-between items-center text-xl font-bold text-orange-600 border-t border-dashed border-gray-300 pt-4">
                  <span>Remaining Balance</span>

                  <span>
                    {selectedInvoiceData.currencySymbol}{" "}
                    {remainingAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-4xl font-black text-[#154068] border-t-2 border-gray-400 pt-6">
                  {/* <span className="uppercase tracking-tighter text-sm">
                    Final Credit
                  </span> */}
                  {/* <span className="font-mono underline decoration-double decoration-red-500">
                    {selectedInvoiceData.currencySymbol}{" "}
                    {creditAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span> */}
                </div>
              </div>
            </div>

            {/* BUTTONS */}
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
                  ? "Saving..."
                  : editData
                    ? "Update Credit Note"
                    : "Create Credit Note"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditNoteWizard;
