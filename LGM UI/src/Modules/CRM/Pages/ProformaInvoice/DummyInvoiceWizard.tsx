import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaClone, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
import Select from "react-select"; // You might need this for Bank Details
import type { DummyInvoice, DummyInvoiceItem } from "./Services/types";
import { saveDummyInvoice } from "./Services/ProformaInvoiceService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { getBanksByCompanyId } from "../Company/Services/CompanyService"; // For Bank dropdown
import { useEnquiryOptions } from "../Enquiry/Hooks/useEnquiryOptions"; // To get labels for dropdowns

// Styled InfoDisplay for read-only fields
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

const createNewItem = (): DummyInvoiceItem => ({
  _id: crypto.randomUUID(),
  productId: null,
  description: "",
  hsnSacCode: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  taxPercentage: 18,
  total: 0,
  gstTax: 0,
  price: 0,
});

const DummyInvoiceWizard = ({
  initialData,
  onCancel,
  onSuccess,
}: {
  initialData: DummyInvoice;
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const [data, setData] = useState<DummyInvoice>({
    ...initialData,
     percentage: initialData.percentage || 0,
    percentageAmount: initialData.percentageAmount || 0,
    percentageTaxAmount: initialData.percentageTaxAmount || 0,
    totalAmount: initialData.totalAmount || 0,
    balanceAmount: initialData.balanceAmount || 0,
    items: initialData.items.map((item) => ({
      ...item,
      _id: crypto.randomUUID(),
    })),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [companyBanks, setCompanyBanks] = useState<any[]>([]);
  const options = useEnquiryOptions(); // Hook to get dropdown labels

  const isServiceInvoice =
  data.serviceReportId && data.serviceReportId > 0;

  // Load Banks when component mounts with a companyId
  useEffect(() => {
    if (data.companyId) {
      getBanksByCompanyId(data.companyId).then((res) => {
        const formatted = res.map(
          (b: { bankDetailId: any; bankName: any; accountNo: any }) => ({
            value: b.bankDetailId,
            label: `${b.bankName} - ${b.accountNo}`,
          }),
        );
        setCompanyBanks(formatted);
      });
    }
  }, [data.companyId]);

  // Recalculate all totals when items or freight change
  useEffect(() => {
    const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
    const totalGst = data.items.reduce((sum, item) => sum + item.gstTax, 0);
   const freight =
  isServiceInvoice
    ? 0
    : Number(data.freightOrCarrierInsurance) || 0;

  const percentage =
  Math.min(Math.max(Number(data.percentage) || 0, 0), 100);

const percentageAmount =
  subtotal * (percentage / 100);

const percentageTaxAmount =
  percentageAmount * 0.18;

const totalAmount =
  percentageAmount + percentageTaxAmount;

const balanceAmount =
  subtotal - totalAmount;

setData((prev) => ({
  ...prev,

  subtotal,
  totalGstAmount: totalGst,

  percentageAmount,
  percentageTaxAmount,
  totalAmount,
  balanceAmount,

  grandTotal: subtotal + totalGst + freight,
}));
  }, [
  data.items,
  data.freightOrCarrierInsurance,
  data.percentage,
]);

  const handleItemChange = (
    id: string,
    field: keyof DummyInvoiceItem,
    value: string | number,
  ) => {
    const updatedItems = data.items.map((item) => {
      if (item._id === id) {
        const updatedItem = { ...item, [field]: value };
        const qty = Number(updatedItem.quantity) || 0;
        const rate = Number(updatedItem.rate) || 0;
        const discount = Number(updatedItem.discount) || 0;
        const taxPerc = Number(updatedItem.taxPercentage) || 0;
        const total = qty * rate - discount;
        const gstTax = total * (taxPerc / 100);
        const price = total + gstTax;
        return { ...updatedItem, total, gstTax, price };
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
    if (!data.consigneeNameAndAddress)
      return toast.error("Consignee Name & Address is required.");
    setIsSaving(true);
    try {
      await saveDummyInvoice(data);
      toast.success("Dummy Invoice created successfully!");
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save dummy invoice.");
    } finally {
      setIsSaving(false);
    }
  };

  const getLabel = (list: any[], value: number | null | undefined) =>
    list?.find((x) => Number(x.value) === Number(value))?.label || "N/A";

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-xl animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-200 bg-teal-800 px-6 py-5 text-white">
        <h2 className="flex items-center gap-3 text-lg font-semibold">
          <FaClone /> Create Dummy Invoice (From:{" "}
          {initialData.proformaInvoiceNo})
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
              <InfoDisplay
        label="Source Order"
        value={
          isServiceInvoice
            ? `Service - ${data.proformaInvoiceNo}`
            : `Enquiry - ${data.proformaInvoiceNo}`
        }
      />
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
            label="Contact Person"
            value={data.responsiblePersonName || "N/A"}
          />
          <InfoDisplay
            label="Currency"
            value={getLabel(options.currencies, data.currencyId)}
          />
          <InfoDisplay
            label="Place of Supply"
            value={getLabel(options.states, data.placeOfSupplyId)}
          />
          <InfoDisplay label="Proforma Invoice No" value="DUMMY (Auto)" />

          {/* --- EDITABLE HEADER FIELDS --- */}
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
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Proforma Invoice Date
            </label>
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={data.proformaInvoiceDate.split("T")[0]}
              onChange={(e) =>
                setData({ ...data, proformaInvoiceDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Expiry Date
            </label>
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={data.proformaInvoiceExpiryDate.split("T")[0]}
              onChange={(e) =>
                setData({ ...data, proformaInvoiceExpiryDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer PO
            </label>
            <input
              type="text"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={data.customerPO || ""}
              onChange={(e) => setData({ ...data, customerPO: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Customer PO Date
            </label>
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm"
              value={
                data.customerPODate ? data.customerPODate.split("T")[0] : ""
              }
              onChange={(e) =>
                setData({ ...data, customerPODate: e.target.value })
              }
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
                          value={
                              item.itemType === "Product"
                                ? item.productName || item.description
                                : item.itemType === "Accessory"
                                ? item.accessoryName || item.description
                                : item.description
                            }
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
                    {data.currencySymbol} {data.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-4 rounded-lg border border-slate-600 p-4">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">
                      Percentage (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={data.percentage || 0}
                      onChange={(e) =>
                        setData({
                          ...data,
                          percentage: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-slate-500 bg-slate-700 px-3 py-2 text-right text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Percentage Amount</span>
                    <span className="font-mono">
                      {data.currencySymbol} {(data.percentageAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">18% GST On Percentage</span>
                    <span className="font-mono">
                      {data.currencySymbol} {(data.percentageTaxAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-300">
                      Total Amount
                    </span>
                    <span className="font-mono font-bold text-green-300">
                      {data.currencySymbol} {(data.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Balance Amount</span>
                    <span className="font-mono">
                      {data.currencySymbol} {(data.balanceAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-slate-300">Total GST</span>{" "}
                  <span className="font-mono text-xl">
                    {data.totalGstAmount.toFixed(2)}
                  </span>
                </div> */}
                {/* {!isServiceInvoice && (
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
                      className="h-10 w-full rounded-xl border border-slate-600 bg-gray-500 pl-8 pr-3 text-right font-mono text-white"
                      value={data.freightOrCarrierInsurance}
                      onChange={(e) =>
                        setData({
                          ...data,
                          freightOrCarrierInsurance:
                            parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                )} */}
                {/* <div className="border-t border-dashed border-slate-600 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold uppercase">Grand Total</span>
                    <span className="font-mono text-3xl font-bold">
                      {data.currencySymbol} {data.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div> */}
              </div>
              
              <div className="mt-6">
                <button
                  disabled={isSaving}
                  onClick={handleSave}
                  className={buttonStyles.save + " w-full"}
                >
                  {isSaving ? "SAVING..." : <>Save Dummy Proforma Invoice</>}
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
              value={data.consigneeNameAndAddress}
              onChange={(e) =>
                setData({ ...data, consigneeNameAndAddress: e.target.value })
              }
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Terms & Conditions
            </label>
            <textarea
              className="h-28 w-full rounded-xl border border-slate-300 p-3 text-xs"
              value={data.termsAndConditions}
              onChange={(e) =>
                setData({ ...data, termsAndConditions: e.target.value })
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

export default DummyInvoiceWizard;
