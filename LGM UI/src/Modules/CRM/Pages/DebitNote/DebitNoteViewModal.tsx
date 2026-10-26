import React from "react";
import {
  FaTimes,
  FaPlusCircle,
  FaBuilding,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type { DebitNoteDto } from "./Services/types";

interface Props {
  data: DebitNoteDto;
  onClose: () => void;
}

const DebitNoteViewModal: React.FC<Props> = ({ data, onClose }) => {
  const formatCurrency = (val: number = 0) =>
    `${data.currencySymbol || "₹"} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const DataItem = ({ label, value, highlight = false, dark = false }: any) => (
    <div
      className={`py-3 ${dark ? "border-b border-white/10" : "border-b border-slate-100"}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-400"}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${highlight ? "text-indigo-500" : dark ? "text-white" : "text-slate-800"}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in duration-300">
        <div className="bg-[#1e293b] text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-indigo-500 p-3 text-white shadow-lg">
              <FaPlusCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tight">
                {data.debitNoteNo}
              </h2>
              <p className="text-xs text-indigo-300 font-medium">
                Linked to Invoice: {data.invoiceNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 hover:bg-red-500 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 p-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                <FaBuilding /> Parties
              </h4>
              <DataItem label="Customer" value={data.customerName} highlight />
              <DataItem label="Company" value={data.companyName} />
              <DataItem label="Vendor" value={data.vendorName} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                <FaInfoCircle /> Debit Detail
              </h4>
              <div className="p-3 bg-blue-50 rounded-xl mb-3">
                <p className="text-sm italic text-blue-900">
                  "{data.debitReason}"
                </p>
              </div>
              <DataItem
                label="Place of Supply"
                value={data.placeOfSupplyName}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-[11px] font-black uppercase text-slate-400 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt /> Logistics
              </h4>
              <DataItem
                label="Currency"
                value={`${data.currencyName} (${data.currencySymbol})`}
              />
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">
                  Bank Details
                </p>

                <div className="space-y-1">
                  <p className="font-semibold text-slate-800">
                    {data.bankName || "N/A"}
                  </p>

                  <p className="text-sm text-slate-600">
                    Acc No: {data.accountNo || "N/A"}
                  </p>
                </div>
              </div>
              <DataItem
                label="DebitNote Date"
                value={
                  data.debitNoteDate
                    ? new Date(data.debitNoteDate).toLocaleDateString()
                    : ""
                }
              />
            </div>
            <div className="rounded-2xl bg-[#0f172a] p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
                  <FaFileInvoiceDollar /> Financials
                </h4>
                <DataItem
                  label="Original Invoice"
                  value={formatCurrency(data.grandTotal)}
                  dark
                />
                <DataItem
                  label="Adjustment (Debit)"
                  value={formatCurrency(data.adjustAmount)}
                  highlight
                  dark
                />
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Updated Balance
                </p>
                <p className="text-3xl font-black text-white font-mono">
                  {formatCurrency(data.updatedBalanceAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm mb-8">
            <table className="w-full text-left">
              <thead className="bg-[#1e293b] text-white text-[11px] uppercase">
                <tr>
                  <th className="p-4 text-center">#</th>
                  <th className="p-4">Item & Description</th>
                  <th className="p-4 text-center">Qty</th>
                  <th className="p-4 text-right">Rate</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items?.map((it, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-4 text-center text-slate-400 font-bold">
                      {i + 1}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 uppercase">
                        {it.description}
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold">
                        HSN: {it.hsnSacCode}
                      </span>
                    </td>
                    <td className="p-4 text-center">{it.quantity}</td>
                    <td className="p-4 text-right">
                      {formatCurrency(it.rate)}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatCurrency(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-6 bg-white border-t flex justify-end">
          <button onClick={onClose} className={buttonStyles.cancel}>
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebitNoteViewModal;
