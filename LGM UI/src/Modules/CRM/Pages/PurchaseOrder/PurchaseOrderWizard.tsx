import { useEffect, useState, useMemo, useRef } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  FaBoxOpen,
  FaCheckDouble,
  FaTimes,
  FaTrash,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaSync,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getDataForPOFromOAs,
  getFinalOAs,
  getNextPONumber,
  savePO,
} from "./Services/PurchaseOrderService";
import { getOAById } from "../OrderAcceptance/Services/OrderAcceptanceService";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";
import { useAuth } from "../../../../hooks/useAuth";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderOffer,
} from "./Services/types";
import apiClient from "../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const getInitialData = (): PurchaseOrder => ({
  purchaseOrderId: 0,
  orderAcceptanceIds: [],
  purchaseOrderNo: "",
  gaxcePurchaseOrderNo: "",
  customerOrderNo: "",
  customerOrderDate: null,
  invoiceNo: "",
  invoiceDate: null,
  purchaseOrderDate: new Date().toISOString().split("T")[0],
  nextFollowUpDate: null,
  offerCreateDate: null,
  offerExpiryDate: null,
  companyCode: "",
  vendorCode: "",
  address: "",
  customerId: 0,
  vendorId: 0,
  companyId: 0,
  productGroupId: 0,
  companyGroupId: 0,
  currencyId: 0,
  currencySymbol: "",
  placeOfSupplyId: 0,
  bankDetailId: 0,
  responsiblePersonId: 0,
  assignedToEmployeeId: 0,
  subtotal: 0,
  freightCharges: 0,
  grandTotal: 0,
  termsConditions: "",
  customerNotes: "",
  status: "DRAFT",
  items: [],
});

const PurchaseOrderWizard = ({
  editData,
  options,
  onCancel,
  onSuccess,
}: any) => {
  useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [finalOAs, setFinalOAs] = useState<any[]>([]);
  const [, setContactOptions] = useState<any[]>([]);
  const [isMultiOAMode, setIsMultiOAMode] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [data, setData] = useState<PurchaseOrder>(
    editData
      ? {
          ...editData,
          orderAcceptanceIds: editData.offers?.map((o: any) => o.offerId) || [],
        }
      : getInitialData(),
  );

  const [sourceOfferData, setSourceOfferData] = useState<PurchaseOrderOffer[]>(
    [],
  );

  const [liveRates, setLiveRates] = useState<{
    USD: number;
    GBP: number;
    EUR: number;
    CNY: number;
    INR: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isSyncingOA, setIsSyncingOA] = useState(false);

  const updateData = (field: keyof PurchaseOrder, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTableScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;
      setShowLeftArrow(hasHorizontalScrollbar && el.scrollLeft > 1);
      setShowRightArrow(
        hasHorizontalScrollbar &&
          Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1,
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => handleTableScroll(), 100);
    window.addEventListener("resize", handleTableScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleTableScroll);
    };
  }, [data.items]);

  const scrollTable = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -400 : 400;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const primaryCurrencyId = useMemo(
    () => data.currencyId || 0,
    [data.currencyId],
  );

  const getCurrencySymbol = (currencyId: number) =>
    options.currencies?.find((c: any) => Number(c.value) === Number(currencyId))
      ?.currencySymbol || "";

  const curSym = useMemo(() => {
    return data.currencySymbol || getCurrencySymbol(primaryCurrencyId) || "£";
  }, [data.currencySymbol, primaryCurrencyId, options.currencies]);

  const { subtotal } = useMemo(() => {
    const sub: number =
      data.items?.reduce((s: number, i: any) => s + (i.total || 0), 0) || 0;

    return { subtotal: sub };
  }, [data.items]);

  const grandTotal: number = useMemo(() => {
    return subtotal + Number(data.freightCharges || 0);
  }, [subtotal, data.freightCharges]);

  useEffect(() => {
  if (!data.items?.length) return;

  setData(prev => {
    const updatedItems = prev.items.map(item => {

      const total =
        Number(item.quantity || 0) *
        Number(item.rate || 0) *
        (1 - Number(item.discount || 0) / 100);

      return {
        ...item,
        total,
        finalPrice: total,
        taxPercentage: 0,
        gstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0
      };
    });

    return {
      ...prev,
      items: updatedItems
    };
  });

}, [data.items.length]);

  useEffect(() => {
    getFinalOAs().then(setFinalOAs);
    if (!editData) {
      getNextPONumber().then((no) => updateData("purchaseOrderNo", no));
    } else {
      if (editData.offers) setSourceOfferData(editData.offers);
      if (editData.offers?.length > 1) setIsMultiOAMode(true);
    }
  }, [editData]);

  useEffect(() => {
    if (data.customerId)
      getCustomerContacts(data.customerId).then(setContactOptions);
  }, [data.customerId]);

  const getItemRateByCurrency = (item: any, currencyId: number) => {
    const match = item.currencyPrices?.find(
      (cp: any) => Number(cp.currencyId) === Number(currencyId),
    );

    if (match) return Number(match.price || 0);

    return Number(item.rate || 0);
  };

  const getCurrencyOption = (code: string) =>
    options.currencies?.find(
      (c: any) =>
        c.label?.toUpperCase() === code ||
        c.currencyName?.toUpperCase() === code,
    );

  const getConvertedRate = (item: any, isINR: boolean, liveRates: any) => {
    // Always get GBP price
    const gbpPrice = item.currencyPrices?.find(
      (cp: any) => cp.currencyName?.toUpperCase() === "GBP",
    );

    // If GBP price not found
    if (!gbpPrice) {
      return {
        rate: Number(item.rate || 0),
        originalPrice: null,
        originalCurrency: null,
      };
    }

    // ===========================
    // ONLY INR CONVERSION
    // ===========================
    if (isINR && liveRates) {
      const convertedRate = Number(
        (Number(gbpPrice.price) * Number(liveRates.GBP) * 1.25).toFixed(2),
      );

      return {
        rate: convertedRate,
        originalPrice: Number(gbpPrice.price),
        originalCurrency: "GBP",
      };
    }

    // ===========================
    // GBP / USD / EUR / CNY
    // Show GBP price only
    // ===========================
    return {
      rate: Number(gbpPrice.price),
      originalPrice: null,
      originalCurrency: null,
    };
  };

  const syncSelectedOAs = async (idsToSync: number[]) => {
    setIsSyncingOA(true);

    if (!idsToSync || idsToSync.length === 0) {
      setIsSyncingOA(false);
      return toast.error("Select OA.");
    }

    const toastId = toast.loading("Syncing & Converting Prices...");
    try {
      const responseData = await getDataForPOFromOAs(idsToSync);

      // 1. Determine if the PO is INR directly from the response, not the state
      let selectedCurrencyId = data.currencyId;

      if (!selectedCurrencyId) {
        const gbpCurrency = getCurrencyOption("GBP");
        selectedCurrencyId = Number(gbpCurrency?.value || 0);
      }

      const convertedItems = responseData.items.map((item: any) => {
        const rate = getItemRateByCurrency(item, selectedCurrencyId);
        const total = Number(item.quantity || 0) * Number(rate || 0);

        return {
          ...item,
          rate,
          originalPrice: null,
          originalCurrency: null,
          accessoryIds: item.accessoryIds || [],
          taxPercentage: 0,
          total,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          finalPrice: total,
        };
      });

      const selectedCurrency = options.currencies?.find(
        (c: any) => Number(c.value) === Number(selectedCurrencyId),
      );

      // 4. Update the state all at once
      setData((prev) => ({
        ...prev,
        ...responseData,
        purchaseOrderDate: prev.purchaseOrderDate,
        items: convertedItems,
        orderAcceptanceIds: idsToSync,
        currencyId: selectedCurrencyId,
        currencySymbol: selectedCurrency?.currencySymbol || "",
      }));

      if (responseData.offers) {
        setSourceOfferData(
          responseData.offers.map((offer: any) => ({
            ...offer,
            currencyId: selectedCurrencyId,
          })),
        );
      }

      toast.dismiss(toastId);
      toast.success("PO data synced successfully");
      setIsSyncingOA(false);
    } catch (err) {
      toast.dismiss(toastId);
      console.error("Sync Error:", err);
      toast.error("Failed to sync data.");
    }
  };

  // Load Linked OA Details for Editing
  useEffect(() => {
    if (editData && editData.orderAcceptanceIds?.length > 0) {
      const fetchOADetails = async () => {
        const toastId = toast.loading(
          "Loading linked Order Acceptance details...",
        );
        try {
          const fetchedOAs = await Promise.all(
            editData.orderAcceptanceIds.map((id: number) => getOAById(id)),
          );
          setData((prev: any) => ({ ...prev, orderAcceptances: fetchedOAs }));
          toast.dismiss(toastId);
        } catch (err) {
          console.error("Failed to load OA details for editing.", err);
          toast.dismiss(toastId);
          toast.error("Could not load linked OA details.");
        }
      };
      fetchOADetails();
    }
  }, [editData]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const [usdRes, gbpRes, eurRes, cnyRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.LockedRate, {
            params: { source: "USD", target: "INR" },
          }),
          apiClient.get(API_ENDPOINTS.LockedRate, {
            params: { source: "GBP", target: "INR" },
          }),
          apiClient.get(API_ENDPOINTS.LockedRate, {
            params: { source: "EUR", target: "INR" },
          }),
          apiClient.get(API_ENDPOINTS.LockedRate, {
            params: { source: "CNY", target: "INR" },
          }),
        ]);

        setLiveRates({
          USD: Number(usdRes.data?.rate || 0),
          GBP: Number(gbpRes.data?.rate || 0),
          EUR: Number(eurRes.data?.rate || 0),
          CNY: Number(cnyRes.data?.rate || 0),
          INR: 1,
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
  if (!liveRates) return;
  if (!data.items.length) return;

  const selectedCurrency = options.currencies?.find(
    (x: any) => Number(x.value) === Number(data.currencyId)
  );

  if (!selectedCurrency) return;

  const isINR =
    selectedCurrency.label === "INR" ||
    selectedCurrency.currencySymbol === "₹";

  setData(prev => ({
    ...prev,
    items: prev.items.map(item => {
      const converted = getConvertedRate(item, isINR, liveRates);

      const total =
        Number(item.quantity || 0) *
        converted.rate *
        (1 - Number(item.discount || 0) / 100);

      return {
        ...item,
        rate: converted.rate,
        originalPrice: converted.originalPrice,
        originalCurrency: converted.originalCurrency,
        total,
        finalPrice: total,
      };
    }),
  }));
}, [liveRates]);

  const handleOASelectionChange = (selectedOptions: any) => {
    if (
      !selectedOptions ||
      (Array.isArray(selectedOptions) && selectedOptions.length === 0)
    ) {
      setData((prev: any) => ({
        ...prev,
        orderAcceptanceIds: [],
        orderAcceptances: [],
        items: [],
      }));
      return;
    }
    const ids = Array.isArray(selectedOptions)
      ? selectedOptions.map((opt: any) => opt.value)
      : [selectedOptions.value];
    setData((prev: any) => ({ ...prev, orderAcceptanceIds: ids }));

    if (!isMultiOAMode) {
      syncSelectedOAs(ids);
    }
  };

  const updateItem = (index: number, updates: Partial<PurchaseOrderItem>) => {
    const newItems = [...data.items];
    newItems[index] = { ...newItems[index], ...updates };
    updateData("items", newItems);
  };

  const updateSpecificOfferData = (
    index: number,
    field: string,
    value: any,
  ) => {
    setSourceOfferData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = async () => {
    if (!data.items || data.items.length === 0)
      return toast.error("Add products first.");
    setIsSaving(true);
    try {
      // We send 'sourceOfferData' as the offers array because it holds individual C/V codes
      const payload = {
        ...data,
        offers: sourceOfferData.map((o: any) => ({
          ...o,
          vendorCode: o.vendorCode?.trim() || "",
        })),
        grandTotal,
        subtotal,
      };

      await savePO(payload);
      toast.success("PO Saved Successfully!");
      onSuccess();
    } catch {
      toast.error("Save Failed!");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOAs = useMemo(() => {
    return finalOAs;
  }, [finalOAs]);

  const customerOptionsWithBranch =
    options.rawCustomersList?.map((c: any) => ({
      value: c.id,
      label: `${c.customerName}${c.branch ? ` (${c.branch})` : ""}`,
      branch: c.branch,
    })) || [];

  const labelClass =
    "mb-1 block text-[10px] font-bold uppercase tracking-widest text-slate-500";
  const inputClass =
    "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100";

  const SectionHeader = ({ icon: Icon, title }: any) => (
    <div className="flex items-center gap-2 mb-4 border-b pb-2">
      <Icon className="text-blue-500 text-sm" />
      <h4 className="text-[10px] font-black uppercase text-slate-800 tracking-widest">
        {title}
      </h4>
    </div>
  );

  const resolveLabel = (list: any[], value: any) =>
    list?.find((x: any) => Number(x.value) === Number(value))?.label || "—";

  // Change the parameter type to include "undefined"
  const formatDate = (dateStr: string | null | undefined) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8fafc] text-left shadow-2xl animate-in slide-in-from-top-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
        <h2 className="flex items-center gap-2 text-lg font-bold ">
          <FaBoxOpen className="text-blue-400" />
          {data.purchaseOrderId > 0
            ? `Edit PO: ${data.purchaseOrderNo}`
            : "Purchase Order Workspace"}
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-[11px] font-bold uppercase transition hover:bg-rose-600"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-2 md:p-4 space-y-3">
        {/* Step 1: Selection (Only show if not in edit mode OR if user wants to change OAs) */}
        {data.purchaseOrderId === 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 shadow-inner text-center">
            <label className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase text-blue-900 tracking-widest">
              <FaCheckDouble /> Step 1: Select Approved Order Acceptance(s)
            </label>
            <div className="flex justify-center items-center gap-2 mb-6 p-1 bg-blue-100 rounded-full max-w-md mx-auto">
              <button
                onClick={() => setIsMultiOAMode(true)}
                className={`w-1/2 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition-all ${isMultiOAMode ? "bg-white text-blue-800 shadow" : "text-slate-500"}`}
              >
                Multiple OAs (INR)
              </button>
            </div>
            <div className="max-w-xl mx-auto flex items-start gap-2">
              <div className="grow">
                <Select
                  isMulti={isMultiOAMode}
                  options={filteredOAs}
                  value={filteredOAs.filter((o: any) =>
                    data.orderAcceptanceIds?.includes(o.value),
                  )}
                  onChange={handleOASelectionChange}
                  placeholder={
                    isMultiOAMode
                      ? "Search & Select one or more INR OAs..."
                      : "Search any Order Acceptance..."
                  }
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  closeMenuOnSelect={!isMultiOAMode}
                />
              </div>
              {isMultiOAMode && (
                <button
                  onClick={() => syncSelectedOAs(data.orderAcceptanceIds)}
                  disabled={
                    !data.orderAcceptanceIds ||
                    data.orderAcceptanceIds.length === 0
                  }
                  className={buttonStyles.addmore + " flex items-center gap-1"}
                >
                  <FaSync /> Sync
                </button>
              )}
            </div>
          </div>
        )}

        {(data.orderAcceptanceIds.length > 0 || data.purchaseOrderId > 0) && (
          <div className="space-y-3">
            {/* Common PO Details */}
            <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <SectionHeader
                icon={FaFileAlt}
                title="Common Purchase Order Details"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>Generated PO No</label>
                  <input
                    className={`${inputClass} bg-slate-100 font-bold`}
                    value={data.purchaseOrderNo}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass}>PO Creation Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.purchaseOrderDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      updateData("purchaseOrderDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <Select
                    options={[
                      { value: "DRAFT", label: "Draft" },
                      { value: "FINAL", label: "Final" },
                    ]}
                    value={{ value: data.status, label: data.status }}
                    onChange={(o: any) => updateData("status", o.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Next Follow-up</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.nextFollowUpDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      updateData("nextFollowUpDate", e.target.value)
                    }
                  />
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>PO Terms & Conditions</label>
                    <textarea
                      className={`${inputClass} h-24 pt-3`}
                      value={data.termsConditions || ""}
                      onChange={(e) =>
                        updateData("termsConditions", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* REPEATED SECTION FOR EVERY SELECTED OA */}
            {sourceOfferData.map((offer, index) => (
              <div
                key={offer.offerId}
                className="rounded-4xl border-2 border-blue-100 bg-white p-8 shadow-lg mb-8"
              >
                <h3 className="text-sm font-black text-blue-800 mb-6 pb-2 border-b uppercase tracking-widest flex justify-between">
                  <span>
                    Details for OA:{" "}
                    <span className="text-slate-900">
                      {offer.gaxcePurchaseOrderNo || "N/A"}
                    </span>
                  </span>
                  <span className="text-[10px] bg-blue-50 px-3 py-1 rounded text-blue-600 font-bold">
                    Offer ID: {offer.offerId}
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Row 1: Customer, Company, Vendor */}
                  <div>
                    <label className={labelClass}>Customer</label>
                    <Select
                      // options={options.customers}
                      options={customerOptionsWithBranch}
                      value={customerOptionsWithBranch.find(
                        (x: any) => x.value === offer.customerId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(index, "customerId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company</label>
                    <Select
                      options={options.companies}
                      value={options.companies?.find(
                        (x: any) => x.value === offer.companyId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(index, "companyId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Vendor</label>
                    <Select
                      options={options.vendors}
                      value={options.vendors?.find(
                        (x: any) => x.value === offer.vendorId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(index, "vendorId", o?.value)
                      }
                    />
                  </div>
                  {/* Row 2: Codes and Group */}
                  <div>
                    <label className={labelClass}>Company Code</label>
                    <input
                      className={inputClass}
                      value={offer.companyCode || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "companyCode",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Vendor Code</label>
                    <input
                      className={inputClass}
                      value={offer.vendorCode || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "vendorCode",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Group</label>
                    <Select
                      options={options.groups}
                      value={options.groups?.find(
                        (x: any) => x.value === offer.productGroupId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(
                          index,
                          "productGroupId",
                          o?.value,
                        )
                      }
                    />
                  </div>
                  {/* Row 3: Company Group, Responsible Person, Offer Date */}
                  <div>
                    <label className={labelClass}>Company Group</label>
                    <Select
                      options={options.companyGroups}
                      value={options.companyGroups?.find(
                        (x: any) => x.value === offer.companyGroupId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(
                          index,
                          "companyGroupId",
                          o?.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Responsible Person</label>
                    <Select
                      options={options.employees}
                      value={options.employees?.find(
                        (x: any) => x.value === offer.assignedToEmployeeId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(
                          index,
                          "assignedToEmployeeId",
                          o?.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Offer Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={offer.offerCreateDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "offerCreateDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  {/* Row 4: Expiry, Currency, POS */}
                  <div>
                    <label className={labelClass}>Expiry Date</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={offer.offerExpiryDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "offerExpiryDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Purchase Currency</label>
                    <Select
                      isDisabled={isSyncingOA}
                      options={options.currencies}
                      value={
                        options.currencies?.find(
                          (x: any) =>
                            Number(x.value) ===
                            Number(offer.currencyId || data.currencyId),
                        ) || null
                      }
                      onChange={(o: any) => {
                        if (isSyncingOA) return;
                        const newCurrencyId = Number(o?.value || 0);

                        if (!liveRates) {
                          toast.error("Currency rates are loading...");
                          return;
                      }

                        updateSpecificOfferData(
                          index,
                          "currencyId",
                          newCurrencyId,
                        );

                        setData((prev: any) => {
                          const updatedItems = prev.items.map((item: any) => {
                            // Find the price for the selected currency
                            const selectedCurrency = options.currencies?.find(
                              (x: any) =>
                                Number(x.value) === Number(newCurrencyId),
                            );

                            const isINR =
                              selectedCurrency?.label === "INR" ||
                              selectedCurrency?.currencySymbol === "₹";

                            const converted = getConvertedRate(
                              item,
                              isINR,
                              liveRates,
                            );

                            const rate = converted.rate;

                            const quantity = Number(item.quantity || 0);
                            const discount = Number(item.discount || 0);

                            const total =
                              quantity * rate * (1 - discount / 100);

                            return {
                              ...item,
                              rate,
                              originalPrice: converted.originalPrice,
                              originalCurrency: converted.originalCurrency,
                              total,
                              finalPrice: total,
                              taxPercentage: 0,
                              gstAmount: 0,
                              cgstAmount: 0,
                              sgstAmount: 0,
                              igstAmount: 0,
                            };
                          });

                          return {
                            ...prev,
                            currencyId: newCurrencyId,
                            currencySymbol: o?.currencySymbol || "",
                            items: updatedItems,
                          };
                        });
                      }}
                      placeholder="Select Purchase Currency..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Place of Supply</label>
                    <Select
                      options={options.states}
                      value={options.states?.find(
                        (x: any) => x.value === offer.placeOfSupplyId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(
                          index,
                          "placeOfSupplyId",
                          o?.value,
                        )
                      }
                    />
                  </div>
                  {/* Row 5: Bank Detail, Freight */}
                  <div>
                    <label className={labelClass}>Bank Detail</label>
                    <Select
                      options={options.banks}
                      value={options.banks?.find(
                        (x: any) => x.value === offer.bankDetailId,
                      )}
                      onChange={(o) =>
                        updateSpecificOfferData(index, "bankDetailId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Freight Charges</label>
                    <input
                      type="number"
                      className={inputClass}
                      value={offer.freightCharges || 0}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "freightCharges",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div className="hidden lg:block"></div> {/* Spacer */}
                  {/* Row 6: Delivery Address (Full Width) */}
                  <div className="lg:col-span-3">
                    <label className={labelClass}>Delivery Address</label>
                    <textarea
                      className={`${inputClass} h-20 pt-3`}
                      value={offer.address || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "address",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  {/* Row 7: Customer Notes (Full Width) */}
                  <div className="lg:col-span-3">
                    <label className={labelClass}>Customer Notes</label>
                    <textarea
                      className={`${inputClass} h-20 pt-3`}
                      value={offer.customerNotes || ""}
                      onChange={(e) =>
                        updateSpecificOfferData(
                          index,
                          "customerNotes",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="relative">
              {showLeftArrow && (
                <button
                  onClick={() => scrollTable("left")}
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[#f07837] hover:bg-[#194485] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300 transition-all"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft size={18} />
                </button>
              )}
              {/* --- Items Table --- */}
              <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-auto shadow-xl">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleTableScroll}
                  className="overflow-auto"
                >
                  <table className="w-full text-left min-w-[1100px] table-fixed">
                    <thead className="bg-[#f07837] text-white text-[10px] font-black uppercase tracking-widest sticky top-0 z-0">
                      <tr>
                        <th className="p-5 w-12 text-center">#</th>
                        <th className="p-5 w-[40%]">
                          Type / Product / Paid Accessory
                        </th>
                        <th className="p-5 w-28 text-center">HSN/SAC</th>
                        <th className="p-5 w-24 text-center">Qty</th>
                        <th className="p-5 w-32 text-right">Rate</th>
                        <th className="p-5 w-36 text-right">Final Amt</th>
                        <th className="p-5 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items?.map((item: any, i: number) => {
                        const isProductItem =
                          item.itemType?.toLowerCase() !== "accessory";
                        const selectedProduct = options.products?.find(
                          (x: any) => x.value === item.productId,
                        );
                        const selectedAccessory = options.accessories?.find(
                          (x: any) => x.value === item.accessoryId,
                        );

                        return (
                          <tr
                            key={i}
                            className="border-b last:border-0 hover:bg-slate-50 align-top"
                          >
                            <td className="p-4 text-center font-bold text-slate-400 border-r">
                              {i + 1}
                            </td>
                            <td className="p-4 space-y-2 border-r">
                              <div className="flex gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${isProductItem ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                                >
                                  {isProductItem ? "Product" : "Paid Accessory"}
                                </span>

                                {item.productSource && (
                                  <span
                                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      item.productSource === "Imported"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {item.productSource}
                                  </span>
                                )}

                                {item.sourceOA && (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    Source OA: {item.sourceOA}
                                  </span>
                                )}
                              </div>

                              {isProductItem ? (
                                <>
                                  <Select
                                    options={options.products}
                                    value={selectedProduct || null}
                                    filterOption={(option, inputValue) => {
                                      const label =
                                        option.label?.toLowerCase() || "";
                                      const code =
                                        option.data.productCode?.toLowerCase() ||
                                        "";
                                      const partNo =
                                        option.data.partNo?.toLowerCase() || "";
                                      const search = inputValue.toLowerCase();

                                      return (
                                        label.includes(search) ||
                                        code.includes(search) ||
                                        partNo.includes(search)
                                      );
                                    }}
                                    placeholder="Select Product"
                                    onChange={(o: any) => {
                                      const finalRate = getItemRateByCurrency(
                                        o,
                                        primaryCurrencyId,
                                      );

                                      updateItem(i, {
                                        itemType: "Product",
                                        productId: o.value,
                                        accessoryId: 0,
                                        rate: finalRate,
                                        description: o.label,
                                        hsnSacCode: o.hsnCode,
                                      });
                                    }}
                                  />
                                  <Select
                                    isMulti
                                    placeholder="Free Accessories..."
                                    options={options.accessories}
                                    value={options.accessories?.filter(
                                      (x: any) =>
                                        item.accessoryIds?.includes(
                                          Number(x.value),
                                        ),
                                    )}
                                    filterOption={(option, inputValue) => {
                                      const search = inputValue.toLowerCase();

                                      return (
                                        option.label
                                          ?.toLowerCase()
                                          .includes(search) ||
                                        option.data.partNo
                                          ?.toLowerCase()
                                          .includes(search)
                                      );
                                    }}
                                    onChange={(opts: any) =>
                                      updateItem(i, {
                                        accessoryIds: opts
                                          ? opts.map((x: any) =>
                                              Number(x.value),
                                            )
                                          : [],
                                      })
                                    }
                                  />
                                </>
                              ) : (
                                <Select
                                  options={options.accessories}
                                  value={selectedAccessory || null}
                                  filterOption={(option, inputValue) => {
                                    const search = inputValue.toLowerCase();

                                    return (
                                      option.label
                                        ?.toLowerCase()
                                        .includes(search) ||
                                      option.data.partNo
                                        ?.toLowerCase()
                                        .includes(search)
                                    );
                                  }}
                                  placeholder="Select Paid Accessory"
                                  onChange={(o: any) => {
                                    const finalRate = getItemRateByCurrency(
                                      o,
                                      primaryCurrencyId,
                                    );

                                    updateItem(i, {
                                      itemType: "Accessory",
                                      accessoryId: o.value,
                                      productId: 0,
                                      rate: finalRate,
                                      description: o.label,
                                      hsnSacCode: o.hsnCode,
                                    });
                                  }}
                                />
                              )}
                              <textarea
                                className="w-full rounded-xl border p-2 text-xs h-16"
                                value={item.description || ""}
                                onChange={(e) =>
                                  updateItem(i, { description: e.target.value })
                                }
                              />
                            </td>
                            <td className="p-4 border-r">
                              <input
                                className={`${inputClass} text-center`}
                                value={item.hsnSacCode || ""}
                                onChange={(e) =>
                                  updateItem(i, { hsnSacCode: e.target.value })
                                }
                              />
                            </td>
                            <td className="p-4 border-r">
                              <input
                                type="number"
                                className={`${inputClass} text-center font-bold`}
                                value={item.quantity || 0}
                                onChange={(e) =>
                                  updateItem(i, {
                                    quantity: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4 border-r">
                              {item.originalPrice && (
                                <div className="text-[10px] text-blue-600 font-bold mb-1 animate-pulse text-right pr-1">
                                  {item.originalPrice.toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}{" "}
                                  {item.originalCurrency}
                                </div>
                              )}

                              {/* If there is no original price, we add a small spacer div to keep the input boxes aligned across rows */}
                              {!item.originalPrice && <div></div>}

                              <input
                                type="number"
                                className={`${inputClass} text-right font-bold bg-white focus:ring-2 focus:ring-blue-400`}
                                value={item.rate || 0}
                                onChange={(e) =>
                                  updateItem(i, {
                                    rate: parseFloat(e.target.value) || 0,
                                    originalPrice: null,
                                    originalCurrency: null,
                                  })
                                }
                              />
                            </td>

                            <td className="p-4 text-right font-mono text-lg font-black text-[#0b2c52]">
                              {curSym}
                              {(item.total || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() =>
                                  setData({
                                    ...data,
                                    items: data.items.filter(
                                      (_: any, idx: number) => idx !== i,
                                    ),
                                  })
                                }
                                className="text-red-400 hover:text-red-600"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {showRightArrow && (
                <button
                  onClick={() => scrollTable("right")}
                  className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 bg-[#f07837] hover:bg-[#194485] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300 transition-all"
                  aria-label="Scroll right"
                >
                  <FaChevronRight size={18} />
                </button>
              )}
            </div>

            {/* --- Summary and Actions --- */}
            <div className="w-full grid grid-cols-1 gap-8 pt-1">
              <div className="rounded-[3rem] bg-[#f07837] p-10 text-white shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b border-white/10 pb-4 text-blue-600 flex justify-between">
                  PO Summary <FaFileInvoiceDollar size={18} />
                </h3>
                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="flex flex-col text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="font-mono text-lg">
                      {curSym} {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      Freight / Logistics
                    </label>
                    <input
                      type="number"
                      className="h-12 w-full rounded-xl border-none bg-white/5 px-4 text-right font-mono text-lg outline-none"
                      value={data.freightCharges || 0}
                      onChange={(e) =>
                        setData({
                          ...data,
                          freightCharges: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase text-blue-400 mb-1">
                      Grand Total
                    </p>
                    <p className="font-mono text-3xl font-black tracking-tighter">
                      {curSym} {grandTotal.toLocaleString()}
                    </p>
                  </div>
                  <div></div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={onCancel} className={buttonStyles.cancel}>
                      Discard
                    </button>
                    <button
                      onClick={() => setShowPreview(true)}
                      className={
                        "w-full rounded-xl bg-green-700 py-4 text-sm font-bold uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all text-white"
                      }
                    >
                      Preview Before Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showPreview && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-7xl rounded-[3rem] shadow-2xl flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-300 border border-white/20">
            {/* 1. STICKY MODAL HEADER */}
            <div className="flex items-center justify-between px-10 py-7 border-b border-slate-100 bg-[#f07837] rounded-t-[3rem] text-white">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <FaBoxOpen className="text-blue-400" /> Purchase Order Preview
                </h3>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em] mt-1">
                  Official Document Review • PO No:{" "}
                  {data.purchaseOrderNo || "GENERATING..."}
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="group p-3 bg-white/10 hover:bg-rose-500 text-white rounded-2xl transition-all shadow-sm"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* 2. MODAL BODY (SCROLLABLE CONTENT) */}
            <div className="p-10 overflow-y-auto space-y-12">
              {/* SECTION A: PRIMARY PO METADATA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <div className="space-y-1 border-l-4 border-blue-500 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Global PO Number
                  </p>
                  <p className="text-sm font-black text-blue-900">
                    {data.purchaseOrderNo}
                  </p>
                </div>
                <div className="space-y-1 border-l-4 border-slate-300 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Creation Date
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {formatDate(data.purchaseOrderDate)}
                  </p>
                </div>
                <div className="space-y-1 border-l-4 border-slate-300 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    System Status
                  </p>
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${data.status === "FINAL" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {data.status}
                  </span>
                </div>
                <div className="space-y-1 border-l-4 border-slate-300 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Next Follow-up
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {formatDate(data.nextFollowUpDate)}
                  </p>
                </div>
              </div>

              {/* SECTION B: INDIVIDUAL SOURCE OA DATA (ALL 16 FIELDS PER OA) */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <hr className="grow border-slate-200" />
                  <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] whitespace-nowrap">
                    Detailed Source Metadata (Per OA)
                  </h4>
                  <hr className="grow border-slate-200" />
                </div>

                <div className="space-y-6">
                  {sourceOfferData.map((offer) => (
                    <div
                      key={offer.offerId}
                      className="group p-8 rounded-[2.5rem] border-2 border-slate-100 bg-white hover:border-blue-200 transition-all shadow-sm space-y-8"
                    >
                      <div className="flex justify-between border-b border-slate-100 pb-4 items-center">
                        <span className="text-lg font-black text-[#154068]">
                          OA Ref: {offer.gaxcePurchaseOrderNo}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                          Offer Linked: #{offer.offerId}
                        </span>
                      </div>

                      {/* All 16 Fields Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Customer
                          </span>
                          <span className="font-bold text-slate-800">
                            {resolveLabel(options.customers, offer.customerId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Billing Company
                          </span>
                          <span className="font-bold text-slate-800">
                            {resolveLabel(options.companies, offer.companyId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Vendor
                          </span>
                          <span className="font-bold text-slate-800">
                            {resolveLabel(options.vendors, offer.vendorId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Company Code
                          </span>
                          <span className="font-mono text-blue-600 font-bold">
                            {offer.companyCode || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Vendor Code
                          </span>
                          <span className="font-mono text-blue-600 font-bold">
                            {offer.vendorCode || "-"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Product Group
                          </span>
                          <span className="font-bold text-slate-700">
                            {resolveLabel(options.groups, offer.productGroupId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Company Group
                          </span>
                          <span className="font-bold text-slate-700">
                            {resolveLabel(
                              options.companyGroups,
                              offer.companyGroupId,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Manager / Responsible
                          </span>
                          <span className="font-bold text-slate-700">
                            {resolveLabel(
                              options.employees,
                              offer.assignedToEmployeeId,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Offer Date
                          </span>
                          <span className="font-semibold text-slate-600">
                            {formatDate(offer.offerCreateDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Expiry Date
                          </span>
                          <span className="font-semibold text-slate-600">
                            {formatDate(offer.offerExpiryDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Currency
                          </span>
                          <span className="font-bold text-blue-600">
                            {resolveLabel(options.currencies, offer.currencyId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Place of Supply
                          </span>
                          <span className="font-semibold text-slate-600">
                            {resolveLabel(
                              options.states,
                              offer.placeOfSupplyId,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Bank Detail
                          </span>
                          <span className="font-semibold text-slate-600 truncate block max-w-[150px]">
                            {resolveLabel(options.banks, offer.bankDetailId)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-1">
                            Freight (This OA)
                          </span>
                          <span className="font-bold text-slate-700">
                            {curSym} {offer.freightCharges?.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-2">
                            Delivery Address
                          </span>
                          <p className="text-xs text-slate-600 italic whitespace-pre-wrap leading-relaxed">
                            {offer.address || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-slate-400 font-bold uppercase text-[8px] block mb-2">
                            Customer Notes
                          </span>
                          <p className="text-xs text-slate-600 italic whitespace-pre-wrap leading-relaxed">
                            {offer.customerNotes || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C: CONSOLIDATED ITEMS TABLE */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.3em]">
                  Consolidated Line Items
                </h4>
                <div className="rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f07837] text-white">
                      <tr>
                        <th className="p-5 w-12 text-center">#</th>
                        <th className="p-5">Description & Logistics</th>
                        <th className="p-5 text-center">HSN/SAC</th>
                        <th className="p-5 text-center">Qty</th>
                        <th className="p-5 text-right">Unit Rate</th>
                        <th className="p-5 text-right">Tax Component</th>
                        <th className="p-5 text-right">Row Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {data.items?.map((item: any, i: number) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="p-5 text-center font-bold text-slate-300 border-r">
                            {i + 1}
                          </td>
                          <td className="p-5 space-y-2">
                            <p className="font-black text-slate-800 text-[13px]">
                              {item.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-[8px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-tighter">
                                {item.itemType}
                              </span>
                              {item.productSource && (
                                <span
                                  className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${item.productSource === "Imported" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
                                >
                                  {item.productSource}
                                </span>
                              )}
                              {item.sourceOA && (
                                <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-black uppercase tracking-tighter">
                                  Ref OA: {item.sourceOA}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-5 text-center font-mono font-bold text-slate-400">
                            {item.hsnSacCode || "—"}
                          </td>
                          <td className="p-5 text-center font-black text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="p-5 text-right font-bold text-slate-600">
                            {curSym}{" "}
                            {Number(item.rate).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-5 text-right">
                            <div className="flex flex-col gap-0.5 text-[9px]">
                              {item.igstAmount > 0 && (
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                  IGST: {curSym}
                                  {item.igstAmount.toFixed(2)}
                                </span>
                              )}
                              {item.cgstAmount > 0 && (
                                <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                  CGST: {curSym}
                                  {item.cgstAmount.toFixed(2)}
                                </span>
                              )}
                              {item.sgstAmount > 0 && (
                                <span className="text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                  SGST: {curSym}
                                  {item.sgstAmount.toFixed(2)}
                                </span>
                              )}
                              {!(item.igstAmount || item.cgstAmount) && (
                                <span className="text-slate-400 italic">
                                  No Tax
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-5 text-right font-black text-slate-900 text-sm">
                            {curSym}{" "}
                            {Number(item.finalPrice).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION D: FINAL PO REMARKS & TOTALS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        Global PO Remarks
                      </h5>
                      <div className="p-5 bg-white rounded-3xl text-[10px] text-slate-500 italic min-h-[100px] border border-slate-200 shadow-sm">
                        {data.customerNotes || "No global remarks logged."}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                        PO Terms & Conditions
                      </h5>
                      <div className="p-5 bg-white rounded-3xl text-[10px] text-slate-500 min-h-[100px] border border-slate-200 shadow-sm whitespace-pre-wrap">
                        {data.termsConditions ||
                          "Standard commercial terms apply."}
                      </div>
                    </div>
                  </div>
                </div>

                {/* FINANCIAL SUMMARY CARD */}
                <div className="lg:col-span-5">
                  <div className="bg-[#f07837] rounded-[3rem] p-10 text-white shadow-2xl space-y-8 relative overflow-hidden border border-white/10">
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]"></div>
                    <div className="relative space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-300 border-b border-white/10 pb-4">
                        Consolidated Valuation
                      </h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-white/40 uppercase tracking-widest text-[9px]">
                            Consolidated Subtotal
                          </span>
                          <span className="font-mono text-xl">
                            {curSym}{" "}
                            {subtotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-white/40 uppercase tracking-widest text-[9px]">
                            Freight & Logistics
                          </span>
                          <span className="font-mono text-xl">
                            {curSym}{" "}
                            {Number(data.freightCharges || 0).toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                            Total Payable Amount
                          </p>
                          <p className="text-[9px] text-white/30 italic">
                            Inclusive of all taxes & charges
                          </p>
                        </div>
                        <p className="text-5xl font-black font-mono tracking-tighter text-white">
                          {curSym}
                          {grandTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. MODAL ACTION FOOTER */}
            <div className="p-10 border-t border-slate-100 flex gap-4 justify-end bg-slate-50/90 rounded-b-[3rem] items-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase mr-auto flex items-center gap-2 italic">
                <FaInfoCircle /> Cross-check all 16 metadata fields per OA
                before authorizing the document.
              </p>
              <button
                onClick={() => setShowPreview(false)}
                className="px-10 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-800 transition-all"
              >
                Return to Editor
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="px-12 py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all disabled:bg-slate-300 flex items-center gap-2"
              >
                {isSaving
                  ? "Updating..."
                  : data.purchaseOrderId > 0
                    ? "PO Update"
                    : "Confirm & Save PO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderWizard;
