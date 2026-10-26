import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaBuilding,
  FaInfoCircle,
  FaShieldAlt,
  FaHistory,
  FaUserClock,
  FaArrowRight,
  FaUserTie,
  FaClipboardList,
  FaMapMarkedAlt,
} from "react-icons/fa";
import type { PurchaseOrder } from "./Services/types";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";

interface PurchaseOrderViewModalProps {
  data: PurchaseOrder;
  options: any;
  onClose: () => void;
}

const PurchaseOrderViewModal: React.FC<PurchaseOrderViewModalProps> = ({
  data,
  options,
  onClose,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<any | null>(null);
  const [contactOptions, setContactOptions] = useState<any[]>([]);

  // Dynamically load contacts based on the main customer
  useEffect(() => {
    if (data?.customerId) {
      getCustomerContacts(data.customerId)
        .then(setContactOptions)
        .catch(() => setContactOptions([]));
    }
  }, [data?.customerId]);

  const getLabel = (list: any[], id?: number | string) => {
    if (!list || id === undefined || id === null) return "N/A";
    const found = list.find((x) => Number(x.value) === Number(id));
    return found ? found.label : "N/A";
  };

  const offerCurrencyId = (data as any)?.offers?.[0]?.currencyId;

  const selectedCurrency = options.currencies?.find(
    (c: any) => c.value === offerCurrencyId,
  );

  const curSym = selectedCurrency?.currencySymbol || "₹";

  const formatCurrency = (value?: number) => {
    const num = Number(value || 0);
    return `${curSym} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const DataItem = ({
    label,
    value,
    highlight = false,
  }: {
    label: string;
    value?: any;
    highlight?: boolean;
  }) => (
    <div className="py-2 border-b border-slate-100 last:border-b-0">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-bold ${highlight ? "text-blue-600" : "text-slate-800"}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
    color = "text-slate-500",
  }: any) => (
    <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
      <Icon className={`${color} text-sm`} />
      <h4
        className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${color}`}
      >
        {title}
      </h4>
    </div>
  );

  // Casting to any to ensure we can access the 'offers' array from Backend mapping
  const offersArray = (data as any).offers || (data as any).Offers || [];
  const historyData =
    (data as any).versionHistory || (data as any).VersionHistory || [];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md text-left">
      <div className="flex max-h-[96vh] w-full max-w-360 flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-300">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between bg-[#f07837] px-8 py-6 text-white">
          <div className="flex items-center gap-6">
            <div className="rounded-2xl bg-white/10 p-3.5 text-white border border-white/10 shadow-inner">
              <FaFileInvoiceDollar size={28} />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-semibold uppercase tracking-tighter">
                  {data.purchaseOrderNo}
                </h2>
                <span
                  className={`rounded-xl px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${data.status === "FINAL" ? "bg-emerald-500 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-500/20"}`}
                >
                  {data.status || "DRAFT"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Date:{" "}
                  {new Date(data.purchaseOrderDate || "").toLocaleDateString(
                    "en-GB",
                  )}
                </p>
                <div className="h-1 w-1 rounded-full bg-[#f07837]"></div>
                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                  Linked Records: {offersArray.length}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-white/5 p-3 transition hover:bg-rose-600 hover:text-white border border-white/5"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="overflow-y-auto bg-[#f8fafc] p-6 md:p-8 flex-1">
          <div className="lg:col-span-8">
            {/* LEFT COLUMN: SOURCE DETAILS & ITEMS */}
            <div className="lg:col-span-12 space-y-8">
              {/* --- INDIVIDUAL SOURCE OA BOXES (Like Order Acceptance View) --- */}
              {offersArray.map((source: any, index: number) => (
                <div
                  key={index}
                  className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md border-l-[6px] border-l-blue-500"
                >
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                    <h3 className="text-xl font-semibold text-[#0b2c52] uppercase tracking-tight flex items-center gap-3">
                      <FaClipboardList className="text-blue-500" />
                      Source OA:{" "}
                      <span className="text-blue-600">
                        {source.gaxcePurchaseOrderNo}
                      </span>
                    </h3>
                    <div className="px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                      Sequence #{index + 1}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Column 1: Parties */}
                    <div className="space-y-1">
                      <SectionHeader
                        icon={FaBuilding}
                        title="Parties & Group"
                        color="text-indigo-500"
                      />
                      <DataItem
                        label="Customer Account"
                        value={getLabel(options.customers, source.customerId)}
                        highlight
                      />
                      <DataItem
                        label="Vendor Detail"
                        value={getLabel(options.vendors, source.vendorId)}
                      />
                      <DataItem
                        label="Product Group"
                        value={getLabel(options.groups, source.productGroupId)}
                      />
                      <DataItem
                        label="Company Group"
                        value={getLabel(
                          options.companyGroups,
                          source.companyGroupId,
                        )}
                      />
                    </div>

                    {/* Column 2: Ownership */}
                    <div className="space-y-1">
                      <SectionHeader
                        icon={FaUserTie}
                        title="Contact & Ownership"
                        color="text-emerald-500"
                      />
                      <DataItem
                        label="Responsible Person"
                        value={
                          source.responsiblePersonName ||
                          getLabel(contactOptions, source.responsiblePersonId)
                        }
                      />
                      <DataItem
                        label="Assigned Manager"
                        value={getLabel(
                          options.employees,
                          source.assignedToEmployeeId,
                        )}
                      />
                      <DataItem
                        label="Company Code"
                        value={source.companyCode}
                      />
                      <DataItem label="Vendor Code" value={source.vendorCode} />
                    </div>

                    {/* Column 3: Logistics */}
                    <div className="space-y-1">
                      <SectionHeader
                        icon={FaMapMarkedAlt}
                        title="Logistics Info"
                        color="text-amber-500"
                      />
                      <DataItem
                        label="Place of Supply"
                        value={getLabel(options.states, source.placeOfSupplyId)}
                      />
                      <DataItem
                        label="Source Currency"
                        value={getLabel(options.currencies, source.currencyId)}
                      />
                      <DataItem
                        label="Settlement Bank"
                        value={getLabel(options.banks, source.bankDetailId)}
                      />
                      <DataItem
                        label="OA Creation Date"
                        value={
                          source.offerCreateDate
                            ? new Date(
                                source.offerCreateDate,
                              ).toLocaleDateString("en-GB")
                            : "N/A"
                        }
                      />
                    </div>
                  </div>

                  {/* Sub-Footer for this Box */}
                  <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2 tracking-widest">
                        Shipping / Delivery Address
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                        {source.address || "Not Specified"}
                      </p>
                    </div>
                    <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-semibold uppercase text-slate-400 mb-2 tracking-widest">
                        Source Remarks
                      </p>
                      <p className="text-xs text-slate-500 italic font-medium leading-relaxed">
                        "
                        {source.customerNotes ||
                          "No specific notes for this OA source."}
                        "
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* --- ITEMS TABLE --- */}
              <div className="rounded-4xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <div className="bg-[#f07837] px-8 py-5 flex justify-between items-center">
                  <h4 className="text-white text-sm font-semibold uppercase tracking-[0.2em]">
                    Aggregated Itemized Breakdown
                  </h4>
                  <div className="bg-white/10 px-4 py-1.5 rounded-lg text-[10px] font-bold text-slate-300 uppercase">
                    {data.items?.length || 0} Total SKUs
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-semibold text-slate-500 border-b">
                    <tr>
                      <th className="p-3 w-12 text-center border-r">#</th>
                      <th className="p-3">
                        Product Details / Technical Description
                      </th>
                      <th className="p-2 w-18 text-center border-x">
                        Quantity
                      </th>
                      <th className="p-3 w-32 text-center border-r">HSN/SAC</th>
                      <th className="p-3 w-32 text-center border-r">Base</th>

                      <th className="p-3 text-right w-44">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-700">
                    {data.items?.map((it: any, i: number) => {
                      // 1. Robust Type Detection
                      const isAccessory =
                        it.itemType === "Accessory" ||
                        (!!it.accessoryId &&
                          (!it.productId || it.productId === 0));

                      // 2. Correct Label Lookup
                      const itemName = isAccessory
                        ? getLabel(options.accessories, it.accessoryId)
                        : getLabel(options.products, it.productId);

                      return (
                        <tr
                          key={i}
                          className={`border-b last:border-0 transition-all align-top ${
                            isAccessory
                              ? "bg-purple-50/40 hover:bg-purple-50/60"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <td
                            className={`p-3 border-r text-center font-semibold ${isAccessory ? "text-purple-400" : "text-slate-300"}`}
                          >
                            {i + 1}
                          </td>
                          <td className="p-3">
                            {/* Badge Row */}
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-[8px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider border ${
                                  isAccessory
                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {isAccessory ? "Paid Accessory" : "Product"}
                              </span>
                              {it.sourceOA && (
                                <span className="text-[9px] font-semibold text-slate-400 uppercase">
                                  OA: {it.sourceOA}
                                </span>
                              )}
                            </div>

                            {/* Item Name */}
                            <p className="font-semibold text-[#0b2c52] uppercase text-sm mb-1">
                              {itemName}
                            </p>

                            {/* Linked Free Accessories (Only for Products) */}
                            {!isAccessory &&
                              it.accessoryIds &&
                              it.accessoryIds.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                                  {it.accessoryIds.map((aid: number) => (
                                    <span
                                      key={aid}
                                      className="bg-white text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200"
                                    >
                                      + {getLabel(options.accessories, aid)}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {it.description && (
                              <p className="text-[11px] leading-relaxed text-slate-500 font-medium bg-white/60 p-3 rounded-xl border border-slate-100 mt-2 shadow-sm">
                                {it.description}
                              </p>
                            )}
                          </td>
                          <td className="p-3 border-x text-center font-semibold text-slate-800 text-lg">
                            {it.quantity}
                          </td>
                          <td className="p-3 border-r text-center font-bold text-slate-400 uppercase tracking-widest">
                            {it.hsnSacCode || "---"}
                          </td>

                          <td className="p-3 border-r text-center font-bold text-slate-400 uppercase tracking-widest">
                            {formatCurrency(it.total)}
                          </td>

                          <td className="p-3 text-right font-semibold text-[#0b2c52] font-mono text-lg">
                            {formatCurrency(it.finalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Final Valuation Bar */}
                <div className="bg-[#f07837] p-8 flex flex-col md:flex-row justify-between items-center text-white border-t border-white/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-slate-300 text-xs">Subtotal</p>
                      <p className="font-semibold">
                        {formatCurrency(data.subtotal)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-300 text-xs">Freight</p>
                      <p className="font-semibold">
                        {formatCurrency(data.freightCharges)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-[0.25em] mb-1">
                      Total Payable PO Amount
                    </p>
                    <p className="text-3xl font-semibold font-mono tracking-tighter text-white">
                      {formatCurrency(data.grandTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: HISTORY & ACTIVITY */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {/* Valuation Summary Card */}
              <div className="rounded-4xl bg-[#f07837] p-8 text-white shadow-xl">
                <SectionHeader
                  icon={FaFileInvoiceDollar}
                  title="Invoice Summary"
                  color="text-white"
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-[10px] font-bold uppercase text-white">
                      Invoice No
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-widest">
                      {data.invoiceNo || "NOT GENERATED"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <span className="text-[10px] font-bold uppercase text-white">
                      Invoice Date
                    </span>
                    <span className="text-sm font-semibold uppercase">
                      {data.invoiceDate
                        ? new Date(data.invoiceDate).toLocaleDateString("en-GB")
                        : "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-white">
                      Follow-up
                    </span>
                    <span className="text-sm font-semibold uppercase">
                      {data.nextFollowUpDate
                        ? new Date(data.nextFollowUpDate).toLocaleDateString(
                            "en-GB",
                          )
                        : "---"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Remarks */}
              <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
                <SectionHeader
                  icon={FaShieldAlt}
                  title="Final PO Terms"
                  color="text-slate-800"
                />
                <p className="text-[11px] font-bold uppercase leading-relaxed text-slate-500 whitespace-pre-wrap">
                  {data.termsConditions || "NO TERMS SPECIFIED"}
                </p>

                <div className="mt-8">
                  <SectionHeader
                    icon={FaInfoCircle}
                    title="Common PO Remarks"
                    color="text-slate-800"
                  />
                  <p className="text-[11px] italic text-slate-400 font-medium whitespace-pre-wrap">
                    "{data.customerNotes || "No common notes available"}"
                  </p>
                </div>
              </div>

              {/* Activity Logs Sidebar */}
              <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col min-h-[400px]">
                <SectionHeader
                  icon={FaHistory}
                  title="PO Version History"
                  color="text-blue-600"
                />
                <div className="space-y-5 overflow-y-auto max-h-[500px] mt-6 pr-2 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {historyData.length > 0 ? (
                    historyData.map((v: any, idx: number) => (
                      <div
                        key={idx}
                        className="relative pl-10 group cursor-pointer"
                        onClick={() =>
                          setSelectedSnapshot(
                            JSON.parse(
                              v.snapshotDataJson || v.snapshotJson || "{}",
                            ),
                          )
                        }
                      >
                        <div className="absolute left-0 top-1.5 w-8 h-8 bg-white border-4 border-slate-100 rounded-full flex items-center justify-center group-hover:border-blue-500 transition-all shadow-sm">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-white hover:shadow-md transition-all text-left">
                          <div className="flex justify-between items-center mb-1">
                            <h5 className="text-[11px] font-semibold text-[#154068] uppercase">
                              Ver. {v.versionNo || idx + 1}
                            </h5>
                            <span className="text-[8px] font-semibold px-2 py-0.5 rounded-md bg-white border uppercase text-slate-400">
                              {v.statusAtMoment}
                            </span>
                          </div>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <FaUserClock className="inline mr-1" />
                            {v.authorName || "System"} •{" "}
                            {new Date(v.savedAt || "").toLocaleDateString()}
                          </div>
                          <div className="text-blue-600 text-[9px] font-semibold mt-3 uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            Inspect snapshot <FaArrowRight />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 opacity-30">
                      <FaClipboardList className="mx-auto size-12 mb-3" />
                      <p className="text-[10px] font-semibold uppercase">
                        No Logs Found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 bg-slate-50 border-t flex justify-center">
          <button
            onClick={onClose}
            className="px-24 py-4 bg-[#f07837] text-white text-xs font-semibold uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-black transition-all active:scale-95"
          >
            Exit PO Workspace
          </button>
        </div>
      </div>

      {/* --- SNAPSHOT OVERLAY --- */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-10000 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-10 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b p-10 bg-slate-50">
              <h2 className="text-2xl font-semibold text-[#0b2c52] uppercase tracking-tighter flex items-center gap-4">
                <FaHistory className="text-blue-500" /> Version Snapshot Details
              </h2>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="p-3 bg-white rounded-full border shadow-sm text-slate-400 hover:text-red-500 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-10 space-y-8 text-left">
              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8 shadow-inner">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                    Stored PO No
                  </p>
                  <p className="text-2xl font-semibold text-slate-800">
                    {selectedSnapshot.purchaseOrderNo ||
                      selectedSnapshot.PurchaseOrderNo}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-8 shadow-xl text-white flex flex-col justify-center">
                  <SectionHeader
                    icon={FaFileInvoiceDollar}
                    title="Historical Valuation"
                    color="text-white/40"
                  />
                  <p className="text-3xl font-semibold text-emerald-400 font-mono tracking-tighter">
                    {formatCurrency(
                      selectedSnapshot.grandTotal ||
                        selectedSnapshot.GrandTotal,
                    )}
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 font-semibold uppercase tracking-[0.15em] text-slate-400 border-b">
                    <tr>
                      <th className="p-3 w-12 text-center">Qty</th>
                      <th className="p-3">Product Detail</th>
                      <th className="p-3 text-right">Historical Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSnapshot.items || selectedSnapshot.Items)?.map(
                      (it: any, i: number) => (
                        <tr key={i} className="border-t border-slate-50">
                          <td className="p-3 font-semibold text-slate-800 text-center text-lg">
                            {it.quantity || it.Quantity}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 uppercase tracking-tight">
                            {getLabel(
                              options.products,
                              it.productId || it.ProductId,
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-[#0b2c52] text-lg">
                            {formatCurrency(it.rate || it.Rate)}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-10 border-t flex justify-center bg-slate-50">
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="bg-slate-900 text-white px-16 py-4 rounded-2xl font-semibold uppercase text-[10px] tracking-widest shadow-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderViewModal;
