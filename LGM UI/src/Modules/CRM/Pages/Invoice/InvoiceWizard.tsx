import React, { useEffect, useRef, useState } from "react";
import Select, { type SingleValue } from "react-select";
import {
  FaBoxOpen,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaTrash,
  FaUserEdit,
} from "react-icons/fa";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import {
  getBanksByCompanyId,
  getCompanies,
  getCompanyGroups,
  getCurrencies,
  // getCustomerAddress,
  getCustomerContacts,
  getCustomersByCompanyGroup,
  getProductGroups,
  getStates,
  getVendors,
  saveInvoice,
  updateInvoice,
  getActiveOrderAcceptances, // <-- IMPORT THIS
  getDataFromOrderAcceptance,
  getServiceReportSerials, // <-- ADD THIS
  getDataFromServiceReport,
  getActiveProformaInvoices,
  getDataFromProformaInvoice,
} from "./Services/InvoiceService";
import type {
  AccessoryResponse,
  BankResponse,
  InvoiceData,
  InvoiceItem,
  InvoiceViewData,
  ProductResponse,
  SelectOption,
} from "./Services/types";
import { toast } from "sonner";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { getProducts } from "../Product/Services/ProductService";
import { getAccessories } from "../Accessories/Services/AccessoriesService";
import apiClient from "../../../../API/apiClient";

// const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const FREIGHT_LINE = "* FREIGHT & INSURANCE : EXCLUSIVE";

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

const getTermsConditions = (
  freightCharges: number,
  placeOfSupplyLabel?: string,
  isINR?: boolean,
) => {
  const placeText = placeOfSupplyLabel || "IND";

  const lines = [
    isINR ? "* PRICES : DOOR DELIVERY" : `* PRICES : CIF, ${placeText}`,
    "* PAYMENT : 100% ADVANCE",
    "* DUTY & TAXES : Extra, As Applicable",
    "* DELIVERY : 4-5 Weeks from the date of Confirm Order.",
    "* WARRANTY : One Year from the date of Purchase",
  ];

  if (Number(freightCharges) > 0) {
    lines.splice(1, 0, FREIGHT_LINE);
  }

  return lines.join("\n");
};

const createDefaultInvoiceData = (): InvoiceData => ({
  invoiceId: 0,
    orderAcceptanceId: null,
  group: null,
  company: null,
  vendor: null,
  companyGroup: null,
  customerCompany: null,
  responsiblePersonName: null,
  currency: null,
  placeOfSupply: null,
  currencyId: 0,
  invoiceNo: "",
  invoiceDate: getTodayDate(),
  invoiceDueDate: getTodayDate(),
  customerPo: "",
  companyPoDate: getTodayDate(),
  consigneeNameAddress: "",
  description: "",
  subtotal: 0,
  grandTotal: 0,
  advanceReceived: false,
  advanceAmount: 0,
  balanceAmount: 0,
  bankDetail: null,
  items: [],
  termsConditions: getTermsConditions(0, "IND", false),
  customerNotes: "",
  freightCharges: 0,
  serviceId: null,
});

interface InvoiceWizardProps {
  onCancel: () => void;
  onSuccess: () => void;
  editData?: InvoiceViewData | null;
}

const InvoiceWizard: React.FC<InvoiceWizardProps> = ({
  onCancel,
  onSuccess,
  editData,
}) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOAs, setActiveOAs] = useState<SelectOption[]>([]);
  const [serviceReportOptions, setServiceReportOptions] = useState<
    SelectOption[]
  >([]);
  const [proformaInvoiceOptions, setProformaInvoiceOptions] = useState<
    SelectOption[]
  >([]);

  const [isPiSelected, setIsPiSelected] = useState(false);
  const [isOaSelected, setIsOaSelected] = useState(false);
  const [isSrSelected, setIsSrSelected] = useState(false);
  const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);
  const [companyOptions, setCompanyOptions] = useState<SelectOption[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<SelectOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [companyGroupOptions, setCompanyGroupOptions] = useState<
    SelectOption[]
  >([]);
  // NOTE: We don't need customerOptions in state anymore for the dropdown, but it's used inside handleOaSelection.
  // We'll fetch it on-demand there instead of storing it in state.
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<SelectOption[]>([]);
  // const [contactOptions, setContactOptions] = useState<SelectOption[]>([]);
  const [companyBanks, setCompanyBanks] = useState<SelectOption[]>([]);
  // const [liveRates, setLiveRates] = useState<any>(null);
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
  const isEditMode = !!editData;

  const [data, setData] = useState<InvoiceData>(createDefaultInvoiceData());

  useEffect(() => {
    if (!isInitializing) return;

    if (isEditMode) {
      if (
        editData &&
        productOptions.length > 0 &&
        accessoryOptions.length > 0 &&
        data.grandTotal > 0 &&
        data.grandTotal === editData.grandTotal
      ) {
        setIsInitializing(false);
      }
    } else {
      if (
        companyOptions.length > 0 &&
        activeOAs.length > 0 &&
        serviceReportOptions.length > 0
      ) {
        // <-- Make sure OAs are also loaded
        setIsInitializing(false);
      }
    }
  }, [
    isInitializing,
    isEditMode,
    editData,
    data.grandTotal,
    companyOptions,
    productOptions,
    accessoryOptions,
    activeOAs,
    serviceReportOptions,
  ]);

  useEffect(() => {
    if (isEditMode) {
      setIsOaSelected(true);
    }
    loadMasters();
  }, [isEditMode]);

  const loadMasters = async () => {
    const [
      groups,
      companies,
      vendors,
      currencies,
      states,
      companyGroups,
      products,
      accessories,
      orderAcceptances,
      serviceReports,
      proformaInvoices,
    ] = await Promise.all([
      getProductGroups(),
      getCompanies(),
      getVendors(),
      getCurrencies(),
      getStates(),
      getCompanyGroups(),
      getProducts(),
      getAccessories(),
      isEditMode ? Promise.resolve([]) : getActiveOrderAcceptances(),
      isEditMode ? Promise.resolve([]) : getServiceReportSerials(),
      isEditMode ? Promise.resolve([]) : getActiveProformaInvoices(),
    ]);

    setGroupOptions(
      groups.map((g: { id: number; groupName: string }) => ({
        value: g.id,
        label: g.groupName,
      })),
    );

    setCompanyOptions(
      companies.map(
        (c: {
          companyId: number;
          companyName: string;
          stateName?: string;
        }) => ({
          value: c.companyId,
          label: c.companyName,
          stateName: c.stateName,
        }),
      ),
    );

    setVendorOptions(
      vendors.map((v: { id: number; vendorName: string }) => ({
        value: v.id,
        label: v.vendorName,
      })),
    );

    setCurrencyOptions(
      currencies.map(
        (c: {
          id: number;
          currencyName: string;
          currencySymbol: string;
          currencyCode?: string;
        }) => ({
          value: c.id,
          label: c.currencyName,
          currencySymbol: c.currencySymbol,
          currencyCode: c.currencyCode || c.currencyName,
        }),
      ),
    );

    setStateOptions(
      states.map((s: { id: number; stateName: string }) => ({
        value: s.id,
        label: s.stateName,
      })),
    );

    setCompanyGroupOptions(
      companyGroups.map((cg: { id: number; companyGroupName: string }) => ({
        value: cg.id,
        label: cg.companyGroupName,
      })),
    );

    setProductOptions(
      products.map(
        (p: ProductResponse): SelectOption => ({
          value: p.productId,
          label: `${p.productCode} - ${p.ProductDescription || p.productName}`,
          image: p.productImagePath,
          hsnCode: p.hsnCode,
          currencyPrices: p.currencyPrices,
          mapAccessories: p.mapAccessories,
          partNo: p.partNo,
        }),
      ),
    );

    setAccessoryOptions(
      accessories.map(
        (a: AccessoryResponse): SelectOption => ({
          value: a.accessoriesId,
          label: `${a.accessoriesCode} - ${a.accessoriesDescription}`,
          image: a.accessoriesImagePath,
          price: a.salePrice,
          hsnCode: a.hsnCode,
          currencyPrices: a.currencyPrices,
          partNo: a.partNo,
        }),
      ),
    );
    setActiveOAs(
      (orderAcceptances || []).map((oa: any) => ({
        value: oa.value,
        label: oa.label,
      })),
    );

    setServiceReportOptions(
      (serviceReports || []).map((sr: any) => ({
        value: sr.value,
        label: sr.label,
      })),
    );

    setProformaInvoiceOptions(
      (proformaInvoices || []).map((pi: any) => ({
        value: pi.value,
        label: pi.label,
      })),
    );
  };

  const selectedCurrencyObj = currencyOptions.find(
    (c) => c.value === data.currency?.value,
  );

  const curSym = selectedCurrencyObj?.currencySymbol || "";
  const isINR =
    selectedCurrencyObj?.currencyCode?.toUpperCase() === "INR" ||
    selectedCurrencyObj?.label?.toUpperCase() === "INR" ||
    selectedCurrencyObj?.currencySymbol === "₹";

  const selectedBillingCompany = companyOptions.find(
    (c) => Number(c.value) === Number(data.company?.value),
  );

  const selectedPlaceOfSupply = stateOptions.find(
    (s) => Number(s.value) === Number(data.placeOfSupply?.value),
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

  const placeOfSupplyLabel = selectedPlaceOfSupply?.label || "IND";

  const handleOaSelection = async (opt: SingleValue<SelectOption>) => {
    if (!opt?.value) {
      setData(createDefaultInvoiceData());
      setIsOaSelected(false);
      return;
    }

    toast.loading("Fetching data from Order Acceptance...");

    try {
      const oaData = await getDataFromOrderAcceptance(Number(opt.value));

      // --- START OF CORRECTED LOGIC (SINGLE, CLEAN BLOCK) ---

      // 1. Find the necessary master data objects for our calculations.
      // const currencyForGst = currencyOptions.find((o) => o.value === oaData.currencyId);
      // const billingCompanyForGst = companyOptions.find(c => c.value === oaData.companyId);
      // const placeOfSupplyForGst = stateOptions.find(s => s.value === oaData.placeOfSupplyId);

      // 2. Determine if the invoice will apply GST using the same logic as the main component.
      //  const isInvoiceInr = !!currencyForGst && (
      //     currencyForGst.currencyCode?.toUpperCase() === "INR" ||
      //     currencyForGst.label?.toUpperCase() === "INR" ||
      //     currencyForGst.currencySymbol === "₹"
      // );
      // const hasGstStateContext = !!billingCompanyForGst?.stateName && !!placeOfSupplyForGst?.label;
      // const willApplyGst = isInvoiceInr && hasGstStateContext;

      // 3. Process the items to calculate the correct rate for the invoice.
      const processedItems = (oaData.items || []).map((item: any) => ({
        ...item,
        // ✅ Keep EXACT values from OA
        rate: item.rate,
        total: item.total,
        gstAmount: item.gstAmount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        igstAmount: item.igstAmount,
        finalPrice: item.finalPrice,

        originalPrice: null,
        originalCurrency: null,
      }));

      // We still need the lists of master data to find the labels for the IDs
      const customers = oaData.companyGroupId
        ? await getCustomersByCompanyGroup(oaData.companyGroupId)
        : [];
      const customer = customers.find((c: any) => c.id === oaData.customerId);
      const contacts = oaData.customerId
        ? await getCustomerContacts(oaData.customerId)
        : [];
      const responsiblePerson = contacts.find(
        (c: any) => c.value === oaData.responsiblePersonId,
      );

      setData((prev) => ({
        ...prev,
          orderAcceptanceId: oaData.orderAcceptanceId,
        invoiceNo: oaData.invoiceNo || "",
        group:
          groupOptions.find((o) => o.value === oaData.productGroupId) || null,
        company:
          companyOptions.find((o) => o.value === oaData.companyId) || null,
        vendor: vendorOptions.find((o) => o.value === oaData.vendorId) || null,
        companyGroup:
          companyGroupOptions.find((o) => o.value === oaData.companyGroupId) ||
          null,
        customerCompany: customer
          ? {
              value: customer.id,
              label: `${customer.customerName} (${customer.customerCode})`,
            }
          : null,
        responsiblePersonName: responsiblePerson || null,
        currency:
          currencyOptions.find((o) => o.value === oaData.currencyId) || null,
        currencyId: oaData.currencyId || 0,
        placeOfSupply:
          stateOptions.find((o) => o.value === oaData.placeOfSupplyId) || null,

        consigneeNameAddress: oaData.consigneeNameAddress,
        customerPo: oaData.customerPo,
        companyPoDate: oaData.companyPoDate
          ? oaData.companyPoDate.split("T")[0]
          : getTodayDate(),

        freightCharges: oaData.freightCharges || 0,
        termsConditions: oaData.termsConditions,
        customerNotes: oaData.customerNotes,

        items: processedItems,
        serviceId: oaData.serviceId || null,
      }));

      setIsOaSelected(true);
      toast.dismiss();
      toast.success("Data pulled successfully!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch data from Order Acceptance.");
    }
  };

  const handleSrSelection = async (opt: SingleValue<SelectOption>) => {
    if (!opt?.value) {
      setData(createDefaultInvoiceData());
      setIsSrSelected(false);
      return;
    }

    toast.loading("Fetching data from Service Report...");

    try {
      const srData = await getDataFromServiceReport(Number(opt.value));

      // This logic assumes the data structure from the service report
      // is similar to the one from order acceptance. Adjust if needed.
      const processedItems = (srData.items || []).map((item: any) => ({
        ...item,
        rate: item.rate,
        total: item.total,
        gstAmount: item.gstAmount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        igstAmount: item.igstAmount,
        finalPrice: item.finalPrice,
        originalPrice: null,
        originalCurrency: null,
      }));

      const customers = srData.companyGroupId
        ? await getCustomersByCompanyGroup(srData.companyGroupId)
        : [];
      const customer = customers.find((c: any) => c.id === srData.customerId);
      const contacts = srData.customerId
        ? await getCustomerContacts(srData.customerId)
        : [];
      const responsiblePerson = contacts.find(
        (c: any) => c.value === srData.responsiblePersonId,
      );

      setData((prev) => ({
        ...prev,
        invoiceNo: srData.invoiceNo || "",
        group:
          groupOptions.find((o) => o.value === srData.productGroupId) || null,
        company:
          companyOptions.find((o) => o.value === srData.companyId) || null,
        vendor: vendorOptions.find((o) => o.value === srData.vendorId) || null,
        companyGroup:
          companyGroupOptions.find((o) => o.value === srData.companyGroupId) ||
          null,
        customerCompany: customer
          ? {
              value: customer.id,
              label: `${customer.customerName} (${customer.customerCode})`,
            }
          : null,
        responsiblePersonName: responsiblePerson || null,
        currency:
          currencyOptions.find((o) => o.value === srData.currencyId) || null,
        currencyId: srData.currencyId || 0,
        placeOfSupply:
          stateOptions.find((o) => o.value === srData.placeOfSupplyId) || null,
        consigneeNameAddress: srData.consigneeNameAddress,
        customerPo: srData.customerPo,
        companyPoDate: srData.companyPoDate
          ? srData.companyPoDate.split("T")[0]
          : getTodayDate(),
        freightCharges: srData.freightCharges || 0,
        termsConditions: srData.termsConditions,
        customerNotes: srData.customerNotes,
        items: processedItems,
        serviceId: null, // Link to the service report
        serviceReportId: srData.serviceReportId || Number(opt.value),
      }));

      setIsSrSelected(true);
      toast.dismiss();
      toast.success("Data pulled successfully from Service Report!");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch data from Service Report.");
    }
  };

  const handleProformaInvoiceSelection = async (
    opt: SingleValue<SelectOption>,
  ) => {
    if (!opt?.value) {
      setData(createDefaultInvoiceData());
      setIsPiSelected(false);
      return;
    }

    toast.loading("Fetching data from Proforma Invoice...");

    try {
      const piData = await getDataFromProformaInvoice(Number(opt.value));

      const processedItems = (piData.items || []).map((item: any) => ({
        ...item,

        rate: item.rate,
        total: item.total,
        gstAmount: item.gstAmount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        igstAmount: item.igstAmount,
        finalPrice: item.finalPrice,

        originalPrice: null,
        originalCurrency: null,
      }));

      const customers = piData.companyGroupId
        ? await getCustomersByCompanyGroup(piData.companyGroupId)
        : [];

      const customer = customers.find((c: any) => c.id === piData.customerId);

      const contacts = piData.customerId
        ? await getCustomerContacts(piData.customerId)
        : [];

      const responsiblePerson = contacts.find(
        (c: any) => c.value === piData.responsiblePersonId,
      );

      setData((prev) => ({
        ...prev,
        invoiceNo: piData.invoiceNo || "",
        group:
          groupOptions.find((o) => o.value === piData.productGroupId) || null,

        company:
          companyOptions.find((o) => o.value === piData.companyId) || null,

        vendor: vendorOptions.find((o) => o.value === piData.vendorId) || null,

        companyGroup:
          companyGroupOptions.find((o) => o.value === piData.companyGroupId) ||
          null,

        customerCompany: customer
          ? {
              value: customer.id,
              label: `${customer.customerName} (${customer.customerCode})`,
            }
          : null,

        responsiblePersonName: responsiblePerson || null,

        currency:
          currencyOptions.find((o) => o.value === piData.currencyId) || null,

        currencyId: piData.currencyId || 0,

        placeOfSupply:
          stateOptions.find((o) => o.value === piData.placeOfSupplyId) || null,

        consigneeNameAddress: piData.consigneeNameAddress,

        customerPo: piData.customerPo,

        companyPoDate: piData.companyPoDate
          ? piData.companyPoDate.split("T")[0]
          : getTodayDate(),

        freightCharges: piData.freightCharges || 0,

        termsConditions: piData.termsConditions,

        customerNotes: piData.customerNotes,

        items: processedItems,
      }));

      setIsPiSelected(true);

      toast.dismiss();
      toast.success("Data fetched from Proforma Invoice!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch Proforma Invoice data");
    }
  };

  const handleTableScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasHorizontalScrollbar = el.scrollWidth > el.clientWidth;
      setShowLeftArrow(hasHorizontalScrollbar && el.scrollLeft > 0);
      setShowRightArrow(
        hasHorizontalScrollbar &&
          Math.ceil(el.scrollLeft) < el.scrollWidth - el.clientWidth - 1,
      );
    }
  };

  useEffect(() => {
    handleTableScroll();
    window.addEventListener("resize", handleTableScroll);
    return () => window.removeEventListener("resize", handleTableScroll);
  }, [data.items]);

  const scrollTable = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -400 : 400;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

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
      } catch (error) {
        console.error("Failed to fetch Wise live rates for conversion", error);
        toast.error("Failed to load Wise currency rates");
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      termsConditions: getTermsConditions(
        Number(prev.freightCharges || 0),
        stateOptions.find(
          (s) => Number(s.value) === Number(prev.placeOfSupply?.value),
        )?.label || "IND",
        isINR,
      ),
    }));
  }, [data.placeOfSupply, data.freightCharges, stateOptions, isINR]);

  const labelClass =
    "text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1";
  const inputClass =
    "w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500 h-[38px] bg-white";
  const readOnlyInputClass = `${inputClass} bg-gray-100 cursor-not-allowed`;

  const calculateRow = (
    item: InvoiceItem,
    currencyIsINR = isINR,
  ): InvoiceItem => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const dis = Number(item.discount) || 0;

    const taxableAmount = qty * rate * (1 - dis / 100);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (currencyIsINR && hasValidGstState) {
      if (isIntraState) {
        cgst = Math.round((taxableAmount * 0.09 + Number.EPSILON) * 100) / 100;
        sgst = Math.round((taxableAmount * 0.09 + Number.EPSILON) * 100) / 100;
      } else {
        igst = Math.round((taxableAmount * 0.18 + Number.EPSILON) * 100) / 100;
      }
    }

    const totalGst = cgst + sgst + igst;

    return {
      ...item,
      total: taxableAmount,
      taxPercentage: currencyIsINR && hasValidGstState ? 18 : 0,
      gstAmount: totalGst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      finalPrice: taxableAmount + totalGst,
    };
  };

  useEffect(() => {
    if (!isOaSelected && !isSrSelected && !isPiSelected && !isEditMode) return;

    // ✅ DO NOT recalculate if coming from OA
    const updatedItems = data.items;

    const sub = updatedItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = updatedItems.reduce((s, i) => s + (i.gstAmount || 0), 0);

    setData((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(prev.freightCharges),
    }));
  }, [
    data.items,
    data.company,
    data.placeOfSupply,
    data.currency,
    data.freightCharges,
    isOaSelected,
    isSrSelected,
    isEditMode,
  ]);

  useEffect(() => {
  const balance =
    Number(data.grandTotal || 0) -
    Number(data.advanceAmount || 0);

  setData((prev) => ({
    ...prev,
    balanceAmount: balance < 0 ? 0 : balance,
  }));
}, [data.advanceAmount, data.grandTotal]);

  const updateMultipleItemFields = (
    index: number,
    updates: Partial<InvoiceItem>,
  ) => {
    const newItems: InvoiceItem[] = [...data.items];

    if (isOaSelected) {
      // DO NOT recalculate GST
      newItems[index] = {
        ...newItems[index],
        ...updates,
      };
    } else {
      newItems[index] = calculateRow({
        ...newItems[index],
        ...updates,
      });
    }

    const sub = newItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = newItems.reduce((s, i) => s + (i.gstAmount || 0), 0);

    setData({
      ...data,
      items: newItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(data.freightCharges),
    });
  };
  // Removed handleCurrencyChange as it's now read-only

  //   const addItem = () => {
  //   const newItem: InvoiceItem = isOaSelected
  //     ? {
  //         itemType: "Product",
  //         productId: 0,
  //         accessoryId: null,
  //         description: "",
  //         hsnSacCode: "",
  //         quantity: 1,
  //         rate: 0,
  //         discount: 0,
  //         taxPercentage: 0,
  //         total: 0,
  //         gstAmount: 0,
  //         finalPrice: 0,
  //         accessoryIds: [],
  //         originalPrice: null,
  //         originalCurrency: null,
  //         cgstAmount: 0,
  //         sgstAmount: 0,
  //         igstAmount: 0,
  //       }
  //     : calculateRow({
  //         itemType: "Product",
  //         productId: 0,
  //         accessoryId: null,
  //         description: "",
  //         hsnSacCode: "",
  //         quantity: 1,
  //         rate: 0,
  //         discount: 0,
  //         taxPercentage: 0,
  //         total: 0,
  //         gstAmount: 0,
  //         finalPrice: 0,
  //         accessoryIds: [],
  //         originalPrice: null,
  //         originalCurrency: null,
  //         cgstAmount: 0,
  //         sgstAmount: 0,
  //         igstAmount: 0,
  //       });

  //   setData({
  //     ...data,
  //     items: [...data.items, newItem],
  //   });
  // };

  //   const addAccessoryItem = () => {
  //   const newItem: InvoiceItem = isOaSelected
  //     ? {
  //         itemType: "Accessory",
  //         productId: null,
  //         accessoryId: 0,
  //         description: "",
  //         hsnSacCode: "",
  //         quantity: 1,
  //         rate: 0,
  //         discount: 0,
  //         taxPercentage: 0,
  //         total: 0,
  //         gstAmount: 0,
  //         finalPrice: 0,
  //         accessoryIds: [],
  //         originalPrice: null,
  //         originalCurrency: null,
  //         cgstAmount: 0,
  //         sgstAmount: 0,
  //         igstAmount: 0,
  //       }
  //     : calculateRow({
  //         itemType: "Accessory",
  //         productId: null,
  //         accessoryId: 0,
  //         description: "",
  //         hsnSacCode: "",
  //         quantity: 1,
  //         rate: 0,
  //         discount: 0,
  //         taxPercentage: 0,
  //         total: 0,
  //         gstAmount: 0,
  //         finalPrice: 0,
  //         accessoryIds: [],
  //         originalPrice: null,
  //         originalCurrency: null,
  //         cgstAmount: 0,
  //         sgstAmount: 0,
  //         igstAmount: 0,
  //       });

  //   setData({
  //     ...data,
  //     items: [...data.items, newItem],
  //   });
  // };

  useEffect(() => {
    const companyId = data.company?.value;

    if (!companyId) {
      setCompanyBanks([]);
      return;
    }

    const loadBanks = async () => {
      const banks: BankResponse[] = await getBanksByCompanyId(
        Number(companyId),
      );

      const formatted: SelectOption[] = banks.map((b: BankResponse) => ({
        value: b.bankDetailId,
        label: `${b.bankName} - ${b.accountNo}`,
      }));

      setCompanyBanks(formatted);
      // Auto-select the bank if it's pre-filled from OA/Edit Data
      if (data.bankDetail?.value) {
        const matchingBank = formatted.find(
          (b) => b.value === data.bankDetail?.value,
        );
        if (matchingBank) {
          setData((p) => ({ ...p, bankDetail: matchingBank }));
        }
      }
    };

    loadBanks();
  }, [data.company]);

  const handleSaveInvoice = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      if (data.invoiceId) {
        await updateInvoice(data);
        toast.success("Invoice updated successfully");
      } else {
        await saveInvoice(data);
        toast.success("Invoice saved successfully");
      }

      onSuccess();
    } catch (error: any) {
  console.error(error);

  const errorMessage =
    error?.response?.data?.message ||
    error?.response?.data ||
    error?.message ||
    "Failed to save invoice";

  toast.error(errorMessage);
}finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!editData) return;

    setData((prev) => ({
      ...prev,
      invoiceId: editData.invoiceId,
      invoiceNo: editData.invoiceNo,
      invoiceDate: editData.invoiceDate?.split("T")[0],
      invoiceDueDate: editData.invoiceDueDate?.split("T")[0],
      customerPo: editData.customerPo,
      companyPoDate: editData.companyPoDate?.split("T")[0],
      consigneeNameAddress: editData.consigneeNameAddress,
      description: editData.description,
      subtotal: editData.subTotal,
      freightCharges: editData.freightCharges,
      grandTotal: editData.grandTotal,
      advanceReceived: editData.advanceReceived,
      advanceAmount: editData.advanceAmount,
      balanceAmount: editData.balanceAmount,
      termsConditions:
        editData.termsConditions ||
        getTermsConditions(
          editData.freightCharges || 0,
          editData.placeOfSupplyName || "IND",
          editData.currencySymbol === "₹" || editData.currencyName === "INR",
        ),
      customerNotes: editData.customerNotes,

      group: {
        value: editData.productGroupId,
        label: editData.productGroupName,
      },
      company: {
        value: editData.companyId,
        label: editData.companyName ?? "",
      },
      vendor: {
        value: editData.vendorId,
        label: editData.vendorName ?? "",
      },
      companyGroup: {
        value: editData.companyGroupId,
        label: editData.companyGroupName ?? "",
      },
      customerCompany: {
        value: editData.customerId,
        label: editData.customerName ?? "",
      },
      responsiblePersonName: {
        value: editData.responsiblePersonId,
        label: editData.responsiblePersonName ?? "",
      },
      currency: {
        value: editData.currencyId,
        label: editData.currencyName ?? "",
        currencySymbol: editData.currencySymbol ?? "",
      },
      currencyId: editData.currencyId,
      placeOfSupply: {
        value: editData.placeOfSupplyId,
        label: editData.placeOfSupplyName ?? "",
      },
      bankDetail: {
        value: editData.bankDetailId,
        label: `${editData.bankName ?? ""} - ${editData.accountNo ?? ""}`,
      },
      serviceId: editData.serviceId || null,
      items: editData.items.map((i) => ({
        productId: i.productId,
        accessoryId: i.accessoryId,
        itemType: i.accessoryId ? "Accessory" : "Product",
        description: i.description,
        hsnSacCode: i.hsnSacCode,
        quantity: i.quantity,
        rate: i.rate,
        discount: i.discount,
        total: i.total,
        gstAmount: i.gstAmount,
        finalPrice: i.price,
        taxPercentage: i.taxPercentage,
        accessoryIds: i.accessoryIds || [],
        cgstAmount: i.cgstAmount || 0,
        sgstAmount: i.sgstAmount || 0,
        igstAmount: i.igstAmount || 0,
        originalPrice: i.originalPrice ?? null,
        originalCurrency: i.originalCurrency ?? null,
      })),
    }));
  }, [editData]);

  const isFormVisible =
    isOaSelected || isSrSelected || isPiSelected || isEditMode;

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500 text-left">
      <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FaBoxOpen /> {isEditMode ? "Edit Invoice" : "New Invoice"}
        </h2>

        <button
          onClick={onCancel}
          className="bg-white/10 hover:bg-red-500 p-2 px-4 rounded-lg flex items-center gap-2 text-xs uppercase font-bold transition"
        >
          <FaTimes /> Close
        </button>
      </div>
      {!isFormVisible ? (
        <div className="p-8">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-blue-900">
              SYNC ORDER ACCEPTANCE
            </label>
            <Select
              options={Array.isArray(activeOAs) ? activeOAs : []}
              onChange={handleOaSelection}
              placeholder="Search and select a finalized Order Acceptance..."
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              isClearable
              isDisabled={isSrSelected}
            />
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 font-bold text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50/70 p-5">
            <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-green-900">
              SYNC SERVICE REPORT
            </label>
            <Select
              options={
                Array.isArray(serviceReportOptions) ? serviceReportOptions : []
              }
              onChange={handleSrSelection}
              placeholder="Search and select a Service Report serial number..."
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
              isClearable
              isDisabled={isOaSelected} // Disable if an OA is selected
            />
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>

            <span className="flex-shrink mx-4 text-gray-400 font-bold text-sm">
              OR
            </span>

            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-5">
            <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-purple-900">
              CREATE INVOICE FROM PROFORMA INVOICE
            </label>

            <Select
              options={
                Array.isArray(proformaInvoiceOptions)
                  ? proformaInvoiceOptions
                  : []
              }
              onChange={handleProformaInvoiceSelection}
              placeholder="Search and select Proforma Invoice..."
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

                control: (base) => ({
                  ...base,
                  minHeight: "34px",
                }),
              }}
              isClearable
              isDisabled={isOaSelected || isSrSelected}
            />
          </div>
        </div>
      ) : (
        <div className="p-8">
          {/* HEADER GRID --- CHANGED TO READ-ONLY INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-5 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <label className={labelClass}>Group</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.group?.label || ""}
                readOnly
              />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.company?.label || ""}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Vendor</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.vendor?.label || ""}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Company Group</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.companyGroup?.label || ""}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Customer Company</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.customerCompany?.label || ""}
                readOnly
              />
            </div>

            {/* <div>
            <label className={labelClass}>Responsible Person Name</label>
             <input
              type="text"
              className={readOnlyInputClass}
              value={data.responsiblePersonName?.label || ""}
              readOnly
            />
          </div> */}

            <div>
              <label className={labelClass}>Currency</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.currency?.label || ""}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Place of Supply</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.placeOfSupply?.label || ""}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Invoice No.</label>
             <input
              type="text"
              className={`${inputClass} bg-gray-200 font-bold text-blue-400`}
              value={data.invoiceNo}
              placeholder="Enter Invoice No"
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  invoiceNo: e.target.value,
                }))
              }
            />
            </div>

            <div>
              <label className={labelClass}>Invoice Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.invoiceDate}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    invoiceDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className={labelClass}>Invoice Due Date</label>
              <input
                type="date"
                className={inputClass}
                value={data.invoiceDueDate}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    invoiceDueDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className={labelClass}>Customer PO</label>
              <input
                type="text"
                className={readOnlyInputClass}
                value={data.customerPo}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Customer PO Date</label>
              <input
                type="date"
                className={readOnlyInputClass}
                value={data.companyPoDate}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Delivery Name & Address</label>
              <textarea
                className={`${readOnlyInputClass} h-20`}
                value={data.consigneeNameAddress}
                readOnly
              />
            </div>

            <div>
              <label className={labelClass}>Description Of Work</label>
              <input
                type="text"
                value={data.description}
                className={inputClass}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          {/* END OF HEADER GRID CHANGES */}

          {/* THE REST OF THE COMPONENT (TABLE, TOTALS, ETC.) REMAINS THE SAME */}
          {/* ... (pasting the rest of the file for completeness) ... */}

          {/* PRODUCT TABLE */}
          <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => scrollTable("left")}
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-[#f07837] hover:bg-[#194485] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300  transition-all"
                aria-label="Scroll left"
              >
                <FaChevronLeft size={18} />
              </button>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={handleTableScroll}
              className="border rounded-xl overflow-auto mb-6 shadow-sm border-gray-300 "
            >
              <table className="w-full text-left table-fixed min-w-[1100px]">
                <thead className="bg-[#f07837] text-white text-[12px] tracking-wider sticky top-0 z-0">
                  <tr>
                    <th className="p-3 border-r border-blue-900 w-[4%] text-center">
                      #
                    </th>
                    <th className="p-3 border-r border-blue-900 w-[40%]">
                      Product & Accessories
                    </th>
                    <th className="p-3 border-r border-blue-900 w-[8%] text-center">
                      Qty
                    </th>
                    <th className="p-3 border-r border-blue-900 w-[12%] text-center">
                      Rate
                    </th>
                    {/* // <th className="p-3 border-r border-blue-900 w-[8%] text-center">
                   // Dis%
                  //</th> */}
                    <th className="p-3 border-r border-blue-900 w-[12%] text-center">
                      Final Amt
                    </th>
                    {/* <th className="p-3 w-[8%] text-center">Image</th> */}
                    <th className="p-3 w-[3%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.items.map((item: InvoiceItem, i: number) => {
                    const isProductItem = item.itemType === "Product";
                    const isServiceItem = item.itemType === "Service";
                    const isAccessoryItem = !isProductItem && !isServiceItem;

                    // Get selected object based on type
                    const selectedProduct = isProductItem
                      ? productOptions.find((x) => x.value === item.productId)
                      : null;
                    const selectedAccessory = isAccessoryItem
                      ? accessoryOptions.find(
                          (x) => x.value === item.accessoryId,
                        )
                      : null;

                    const typeStyles = isProductItem
                      ? {
                          bg: "bg-blue-50",
                          text: "text-blue-700",
                          badge: "bg-blue-100 text-blue-800",
                          border: "border-blue-200",
                        }
                      : isServiceItem
                        ? {
                            // New style for Service Row (Green)
                            bg: "bg-green-50",
                            text: "text-green-700",
                            badge: "bg-green-100 text-green-800",
                            border: "border-green-200",
                          }
                        : {
                            bg: "bg-purple-50",
                            text: "text-purple-700",
                            badge: "bg-purple-100 text-purple-800",
                            border: "border-purple-200",
                          };

                    return (
                      <tr
                        key={i}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td
                          className={`p-3 font-bold text-center border-r ${typeStyles.bg} ${typeStyles.text}`}
                        >
                          {i + 1}
                        </td>
                        <td className="p-3 border-r space-y-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${typeStyles.badge} ${typeStyles.border}`}
                            >
                              {isProductItem
                                ? "Product Row"
                                : isServiceItem
                                  ? "Service Row"
                                  : "Paid Accessory"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              {isProductItem ? (
                                <Select
                                  options={productOptions}
                                  value={selectedProduct}
                                  isDisabled={!data.currencyId}
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  }}
                                  filterOption={(option, inputValue) => {
                                    const label =
                                      option.label?.toLowerCase() || "";
                                    const partNo =
                                      option.data.partNo?.toLowerCase() || "";
                                    const search = inputValue.toLowerCase();

                                    return (
                                      label.includes(search) ||
                                      partNo.includes(search)
                                    );
                                  }}
                                  onChange={(opt) => {
                                    if (!opt) return;

                                    const accIds = opt.mapAccessories
                                      ? opt.mapAccessories
                                          .split(",")
                                          .map(Number)
                                      : [];

                                    const currencyPrice =
                                      opt.currencyPrices?.find(
                                        (cp) =>
                                          Number(cp.currencyId) ===
                                          Number(data.currencyId),
                                      );

                                    let finalCalculatedRate = currencyPrice
                                      ? Number(currencyPrice.price)
                                      : 0;
                                    let origPrice: number | null = null;
                                    let origCurr: string | null = null;

                                    if (
                                      !currencyPrice &&
                                      isINR &&
                                      liveRates &&
                                      opt.currencyPrices?.length
                                    ) {
                                      const foreignPriceObj =
                                        opt.currencyPrices.find((cp: any) => {
                                          const matchedCurrency =
                                            currencyOptions.find(
                                              (c) =>
                                                Number(c.value) ===
                                                Number(cp.currencyId),
                                            );

                                          const code =
                                            matchedCurrency?.currencyCode?.toUpperCase() ||
                                            matchedCurrency?.label?.toUpperCase() ||
                                            "";

                                          return [
                                            "USD",
                                            "GBP",
                                            "EUR",
                                            "CNY",
                                          ].includes(code);
                                        });

                                      if (foreignPriceObj) {
                                        const matchedCurrency =
                                          currencyOptions.find(
                                            (c) =>
                                              Number(c.value) ===
                                              Number(
                                                foreignPriceObj.currencyId,
                                              ),
                                          );

                                        const foreignCode =
                                          matchedCurrency?.currencyCode?.toUpperCase() ||
                                          matchedCurrency?.label?.toUpperCase() ||
                                          "";

                                        const rateToINR =
                                          foreignCode &&
                                          foreignCode in liveRates
                                            ? liveRates[
                                                foreignCode as keyof typeof liveRates
                                              ]
                                            : 0;

                                        if (rateToINR) {
                                          finalCalculatedRate = parseFloat(
                                            (
                                              Number(foreignPriceObj.price) *
                                              Number(rateToINR) *
                                              1.25
                                            ).toFixed(2),
                                          );
                                          origPrice = Number(
                                            foreignPriceObj.price,
                                          );
                                          origCurr = foreignCode;

                                          toast.info(
                                            `Converted from ${foreignCode} (${origPrice}) at rate ${rateToINR.toFixed(2)}`,
                                          );
                                        }
                                      }
                                    }

                                    updateMultipleItemFields(i, {
                                      productId: Number(opt.value),
                                      accessoryId: null,
                                      itemType: "Product",
                                      rate: finalCalculatedRate,
                                      originalPrice: origPrice,
                                      originalCurrency: origCurr,
                                      accessoryIds: accIds,
                                      description: opt.label,
                                      hsnSacCode: opt.hsnCode || "",
                                    });

                                    if (
                                      !currencyPrice &&
                                      finalCalculatedRate === 0 &&
                                      data.currencyId
                                    ) {
                                      toast.error(
                                        `No direct INR price found, and no convertible foreign currency price was found in product master.`,
                                      );
                                    }
                                  }}
                                />
                              ) : isServiceItem ? (
                                // ✅ This is the new rendering for a service item
                                <div className="w-full border rounded p-2 text-sm bg-gray-100 text-gray-700 h-[38px] flex items-center">
                                  {item.description}
                                </div>
                              ) : (
                                <Select
                                  options={accessoryOptions}
                                  value={selectedAccessory}
                                  isDisabled={!data.currencyId}
                                  placeholder="Select Paid Accessory..."
                                  onChange={(opt) => {
                                    if (!opt) return;

                                    // Accessory Currency Conversion Logic (Same as Product)
                                    const currencyPrice =
                                      opt.currencyPrices?.find(
                                        (cp) =>
                                          Number(cp.currencyId) ===
                                          Number(data.currencyId),
                                      );
                                    let finalRate = currencyPrice
                                      ? Number(currencyPrice.price)
                                      : opt.price || 0;
                                    let oPrice = null,
                                      oCurr = null;

                                    if (
                                      !currencyPrice &&
                                      isINR &&
                                      liveRates &&
                                      opt.currencyPrices?.length
                                    ) {
                                      // Same conversion logic for accessories
                                      const foreignPrice =
                                        opt.currencyPrices.find((cp) => {
                                          const matchedCurrency =
                                            currencyOptions.find(
                                              (c) =>
                                                Number(c.value) ===
                                                Number(cp.currencyId),
                                            );

                                          const code =
                                            matchedCurrency?.currencyCode?.toUpperCase() ||
                                            matchedCurrency?.label?.toUpperCase() ||
                                            "";

                                          return [
                                            "USD",
                                            "GBP",
                                            "EUR",
                                            "CNY",
                                          ].includes(code);
                                        });

                                      if (foreignPrice) {
                                        const matchedCurrency =
                                          currencyOptions.find(
                                            (c) =>
                                              Number(c.value) ===
                                              Number(foreignPrice.currencyId),
                                          );

                                        const code =
                                          matchedCurrency?.currencyCode?.toUpperCase() ||
                                          matchedCurrency?.label?.toUpperCase() ||
                                          "";

                                        const rateToINR =
                                          code && code in liveRates
                                            ? liveRates[
                                                code as keyof typeof liveRates
                                              ]
                                            : 0;

                                        if (rateToINR) {
                                          finalRate = parseFloat(
                                            (
                                              Number(foreignPrice.price) *
                                              Number(rateToINR) *
                                              1.25
                                            ).toFixed(2),
                                          );
                                          oPrice = Number(foreignPrice.price);
                                          oCurr = code;
                                        }
                                      }
                                    }

                                    updateMultipleItemFields(i, {
                                      productId: null,
                                      accessoryId: Number(opt.value),
                                      itemType: "Accessory",
                                      rate: finalRate,
                                      originalPrice: oPrice,
                                      originalCurrency: oCurr,
                                      description: opt.label,
                                      hsnSacCode: opt.hsnCode || "",
                                      accessoryIds: [],
                                    });
                                  }}
                                  filterOption={(option, inputValue) => {
                                    const label =
                                      option.label?.toLowerCase() || "";
                                    const partNo =
                                      option.data.partNo?.toLowerCase() || "";
                                    const search = inputValue.toLowerCase();

                                    return (
                                      label.includes(search) ||
                                      partNo.includes(search)
                                    );
                                  }}
                                />
                              )}
                            </div>
                            <div className="w-24">
                              <input
                                className="w-full border rounded p-2 text-[10px] uppercase font-bold"
                                placeholder="HSN/SAC"
                                value={item.hsnSacCode}
                                readOnly={isServiceItem}
                                onChange={(e) =>
                                  updateMultipleItemFields(i, {
                                    hsnSacCode: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          {isProductItem &&
                            item.productId !== null &&
                            item.productId > 0 && (
                              <Select<SelectOption, true>
                                isMulti
                                options={accessoryOptions}
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                }}
                                value={accessoryOptions.filter(
                                  (x: SelectOption) =>
                                    item.accessoryIds.includes(Number(x.value)),
                                )}
                                onChange={(opts) =>
                                  updateMultipleItemFields(i, {
                                    accessoryIds: opts
                                      ? opts.map((x) => Number(x.value))
                                      : [],
                                  })
                                }
                                filterOption={(option, inputValue) => {
                                  const label =
                                    option.label?.toLowerCase() || "";
                                  const partNo =
                                    option.data.partNo?.toLowerCase() || "";
                                  const search = inputValue.toLowerCase();

                                  return (
                                    label.includes(search) ||
                                    partNo.includes(search)
                                  );
                                }}
                                placeholder="Linked Accessories..."
                              />
                            )}
                          <textarea
                            className="w-full border rounded p-2 h-16 text-[11px]"
                            value={item.description}
                            readOnly={isServiceItem}
                            onChange={(e) =>
                              updateMultipleItemFields(i, {
                                description: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="p-3 border-r text-center">
                          <input
                            type="number"
                            className="w-full border text-center p-2 rounded"
                            value={item.quantity}
                            onChange={(e) =>
                              updateMultipleItemFields(i, {
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </td>

                        <td className="p-3 border-r text-center">
                          {item.originalPrice ? (
                            <div className="text-[10px] text-blue-600 font-bold mb-1 animate-pulse">
                              {item.originalPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}{" "}
                              {item.originalCurrency}
                            </div>
                          ) : (
                            <div className="h-[15px] mb-1"></div>
                          )}

                          <input
                            type="number"
                            className="w-full border text-center p-2 rounded font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                            value={item.rate}
                            onChange={(e) =>
                              updateMultipleItemFields(i, {
                                rate: parseFloat(e.target.value) || 0,
                                originalPrice: null,
                                originalCurrency: null,
                              })
                            }
                          />
                        </td>
                        {/* <td className="p-3 border-r text-center">
                        <input
                          type="number"
                          className="w-full border text-center p-2 rounded"
                          value={item.discount}
                          onChange={(e) =>
                            updateMultipleItemFields(i, {
                              discount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </td> */}
                        <td className="p-3 border-r font-black text-center text-lg text-blue-700">
                          {curSym}
                          {item.finalPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        {/* <td className="p-3 border-r text-center">
                        <div className="w-14 h-14 border rounded bg-white flex items-center justify-center overflow-hidden mx-auto">
                          {isProductItem ? (
                            selectedProduct?.image ? (
                              <img
                                src={`${FILE_BASE_URL}${selectedProduct.image}`}
                                className="w-full h-full object-contain"
                                alt="product"
                              />
                            ) : (
                              <span className="text-[8px] text-gray-300">
                                NO IMG
                              </span>
                            )
                          ) : selectedAccessory?.image ? (
                            <img
                              src={`${FILE_BASE_URL}${selectedAccessory.image}`}
                              className="w-full h-full object-contain"
                              alt="accessory"
                            />
                          ) : (
                            <span className="text-[8px] text-gray-300">
                              NO IMG
                            </span>
                          )}
                        </div>
                      </td> */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              const newItems = data.items.filter(
                                (_, idx) => idx !== i,
                              );
                              const newSubtotal = newItems.reduce(
                                (sum, item) => sum + (item.total || 0),
                                0,
                              );
                              const newTaxTotal = newItems.reduce(
                                (sum, item) => sum + (item.gstAmount || 0),
                                0,
                              );

                              setData({
                                ...data,
                                items: newItems,
                                subtotal: newSubtotal,
                                grandTotal:
                                  newSubtotal +
                                  newTaxTotal +
                                  Number(data.freightCharges),
                              });
                            }}
                            className="text-red-500 hover:scale-125 transition"
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

            {showRightArrow && (
              <button
                onClick={() => scrollTable("right")}
                className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 bg-[#f07837] hover:bg-[#0d3357] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300 transition-all"
                aria-label="Scroll right"
              >
                <FaChevronRight size={18} />
              </button>
            )}
          </div>

          {/* <div className="flex gap-4 mb-6">
          <button onClick={addItem} className={buttonStyles.addmore}>
            + Add Product Row
          </button>
          <button onClick={addAccessoryItem} className={buttonStyles.addmore}>
            + Add Paid Accessory
          </button>
        </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6 text-left mt-2">
              <div>
                <label className={labelClass}>Bank Details</label>

                <Select<SelectOption>
                  options={companyBanks}
                  value={data.bankDetail}
                  onChange={(v) =>
                    setData((p) => ({
                      ...p,
                      bankDetail: v,
                    }))
                  }
                  isClearable
                  isDisabled={!data.company}
                  placeholder="Select Bank Account"
                />
              </div>
              <div className="bg-white border rounded-xl p-4 shadow-sm border-gray-100">
                <label className="text-[11px] font-black text-[#154068] uppercase mb-2 flex items-center gap-2">
                  <FaUserEdit /> Terms & Conditions
                </label>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 border p-3 text-sm rounded-xl h-36 outline-none focus:border-blue-500 shadow-inner"
                    placeholder="Type terms & conditions..."
                    value={data.termsConditions}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        termsConditions: e.target.value,
                      }))
                    }
                  />
                </div>
                <label className="text-[11px] font-black text-[#154068] uppercase mb-2 flex items-center gap-2">
                  <FaUserEdit /> Customer Notes
                </label>
                <div className="flex gap-2">
                  <textarea
                    className="flex-1 border p-3 text-sm rounded-xl h-16 outline-none focus:border-blue-500 shadow-inner"
                    placeholder="Type customer notes..."
                    value={data.customerNotes}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        customerNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-10 rounded-4xl border border-gray-300 shadow-inner space-y-6">
              <div className="flex justify-between font-bold text-gray-500 uppercase text-[12px]">
                <span>Subtotal</span>
                <span className="font-mono text-xl">
                  {curSym}
                  {data.subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {isINR && hasValidGstState && (
                <div className="space-y-2 border-y border-gray-200 py-4 animate-in fade-in slide-in-from-right-2">
                  {isIntraState ? (
                    <>
                      <div className="flex justify-between text-blue-600 font-bold text-[12px]">
                        <span>CGST (9%)</span>
                        <span className="font-mono text-lg">
                          {curSym}
                          {data.items
                            .reduce((s, i) => s + (i.cgstAmount || 0), 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>

                      <div className="flex justify-between text-blue-600 font-bold text-[12px]">
                        <span>SGST (9%)</span>
                        <span className="font-mono text-lg">
                          {curSym}
                          {data.items
                            .reduce((s, i) => s + (i.sgstAmount || 0), 0)
                            .toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-blue-600 font-bold text-[12px]">
                      <span>IGST (18%)</span>
                      <span className="font-mono text-lg">
                        {curSym}
                        {data.items
                          .reduce((s, i) => s + (i.igstAmount || 0), 0)
                          .toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {!isSrSelected && (
              <div className="flex justify-between items-center font-bold text-gray-500 uppercase text-[12px]">
                <span>Freight / Carrier</span>
                <input
                  type="number"
                  className="border-2 border-gray-300 p-2 w-40 text-right text-lg rounded-lg font-mono font-bold"
                  value={data.freightCharges}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;

                    const taxT = data.items.reduce(
                      (sum: number, item: InvoiceItem) =>
                        sum + (item.gstAmount || 0),
                      0,
                    );

                    setData((prev) => ({
                      ...prev,
                      freightCharges: val,
                      grandTotal: prev.subtotal + taxT + val,
                      termsConditions: getTermsConditions(
                        val,
                        placeOfSupplyLabel,
                        isINR,
                      ),
                    }));
                  }}
                />
              </div>
              )}

              <div className="flex justify-between items-center text-3xl font-black text-[#154068] border-t-2 border-dashed border-gray-400 pt-6">
                <span className="uppercase tracking-tighter text-sm">
                  Grand Total
                </span>
                <span className="font-mono underline decoration-double decoration-blue-500">
                  {curSym}
                  {data.grandTotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="mt-6 border-t pt-4">

                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={data.advanceReceived}
                    onChange={(e) =>
                      setData({
                        ...data,
                        advanceReceived: e.target.checked,
                        advanceAmount: e.target.checked
                          ? data.advanceAmount
                          : 0,
                      })
                    }
                  />

                  <span className="font-semibold">
                    Advance Received
                  </span>
                </label>

                {data.advanceReceived && (
                  <>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold mb-1">
                        Advance Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={data.advanceAmount}
                        onChange={(e) =>
                          setData({
                            ...data,
                            advanceAmount:
                              Number(e.target.value) || 0,
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2 text-right"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-700">
                          Remaining Amount
                        </span>

                        <span className="font-bold text-green-700 text-xl">
                          {curSym}
                          {Number(data.balanceAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-16 pt-8 border-t">
            <button onClick={onCancel} className={buttonStyles.cancel}>
              Cancel
            </button>

            <button
              onClick={handleSaveInvoice}
              disabled={isInitializing || isSubmitting}
              className={`bg-green-600 text-white px-6 py-2 rounded-lg transition ${
                isInitializing || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-green-700"
              }`}
            >
              {isInitializing
                ? "Loading..."
                : isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Invoice"
                    : "Save Invoice"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceWizard;
