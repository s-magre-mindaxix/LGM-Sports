import React from "react";
import {
  FaTimes,
  FaUndo,
  FaBuilding,
  FaInfoCircle,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaFileInvoice,
} from "react-icons/fa";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type { CreditNoteDto } from "./Services/types";

interface Props {
  data: CreditNoteDto;
  onClose: () => void;
}

const CreditNoteViewModal: React.FC<Props> = ({ data, onClose }) => {
  const hasIgst = data.items?.some((it) => (it.igstAmount ?? 0) > 0);
  //const isINR = data.currencyName === "INR" || data.currencySymbol === "₹";

  const formatCurrency = (val: number = 0) => {
    return `${data.currencySymbol || "₹"} ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const DataItem = ({ label, value, highlight = false, dark = false }: any) => (
    <div
      className={`py-3 last:border-b-0 ${dark ? "border-b border-white/20" : "border-b border-slate-100"}`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-slate-300" : "text-slate-400"}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold ${highlight ? "text-orange-400" : dark ? "text-white" : "text-slate-800"}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title, dark = false }: any) => (
    <div
      className={`mb-4 flex items-center gap-2 pb-2 ${dark ? "border-b border-white/20" : "border-b border-slate-200"}`}
    >
      <Icon
        className={`text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}
      />
      <h4
        className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-100" : "text-slate-700"}`}
      >
        {title}
      </h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-300">
        {/* HEADER - Styled in Red/Slate for Credit Note */}
        <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-[#7c2d12] shadow-lg">
              <FaUndo size={26} />
            </div>
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-wide md:text-2xl">
                {data.creditNoteNo}
              </h2>
              <p className="mt-1 text-xs text-orange-200 uppercase tracking-widest font-medium">
                Ref Invoice: {data.invoiceNo} | Date:{" "}
                {formatDate(data.creditNoteDate)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 p-2 transition hover:bg-red-500"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto bg-slate-50 p-5 md:p-7 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Parties */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Parties Involved" />
              <DataItem label="Customer" value={data.customerName} highlight />
              <DataItem label="Company" value={data.companyName} />
              <DataItem label="Vendor" value={data.vendorName} />
            </div>

            {/* Credit Reasons */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Credit Reason" />
              <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-sm font-medium text-orange-900 italic">
                  "{data.creditReason}"
                </p>
              </div>
              <DataItem
                label="Place of Supply"
                value={data.placeOfSupplyName}
              />
            </div>

            {/* Logistics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaMapMarkerAlt} title="Details" />
              <DataItem
                label="Currency"
                value={`${data.currencyName} (${data.currencySymbol})`}
              />
              <DataItem label="Bank Used" value={data.bankName} />
              <DataItem label="Reference" value={data.invoiceNo} />
            </div>

            {/* Financial Summary */}
            <div className="rounded-2xl border border-slate-200 bg-[#1e293b] p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <SectionHeader
                  icon={FaFileInvoice}
                  title="Credit Summary"
                  dark
                />

                <div className="space-y-1">
                  <DataItem
                    label="Original Invoice Total"
                    value={formatCurrency(data.grandTotal)}
                    dark
                  />
                  {/* Show Advance if it exists */}
                  {/* {data.advanceAmount > 0 && (
                        <DataItem label="Advance Paid" value={formatCurrency(data.advanceAmount)} dark />
                    )} */}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-5">
                {/* Credit Note Amount Highlight */}
                <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                    Credit Note Amount
                  </p>
                  <p className="text-3xl font-black text-white font-mono">
                    {formatCurrency(data.creditNoteAmount)}
                  </p>
                </div>

                {/* NEW: Balance Amount Section */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Remaining Balance
                    </p>
                    <p
                      className={`text-2xl font-bold font-mono ${
                        (data.remainingBalanceAmount ?? 0) > 0
                          ? "text-green-400"
                          : "text-white"
                      }`}
                    >
                      {formatCurrency(data.remainingBalanceAmount)}
                    </p>
                  </div>
                  {/* Optional: Add a small status indicator */}
                  <span
                    className={`text-[9px] px-2 py-1 rounded-full font-bold uppercase ${data.balanceAmount === 0 ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-300"}`}
                  >
                    {data.balanceAmount === 0 ? "Settled" : "Due"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#1e293b] text-[12px] uppercase tracking-wider text-white">
                <tr>
                  <th className="p-4 text-center w-12">#</th>
                  <th className="p-4 w-[400px]">Item & Description</th>
                  <th className="p-4 text-center w-20">Qty</th>
                  <th className="p-4 text-right w-28">Rate</th>
                  <th className="p-4 text-right w-32">Tax (GST)</th>
                  <th className="p-4 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items?.map((it, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="p-4 text-center font-bold text-slate-400">
                      {i + 1}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 uppercase">
                        {it.description}
                      </p>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500">
                        HSN: {it.hsnSacCode}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold">{it.quantity}</td>
                    <td className="p-4 text-right">
                      {formatCurrency(it.rate)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-[11px]">
                        {hasIgst ? (
                          <p>IGST: {formatCurrency(it.igstAmount)}</p>
                        ) : (
                          <>
                            <p>CGST: {formatCurrency(it.cgstAmount)}</p>
                            <p>SGST: {formatCurrency(it.sgstAmount)}</p>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatCurrency(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaShieldAlt} title="Terms" />
              <p className="text-xs text-slate-600 whitespace-pre-wrap">
                {data.termsConditions || "Standard terms apply."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Delivery Address" />
              <div className="text-xs text-slate-600 italic">
                {data.consigneeNameAddress || "N/A"}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Bank Info" />
              <div className="text-sm text-slate-700">
                <p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Bank
                  </span>{" "}
                  {data.bankName}
                </p>
                <p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    A/C No
                  </span>{" "}
                  {data.accountNo}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className={buttonStyles.cancel}>
            Close Credit Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteViewModal;
