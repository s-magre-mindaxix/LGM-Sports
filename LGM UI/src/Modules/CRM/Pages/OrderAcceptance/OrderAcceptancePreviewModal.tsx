import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaBuilding,
  FaInfoCircle,
  FaUserTie,
  FaUniversity,
  FaFileInvoice,
} from "react-icons/fa";
import type { OrderAcceptance, OptionsType } from "./Services/types";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

interface PreviewModalProps {
  data: OrderAcceptance;
  options: OptionsType;
  onClose: () => void;
  onConfirm: () => void;
}

const OrderAcceptancePreviewModal: React.FC<PreviewModalProps> = ({
  data,
  options,
  onClose,
  onConfirm,
}) => {
  const [contactOptions, setContactOptions] = useState<any[]>([]);

  // Fetch contacts for the first offer's customer (simplified)
  useEffect(() => {
    const customerId = data.offers?.[0]?.customerId;
    if (customerId) {
      getCustomerContacts(customerId)
        .then(setContactOptions)
        .catch(() => setContactOptions([]));
    }
  }, [data.offers]);

  const getLabel = (list: any[] | undefined, id?: number | string | null) => {
    if (!list || id === undefined || id === null) return "N/A";
    const found = list.find((x) => Number(x.value) === Number(id));
    return found ? found.label : "N/A";
  };

  const formatCurrency = (value?: number, curSym?: string) => {
    const num = Number(value || 0);
    const symbol = curSym || "₹";
    return `${symbol} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Determine primary currency symbol from the first offer
  const primaryCurrencyId = data.offers?.[0]?.currencyId || 0;
  const selectedCurrency = options.currencies?.find(
    (c) => Number(c.value) === Number(primaryCurrencyId),
  );
  const curSym = selectedCurrency?.currencySymbol || "₹";

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
      <Icon className="text-[#154068]" />
      <h4 className="text-xs font-bold uppercase tracking-widest text-[#154068]">
        {title}
      </h4>
    </div>
  );

  const selectedCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.offers?.[0]?.companyId),
  );

  const selectedState = options.states?.find(
    (s: any) => Number(s.value) === Number(data.offers?.[0]?.placeOfSupplyId),
  );

  const billingState = (selectedCompany?.stateName || "").toLowerCase().trim();
  const supplyState = (selectedState?.label || "").toLowerCase().trim();

  const hasValidGstState = !!billingState && !!supplyState;

  const isIntraState = hasValidGstState && billingState === supplyState;

  const isINR = selectedCurrency?.label === "INR";

  const totalCGST =
    data.items?.reduce((s, i) => s + (i.cgstAmount || 0), 0) || 0;

  const totalSGST =
    data.items?.reduce((s, i) => s + (i.sgstAmount || 0), 0) || 0;

  const totalIGST =
    data.items?.reduce((s, i) => s + (i.igstAmount || 0), 0) || 0;

  const calculatedSubtotal =
    data.items?.reduce((s, item) => s + (item.total || 0), 0) || 0;
  const totalTax = totalCGST + totalSGST + totalIGST;
  const calculatedGrandTotal =
    calculatedSubtotal + totalTax + (data.freightCharges || 0);

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
          {/* ========== COMMON ORDER DETAILS ========== */}
          <div className="mb-8 border rounded-2xl bg-white shadow-sm p-6">
            <SectionHeader icon={FaFileInvoice} title="Common Order Details" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DataItem
                label="Gaxce Order No"
                value={data.gaxcePurchaseOrderNo}
              />
              <DataItem label="Customer PO No." value={data.customerOrderNo} />
              <DataItem
                label="Customer PO Date"
                value={
                  data.customerOrderDate
                    ? new Date(data.customerOrderDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <DataItem
                label="Order Date"
                value={
                  data.orderDate
                    ? new Date(data.orderDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <DataItem label="Status" value={data.status} />
              {/* <DataItem
                label="Next Follow-up"
                value={
                  data.nextFollowUpDate
                    ? new Date(data.nextFollowUpDate).toLocaleDateString()
                    : "N/A"
                }
              /> */}
              <div className="md:col-span-3">
                <DataItem
                  label="Internal Office Remarks"
                  value={data.customerNotes}
                />
              </div>
              <div className="md:col-span-3">
                <DataItem
                  label="Terms & Conditions"
                  value={data.termsConditions}
                />
              </div>
            </div>
          </div>

          {/* ========== OFFER DETAILS ========== */}
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
                {/* Parties & Group */}
                <div>
                  <SectionHeader icon={FaBuilding} title="Parties & Group" />
                  <DataItem
                    label="Customer Account"
                    value={getLabel(options.customers, offer.customerId)}
                  />
                  <DataItem
                    label="Billing Company"
                    value={getLabel(options.companies, offer.companyId)}
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

                {/* Ownership */}
                <div>
                  <SectionHeader icon={FaUserTie} title="Ownership" />
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

                {/* Logistics & Dates */}
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
                    value={
                      offer.bankDetailId
                        ? getLabel(options.banks, offer.bankDetailId)
                        : data.bankDetails
                          ? `${data.bankDetails.bankName} - ${data.bankDetails.accountNo}`
                          : "N/A"
                    }
                  />
                  <DataItem
                    label="Offer Date"
                    value={
                      offer.offerCreateDate
                        ? new Date(offer.offerCreateDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <DataItem
                    label="Expiry Date"
                    value={
                      offer.offerExpiryDate
                        ? new Date(offer.offerExpiryDate).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </div>
              </div>

              {/* Address & Notes */}
              <div className="mt-6">
                <SectionHeader icon={FaInfoCircle} title="Address & Notes" />
                <DataItem label="Delivery Address" value={offer.address} />
                <DataItem
                  label="Freight Charges"
                  value={formatCurrency(offer.freightCharges, curSym)}
                />
                <DataItem label="Customer Notes" value={offer.customerNotes} />
              </div>
            </div>
          ))}

          {/* ========== ITEMS TABLE ========== */}
          {/* <div className="bg-white rounded-2xl shadow-sm border overflow-hidden"> */}

          {!data.offers?.some((o: any) => o.source === "SERVICE") && (
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f07837] text-white">
                  <tr>
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4 min-w-[300px]">Item Configuration</th>
                    <th className="p-4 text-center w-20">Qty</th>
                    <th className="p-4 w-28 text-right">Rate</th>
                    <th className="p-4 w-20 text-right">Disc%</th>
                    <th className="p-4 w-28">HSN</th>
                    <th className="p-4 w-28 text-right">Tax %</th>
                    <th className="p-4 w-28 text-right">Base</th>
                    <th className="p-4 w-28 text-right">Tax</th>
                    <th className="p-4 text-right pr-8">Final Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items?.map((it: any, i) => {
                    const isAccessory = it.itemType === "Accessory";
                    const itemName = isAccessory
                      ? getLabel(options.accessories, it.accessoryId)
                      : getLabel(options.products, it.productId);

                    return (
                      <tr
                        key={i}
                        className={`border-b last:border-0 align-top ${
                          isAccessory ? "bg-purple-50/40" : ""
                        }`}
                      >
                        <td className="p-4 text-center font-bold text-slate-400">
                          {i + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${
                                isAccessory
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              {isAccessory ? "Paid Accessory" : "Product"}
                            </span>
                            {it.offerNo && (
                              <span className="text-[9px] font-black text-slate-400 uppercase">
                                Ref: {it.offerNo}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-[#154068] text-sm uppercase">
                            {itemName}
                          </div>
                          {!isAccessory && it.accessoryIds?.length > 0 && (
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
                          {it.description && (
                            <div className="text-[11px] text-slate-500 italic mt-3 bg-white/50 p-2 rounded border border-slate-100 shadow-sm">
                              {it.description}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center font-black text-slate-600">
                          {it.quantity}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-600">
                          {formatCurrency(it.rate, curSym)}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-600">
                          {it.discount || 0}%
                        </td>
                        <td className="p-4 font-medium text-slate-500">
                          {it.hsnSacCode || "—"}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-500">
                          {Number(it.taxPercentage || 0).toFixed(2)}%
                        </td>
                        <td className="p-4 text-right font-medium text-slate-500">
                          {formatCurrency(it.total, curSym)}
                        </td>
                        <td className="p-4 text-right font-medium text-slate-500">
                          {isINR ? (
                            isIntraState ? (
                              <>
                                <div>
                                  CGST: {formatCurrency(it.cgstAmount, curSym)}
                                </div>
                                <div>
                                  SGST: {formatCurrency(it.sgstAmount, curSym)}
                                </div>
                              </>
                            ) : (
                              <div>
                                IGST: {formatCurrency(it.igstAmount, curSym)}
                              </div>
                            )
                          ) : (
                            formatCurrency(it.gstAmount, curSym)
                          )}
                        </td>
                        <td className="p-4 text-right pr-8 font-black text-[#154068] text-base">
                          {formatCurrency(it.finalPrice, curSym)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* ========== FINANCIAL SUMMARY ========== */}
          <div className="mt-6 bg-[#f07837] text-white rounded-2xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs uppercase text-slate-300">Subtotal</p>
                <p className="text-lg font-mono">
                  {formatCurrency(calculatedSubtotal, curSym)}
                </p>
              </div>
              {isINR ? (
                isIntraState ? (
                  <>
                    <div>
                      <p className="text-xs uppercase text-emerald-400">
                        CGST (9%)
                      </p>
                      <p className="text-lg font-mono text-emerald-400">
                        {formatCurrency(totalCGST, curSym)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-emerald-400">
                        SGST (9%)
                      </p>
                      <p className="text-lg font-mono text-emerald-400">
                        {formatCurrency(totalSGST, curSym)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs uppercase text-emerald-400">
                      IGST (18%)
                    </p>
                    <p className="text-lg font-mono text-emerald-400">
                      {formatCurrency(totalIGST, curSym)}
                    </p>
                  </div>
                )
              ) : (
                <div>
                  <p className="text-xs uppercase text-slate-300">Tax</p>
                  {/* <p className="text-lg font-mono">
                    {formatCurrency(
                      data.items?.reduce((s, i) => s + (i.gstAmount || 0), 0),
                      curSym,
                    )}
                  </p> */}
                  <p className="text-lg font-mono">
                    {/* CHANGE: Using calculated total tax */}
                    {formatCurrency(totalTax, curSym)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase text-slate-300">Freight</p>
                <p className="text-lg font-mono">
                  {formatCurrency(data.freightCharges, curSym)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-300 font-bold">
                  Grand Total
                </p>
                <p className="text-2xl font-black">
                  {formatCurrency(calculatedGrandTotal, curSym)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end border-t border-slate-200 bg-white p-5 gap-3">
          <button onClick={onClose} className={buttonStyles.cancel}>
            Close Preview
          </button>
          <button onClick={onConfirm} className={buttonStyles.save}>
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderAcceptancePreviewModal;
