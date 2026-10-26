import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  FaFileAlt,
  FaPlus,
  FaTrash,
  FaSync,
  FaTimes,
  FaBoxOpen,
  FaHashtag,
  FaCalendarDay,
} from "react-icons/fa";
import Select from "react-select";

import type {
  ServiceReport,
  ServiceReportItem,
  SelectOption,
} from "./Serivces/types";
import { getOAById } from "../OrderAcceptance/Services/OrderAcceptanceService";
import {
  createServiceReport,
  updateServiceReport,
  getAllCustomers,
  getAllProducts,
  getAccessories,
} from "./Serivces/ServiceReportService";

import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { getFinalServiceOAs } from "../PurchaseOrder/Services/PurchaseOrderService";

interface FormProps {
  editData: ServiceReport | null;
  isCreatingFromOffer: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialData: ServiceReport = {
  id: 0,
  reportNo: "",
  date: new Date().toISOString().slice(0, 10),
  orderAcceptanceId: 0,
  customerId: 0,
  customerName: "",
  productId: 0,
  productName: "",
  accessoryId: 0,
  itemType: "Product",
  serialNumber: "",
  inspectionSummary: "",
  softwareCheck: "",
  portTesting: "",
  firmwareCheck: "",
  physicalInspection: "",
  icReplacement: "",
  finalComments: "",
  uploadedFiles: "",
  customerReported: "",
  reportFiles: [],
  items: [],
};

const ServiceReportForm: React.FC<FormProps> = ({
  editData,
  isCreatingFromOffer,
  onSuccess,
  onCancel,
}) => {
  const labelStyle =
    "text-[11px] font-extrabold text-gray-500 uppercase mb-1 tracking-widest";
  const inputStyle =
    "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  const [data, setData] = useState<ServiceReport>(initialData);
  const [customers, setCustomers] = useState<any[]>([]);
  const [offers, setOffers] = useState<SelectOption[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<SelectOption | null>(null);

  const [formReady, setFormReady] = useState(
    !isCreatingFromOffer || !!editData,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

  const [isWithoutPO, setIsWithoutPO] = useState(false);
  const [isManualCreatedReport, setIsManualCreatedReport] = useState(false);
  const isManualMode = isWithoutPO || isManualCreatedReport;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [c] = await Promise.all([
          getAllCustomers(),
          getAllProducts(),
          getAccessories(),
        ]);
        setCustomers(c);
        if (isCreatingFromOffer && !editData) {
          const oaList = await getFinalServiceOAs();
          setOffers(
            oaList.map((x: any) => ({
              value: x.value,
              label: x.label || `OA-${x.value}`,
            })),
          );
        }
      } catch {
        toast.error("Failed to load lists.");
      }
    };
    loadData();
  }, [isCreatingFromOffer, editData]);

  useEffect(() => {
    if (editData) {
      setData({
        ...editData,
        date: editData.date
          ? new Date(editData.date).toISOString().slice(0, 10)
          : "",
        reportFiles: [],
        items: editData.items
          ? editData.items.map((item) => ({
              ...item,
              itemType:
                item.itemType === "Service"
                  ? "Service"
                  : item.itemType === "Accessory"
                    ? "Accessory"
                    : "Product",
            }))
          : [],
      });

      // ✅ Detect Manual vs OA Report
      const isManualReport =
        (!editData.orderAcceptanceId || editData.orderAcceptanceId === 0) &&
        (!editData.items ||
          editData.items.every(
            (x) =>
              !x.hsnSacCode &&
              (x.quantity === 1 || !x.quantity) &&
              (x.rate === 0 || !x.rate),
          ));

      setIsManualCreatedReport(isManualReport);
      setIsWithoutPO(false);

      setFormReady(true);
    } else {
      setData(initialData);
    }
  }, [editData]);

  const handleSyncOffer = async () => {
    if (!selectedOffer) return toast.warning("Select OA.");
    setIsLoading(true);
    try {
      const oa = await getOAById(selectedOffer.value);
      const items: ServiceReportItem[] = (oa.items || []).map((i: any) => {
        const itemType = String(i.itemType || i.ItemType || "").toLowerCase();

        const productId = Number(i.productId || i.ProductId || 0);
        const accessoryId = Number(i.accessoryId || i.AccessoryId || 0);

        const sourceServiceId = i.serviceId || i.ServiceId;
        const serviceId = sourceServiceId ? Number(sourceServiceId) : null;

        const isService =
          itemType === "service" || (serviceId !== null && serviceId > 0);
        const isAccessory =
          itemType === "accessory" ||
          (accessoryId > 0 && productId === 0 && !isService);

        return {
          itemType: isService
            ? "Service"
            : isAccessory
              ? "Accessory"
              : "Product",

          productId: isService || isAccessory ? 0 : productId,
          accessoryId: isAccessory ? accessoryId : 0,

          serviceId: isService ? serviceId : null,
          servicePartNo: isService
            ? i.servicePartNo || i.ServicePartNo || i.partNo || i.PartNo || null
            : null,

          description: i.description ?? i.Description ?? "",
          // hsnSacCode: isService ? null : i.hsnSacCode || i.HsnSacCode || null,
          hsnSacCode: i.hsnSacCode || i.HsnSacCode || "",
          quantity: i.quantity ?? i.Quantity ?? 1,
          rate: i.rate ?? i.Rate ?? 0,
          total: i.total ?? i.Total ?? 0,
          finalPrice: i.finalPrice ?? i.FinalPrice ?? 0,
          discount: i.discount ?? i.Discount ?? 0,
          taxPercentage: i.taxPercentage ?? i.TaxPercentage ?? 0,
          gstTax: i.gstAmount ?? i.GstAmount ?? 0,
        };
      });

      const firstItemType = (items[0]?.itemType || "Product") as
        | "Product"
        | "Accessory"
        | "Service";

      setData((prev) => ({
        ...prev,
        items,
        orderAcceptanceId: selectedOffer.value,
        customerId: oa.customerId ?? 0,
        customerName: oa.customerName ?? "",
        finalComments: oa.customerNotes ?? "",
        productId: items[0]?.productId || 0,
        accessoryId: items[0]?.accessoryId || 0,
        itemType: firstItemType,
      }));
      setIsWithoutPO(false);
      setIsManualCreatedReport(false);
      setFormReady(true);
      toast.success("OA details imported.");
    } catch {
      toast.error("Sync failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // CHANGE: Add handler for manual creation
  const handleCreateWithoutPO = () => {
    setIsWithoutPO(true);
    setIsManualCreatedReport(false);
    setFormReady(true);
    setData(initialData); // Ensure form starts fresh
    toast.info("Creating a new service report manually.");
  };

  const addItemRow = (type: "Product" | "Accessory") => {
    const newItem: ServiceReportItem = {
      itemType: type,
      productId: 0,
      accessoryId: 0,
      description: "",
      hsnSacCode: "",
      quantity: 1, // Default quantity, will be hidden but saved
      rate: 0,
      total: 0,
      finalPrice: 0,
    };
    setData((prev) => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const updateItem = (idx: number, updates: Partial<ServiceReportItem>) => {
    setData((prev) => {
      const newItems = [...(prev.items || [])];
      const item = { ...newItems[idx], ...updates };
      const total = (item.quantity || 0) * (item.rate || 0);

      newItems[idx] = {
        ...item,
        total,
        finalPrice: total,
      } as ServiceReportItem;
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async () => {
    if (!data.customerId) return toast.error("Select customer.");

    const saveAction = async () => {
      // Find the first product item in the list
      const firstProductItem = data.items?.find(
        (item) => item.itemType === "Product",
      );

      const firstAccessoryItem = data.items?.find(
        (item) => item.itemType === "Accessory",
      );

      const payload = {
        id: data.id,
        date: data.date,
        orderAcceptanceId: data.orderAcceptanceId ?? 0,
        customerId: data.customerId,
        customerName: data.customerName, // ADD THIS
        uploadedFiles: data.uploadedFiles ?? "", // ADD THIS
        itemType: data.itemType, // ADD THIS
        productId: firstProductItem?.productId ?? null,
        accessoryId: firstAccessoryItem?.accessoryId ?? null,
        serialNumber: data.serialNumber,
        inspectionSummary: data.inspectionSummary,
        softwareCheck: data.softwareCheck,
        portTesting: data.portTesting,
        firmwareCheck: data.firmwareCheck,
        physicalInspection: data.physicalInspection,
        icReplacement: data.icReplacement,
        finalComments: data.finalComments,
        customerReported: data.customerReported ?? "",
        items: (data.items || []).map((i) => ({
          ...i,
          productId:
            i.itemType === "Product" && i.productId && i.productId > 0
              ? i.productId
              : null,
          accessoryId:
            i.itemType === "Accessory" && i.accessoryId && i.accessoryId > 0
              ? i.accessoryId
              : null,
          serviceId:
            i.itemType === "Service" && i.serviceId && i.serviceId > 0
              ? i.serviceId
              : null,
          servicePartNo:
            i.itemType === "Service" ? i.servicePartNo || null : null,
          // hsnSacCode: i.itemType === "Service" ? "" : i.hsnSacCode || "",
          hsnSacCode: i.hsnSacCode || "",
        })),
        reportFiles: data.reportFiles,
        filesToDelete: filesToDelete,
      };

      if (data.id) {
        await updateServiceReport(data.id, payload);
      } else {
        await createServiceReport(payload);
      }
    };

    toast.promise(saveAction(), {
      loading: "Saving report...",
      success: () => {
        onSuccess();
        return "Saved successfully!";
      },
      error: (err) => `Error: ${err.message || "Failed to save"}`,
    });
  };
  useEffect(() => {
    const urls = (data.reportFiles || []).map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [data.reportFiles]);

  const removeNewFile = (index: number) => {
    setData((prev) => ({
      ...prev,
      reportFiles: prev.reportFiles?.filter((_, i) => i !== index),
    }));
  };

  const deleteExistingFile = (file: string) => {
    setFilesToDelete((prev) => [...prev, file]);
    setData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles
        ?.split(";")
        .filter((f) => f !== file)
        .join(";"),
    }));
  };

  const isServiceReport =
    data.items?.some((x) => x.itemType === "Service") ||
    (data.orderAcceptanceId ?? 0) > 0;

  return (
    <div className="bg-[#f8fafc] rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-visible max-h-[90vh] overflow-y-auto">
      <div className="bg-[#f07837] p-5 flex justify-between items-center sticky top-0 z-30 text-white">
        <div className="flex items-center gap-2">
          <FaBoxOpen className="text-blue-400" />
          <h2 className="text-lg font-bold uppercase tracking-tight">
            Service Report Workspace
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="bg-white/10 hover:bg-rose-600 px-6 py-2 rounded-xl border border-white/20 text-[11px] font-bold uppercase transition"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-6 space-y-6">
        {!formReady && isCreatingFromOffer && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 shadow-inner text-center">
            <label className="mb-3 block text-[11px] font-black uppercase text-blue-900 tracking-widest">
              Import from Approved Order Acceptance
            </label>
            <div className="flex gap-2 max-w-xl mx-auto">
              <Select
                className="flex-1"
                options={offers}
                value={selectedOffer}
                onChange={setSelectedOffer}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
              <button
                onClick={handleSyncOffer}
                disabled={isLoading}
                className="bg-[#f07837] text-white px-6 rounded-xl hover:bg-blue-800 transition flex items-center gap-2"
              >
                <FaSync className={isLoading ? "animate-spin" : ""} /> Sync
              </button>
            </div>

            <div className="my-6 flex items-center justify-center gap-4">
              <hr className="w-1/4 border-slate-300" />
              <span className="text-xs font-bold text-slate-400">OR</span>
              <hr className="w-1/4 border-slate-300" />
            </div>

            <button
              onClick={handleCreateWithoutPO}
              className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition font-bold uppercase text-sm tracking-wider"
            >
              Create Manually
            </button>
          </div>
        )}

        {formReady && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <label className={labelStyle}>
                  <FaCalendarDay className="inline mr-1" /> Report Date
                </label>
                <input
                  type="date"
                  className={inputStyle}
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                />
              </div>
              <div>
                <label className={labelStyle}>
                  <FaHashtag className="inline mr-1" /> Customer
                </label>
                <Select
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.customerName,
                  }))}
                  value={
                    customers
                      .map((c) => ({ value: c.id, label: c.customerName }))
                      .find((c) => c.value === data.customerId) || null
                  }
                  onChange={(o: any) =>
                    setData({
                      ...data,
                      customerId: o?.value,
                      customerName: o?.label,
                    })
                  }
                  styles={{
                    menu: (base) => ({
                      ...base,
                      zIndex: 50, // Higher than the table header's z-20
                    }),
                  }}
                />
              </div>
              <div>
                <label className={labelStyle}>Primary Serial Number</label>
                <input
                  className={inputStyle}
                  placeholder="SN-..."
                  value={data.serialNumber}
                  onChange={(e) =>
                    setData({ ...data, serialNumber: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-4xl border border-slate-200 bg-white overflow-visible shadow-xl">
                <div ref={scrollContainerRef} className="overflow-auto">
                  {/* CHANGE: Dynamic min-width for the table */}
                  <table
                    className={`w-full text-left ${
                      isManualMode
                        ? "min-w-[650px]"
                        : "table-fixed min-w-[1100px]"
                    }`}
                  >
                    <thead className="bg-[#f07837] text-white text-[10px] font-black uppercase tracking-widest sticky top-0 z-20">
                      <tr>
                        <th className="w-7 px-1 py-2 text-center">#</th>
                        {/* CHANGE: Dynamic width for description column */}
                        <th
                          className={`py-3 px-2 ${
                            isManualMode ? "w-auto" : "w-[40%]"
                          }`}
                        >
                          Item Description
                        </th>
                        {!isManualMode && (
                          <th className="p-5 w-28 text-center">HSN/SAC</th>
                        )}
                        {/* CHANGE: Conditionally render pricing columns */}
                        {!isManualMode && (
                          <>
                            <th className="p-5 w-24 text-center">Qty</th>
                            <th className="p-5 w-32 text-right">Rate</th>
                            <th className="p-5 w-36 text-right">Final Amt</th>
                          </>
                        )}
                        <th className="w-9 px-1 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.items || []).map((item, i) => (
                        <tr key={i} className="border-b hover:bg-slate-50">
                          <td className="w-7 px-0 py-2 text-center font-bold text-slate-400 border-r align-top">
                            {" "}
                            {i + 1}
                          </td>
                          <td className="px-2 py-2 border-r align-top">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                item.itemType === "Service"
                                  ? "bg-orange-100 text-orange-700"
                                  : item.itemType === "Accessory"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.itemType}
                            </span>

                            {/* --- FIX: Show dropdowns ONLY in manual mode --- */}
                            {isManualMode ? (
                              <>
                                <textarea
                                  className="w-full rounded-lg border px-2 py-1 text-sm h-10 resize-none bg-slate-50"
                                  placeholder="Enter Item Description..."
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(i, {
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </>
                            ) : (
                              // For Synced/Edit mode, just show the description
                              <textarea
                                className="w-full rounded-xl border p-2 text-xs h-16 bg-slate-50"
                                value={item.description}
                                onChange={(e) =>
                                  updateItem(i, { description: e.target.value })
                                }
                              />
                            )}
                          </td>
                          {!isManualMode && (
                            <td className="p-4 border-r">
                              <input
                                className={`${inputStyle} text-center`}
                                value={item.hsnSacCode || ""}
                                onChange={(e) =>
                                  updateItem(i, { hsnSacCode: e.target.value })
                                }
                              />
                            </td>
                          )}
                          {/* CHANGE: Conditionally render pricing cells */}
                          {!isManualMode && (
                            <>
                              <td className="p-4 border-r">
                                <input
                                  type="number"
                                  className={`${inputStyle} text-center font-bold`}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(i, {
                                      quantity: Number(e.target.value),
                                    })
                                  }
                                />
                              </td>
                              <td className="p-4 border-r">
                                <input
                                  type="number"
                                  className={`${inputStyle} text-right font-bold`}
                                  value={item.rate}
                                  onChange={(e) =>
                                    updateItem(i, {
                                      rate: Number(e.target.value),
                                    })
                                  }
                                />
                              </td>
                              <td className="p-4 text-right font-mono text-lg font-black text-[#154068] border-r">
                                ₹ {(item.finalPrice || 0).toLocaleString()}
                              </td>
                            </>
                          )}
                          <td className="w-7 p-1 text-center align-top">
                            <button
                              onClick={() =>
                                setData({
                                  ...data,
                                  items: data.items?.filter(
                                    (_, idx) => idx !== i,
                                  ),
                                })
                              }
                              className="text-red-400 hover:text-red-600"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50 border-t flex gap-4">
                  {isManualMode ? (
                    <button
                      type="button"
                      onClick={() => addItemRow("Product")}
                      className={buttonStyles.addmore}
                    >
                      + Add Item
                    </button>
                  ) : !isServiceReport ? (
                    <>
                      <button
                        type="button"
                        onClick={() => addItemRow("Product")}
                        className={buttonStyles.addmore}
                      >
                        + Add Product
                      </button>

                      <button
                        type="button"
                        onClick={() => addItemRow("Accessory")}
                        className={buttonStyles.addmore}
                      >
                        + Add Paid Accessory
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-4xl border border-slate-200 shadow-sm">
              {[
                { label: "Inspection Summary", name: "inspectionSummary" },
                { label: "Software Check", name: "softwareCheck" },
                { label: "Port Testing", name: "portTesting" },
                { label: "Firmware Check", name: "firmwareCheck" },
                { label: "Physical Inspection", name: "physicalInspection" },
                { label: "IC Replacement", name: "icReplacement" },
                { label: "Final Comments", name: "finalComments" },
                {
                  label: "Customer Reported Problem",
                  name: "customerReported",
                },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className={labelStyle}>{field.label}</label>
                  <textarea
                    name={field.name}
                    value={(data as any)[field.name] || ""}
                    onChange={(e) =>
                      setData({ ...data, [e.target.name]: e.target.value })
                    }
                    rows={3}
                    className={inputStyle + " h-24 pt-2"}
                  />
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-4xl border border-slate-200 shadow-sm">
              <label className={labelStyle}>Report Attachments / Photos</label>
              <div className="flex gap-4 overflow-x-auto py-4">
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition shrink-0">
                  <FaPlus className="text-slate-400" />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files)
                        setData({
                          ...data,
                          reportFiles: [
                            ...(data.reportFiles || []),
                            ...Array.from(e.target.files),
                          ],
                        });
                    }}
                  />
                </label>
                {previews.map((u, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 border rounded-2xl overflow-hidden shrink-0 group"
                  >
                    <img
                      src={u}
                      className="w-full h-full object-cover"
                      alt="new"
                    />
                    <button
                      onClick={() => removeNewFile(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
                {data.uploadedFiles
                  ?.split(";")
                  .filter(Boolean)
                  .map((f, i) => (
                    <div
                      key={`old-${i}`}
                      className="relative w-24 h-24 border rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group"
                    >
                      <FaFileAlt className="text-slate-300 text-2xl" />
                      <button
                        onClick={() => deleteExistingFile(f)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTrash size={10} />
                      </button>
                      <div className="absolute bottom-0 w-full bg-slate-800/50 text-white text-[8px] text-center">
                        SAVED
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 sticky bottom-0 bg-[#f8fafc] py-4 border-t">
              <button
                onClick={onCancel}
                className={buttonStyles.cancel + " px-10 h-12"}
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                className={buttonStyles.save + " px-10 h-12"}
              >
                Save Service Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ServiceReportForm;
