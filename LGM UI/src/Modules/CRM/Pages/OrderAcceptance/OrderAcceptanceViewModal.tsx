import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBuilding,
  FaInfoCircle,
  FaUserTie,
  FaUniversity,
  FaHistory,
} from "react-icons/fa";

import type { OrderAcceptance } from "./Services/types";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";

interface OrderAcceptanceViewModalProps {
  data: OrderAcceptance;
  options: any;
  onClose: () => void;
}

const OrderAcceptanceViewModal: React.FC<OrderAcceptanceViewModalProps> = ({
  data,
  options,
  onClose,
}) => {
  const [contactOptions, setContactOptions] = useState<any[]>([]);

  const modalCurrencyId = data.offers?.[0]?.currencyId ?? data.currencyId;

  const selectedCurrency = options.currencies?.find(
    (c: any) => Number(c.value) === Number(modalCurrencyId),
  );

  const curSym = selectedCurrency?.currencySymbol || "₹";

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

  const formatCurrency = (value?: number) => {
    const num = Number(value || 0);
    return `${curSym} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const selectedCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.offers?.[0]?.companyId),
  );

  const selectedState = options.states?.find(
    (s: any) => Number(s.value) === Number(data.offers?.[0]?.placeOfSupplyId),
  );

  const billingState = (selectedCompany?.stateName || "").toLowerCase().trim();
  const supplyState = (selectedState?.label || "").toLowerCase().trim();

  const isIntraState =
    billingState && supplyState && billingState === supplyState;

  const isINR = selectedCurrency?.label === "INR";

  const hasNotes =
  Array.isArray(data.orderAcceptanceNotes) &&
  data.orderAcceptanceNotes.length > 0;

  const DataItem = ({ label, value }: any) => (
    <div className="py-2 border-b border-slate-100 last:border-b-0">
      <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-widest">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value || "N/A"}</p>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="mb-3 flex items-center gap-2 border-b pb-2">
      <Icon className="text-[#0b2c52]" />
      <h4 className="text-xs font-bold uppercase tracking-widest text-[#0b2c52]">
        {title}
      </h4>
    </div>
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* HEADER */}

        <div className="bg-[#f07837] text-white px-8 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{data.gaxcePurchaseOrderNo}</h2>
            <p className="text-xs text-slate-300">
              Customer PO: {data.customerOrderNo} | Date:{" "}
              {new Date(data.orderDate || "").toLocaleDateString()}
            </p>
          </div>

          <button onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="overflow-y-auto p-6 bg-slate-50 flex-1">
          {/* OFFER DETAILS */}

          {data.offers?.map((offer: any, index: number) => (
            <div
              key={index}
              className="mb-8 border rounded-2xl bg-white shadow-sm p-6"
            >
              <h3 className="font-bold text-blue-700 mb-4">
                Offer #{offer.offerNo}
              </h3>

              {offer.source === "SERVICE" && (
                <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                    Service Based Offer
                  </p>
                  <p className="text-sm text-purple-900 font-semibold mt-1">
                    {offer.serviceDescription ||
                      "No service description available"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <SectionHeader icon={FaBuilding} title="Parties & Group" />

                  <DataItem
                    label="Customer Account"
                    value={getLabel(options.customers, offer.customerId)}
                  />
                  <DataItem
                    label="Assigned Vendor"
                    value={getLabel(options.vendors, offer.vendorId)}
                  />
                  <DataItem
                    label="Product Group"
                    value={getLabel(options.groups, offer.productGroupId)}
                  />
                  <DataItem
                    label="Company Group"
                    value={getLabel(
                      options.companyGroups,
                      offer.companyGroupId,
                    )}
                  />
                </div>

                <div>
                  <SectionHeader icon={FaUserTie} title="Ownership" />

                  {/* <DataItem label="Contact Person" value={getLabel(contactOptions, offer.responsiblePersonId)} /> */}
                  <DataItem
                    label="Contact Person"
                    value={
                      offer.responsiblePersonName ||
                      getLabel(contactOptions, offer.responsiblePersonId)
                    }
                  />
                  <DataItem
                    label="Assigned Manager"
                    value={getLabel(
                      options.employees,
                      offer.assignedToEmployeeId,
                    )}
                  />
                  <DataItem label="Company Code" value={offer.companyCode} />
                  <DataItem label="Vendor Code" value={offer.vendorCode} />
                </div>

                <div>
                  <SectionHeader icon={FaUniversity} title="Logistics" />

                  <DataItem
                    label="Place of Supply"
                    value={getLabel(options.states, offer.placeOfSupplyId)}
                  />
                  <DataItem
                    label="Currency"
                    value={getLabel(options.currencies, offer.currencyId)}
                  />
                  <DataItem
                    label="Bank A/C"
                    value={getLabel(options.banks, offer.bankDetailId)}
                  />
                  <DataItem
                    label="Offer Date"
                    value={
                      offer.offerCreateDate
                        ? new Date(offer.offerCreateDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>
              </div>

              {/* ADDRESS */}

              <div className="mt-6">
                <SectionHeader icon={FaInfoCircle} title="Address & Notes" />

                <DataItem label="Address" value={offer.address} />
                <DataItem
                  label="Freight Charges"
                  value={formatCurrency(offer.freightCharges)}
                />
                <DataItem
                  label="Terms & Conditions"
                  value={offer.termsConditions}
                />
                <DataItem label="Customer Notes" value={offer.customerNotes} />
              </div>
            </div>
          ))}

          {/* ITEMS TABLE */}

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f07837] text-white">
                <tr>
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4 min-w-[300px]">Item Configuration</th>
                  <th className="p-4 text-center w-20">Qty</th>
                  <th className="p-4 w-28">HSN</th>
                  <th className="w-28 border-r border-slate-700 p-3 text-right">
                    Tax %
                  </th>
                  <th className="w-28 border-r border-slate-700 p-3 text-right">
                    Base
                  </th>
                  <th className="w-28 border-r border-slate-700 p-3 text-right">
                    Tax Breakdown
                  </th>
                  <th className="p-4 text-right pr-8">Final Amt</th>
                </tr>
              </thead>

              <tbody>
                {data.items?.map((it: any, i) => {
                  // 1. Determine if this is a Standalone Accessory
                  const itemType = String(
                    it.itemType || it.ItemType || "Product",
                  ).toLowerCase();

                  const isService = itemType === "service";
                  const isAccessory =
                    !isService &&
                    (itemType === "accessory" ||
                      (!!it.accessoryId &&
                        (!it.productId || Number(it.productId) === 0)));

                  const itemName = isService
                    ? it.servicePartNo ||
                      it.ServicePartNo ||
                      it.partNo ||
                      it.description ||
                      "Service"
                    : isAccessory
                      ? getLabel(options.accessories, it.accessoryId)
                      : getLabel(options.products, it.productId);

                  return (
                    <tr
                      key={i}
                      className={`border-b last:border-0 transition-colors align-top ${
                        isAccessory
                          ? "bg-purple-50/40 hover:bg-purple-50/60"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-4 text-center font-bold text-slate-400">
                        {i + 1}
                      </td>

                      <td className="p-4">
                        {/* Origin / Type Badge Row */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${
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

                          {it.offerNo && (
                            <span className="text-[9px] font-black text-slate-400 uppercase">
                              Ref: {it.offerNo}
                            </span>
                          )}
                        </div>

                        {/* Resolved Item Name */}
                        <div className="font-bold text-[#0b2c52] text-sm uppercase">
                          {itemName}
                        </div>

                        {/* Linked Free Accessories (Only show for Products) */}
                        {!isService &&
                          !isAccessory &&
                          it.accessoryIds &&
                          it.accessoryIds.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
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

                        {/* Description box */}
                        {it.description && (
                          <div className="text-[11px] text-slate-500 italic mt-3 bg-white/50 p-2 rounded border border-slate-100 shadow-sm leading-relaxed">
                            {it.description}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center font-black text-slate-600">
                        {it.quantity}
                      </td>

                      <td className="p-4 font-medium text-slate-500">
                        {isService ? "N/A" : it.hsnSacCode || "—"}
                      </td>
                      <td className="p-4 font-medium text-slate-500">
                        {Number(it.taxPercentage || 0).toFixed(2)}%
                      </td>
                      <td className="p-4 font-medium text-slate-500">
                        {formatCurrency(it.total)}
                      </td>
                      <td className="border-r border-slate-100 p-3 text-right font-medium">
                        {isINR ? (
                          isIntraState ? (
                            <div className="leading-tight">
                              <div className="text-emerald-600 font-bold text-xs">
                                CGST: {formatCurrency(it.cgstAmount)}
                              </div>
                              <div className="text-emerald-600 font-bold text-xs">
                                SGST: {formatCurrency(it.sgstAmount)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-emerald-600 font-bold text-xs">
                              IGST: {formatCurrency(it.igstAmount)}
                            </div>
                          )
                        ) : (
                          formatCurrency(it.gstAmount)
                        )}
                      </td>
                      <td className="p-4 text-right pr-8 font-black text-[#0b2c52] text-base">
                        {formatCurrency(it.finalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ACTIVITY NOTES */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader icon={FaHistory} title="Activity Notes" />

            {hasNotes ? (
              <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
               {data.orderAcceptanceNotes?.map((n: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#154068]/20"
                  >
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                      {n.note}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#154068]">
                        {n.authorName || "System Admin"}
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-400">
                  No activity notes available.
                </p>
              </div>
            )}
          </div>

          {/* TOTAL */}

          <div className="mt-6 bg-[#f07837] text-white rounded-2xl p-6 text-right">
            <p className="text-xs uppercase text-slate-400">Grand Total</p>

            <p className="text-3xl font-black">
              {formatCurrency(data.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAcceptanceViewModal;
