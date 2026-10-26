import React from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaBuilding,
  FaInfoCircle,
  FaShieldAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type { InvoiceViewData } from "./Services/types";

interface InvoiceViewModalProps {
  data: InvoiceViewData;
  onClose: () => void;
}

const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  data,
  onClose,
}) => {
  const hasIgst = data.items?.some((it) => (it.igstAmount ?? 0) > 0);
  const isINR = data.currencyName === "INR" || data.currencySymbol === "₹";

  const formatCurrency = (val: number = 0) => {
    return `${data.currencySymbol} ${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalCgst = data.items?.reduce(
    (sum, it) => sum + (it.cgstAmount || 0),
    0,
  );
  const totalSgst = data.items?.reduce(
    (sum, it) => sum + (it.sgstAmount || 0),
    0,
  );
  const totalIgst = data.items?.reduce(
    (sum, it) => sum + (it.igstAmount || 0),
    0,
  );
  const totalTax = data.items?.reduce(
    (sum, it) => sum + (it.gstAmount || 0),
    0,
  );

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

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-[#154068] shadow-lg">
              <FaFileInvoiceDollar size={26} />
            </div>
            <div>
              <h2 className="text-xl font-semibold uppercase tracking-wide md:text-2xl">
                {data.invoiceNo}
              </h2>
              <p className="mt-1 text-xs text-slate-300 uppercase tracking-widest font-medium">
                Customer: {data.customerName} | Status: Paid
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
          {/* TOP INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Parties Involved" />
              <DataItem label="Customer" value={data.customerName} highlight />
              <DataItem label="Company" value={data.companyName} />
              <DataItem label="Vendor" value={data.vendorName} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaCalendarAlt} title="Dates & Reference" />
              <DataItem
                label="Invoice Date"
                value={formatDate(data.invoiceDate)}
              />
              <DataItem
                label="Due Date"
                value={formatDate(data.invoiceDueDate)}
              />
              <DataItem label="Customer PO" value={data.customerPo || "N/A"} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaMapMarkerAlt} title="Logistics" />
              <DataItem
                label="Place of Supply"
                value={data.placeOfSupplyName}
              />
              <DataItem
                label="Currency"
                value={`${data.currencyName} (${data.currencySymbol})`}
              />
              <DataItem label="Bank" value={data.bankName} />
            </div>

            {/* Financial Summary Box - Matches Enquiry View Logic */}
            <div className="rounded-2xl border border-slate-200 bg-[#f07837] p-6 text-white shadow-xl">
              <SectionHeader
                icon={FaFileInvoiceDollar}
                title="Financial Summary"
                dark
              />
              <DataItem
                label="Subtotal"
                value={formatCurrency(data.subTotal)}
                dark
              />

              {isINR ? (
                !hasIgst ? (
                  <>
                    <DataItem
                      label="CGST"
                      value={formatCurrency(totalCgst)}
                      dark
                    />
                    <DataItem
                      label="SGST"
                      value={formatCurrency(totalSgst)}
                      dark
                    />
                  </>
                ) : (
                  <DataItem
                    label="IGST"
                    value={formatCurrency(totalIgst)}
                    dark
                  />
                )
              ) : (
                <DataItem
                  label="Tax Amount"
                  value={formatCurrency(totalTax)}
                  dark
                />
              )}

              <DataItem
                label="Freight"
                value={formatCurrency(data.freightCharges)}
                dark
              />
              
             <div className="mt-4 pt-4 border-t border-white/10 space-y-3">

              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-2xl font-black text-white font-mono">
                  {formatCurrency(data.grandTotal)}
                </p>
              </div>

              {data.advanceReceived && (
                <div>
                  <p className="text-[10px] font-black text-yellow-300 uppercase tracking-widest">
                    Advance Received
                  </p>
                  <p className="text-xl font-bold text-yellow-200 font-mono">
                    {formatCurrency(data.advanceAmount)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-green-300 uppercase tracking-widest">
                  Balance Amount
                </p>
                <p className="text-3xl font-black text-green-200 font-mono">
                  {formatCurrency(data.balanceAmount)}
                </p>
              </div>

            </div>
            </div>
          </div>

          {/* ITEMS TABLE - Matches Enquiry View Table Style */}
          <div className="mb-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#f07837] text-[12px] uppercase tracking-wider text-white">
                <tr>
                  <th className="p-4 text-center w-12 border-r border-white/10">
                    #
                  </th>
                  <th className="p-4 w-[350px] border-r border-white/10">
                    Item & Description
                  </th>
                  <th className="p-4 text-center w-20 border-r border-white/10">
                    Qty
                  </th>
                  <th className="p-4 text-right w-28 border-r border-white/10">
                    Rate
                  </th>
                  <th className="p-4 text-right w-20 border-r border-white/10">
                    Tax %
                  </th>
                  <th className="p-4 text-right w-32 border-r border-white/10">
                    Tax Breakup
                  </th>
                  <th className="p-4 text-right w-32">Final Price</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items?.map((it, i) => {
                  const isProduct = it.itemType === "Product";

                  // Define styles based on item type (matching your wizard)
                  const typeBadgeStyles = isProduct
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : "bg-purple-100 text-purple-800 border-purple-200";

                  // If it's an accessory, the productName is often "N/A",
                  // so we use the description as the primary title.
                  const primaryName = isProduct
                    ? it.productName
                    : it.description;

                  return (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td
                        className={`p-4 text-center font-bold border-r ${isProduct ? "bg-blue-50/30 text-blue-400" : "bg-purple-50/30 text-purple-400"}`}
                      >
                        {i + 1}
                      </td>
                      <td className="p-4">
                        {/* Type Badge */}
                        <div className="mb-2">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${typeBadgeStyles}`}
                          >
                            {it.itemType}
                          </span>
                        </div>

                        {/* Title */}
                        <p className="font-bold text-[#154068] uppercase text-sm leading-tight">
                          {primaryName}
                        </p>

                        {/* Secondary Description (only if it's a product and differs from name) */}
                        {isProduct &&
                          it.description &&
                          it.description !== it.productName && (
                            <p className="mt-1 text-[11px] text-slate-500 italic">
                              {it.description}
                            </p>
                          )}

                        {/* HSN Code */}
                        {it.hsnSacCode && (
                          <div className="mt-2">
                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                              HSN: {it.hsnSacCode}
                            </span>
                          </div>
                        )}

                        {/* Free Accessories (Linked to Products) */}
                        {isProduct &&
                          it.accessoryNames &&
                          it.accessoryNames.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {it.accessoryNames.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold uppercase"
                                >
                                  + {name}
                                </span>
                              ))}
                            </div>
                          )}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">
                        {it.quantity}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(it.rate)}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {it.taxPercentage}%
                      </td>
                      <td className="p-4 text-right border-r border-slate-50">
                        {isINR ? (
                          !hasIgst ? (
                            <div className="text-[11px] space-y-0.5">
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-400 font-bold">
                                  CGST:
                                </span>
                                <span className="text-slate-600">
                                  {formatCurrency(it.cgstAmount)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-400 font-bold">
                                  SGST:
                                </span>
                                <span className="text-slate-600">
                                  {formatCurrency(it.sgstAmount)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-[11px] flex justify-between gap-2">
                              <span className="text-slate-400 font-bold">
                                IGST:
                              </span>
                              <span className="text-slate-600">
                                {formatCurrency(it.igstAmount)}
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="text-[11px] text-slate-600">
                            {formatCurrency(it.gstAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right font-bold text-[#154068] text-base">
                        {formatCurrency(it.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaShieldAlt} title="Terms & Conditions" />
              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                {data.termsConditions || "Standard terms apply."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Bank Details" />
              <div className="text-sm space-y-1 text-slate-700">
                <p>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block">
                    Bank Name
                  </span>{" "}
                  {data.bankName}
                </p>
                <p>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block">
                    Account No
                  </span>{" "}
                  {data.accountNo}
                </p>
                <p>
                  <span className="font-bold text-[10px] uppercase text-slate-400 block">
                    IFSC Code
                  </span>{" "}
                  {data.ifsc}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Consignee / Shipping" />
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-100 italic leading-relaxed">
                {data.consigneeNameAddress || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-white border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className={buttonStyles.cancel}>
            Close Detail View
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;