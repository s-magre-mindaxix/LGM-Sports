import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaBuilding,
  FaInfoCircle,
  FaShieldAlt,
  FaHistory,
  FaUserTie,
  FaUniversity,
} from "react-icons/fa";
import type { Offer } from "./Services/types";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";
import { printOfferVersionPDF } from "./Services/printOfferVersionPDF";

const OfferViewModal: React.FC<{
  data: Offer;
  options: any;
  onClose: () => void;
}> = ({ data, options, onClose }) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<any | null>(null);
  const [contactOptions, setContactOptions] = useState<any[]>([]);

  const selectedCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.companyId),
  );

  const selectedState = options.states?.find(
    (s: any) => Number(s.value) === Number(data.placeOfSupplyId),
  );

  const billingState = (selectedCompany?.stateName || "").toLowerCase().trim();
  const supplyState = (selectedState?.label || "").toLowerCase().trim();

  const isIntraState =
    billingState && supplyState && billingState === supplyState;

  const isINR = data.currencyName === "INR";

  const totalCGST = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.cgstAmount || 0),
    0,
  );

  const totalSGST = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.sgstAmount || 0),
    0,
  );

  const totalIGST = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.igstAmount || 0),
    0,
  );

  const selectedCur = options.currencies?.find(
    (c: any) => c.value === data.currencyId,
  );
  const curSym = selectedCur?.currencySymbol || "₹";
  useEffect(() => {
    if (data.customerId) {
      getCustomerContacts(data.customerId)
        .then(setContactOptions)
        .catch(() => setContactOptions([]));
    }
  }, [data.customerId]);

  const getLabel = (list: any[], id?: number | string) => {
    if (!list || id === undefined || id === null) return "N/A";
    const found = list.find((x) => Number(x.value) === Number(id));
    return found ? found.label : "N/A";
  };

  // const totalTax = data.items?.reduce(
  //   (sum: number, item: any) => sum + Number(item.gstAmount || 0),
  //   0,
  // );

  const formatCurrency = (val: number = 0) =>
    `${curSym} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatSourceType = (type?: string) => {
    switch (type) {
      case "SERVICE":
        return "Service Order";
      case "VERBAL":
        return "Verbal Communication";
      case "ENQUIRY":
      default:
        return "Linked Enquiry";
    }
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
        className={`mt-1 text-sm font-semibold ${highlight ? "text-emerald-400" : dark ? "text-white" : "text-slate-800 uppercase"}`}
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

const hasNotes = Array.isArray(data.notes) && data.notes.length > 0;

  const previewVersions = [...(data.versionHistory || [])].sort(
    (a: any, b: any) =>
      new Date(b.savedAt || "").getTime() - new Date(a.savedAt || "").getTime(),
  );

  // const handleViewSnapshot = (v: any) => {
  //   try {
  //     const parsed = JSON.parse(v.snapshotDataJson || v.snapshotJson || "{}");
  //     setSelectedSnapshot(parsed);
  //   } catch {
  //     setSelectedSnapshot(null);
  //   }
  // };

  const handleViewSnapshot = (v: any) => {
  try {
    const parsed = JSON.parse(v.snapshotDataJson || v.snapshotJson || "{}");

    parsed.savedAt = v.savedAt;
    parsed.SavedAt = v.savedAt;

    setSelectedSnapshot(parsed);
  } catch {
    setSelectedSnapshot(null);
  }
};

  const normalizeSnapshot = (snap: any) => ({
    offerNo: snap.offerNo ?? snap.OfferNo ?? "-",
    status: snap.status ?? snap.Status ?? "-",
    grandTotal: snap.grandTotal ?? snap.GrandTotal ?? 0,
    customerName: snap.customerName ?? snap.CustomerName ?? "-",
    currencyName: snap.currencyName ?? snap.CurrencyName ?? "-",
    source: snap.source ?? snap.Source ?? "-",
     savedAt: snap.savedAt ?? snap.SavedAt ?? null,
    offerDate: snap.offerDate ?? snap.OfferDate ?? null,
    items: (snap.items ?? snap.Items ?? []).map((x: any) => ({
    ...x,
    liveConversionRate:
        x.liveConversionRate ??
        x.LiveConversionRate ??
        null,
})),
  });

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in duration-300">
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-[#154068] shadow-lg">
              <FaFileInvoiceDollar size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold uppercase tracking-wide md:text-2xl">
                  {data.offerNo || "OFFER"}
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${data.status === "FINAL" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}
                >
                  {data.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-white uppercase tracking-widest font-medium">
                Source: {data.source} | Account:{" "}
                {getLabel(options.customers, data.customerId)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Parties & Group" />

              <DataItem
                label="Offer Source"
                value={formatSourceType(data.source)}
                highlight
              />
              {data.source === "SERVICE" && (
                <DataItem
                  label="Service Description"
                  value={data.serviceDescription}
                />
              )}
              <DataItem
                label="Customer"
                value={getLabel(options.customers, data.customerId)}
                highlight
              />
              <DataItem
                label="Vendor"
                value={getLabel(options.vendors, data.vendorId)}
              />
              <DataItem
                label="Product Group"
                value={getLabel(options.groups, data.productGroupId)}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaUserTie} title="Ownership" />
              <DataItem
                label="Contact Person"
                value={getLabel(contactOptions, data.responsiblePersonId)}
              />
              <DataItem
                label="Account Manager"
                value={getLabel(options.employees, data.assignedToEmployeeId)}
              />
              <DataItem
                label="Company Group"
                value={getLabel(options.companyGroups, data.companyGroupId)}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaUniversity} title="Logistics" />
              <DataItem
                label="Place of Supply"
                value={getLabel(options.states, data.placeOfSupplyId)}
              />
              <DataItem
                label="Currency"
                value={getLabel(options.currencies, data.currencyId)}
              />
              <DataItem
                label="Bank A/C"
                value={getLabel(options.banks, data.bankDetailId)}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f07837] p-6 text-white shadow-xl">
              <SectionHeader
                icon={FaFileInvoiceDollar}
                title="Valuation"
                dark
              />
              <DataItem
                label="Net Subtotal"
                value={formatCurrency(data.subtotal)}
                dark
              />
              <DataItem
                label="Freight Charges"
                value={formatCurrency(data.freightCharges)}
                dark
              />
              {isINR && (
                <>
                  {isIntraState ? (
                    <>
                      <DataItem
                        label="CGST (9%)"
                        value={formatCurrency(totalCGST)}
                        dark
                      />
                      <DataItem
                        label="SGST (9%)"
                        value={formatCurrency(totalSGST)}
                        dark
                      />
                    </>
                  ) : (
                    <DataItem
                      label="IGST (18%)"
                      value={formatCurrency(totalIGST)}
                      dark
                    />
                  )}
                </>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  Grand Total
                </p>
                <p className="text-3xl font-black text-white font-mono">
                  {formatCurrency(data.grandTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Table Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[#f07837] text-[12px] tracking-wide text-slate-100">
                    <tr>
                      <th className="p-4 w-12 text-center border-r border-slate-700">
                        #
                      </th>
                      <th className="p-4 min-w-[300px] border-r border-slate-700">
                        Item Configuration
                      </th>
                      <th className="p-4 text-center w-20 border-r border-slate-700">
                        Qty
                      </th>
                      <th className="p-4 text-right w-32 border-r border-slate-700">
                        Rate
                      </th>
                      <th className="p-4 text-right w-32">Final</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items?.map((it: any, i: number) => {
                      // 1. Determine the type robustly
                      // const isAccessory =
                      //   it.itemType === "Accessory" ||
                      //   (!!it.accessoryId && !it.productId);

                      // // 2. Resolve Label from master options
                      // const itemLabel = isAccessory
                      //   ? getLabel(options.accessories, it.accessoryId)
                      //   : getLabel(options.products, it.productId);

                      const isService = it.itemType === "Service";

                      const isAccessory =
                        it.itemType === "Accessory" ||
                        (!!it.accessoryId && !it.productId && !isService);

                      const itemLabel = isService
                        ? it.servicePartNo ||
                          data.serviceDescription ||
                          "Service"
                        : isAccessory
                          ? getLabel(options.accessories, it.accessoryId)
                          : getLabel(options.products, it.productId);

                      return (
                        <tr
                          key={i}
                          className={`border-b last:border-0 transition-colors align-top ${isAccessory ? "bg-purple-50/30 hover:bg-purple-50/50" : "hover:bg-slate-50"}`}
                        >
                          <td
                            className={`p-4 border-r text-center font-bold ${isAccessory ? "text-purple-400 bg-purple-50/50" : "bg-slate-50/50 text-slate-400"}`}
                          >
                            {i + 1}
                          </td>
                          <td className="p-4 border-r">
                            {/* Type Badge */}
                            <div className="mb-1">
                              <span
                                className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${
                                  // isAccessory
                                  //   ? "bg-purple-100 text-purple-800 border-purple-200"
                                  //   : "bg-blue-100 text-blue-800 border-blue-200"
                                  isService
                                    ? "bg-orange-100 text-orange-800 border-orange-200"
                                    : isAccessory
                                      ? "bg-purple-100 text-purple-800 border-purple-200"
                                      : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {isService
                                  ? "Service"
                                  : isAccessory
                                    ? "Paid Accessory"
                                    : "Product"}
                              </span>
                            </div>

                            {/* Item Name */}
                            <p className="font-bold text-[#154068] text-sm uppercase">
                              {itemLabel}
                            </p>

                            {/* Linked Accessories (Only for Products) */}
                            {!isAccessory && !isService && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {it.accessoryIds?.length ? (
                                  it.accessoryIds.map((aid: number) => (
                                    <span
                                      key={aid}
                                      className="bg-white text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200"
                                    >
                                      + {getLabel(options.accessories, aid)}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[9px] text-slate-400 italic">
                                    No linked accessories
                                  </span>
                                )}
                              </div>
                            )}

                            {it.description && (
                              <div className="mt-3 text-[11px] italic text-slate-500 bg-white/50 p-2 rounded border border-slate-100 shadow-sm">
                                {it.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4 border-r text-center font-black text-slate-600">
                            {it.quantity}
                          </td>
                          <td className="p-4 border-r text-right font-medium text-slate-400">
                            {formatCurrency(it.rate)}
                          </td>
                          <td className="p-4 text-right font-black text-[#154068] font-mono text-lg">
                            {formatCurrency(it.finalPrice)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <SectionHeader
                    icon={FaShieldAlt}
                    title="Terms & Conditions"
                  />
                  <p className="text-xs uppercase leading-relaxed text-slate-500 whitespace-pre-wrap">
                    {data.termsConditions}
                  </p>
                </div>
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <SectionHeader icon={FaInfoCircle} title="Customer Notes" />
                  <p className="text-xs italic text-slate-400 whitespace-pre-wrap">
                    "{data.customerNotes || "N/A"}"
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaHistory} title="Activity Notes" />

              {hasNotes ? (
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {data.notes.map((n: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm text-slate-700">{n.note}</p>

                      <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        <span>{n.authorName || "Unknown"}</span>

                        <span>
                          {n.createdAt
                            ? new Date(n.createdAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No activity notes available.
                </p>
              )}
            </div>
            </div>

            {/* History Sidebar */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-2xl border bg-white p-6 shadow-sm flex flex-col">
                <SectionHeader
                  icon={FaHistory}
                  title="Draft Log History"
                  color="text-blue-600"
                />
                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                  <div className="space-y-2 overflow-y-auto max-h-[500px] pr-2">
                    {previewVersions.length ? (
                      previewVersions.map((v: any, i: number) => {
                        let summary = "Snapshot saved";

                        const rawVersion =
                          v.versionNo ?? v.versionNumber ?? i + 1;

                        const statusText = String(
                          v.statusAtMoment || "",
                        ).toUpperCase();

                        const versionLabel =
                          rawVersion === 1
                            ? "Main"
                            : statusText === "FINAL"
                              ? `Revision ${rawVersion - 2}`
                              : `Revision ${rawVersion - 1}`;

                        try {
                          const parsed = JSON.parse(
                            v.snapshotDataJson || v.snapshotJson || "{}",
                          );

                          const status =
                            v.statusAtMoment ||
                            parsed.status ||
                            parsed.Status ||
                            "-";

                          const total = Number(
                            parsed.grandTotal ?? parsed.GrandTotal ?? 0,
                          );

                          summary = `Status: ${status} | Total: ${total.toFixed(2)}`;
                        } catch {
                          summary = "Snapshot saved";
                        }

                        return (
                          <div
                            key={`${versionLabel}-${v.savedAt}`}
                            onClick={() => handleViewSnapshot(v)}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#154068] hover:bg-blue-50 hover:shadow-md"
                          >
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {versionLabel}
                            </div>

                            <p className="mt-1 text-sm text-slate-700">
                              {summary}
                            </p>

                            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
                              <span>
                                {v.authorName || v.savedByName || "Unknown"}
                              </span>
                              <span>
                                {v.savedAt
                                  ? new Date(v.savedAt).toLocaleString()
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-slate-400">
                        No draft versions yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="p-6 bg-white border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-12 py-3 bg-[#f07837] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-[#0d3357] transition-all"
          >
            Close Workspace
          </button>
        </div>
      </div>

      {selectedSnapshot &&
        (() => {
          const snap = normalizeSnapshot(selectedSnapshot);

          return (
            <div className="fixed inset-0 z-10000 flex items-center justify-center bg-slate-900/60 p-4">
              <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl">
                <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Version Data - {snap.offerNo}
                  </h3>

                  <div className="flex gap-2">
                    {/* <button
                      onClick={() =>
                        printOfferVersionPDF(selectedSnapshot, options)
                      }
                      className="rounded-lg cursor-pointer bg-[#f07837] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d3357]"
                    >
                      Download PDF
                    </button> */}

                  <button
                    onClick={() =>
                      printOfferVersionPDF(selectedSnapshot, options)
                    }
                    className="rounded-lg cursor-pointer bg-[#f07837] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0d3357]"
                  >
                    Download PDF
                  </button>

                    <button
                      onClick={() => setSelectedSnapshot(null)}
                      className="rounded-lg cursor-pointer border px-3 py-1.5 text-xs font-semibold hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="space-y-4 p-6 text-sm text-slate-700">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <b>Status:</b> {snap.status}
                    </div>
                    <div>
                      <b>Offer No:</b> {snap.offerNo}
                    </div>
                    <div>
                      <b>Grand Total:</b>{" "}
                      {Number(snap.grandTotal).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div>
                      <b>Customer:</b> {snap.customerName}
                    </div>
                    <div>
                      <b>Currency:</b> {snap.currencyName}
                    </div>
                    <div>
                      <b>Source:</b> {snap.source}
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead className="bg-slate-100">
                        <tr>
                          <th className="p-3">#</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Rate</th>
                          <th className="p-3 text-right">Live Rate</th>
                          <th className="p-3 text-right">Discount</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {snap.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="p-3">{index + 1}</td>
                            <td className="p-3">
                              {item.itemType ?? item.ItemType ?? "-"}
                            </td>
                            <td className="p-3">
                              {item.description ?? item.Description ?? "-"}
                            </td>
                            <td className="p-3 text-right">
                              {item.quantity ?? item.Quantity ?? 0}
                            </td>
                            <td className="p-3 text-right">
                              {Number(
                                item.rate ?? item.Rate ?? 0,
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-3 text-right">
                              {item.liveConversionRate ??
                              item.LiveConversionRate ??
                              "-"}
                            </td>
                            <td className="p-3 text-right">
                              {Number(item.discount ?? item.Discount ?? 0)}%
                            </td>
                            <td className="p-3 text-right">
                              {Number(
                                item.total ?? item.Total ?? 0,
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default OfferViewModal;
