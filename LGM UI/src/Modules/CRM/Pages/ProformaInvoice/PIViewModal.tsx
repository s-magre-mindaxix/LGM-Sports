// src/Features/CRM/ProformaInvoice/PIViewModal.tsx

import React from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaBuilding,
  FaInfoCircle,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUniversity,
  FaTruck,
} from "react-icons/fa";
import type { ProformaInvoice } from "./Services/types";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface PIViewModalProps {
  data: ProformaInvoice;
  options: any;
  onClose: () => void;
}

const PIViewModal: React.FC<PIViewModalProps> = ({
  data,
  options,
  onClose,
}) => {
  // Helper to resolve dropdown values
  const getLabel = (list: any[], id?: number | string) => {
    if (!list || id === undefined || id === null) return "N/A";
    const found = list.find((x) => Number(x.value) === Number(id));
    return found ? found.label : "N/A";
  };

  const formatCurrency = (val: number = 0, currencySymbol: string = "") => {
    // If symbol not passed, try to find it in options, else default
    const symbol = currencySymbol || "₹";
    return `${symbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Determine status based on dates
  const isExpired = new Date(data.proformaInvoiceExpiryDate) < new Date();
  const statusLabel = isExpired ? "Expired" : "Active";
  const statusColor = isExpired
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

  // --- Sub-components ---
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
        className={`mt-1 text-sm font-semibold ${highlight ? "text-emerald-400" : dark ? "text-white" : "text-slate-800"}`}
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

  // Get Currency Symbol for display
  const currencySym =
  data.currencySymbol ||
  options.currencies?.find((c: any) => c.value === data.currencyId)?.symbol ||
  "";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-300">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#143463] px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-[#143463] shadow-lg">
              <FaFileInvoiceDollar size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold uppercase tracking-wide md:text-2xl">
                  {data.proformaInvoiceNo}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${statusColor}`}
                >
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 uppercase tracking-widest font-medium">
                Customer:{" "}
                {data.customerName ||
                  getLabel(options.customers, data.customerId)}
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

        {/* --- CONTENT --- */}
        <div className="overflow-y-auto bg-slate-50 p-5 md:p-7 flex-1">
          {/* Top Grid: Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Card 1: Parties */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Parties Involved" />
              <DataItem
                label="Customer"
                value={
                  data.customerName ||
                  getLabel(options.customers, data.customerId)
                }
                highlight
              />
              <DataItem
                label="Contact Person"
                value={data.responsiblePersonName || "N/A"}
              />
              <DataItem
                label="Vendor"
                value={getLabel(options.vendors, data.vendorId)}
              />
            </div>

            {/* Card 2: References & Dates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaCalendarAlt} title="Dates & Refs" />
              <DataItem
                label="Proforma Invoice Date"
                value={formatDate(data.proformaInvoiceDate)}
              />
              <DataItem
                label="Proforma Invoice Expiry Date"
                value={formatDate(data.proformaInvoiceExpiryDate)}
              />
              <DataItem
                label="Customer PO"
                value={`${data.customerPO || "N/A"} ${data.customerPODate ? `(${formatDate(data.customerPODate)})` : ""}`}
              />
            </div>

            {/* Card 3: Logistics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaUniversity} title="Logistics & Bank" />
              <DataItem
                label="Currency"
                value={getLabel(options.currencies, data.currencyId)}
              />
              <DataItem
                label="Place of Supply"
                value={getLabel(options.states, data.placeOfSupplyId)}
              />
              <DataItem
                label="Bank Account"
                value={getLabel(options.banks, data.bankDetailId)}
              />
            </div>

            {/* Card 4: Financials (Dark) */}
            <div className="rounded-2xl border border-slate-200 bg-[#143463] p-6 text-white shadow-xl">
              <SectionHeader
                icon={FaFileInvoiceDollar}
                title="Valuation"
                dark
              />
              <div className="grid grid-cols-2 gap-2">
              <DataItem
                label="Subtotal"
                value={formatCurrency(data.subtotal, currencySym)}
                dark
              />

              {(data.percentage ?? 0) > 0 && (
                <>
                  <DataItem
                    label={`Percentage (${data.percentage}%)`}
                    value={formatCurrency(
                      data.percentageAmount ?? 0,
                      currencySym
                    )}
                    dark
                  />

                  <DataItem
                    label="18% GST On Percentage"
                    value={formatCurrency(
                      data.percentageTaxAmount ?? 0,
                      currencySym
                    )}
                    dark
                  />

                  <DataItem
                    label="Total Amount"
                    value={formatCurrency(
                      data.totalAmount ?? 0,
                      currencySym
                    )}
                    dark
                    highlight
                  />

                  <DataItem
                    label="Balance Amount"
                    value={formatCurrency(
                      data.balanceAmount ?? 0,
                      currencySym
                    )}
                    dark
                  />
                </>
              )}

              {/* <DataItem
                label="Total GST"
                value={formatCurrency(
                  data.totalGstAmount,
                  currencySym
                )}
                dark
              /> */}
              </div>
              {/* <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-3xl font-black text-white font-mono">
                  {formatCurrency(data.grandTotal, currencySym)}
                </p>
              </div> */}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Item Table (Span 8) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Item Details
                  </h5>
                  <span className="text-xs font-bold text-[#0b2c52]">
                    {data.items?.length || 0} Items
                  </span>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-[#143463] text-[11px] text-[12px] tracking-wide text-white">
                    <tr>
                      <th className="p-4 w-12 text-center border-r border-slate-700">
                        #
                      </th>
                      <th className="p-4 min-w-[250px] border-r border-slate-700">
                        Product / Description
                      </th>
                      <th className="p-4 text-center w-20 border-r border-slate-700">
                        Qty
                      </th>
                      <th className="p-4 text-right w-28 border-r border-slate-700">
                        Rate
                      </th>
                      <th className="p-4 text-right w-24 border-r border-slate-700">
                        GST
                      </th>
                      <th className="p-4 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((it, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-slate-50 transition-colors align-top"
                      >
                        <td className="p-4 border-r bg-slate-50/50 text-center font-bold text-slate-400">
                          {i + 1}
                        </td>
                        <td className="p-4 border-r">
                         <p className="font-bold text-[#0b2c52] uppercase">
                            {
                              it.itemType === "Accessory"
                                ? getLabel(options.accessories, it.accessoryId)
                                : getLabel(options.products, it.productId)
                            }
                          </p>

                          {(it.hsnSacCode || (it as any).HsnSacCode) && (
                            <div className="mt-1 mb-1 inline-block rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                              HsnSacCode:{" "}
                              {it.hsnSacCode || (it as any).HsnSacCode}
                            </div>
                          )}

                          {it.accessoryIds && it.accessoryIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {it.accessoryIds.map((aid: number) => (
                                <span
                                  key={aid}
                                  className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-100"
                                >
                                  + {getLabel(options.accessories, aid)}
                                </span>
                              ))}
                            </div>
                          )}
                          {it.description && (
                            <p className="mt-2 text-xs italic text-slate-500 bg-slate-100 p-2 rounded border border-slate-200">
                              "{it.description}"
                            </p>
                          )}
                        </td>
                        <td className="p-4 border-r text-center font-black text-slate-600">
                          {it.quantity}
                        </td>
                        <td className="p-4 border-r text-right font-medium text-slate-500">
                          {formatCurrency(it.rate, currencySym)}
                        </td>
                        <td className="p-4 border-r text-right font-medium text-slate-500">
                          {formatCurrency(it.gstTax, currencySym)}
                        </td>
                        <td className="p-4 text-right font-black text-[#0b2c52] font-mono">
                          {formatCurrency(it.price, currencySym)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Address & Notes (Span 4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Consignee */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader icon={FaTruck} title="Consignee / Shipping" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                  <FaMapMarkerAlt className="inline mr-2 text-red-400 mb-1" />
                  {data.consigneeNameAndAddress}
                </div>
              </div>

              {/* Terms */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader icon={FaShieldAlt} title="Terms & Conditions" />
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-xs uppercase leading-relaxed text-slate-500 whitespace-pre-wrap">
                    {data.termsAndConditions || "Standard Terms Apply"}
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <SectionHeader icon={FaInfoCircle} title="Customer Notes" />
                <p className="text-xs italic text-slate-400 whitespace-pre-wrap">
                  {data.customerNotes
                    ? `"${data.customerNotes}"`
                    : "No additional notes provided."}
                </p>
              </div>

              {/* Source Offer Link */}
              {/* {data.offerId > 0 && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    Source Offer
                  </span>
                  <span className="text-xs font-bold text-blue-800">
                    {getLabel(options.activeOffers, data.offerId)}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-white border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className={buttonStyles.cancel}
          >
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};

export default PIViewModal;
