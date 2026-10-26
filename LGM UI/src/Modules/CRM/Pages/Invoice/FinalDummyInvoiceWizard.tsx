import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaClone, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import Select from "react-select";
import type {
  FinalDummyInvoice,
  FinalDummyInvoiceItem,
} from "./Services/types"; // Make sure these types match your data structure
import { saveFinalDummyInvoice } from "./Services/InvoiceService";
import { getBanksByCompanyId } from "../Company/Services/CompanyService";
import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";


// Styled InfoDisplay for read-only fields (Copied from DummyInvoiceWizard)
const InfoDisplay = ({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) => (
  <div>
    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {label}
    </label>
    <div className="flex h-10 w-full items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
      {value || "..."}
    </div>
  </div>
);

// Creates a new item with the correct structure for FinalDummyInvoiceItem
const createNewItem = (): FinalDummyInvoiceItem => ({
  _id: crypto.randomUUID(),
  itemType: "Product",
  productId: null,
  accessoryId: null,
  description: "",
  hsnSacCode: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  taxPercentage: 18,
  total: 0,
  gstAmount: 0, // Correct property name
  price: 0,
});

const FinalDummyInvoiceWizard = ({
  initialData,
  onCancel,
  onSuccess,
}: {
  initialData: FinalDummyInvoice;
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const [data, setData] = useState<FinalDummyInvoice>({
    ...initialData,
    items: initialData.items.map((item) => ({
      ...item,
      _id: crypto.randomUUID(), // Assign a unique frontend ID for list rendering
    })),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [companyBanks, setCompanyBanks] = useState<any[]>([]);
  const options = useEnquiryOptions();

  // Load Banks when component mounts with a companyId
  useEffect(() => {
    if (data.companyId) {
      getBanksByCompanyId(data.companyId).then((res) => {
        const formatted = res.map((b: any) => ({
          value: b.bankDetailId,
          label: `${b.bankName} - ${b.accountNo}`,
        }));
        setCompanyBanks(formatted);
      });
    }
  }, [data.companyId]);

  // Recalculate all totals when items or freight change
  useEffect(() => {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const totalGst = data.items.reduce((sum, item) => sum + item.gstAmount, 0); // Use gstAmount
    const freight = Number(data.freightCharges) || 0; // Use freightCharges

    setData((prev) => ({
      ...prev,
      subTotal: subtotal, // Use subTotal
      totalGstAmount: totalGst,
      grandTotal: subtotal + totalGst + freight,
    }));
  }, [data.items, data.freightCharges]);

  // Handle changes in any line item input
  const handleItemChange = (
    id: string,
    field: keyof FinalDummyInvoiceItem,
    value: string | number,
  ) => {
    const updatedItems = data.items.map((item) => {
      if (item._id === id) {
        const updatedItem = { ...item, [field]: value };
        const qty = Number(updatedItem.quantity) || 0;
        const rate = Number(updatedItem.rate) || 0;
        const discount = Number(updatedItem.discount) || 0;
        const taxPerc = Number(updatedItem.taxPercentage) || 0;

        // Recalculate totals for the specific item
        const total = qty * rate - discount;
        const gstAmount = total * (taxPerc / 100); // Use gstAmount
        const price = total + gstAmount;

        return { ...updatedItem, total, gstAmount, price };
      }
      return item;
    });
    setData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddItem = () => {
    setData((prev) => ({ ...prev, items: [...prev.items, createNewItem()] }));
  };

  const handleRemoveItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item._id !== id),
    }));
  };

  const handleSave = async () => {
    if (data.items.length === 0)
      return toast.error("Cannot save an invoice with no items.");
    if (!data.bankDetailId)
      return toast.error("Bank Details must be selected.");
    if (!data.consigneeNameAddress)
      // Use consigneeNameAddress
      return toast.error("Consignee Name & Address is required.");

    setIsSaving(true);
    try {
      await saveFinalDummyInvoice(data);
      toast.success("Dummy Invoice saved successfully!");
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save dummy invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to find display labels for IDs from options
  const getLabel = (list: any[], value: number | null | undefined) =>
    list?.find((x) => Number(x.value) === Number(value))?.label || "N/A";

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 bg-teal-800 px-6 py-5 text-white">
        <h2 className="flex items-center gap-3 text-lg font-semibold">
          <FaClone /> Create Dummy Invoice
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:bg-red-700"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        {/* --- HEADER INFO GRID (Mostly READ ONLY) --- */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
          <InfoDisplay label="Invoice No" value={data.originalInvoiceNo} />
          <InfoDisplay
            label="Group"
            value={getLabel(options.groups, data.productGroupId)}
          />
          <InfoDisplay
            label="Company"
            value={getLabel(options.companies, data.companyId)}
          />
          <InfoDisplay
            label="Vendor"
            value={getLabel(options.vendors, data.vendorId)}
          />
          <InfoDisplay
            label="Company Group"
            value={getLabel(options.companyGroups, data.companyGroupId)}
          />
          <InfoDisplay label="Customer" value={data.customerName} />
          <InfoDisplay
            label="Currency"
            value={getLabel(options.currencies, data.currencyId)}
          />
          <InfoDisplay
            label="Place of Supply"
            value={getLabel(options.states, data.placeOfSupplyId)}
          />

          {/* --- EDITABLE HEADER FIELD --- */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Bank Details <span className="text-red-500">*</span>
            </label>
            <Select
              options={companyBanks}
              value={companyBanks?.find(
                (b) => Number(b.value) === Number(data.bankDetailId),
              )}
              onChange={(opt: any) =>
                setData({ ...data, bankDetailId: opt?.value })
              }
              // Add styles prop if you want to match the theme further
            />
          </div>
        </div>

        {/* --- ITEMS TABLE & SUMMARY SECTION --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Line Items (Editable)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="p-3 w-[40%]">Item Description</th>
                      <th className="p-3">HSN/SAC</th>
                      <th className="p-3">Qty</th>
                      <th className="p-3">Rate</th>
                      <th className="p-3">Discount</th>
                      <th className="p-3">Tax %</th>
                      <th className="p-3">Total</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((item) => (
                      <tr key={item._id} className="border-t border-slate-100">
                        <td className="p-2">
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(
                                item._id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full rounded border border-slate-300 p-1.5 text-xs"
                            rows={2}
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.hsnSacCode}
                            onChange={(e) =>
                              handleItemChange(
                                item._id,
                                "hsnSacCode",
                                e.target.value,
                              )
                            }
                            className="w-24 rounded border border-slate-300 p-1.5 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                item._id,
                                "quantity",
                                e.target.value,
                              )
                            }
                            className="w-16 rounded border border-slate-300 p-1.5 text-center text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(item._id, "rate", e.target.value)
                            }
                            className="w-24 rounded border border-slate-300 p-1.5 text-right text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(
                                item._id,
                                "discount",
                                e.target.value,
                              )
                            }
                            className="w-20 rounded border border-slate-300 p-1.5 text-right text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.taxPercentage}
                            onChange={(e) =>
                              handleItemChange(
                                item._id,
                                "taxPercentage",
                                e.target.value,
                              )
                            }
                            className="w-16 rounded border border-slate-300 p-1.5 text-right text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-bold text-slate-700">
                          {data.currencySymbol} {item.price.toFixed(2)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAddItem}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                <FaPlus /> Add New Item
              </button>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="sticky top-4 rounded-2xl border border-slate-800 bg-[#f07837] p-6 text-white shadow-xl">
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-300">
                Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Subtotal</span>{" "}
                  <span className="font-mono text-xl">
                    {data.currencySymbol} {data.subTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total GST</span>{" "}
                  <span className="font-mono text-xl">
                    {data.currencySymbol} {data.totalGstAmount.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase text-slate-300">
                    Freight / Insurance
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">
                      {data.currencySymbol}
                    </span>
                    <input
                      type="number"
                      className="h-10 w-full rounded-xl border border-slate-600 bg-gray-500 pl-10 pr-3 text-right font-mono text-white"
                      value={data.freightCharges}
                      onChange={(e) =>
                        setData({
                          ...data,
                          freightCharges: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
           

              </div>
                <div className="border-t border-dashed border-slate-600 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase">Grand Total</span>
                    <span className="font-mono text-3xl font-bold">
                      {data.currencySymbol} {data.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                    {/* Advance & Balance Section */}
              <div className="border-t border-dashed border-slate-600 pt-4 space-y-3">

                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-slate-300">
                    Advance Amount
                  </span>

                  <span className="font-mono text-2xl font-bold text-amber-300">
                    {data.currencySymbol}{" "}
                    {(data.advanceAmount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-slate-300">
                    Remaining Amount
                  </span>

                  <span className="font-mono text-2xl font-bold text-emerald-300">
                    {data.currencySymbol}{" "}
                    {(data.balanceAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <button
                  disabled={isSaving}
                  onClick={handleSave}
                  className={buttonStyles.save + " w-full"}
                >
                  {isSaving ? (
                    "SAVING..."
                  ) : (
                    <>
                     Save Dummy Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER NOTES (Editable) --- */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Delivery Name & Address <span className="text-red-500">*</span>
            </label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-300 p-3 text-xs"
              value={data.consigneeNameAddress}
              onChange={(e) =>
                setData({ ...data, consigneeNameAddress: e.target.value })
              }
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Terms & Conditions
            </label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-300 p-3 text-xs"
              value={data.termsConditions}
              onChange={(e) =>
                setData({ ...data, termsConditions: e.target.value })
              }
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer Notes
            </label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-300 p-3 text-xs"
              value={data.customerNotes}
              onChange={(e) =>
                setData({ ...data, customerNotes: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalDummyInvoiceWizard;
