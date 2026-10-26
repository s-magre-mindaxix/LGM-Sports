import { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import { FaFileInvoiceDollar, FaTimes } from "react-icons/fa";
import type { ProformaInvoice } from "./Services/types";
import {
  getActiveOffersForPI,
  getDataFromOffer,
  saveProformaInvoice,
  getActiveServiceReports,
  getDataFromServiceReport,
} from "./Services/ProformaInvoiceService";
import { getBanksByCompanyId } from "../Company/Services/CompanyService";
import type { SelectOption } from "../Enquiry/Hooks/useEnquiryOptions";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const createDefaultPI = (): ProformaInvoice => ({
  proformaInvoiceId: 0,
  proformaInvoiceNo: "",
  proformaInvoiceDate: new Date().toISOString().split("T")[0],
  // proformaInvoiceExpiryDate: new Date(
  //   new Date().setDate(new Date().getDate() + 15),
  // )
  //   .toISOString()
  //   .split("T")[0],
  proformaInvoiceExpiryDate: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  })(),
  orderAcceptanceId: 0,
  productGroupId: 0,
  companyId: 0,
  vendorId: 0,
  companyGroupId: 0,
  customerId: 0,
  customerName: "",
  responsiblePersonId: 0,
  currencyId: 0,
  placeOfSupplyId: 0,
  bankDetailId: 0,
  customerPO: "",
  // customerPODate: null,
  customerPODate: new Date().toISOString().split("T")[0],
  consigneeNameAndAddress: "",
  subtotal: 0,
  freightOrCarrierInsurance: 0,
  totalGstAmount: 0,
  grandTotal: 0,
  percentage: 0,
percentageAmount: 0,
balanceAmount: 0,
percentageTaxAmount: 0,
totalAmount: 0,
  termsAndConditions: "",
  customerNotes: "",
  items: [],
  currencySymbol: "",
});

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

const ProformaInvoiceWizard = ({
  editData,
  options,
  onCancel,
  onSuccess,
}: any) => {
  const [data, setData] = useState<ProformaInvoice>(createDefaultPI());
  const [isSaving, setIsSaving] = useState(false);
  const [activeOffers, setActiveOffers] = useState<SelectOption[]>([]);
   const [activeServiceReports, setActiveServiceReports] = useState<SelectOption[]>([]);
  const [companyBanks, setCompanyBanks] = useState<SelectOption[]>([]);
  const [isOfferSelected, setIsOfferSelected] = useState(false);
  const [sourceType, setSourceType] = useState<"Enquiry" | "Service" | "">("");
  const [selectedServiceReportId, setSelectedServiceReportId] = useState<number>(0);

  // Load Active Offers for Dropdown
  useEffect(() => {
    const loadDropdowns = async () => {
        try {
            const [offers, serviceReports] = await Promise.all([
                getActiveOffersForPI(),
                getActiveServiceReports()
            ]);
            setActiveOffers(offers);
            setActiveServiceReports(serviceReports);
        } catch (error) {
            toast.error("Failed to load selection options.");
        }
    };
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (editData) {
      const formattedData: ProformaInvoice = {
        ...editData,
        proformaInvoiceDate: editData.proformaInvoiceDate
          ? String(editData.proformaInvoiceDate).split("T")[0]
          : "",
        proformaInvoiceExpiryDate: editData.proformaInvoiceExpiryDate
          ? String(editData.proformaInvoiceExpiryDate).split("T")[0]
          : "",
        customerPODate: editData.customerPODate
          ? String(editData.customerPODate).split("T")[0]
          : null,
      };

      setData(formattedData);
      setIsOfferSelected(true);

      if (editData.serviceReportId && editData.serviceReportId > 0) {
      setSourceType("Service");
      setSelectedServiceReportId(editData.serviceReportId);
    } else {
      setSourceType("Enquiry");
    }
    } else {
      setData(createDefaultPI());
      setIsOfferSelected(false);
       setSourceType("");
    }
  }, [editData]);

  

  // Load Banks when Company ID changes (happens in both modes)
  useEffect(() => {
    if (data.companyId) {
      getBanksByCompanyId(data.companyId).then((res: any[]) => {
        const formatted = res.map((b) => ({
          value: b.bankDetailId,
          label: `${b.bankName} - ${b.accountNo}`,
        }));
        setCompanyBanks(formatted);
      });
    }
  }, [data.companyId]);

  // Handle Fetching Data from PO (Only in Create Mode)
  const handleOfferSelection = async (orderAcceptanceId: number) => {
    if (!orderAcceptanceId) {
      setData(createDefaultPI());
      setIsOfferSelected(false);
      return;
    }
    toast.loading("Fetching data from OA...");
    try {
      const offerData = await getDataFromOffer(orderAcceptanceId);
      const mappedItems = offerData.items.map((i: any) => ({
        ...i,
        hsnSacCode: i.hsnSacCode || i.HsnSacCode, 
      }));
      const today = new Date();

      const expiry = new Date(today);
      expiry.setMonth(expiry.getMonth() + 1);

      setData({
        ...createDefaultPI(),
        ...offerData,
         customerPO: offerData.customerPo, 
        items: mappedItems,

        proformaInvoiceDate: today.toISOString().split("T")[0],

        proformaInvoiceExpiryDate: expiry.toISOString().split("T")[0],
      });

      setIsOfferSelected(true);
      setSourceType("Enquiry");
      toast.dismiss();
      toast.success("Data pulled successfully!");
    } catch {
      toast.dismiss();
      toast.error("Failed to fetch data from offer.");
    }
  };

  const handleServiceReportSelection = async (serviceReportId: number) => {
    if (!serviceReportId) {
        setData(createDefaultPI());
        setIsOfferSelected(false);
          setSourceType("");
          setSelectedServiceReportId(0);
        return;
    }
    toast.loading("Fetching data from Service Report...");
    try {
        const reportData = await getDataFromServiceReport(serviceReportId);
        const mappedItems = reportData.items.map((i: any) => ({
            ...i,
            hsnSacCode: i.hsnSacCode || i.HsnSacCode,
        }));
        const today = new Date();
        const expiry = new Date(today);
        expiry.setMonth(expiry.getMonth() + 1);

        setData({
            ...createDefaultPI(),
            ...reportData,
            serviceReportId: serviceReportId,
            customerPO: reportData.customerPo,
            items: mappedItems,
            proformaInvoiceDate: today.toISOString().split("T")[0],
            proformaInvoiceExpiryDate: expiry.toISOString().split("T")[0],
        });

      setIsOfferSelected(true);
      setSourceType("Service");
      setSelectedServiceReportId(serviceReportId);
        toast.dismiss();
        toast.success("Data pulled successfully from Service Report!");
    } catch {
        toast.dismiss();
        toast.error("Failed to fetch data from service report.");
    }
  };
  // Recalculate Totals (in case Freight changes)
  useEffect(() => {
    const subtotal = data.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    const totalGst = data.items.reduce(
      (sum, item) => sum + (item.gstTax || 0),
      0,
    );
   const freight =
  sourceType === "Service"
    ? 0
    : Number(data.freightOrCarrierInsurance) || 0;

    const percentage = Math.min(
  Math.max(Number(data.percentage) || 0, 0),
  100
);

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
  balanceAmount,
  totalAmount,

  grandTotal: subtotal + totalGst + freight,
}));
 }, [
  data.items,
  data.freightOrCarrierInsurance,
  data.percentage,
  sourceType,
]);

  const handleSave = async () => {
    if (!data.orderAcceptanceId) return toast.error("An PO must be selected.");
    if (!data.bankDetailId)
      return toast.error("Bank Details must be selected.");
    if (!data.consigneeNameAndAddress)
      return toast.error("Delivery Name & Address is required.");

    setIsSaving(true);
    try {
      await saveProformaInvoice(data); // This service handles both POST and PUT based on ID
      toast.success(
        data.proformaInvoiceId > 0
          ? "Proforma Invoice Updated"
          : "Proforma Invoice Created",
      );
      onSuccess();
    } catch (e) {
      console.error(e);
      toast.error("Duplicate invoice numbers cannot be saved");
    } finally {
      setIsSaving(false);
    }
  };

  const getLabel = (list: SelectOption[], value: number | undefined) =>
    list?.find((x) => Number(x.value) === Number(value))?.label || "N/A";

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-xl animate-in fade-in zoom-in duration-300">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FaFileInvoiceDollar />
          {data.proformaInvoiceId > 0
            ? `Edit Invoice: ${data.proformaInvoiceNo}`
            : "New Proforma Invoice"}
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition hover:bg-red-700"
        >
          <FaTimes />
          Close
        </button>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        {/* --- STEP 1: OFFER SELECTION (Hidden in Edit Mode) --- */}
        {!editData && !isOfferSelected && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-blue-900">
             SYNC ORDER ACCEPTANCE

            </label>
            <Select
              options={activeOffers}
              onChange={(opt: any) => handleOfferSelection(opt?.value)}
              placeholder="Search and select a order acceptance..."
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

                 <div className="my-6 flex items-center justify-center">
              <hr className="w-1/4 border-slate-300" />
              <span className="text-xs font-bold uppercase text-slate-400">OR</span>
              <hr className="w-1/4 border-slate-300" />
            </div>

               <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-blue-900">
             SYNC SERVICE REPORT
            </label>
            <Select
              options={activeServiceReports}
              onChange={(opt: any) => handleServiceReportSelection(opt?.value)}
              placeholder="Search and select a service report..."
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />
          </div>
        )}

        {/* --- STEP 2: MAIN FORM --- */}
        {isOfferSelected && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-in fade-in duration-500">
            {/* LEFT COLUMN (Form Fields) */}
            <div className="space-y-6 lg:col-span-12">
              {/* --- HEADER INFO GRID (READ ONLY FIELDS) --- */}
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
                {/* READ ONLY: Derived from Offer */}
             <InfoDisplay
                label={`Source ${sourceType || "Type"}`}
                value={
                  sourceType === "Service"
                    ? getLabel(activeServiceReports, selectedServiceReportId)
                    : getLabel(activeOffers, data.orderAcceptanceId) ||
                      data.orderAcceptanceId
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
                <InfoDisplay
                  label="Customer"
                  value={
                    data.customerName ||
                    getLabel(options.customers, data.customerId)
                  }
                />
                <InfoDisplay
                  label="Contact Person"
                  value={
                    data.responsiblePersonName ||
                    getLabel(options.employees, data.responsiblePersonId)
                  }
                />
                <InfoDisplay
                  label="Currency"
                  value={getLabel(options.currencies, data.currencyId)}
                />
                <InfoDisplay
                  label="Place of Supply"
                  value={getLabel(options.states, data.placeOfSupplyId)}
                />
               <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Proforma Invoice No <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                  value={data.proformaInvoiceNo || ""}
                  onChange={(e) =>
                    setData({
                      ...data,
                      proformaInvoiceNo: e.target.value,
                    })
                  }
                  placeholder="Enter Proforma Invoice No"
                />
              </div>

                {/* --- EDITABLE FIELDS START HERE --- */}

                {/* Bank Details (Editable) */}
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
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                    value={data.proformaInvoiceDate}
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
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                    value={data.proformaInvoiceExpiryDate}
                    onChange={(e) =>
                      setData({
                        ...data,
                        proformaInvoiceExpiryDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Customer PO
                  </label>
                  <input
                    type="text"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                    placeholder="Enter PO Number..."
                    value={data.customerPO || ""}
                    onChange={(e) =>
                      setData({ ...data, customerPO: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Customer PO Date
                  </label>
                  <input
                    type="date"
                    className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none"
                    value={data.customerPODate || ""}
                    onChange={(e) =>
                      setData({ ...data, customerPODate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* --- ITEMS TABLE (READ ONLY LIST) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700 flex justify-between">
                      <span>Line Items</span>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">
                        Items are managed in OrderAcceptance
                      </span>
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="p-3 text-left">Item</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Rate</th>
                            {/* <th className="p-3 text-right">Disc %</th> */}
                            <th className="p-3 text-right">Tax %</th>
                            <th className="p-3 text-right">Tax Amt</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.items.map((item, i) => (
                            <tr
                              key={i}
                              className="border-t border-slate-100 hover:bg-slate-50"
                            >
                              <td className="p-3">
                                <div className="flex items-start gap-4">
                                  {/* Image Block */}
                                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                                    {item.productImage ? (
                                      <img
                                        src={`${FILE_BASE_URL}${item.productImage}`}
                                        alt="Product"
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-slate-50 text-[10px] text-slate-400">
                                        NO IMG
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1">
                                    {/* Product Name */}
                                  <div className="font-bold text-slate-700 text-sm">
                                      {item.itemType === "Accessory" ? (
                                        `Accessory: ${getLabel(options.accessories, item.accessoryId)}`
                                      ) : item.itemType === "Service" ? (
                                        `Service: ${item.description || "N/A"}`
                                      ) : (
                                        `Product: ${getLabel(options.products, item.productId)}`
                                      )}
                                    </div>

                                    {/* --- ADDED: HSN/SAC CODE DISPLAY --- */}
                                    {(item.hsnSacCode ||
                                      (item as any).HsnSacCode) && (
                                      <div className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 w-fit mt-1">
                                        HSN/SAC Code:{" "}
                                        {item.hsnSacCode ||
                                          (item as any).HsnSacCode}
                                      </div>
                                    )}

                                    {/* Accessories Loop */}
                                    {item.accessoryIds &&
                                      item.accessoryIds.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                                          {item.accessoryIds.map(
                                            (accId: number) => (
                                              <span
                                                key={accId}
                                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                              >
                                                +{" "}
                                                {getLabel(
                                                  options.accessories,
                                                  accId,
                                                )}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center text-slate-600">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-right text-slate-600">
                                {data.currencySymbol} {item.rate.toFixed(2)}
                              </td>
                              {/* <td className="p-3 text-right text-slate-600">
                                {item.discount.toFixed(2)}
                              </td> */}
                              <td className="p-3 text-right text-slate-600">
                                {item.taxPercentage.toFixed(2)}
                              </td>
                              <td className="p-3 text-right text-slate-600">
                                {data.currencySymbol} {item.gstTax.toFixed(2)}
                              </td>
                              <td className="p-3 text-right font-bold text-slate-900">
                                {data.currencySymbol} {item.price.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                {/* RIGHT COLUMN (Summary Sidebar) */}
                <div className="lg:col-span-4">
                  <div className="sticky top-4 rounded-2xl border border-slate-800 bg-[#f07837] p-6 text-white shadow-xl">
                    <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-300">
                      Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
                        <span>Subtotal</span>
                        <span className="font-mono text-2xl text-white">
                          {data.currencySymbol} {data.subtotal.toFixed(2)}
                        </span>
                      </div>
                     <div className="space-y-4 rounded-lg border border-slate-600 p-4">
                      <div>
                        <label className="mb-1 block text-xs uppercase tracking-wide text-slate-300">
                          Percentage (%)
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Enter percentage"
                          className="h-10 w-full rounded-xl border border-slate-600 bg-gray-500 px-3 text-right text-white focus:border-emerald-500 focus:outline-none"
                          value={data.percentage || 0}
                          onChange={(e) =>
                            setData({
                              ...data,
                              percentage: Number(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                     {/* Percentage Amount */}
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <span className="text-xs uppercase tracking-wide text-slate-300">
                          Percentage Amount
                        </span>

                        <span className="font-mono text-lg text-white">
                          {data.currencySymbol}
                          {(data.percentageAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* GST On Percentage */}
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <span className="text-xs uppercase tracking-wide text-slate-300">
                          18% GST On Percentage
                        </span>

                        <span className="font-mono text-lg text-white">
                          {data.currencySymbol}
                          {(data.percentageTaxAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Total Amount */}
                      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                        <span className="text-xs uppercase tracking-wide text-slate-300">
                          Total Amount
                        </span>

                        <span className="font-mono text-lg font-bold text-green-300">
                          {data.currencySymbol}
                          {(data.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Balance Amount */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-slate-300">
                          Balance Amount
                        </span>

                        <span className="font-mono text-lg text-white">
                          {data.currencySymbol}
                          {(data.balanceAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                      {/* <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-300">
                        <span>Total GST</span>
                        <span className="font-mono text-2xl text-white">
                          {data.currencySymbol} {data.totalGstAmount.toFixed(2)}
                        </span>
                      </div> */}
                      {sourceType !== "Service" && sourceType !== "Enquiry" && (
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wide text-slate-300">
                          Freight / Insurance
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400">
                            {data.currencySymbol}
                          </span>
                          <input
                            type="number"
                            className="h-10 w-full rounded-xl border border-slate-600 bg-gray-500 px-3 text-right font-mono text-white focus:border-emerald-500 focus:outline-none"
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
                      )}
                      <div className="border-t border-dashed border-slate-600 pt-4">
                        {/* <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold uppercase tracking-wide">
                            Grand Total
                          </span>
                          <span className="font-mono text-3xl font-bold">
                            {data.currencySymbol} {data.grandTotal.toFixed(2)}
                          </span>
                        </div> */}
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <button
                        disabled={isSaving}
                        onClick={handleSave}
                        className={buttonStyles.save + " w-full"}
                      >
                        {isSaving
                          ? "SAVING..."
                          : data.proformaInvoiceId > 0
                            ? "Update Proforma Invoice"
                            : "Generate Proforma Invoice"}
                      </button>
                      <button
                        onClick={onCancel}
                        className={buttonStyles.cancel + " w-full"}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- FOOTER NOTES (Editable) --- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Delivery Name & Address{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs outline-none focus:border-slate-500 transition-colors focus:bg-white"
                    value={data.consigneeNameAndAddress}
                    onChange={(e) =>
                      setData({
                        ...data,
                        consigneeNameAndAddress: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs outline-none focus:border-slate-500 transition-colors focus:bg-white"
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
                    className="h-28 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs outline-none focus:border-slate-500 transition-colors focus:bg-white"
                    value={data.customerNotes}
                    onChange={(e) =>
                      setData({ ...data, customerNotes: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProformaInvoiceWizard;
