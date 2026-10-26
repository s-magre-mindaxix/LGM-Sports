import React, { useEffect, useState } from "react";
import {
  FaTimes,
  FaFileInvoiceDollar,
  FaInfoCircle,
  FaBuilding,
  FaMapMarkerAlt,
  FaHistory,
  FaClipboardList,
  FaShieldAlt,
} from "react-icons/fa";
import type { Enquiry } from "./Services/types";
import { getCustomerContacts } from "./Services/EnquiryService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
  data: Enquiry;
  options: any;
  onClose: () => void;
}

const EnquiryViewModal: React.FC<ViewModalProps> = ({
  data,
  options,
  onClose,
}) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const selectedCurrency = options.currencies?.find(
    (c: any) => c.value === data.currencyId,
  );
  const curSym = selectedCurrency?.currencySymbol || "₹";

  const selectedBillingCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.companyId),
  );

  const selectedPlaceOfSupply = options.states?.find(
    (s: any) => Number(s.value) === Number(data.placeOfSupplyId),
  );

  const billingStateName = (selectedBillingCompany?.stateName || "")
    .trim()
    .toLowerCase();

  const placeOfSupplyStateName = (selectedPlaceOfSupply?.label || "")
    .trim()
    .toLowerCase();

  const hasValidGstState = !!billingStateName && !!placeOfSupplyStateName;

  const isIntraState =
    hasValidGstState && billingStateName === placeOfSupplyStateName;

  const totalTax = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.gstAmount || 0),
    0,
  );

  const totalCgst = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.cgstAmount || 0),
    0,
  );

  const totalSgst = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.sgstAmount || 0),
    0,
  );

  const totalIgst = data.items?.reduce(
    (sum: number, item: any) => sum + Number(item.igstAmount || 0),
    0,
  );

  useEffect(() => {
    if (data.customerId) {
      getCustomerContacts(data.customerId)
        .then((res) => setContacts(res))
        .catch((err) =>
          console.error("Error fetching contacts for view:", err),
        );
    }
  }, [data.customerId]);

  const getLabel = (list: any[], id?: number | string) => {
    if (!list || !id) return "N/A";
    const found = list.find((x: any) => x.value === id);
    return found ? found.label : "N/A";
  };

  const formatCurrency = (value?: number) => {
    const num = Number(value || 0);
    return `${curSym} ${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  const formatEntryType = (type?: string) => {
    switch (type) {
      case "SERVICE":
        return "Service Order";
      case "VERBAL":
        return "Verbal Entry";
      case "ENQUIRY":
      default:
        return "Standard Enquiry";
    }
  };
  const DataItem = ({
    label,
    value,
    highlight = false,
    dark = false,
  }: {
    label: string;
    value?: React.ReactNode;
    highlight?: boolean;
    dark?: boolean;
  }) => (
    <div
      className={`py-3 last:border-b-0 ${dark ? "border-b border-white/20" : "border-b border-slate-100"}`}
    >
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-slate-300" : "text-slate-400"}`}
      >
        {label}
      </p>
      <p
        className={`mt-1 wrap-break-word text-sm font-semibold ${highlight ? "text-emerald-400" : dark ? "text-white" : "text-slate-800"}`}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  const SectionHeader = ({
    icon: Icon,
    title,
    dark = false,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    dark?: boolean;
  }) => (
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

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sx">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white md:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-white p-3 text-slate-900">
              <FaFileInvoiceDollar size={26} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold  tracking-wide md:text-2xl">
                Enquiry: {data.enquiryNo || "Draft"}
              </h2>
              <p className="mt-1 text-xs text-slate-200">
                {new Date(data.offerDate).toLocaleDateString()} to{" "}
                {new Date(data.expiryDate).toLocaleDateString()} | Status:{" "}
                {data.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/10 p-2 transition hover:bg-white/20"
            aria-label="Close"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 p-5 text-left md:p-7">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Enquiry Details" />
              {/* <DataItem label="Enquiry ID" value={data.enquiryId} /> */}
              <DataItem label="Enquiry No" value={data.enquiryNo} />
              <DataItem
                label="Enquiry Type"
                value={formatEntryType(data.entryType)}
              />
              {data.entryType === "SERVICE" && (
                <DataItem
                  label="Service Description"
                  value={data.serviceDescription}
                />
              )}
              <DataItem
                label="Offer Date"
                value={new Date(data.offerDate).toLocaleDateString()}
              />
              <DataItem
                label="Expiry Date"
                value={new Date(data.expiryDate).toLocaleDateString()}
              />
              <DataItem label="Status" value={data.status} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaBuilding} title="Parties & Grouping" />
              <DataItem
                label="Customer"
                value={getLabel(options.customers, data.customerId)}
              />
              <DataItem
                label="Responsible Person"
                value={getLabel(contacts, data.responsiblePersonId)}
              />
              <DataItem
                label="Vendor"
                value={getLabel(options.vendors, data.vendorId)}
              />
              <DataItem
                label="Billing Company"
                value={getLabel(options.companies, data.companyId)}
              />
              <DataItem
                label="Product Group"
                value={getLabel(options.groups, data.productGroupId)}
              />
              <DataItem
                label="Company Group"
                value={getLabel(options.companyGroups, data.companyGroupId)}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader
                icon={FaMapMarkerAlt}
                title="Assignment & Logistics"
              />
              <DataItem
                label="Assigned To"
                value={getLabel(
                  options.employees,
                  data.assignedToEmployeeId ?? undefined,
                )}
              />
              <DataItem
                label="Place of Supply"
                value={getLabel(options.states, data.placeOfSupplyId)}
              />
              <DataItem
                label="Currency"
                value={getLabel(options.currencies, data.currencyId)}
              />
              {/* <DataItem
                label="Bank Details"
                value={getLabel(bankOptions, data.bankDetailId)}
              /> */}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#f07837] p-5 text-white shadow-sm">
              <SectionHeader
                icon={FaFileInvoiceDollar}
                title="Financial Summary"
                dark
              />
              <DataItem
                label="Subtotal"
                value={formatCurrency(data.subtotal)}
                dark
              />
              {selectedCurrency?.label === "INR" ||
              selectedCurrency?.currencySymbol === "₹" ? (
                hasValidGstState ? (
                  isIntraState ? (
                    <>
                      <DataItem
                        label="CGST (9%)"
                        value={formatCurrency(totalCgst)}
                        dark
                      />
                      <DataItem
                        label="SGST (9%)"
                        value={formatCurrency(totalSgst)}
                        dark
                      />
                    </>
                  ) : (
                    <DataItem
                      label="IGST (18%)"
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
                )
              ) : (
                <DataItem
                  label="Tax Amount"
                  value={formatCurrency(totalTax)}
                  dark
                />
              )}
              <DataItem
                label="Freight Charges"
                value={formatCurrency(data.freightCharges)}
                dark
              />
              <DataItem
                label="Grand Total"
                value={formatCurrency(data.grandTotal)}
                highlight
                dark
              />
            </div>
          </div>

          <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#f07837] text-[13px]  tracking-wide text-slate-100">
                <tr>
                  <th className="w-12 border-r border-slate-700 p-3 text-center">
                    #
                  </th>
                  <th className="min-w-[260px] border-r border-slate-700 p-3">
                    Product & Accessories
                  </th>
                  <th className="w-24 border-r border-slate-700 p-3 text-center">
                    Image
                  </th>
                  <th className="w-20 border-r border-slate-700 p-3 text-center">
                    Qty
                  </th>
                  <th className="w-28 border-r border-slate-700 p-3 text-right">
                    Rate
                  </th>
                  <th className="w-20 border-r border-slate-700 p-3 text-right">
                    Tax %
                  </th>
                  <th className="w-28 border-r border-slate-700 p-3 text-right">
                    Base
                  </th>
                  <th className="w-40 border-r border-slate-700 p-3 text-right">
                    Tax Breakup
                  </th>
                  <th className="w-32 p-3 text-right">Final</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {data.items.map((it: any, i: number) => {
                  // const isAccessory =
                  //   it.itemType === "Accessory" ||
                  //   (!!it.accessoryId && !it.productId);
                  // const itemMaster = isAccessory
                  //   ? options.accessories?.find(
                  //       (a: any) => a.value === it.accessoryId,
                  //     )
                  //   : options.products?.find(
                  //       (p: any) => p.value === it.productId,
                  //     );

                  // const itemName = itemMaster ? itemMaster.label : "N/A";
                  // const itemImage =
                  //   itemMaster?.image || itemMaster?.productImage;

                  const isService = it.itemType === "Service";

                  const isAccessory =
                    it.itemType === "Accessory" ||
                    (!!it.accessoryId && !it.productId && !isService);

                  const itemMaster = isService
                    ? null
                    : isAccessory
                      ? options.accessories?.find(
                          (a: any) => a.value === it.accessoryId,
                        )
                      : options.products?.find(
                          (p: any) => p.value === it.productId,
                        );

                  const itemName = isService
                    ? it.servicePartNo || data.serviceDescription || "Service"
                    : itemMaster
                      ? itemMaster.label
                      : "N/A";

                  const itemImage = isService
                    ? null
                    : itemMaster?.image || itemMaster?.productImage;

                  return (
                    <tr
                      key={i}
                      className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50/80"
                    >
                      <td className="border-r border-slate-100 bg-slate-50 p-3 text-center font-semibold">
                        {i + 1}
                      </td>
                      <td className="border-r border-slate-100 p-3">
                        {/* Type Badge */}
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${
                              isService
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
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
                        <p className="font-bold text-slate-900 text-base">
                          {itemName}
                        </p>

                        {/* Free Accessories (Only for Products) */}
                        {!isAccessory && !isService && (
                          <div className="mt-2">
                            {it.accessoryIds?.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {it.accessoryIds.map(
                                  (id: number, idx: number) => (
                                    <span
                                      key={idx}
                                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-slate-500"
                                    >
                                      {getLabel(options.accessories, id)}
                                    </span>
                                  ),
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] font-medium text-slate-400 italic">
                                No linked accessories
                              </span>
                            )}
                          </div>
                        )}

                        {/* Description */}
                        {it.description ? (
                          <div className="mt-3 rounded-lg border border-slate-200 bg-white/50 p-2 text-xs italic text-slate-600 shadow-sm">
                            {it.description}
                          </div>
                        ) : null}
                      </td>
                      <td className="border-r border-slate-100 p-3">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                          {itemImage ? (
                            <img
                              src={`${FILE_BASE_URL}${itemImage}`}
                              className="h-full w-full object-contain"
                              alt={itemName}
                            />
                          ) : (
                            <FaClipboardList
                              className="text-slate-200"
                              size={20}
                            />
                          )}
                        </div>
                      </td>
                      <td className="border-r border-slate-100 p-3 text-center font-semibold">
                        {it.quantity}
                      </td>
                      <td className="border-r border-slate-100 p-3 text-right font-medium">
                        {formatCurrency(it.rate)}
                      </td>
                      <td className="border-r border-slate-100 p-3 text-right font-medium">
                        {Number(it.taxPercentage || 0).toFixed(2)}%
                      </td>
                      <td className="border-r border-slate-100 p-3 text-right font-medium">
                        {formatCurrency(it.total)}
                      </td>
                      <td className="border-r border-slate-100 p-3 text-right font-medium">
                        {selectedCurrency?.label === "INR" ||
                        selectedCurrency?.currencySymbol === "₹" ? (
                          hasValidGstState ? (
                            isIntraState ? (
                              <div className="space-y-1 text-xs">
                                <div>CGST: {formatCurrency(it.cgstAmount)}</div>
                                <div>SGST: {formatCurrency(it.sgstAmount)}</div>
                              </div>
                            ) : (
                              <div className="text-xs">
                                IGST: {formatCurrency(it.igstAmount)}
                              </div>
                            )
                          ) : (
                            <div className="text-xs">
                              {formatCurrency(it.gstAmount)}
                            </div>
                          )
                        ) : (
                          <div className="text-xs">
                            {formatCurrency(it.gstAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-semibold text-slate-900">
                        {formatCurrency(it.finalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaShieldAlt} title="Terms & Conditions" />
              <p className="whitespace-pre-line text-sm text-slate-600">
                {data.termsConditions || "N/A"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader icon={FaInfoCircle} title="Customer Notes" />
              <p className="whitespace-pre-line text-sm italic text-slate-600">
                {data.customerNotes || "N/A"}
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
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
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

        <div className="flex justify-end border-t border-slate-200 bg-white p-5">
          <button onClick={onClose} className={buttonStyles.cancel}>
            Close View
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryViewModal;
