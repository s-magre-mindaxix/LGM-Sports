import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  FaBoxOpen,
  FaCheckDouble,
  FaHistory,
  FaTimes,
  FaTrash,
  FaUserEdit,
} from "react-icons/fa";
import type { Offer, OfferItem } from "./Services/types";
import {
  getFinalEnquiries,
  getFinalServices,
  saveOffer,
} from "./Services/OfferService";
import { getVendorById } from "../Vendor/Services/VendorService";
import {
  getCustomerContacts,
  getEnquiryById,
} from "../Enquiry/Services/EnquiryService";
import { getBanksByCompanyId } from "../Company/Services/CompanyService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { useAuth } from "../../../../hooks/useAuth";
import type { SelectOption } from "../Enquiry/Hooks/useEnquiryOptions";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import apiClient from "../../../../API/apiClient";
import { printOfferVersionPDF } from "./Services/printOfferVersionPDF";
import { getServices } from "../ServiceMaster/Services/ServiceMasterService";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const FREIGHT_LINE = "* FREIGHT & INSURANCE : EXCLUSIVE";

const getTermsConditions = (
  freightCharges: number,
  placeOfSupplyLabel?: string,
  isINR?: boolean,
  // currencyName?: string,
  gstApplicable: boolean = true,
) => {
  const placeText = placeOfSupplyLabel || "IND";
  const hasFreight = Number(freightCharges) > 0;

  let priceLine = "";

  if (isINR) {
    priceLine = "* PRICES : DOOR DELIVERY";
  } else {
    priceLine = hasFreight
      ? `* PRICES : CIF, ${placeText}`
      : "* PRICES : EX WORKS";
  }

  const dutyTaxLine =
    isINR && !gstApplicable
      ? "* DUTY & TAXES : Extra 18% GST Applicable"
      : "* DUTY & TAXES : Extra, As Applicable";

  const lines = [
    priceLine,
    "* PAYMENT : 100% ADVANCE",
    dutyTaxLine,
    "* DELIVERY : 4-5 Weeks from the date of Confirm Order.",
    "* WARRANTY : One Year from the date of Purchase",
  ];

  if (hasFreight) {
    lines.splice(1, 0, FREIGHT_LINE);
  }

  return lines.join("\n");
};

const getLocalDate = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split("T")[0];
};

const createDefaultOffer = (): Offer => ({
  offerId: 0,
  enquiryId: null,
  offerNo: "",
  enquiryNo: "",
  offerDate: getLocalDate(),

  expiryDate: (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  })(),
  source: "ENQUIRY",
  status: "DRAFT",
  nextFollowUpDate: null,
  productGroupId: 0,
  companyId: 0,
  vendorId: 0,
  companyGroupId: 0,
  customerId: 0,
  responsiblePersonId: 0,
  assignedToEmployeeId: 0,
  currencyId: 0,
  placeOfSupplyId: 0,
  bankDetailId: 0,
  subtotal: 0,
  freightCharges: 0,
  grandTotal: 0,
  gstApplicable: true,
  termsConditions: getTermsConditions(0, "IND", false, true),
  customerNotes: "This is a computer generated copy.",
  notes: [],
  versionHistory: [],
  items: [],
});

const emptyItem = (
  type: "Product" | "Accessory" | "Service" = "Product",
): OfferItem => ({
  itemType: type,
  productId: 0,
  accessoryId: null,
  description: "",
  productCode: "",
  hsnSacCode: "",
  quantity: 1,
  rate: 0,
  discount: 0,
  taxPercentage: 18,
  total: 0,
  gstAmount: 0,
  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0,
  finalPrice: 0,
  accessoryIds: [],
  isGst: false,
  originalPrice: null,
  originalCurrency: null,
});
type CreationMode = "enquiry" | "verbal" | "service";

const OfferWizard = ({
  editData,
  options,
  onCancel,
  onSuccess,
  rawCustomers,
}: any) => {
  const { user } = useAuth();
  const initialData: Offer = editData
    ? {
        ...createDefaultOffer(),
        ...editData,
        source:
          editData.serviceId && editData.serviceId > 0
            ? "SERVICE"
            : editData.source === "VERBAL"
              ? "VERBAL"
              : "ENQUIRY",
        status: editData.status === "FINAL" ? "FINAL" : "DRAFT",
        enquiryId: editData.enquiryId ?? null,
        serviceId: editData.serviceId ?? null,
        serviceDescription: editData.serviceDescription ?? null,
        nextFollowUpDate: editData.nextFollowUpDate || null,
        versionHistory: editData.versionHistory || [],
        notes: editData.notes || [],
        items:
          editData.items?.map((x: any) => ({
            ...x,
            isGst: x.taxPercentage !== 18 && x.taxPercentage !== 0,
            itemType: x.itemType || "Product",
          })) || [],
      }
    : createDefaultOffer();

  const [data, setData] = useState<Offer>(initialData);

  const selectedPlaceOfSupply = options.states?.find(
    (s: any) => Number(s.value) === Number(data.placeOfSupplyId),
  );
  const placeOfSupplyLabel = selectedPlaceOfSupply?.label || "MH";

  const selectedCur = options.currencies?.find(
    (c: any) => c.value === data.currencyId,
  );
  const curSym = selectedCur?.currencySymbol || "₹";
  const isINR = selectedCur?.label === "INR";

  const [creationMode, setCreationMode] = useState<CreationMode>(
    editData
      ? editData.serviceId > 0
        ? "service"
        : editData.source === "VERBAL"
          ? "verbal"
          : "enquiry"
      : "enquiry",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingConfirmationLog, setPendingConfirmationLog] = useState<
    any | null
  >(null);
  const [newNote, setNewNote] = useState("");
  const [finalEnquiries, setFinalEnquiries] = useState<SelectOption[]>([]);
  const [finalServices, setFinalServices] = useState<SelectOption[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<SelectOption[]>([]);
  const [companyBanks, setCompanyBanks] = useState<SelectOption[]>([]);
  const [liveRates, setLiveRates] = useState<{
    USD: number;
    GBP: number;
    EUR: number;
    CNY: number;
    INR: number;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedVersionData, setSelectedVersionData] = useState<any | null>(
    null,
  );

  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);

  const statusOptions = useMemo(() => {
    const options = [{ value: "DRAFT", label: "Draft" }];
    if (data.offerId > 0 || data.status === "FINAL") {
      options.push({ value: "FINAL", label: "Final" });
    }
    return options;
  }, [data.offerId, data.status]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getServices();

        const formatted = res.map((s: any) => ({
          value: s.serviceId,
          label: `${s.servicePartNo} (${s.serviceDescription || ""})`,
          servicePartNo: s.servicePartNo,
          serviceDescription: s.serviceDescription,
          sacCode: s.sacCode,
          servicePrice: Number(s.servicePrice || 0),
        }));

        setServiceOptions(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    loadServices();
  }, []);

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
        console.error("Failed to fetch Wise live rates", error);
        toast.error("Failed to load Wise currency rates");
      }
    };

    fetchRates();
  }, []);

  useEffect(() => {
    const fetchBankOptions = async () => {
      try {
        let formatted: SelectOption[] = [];

        if (isINR) {
          // INR -> Billing Company Banks
          if (data.companyId) {
            const res = await getBanksByCompanyId(data.companyId);
            formatted = res.map((b: any) => ({
              value: b.bankDetailId,
              label: `${b.bankName} - ${b.accountNo}`,
            }));
          }
        } else {
          // Foreign Currency -> Vendor Banks
          if (data.vendorId) {
            const vendorData = await getVendorById(data.vendorId);
            if (vendorData?.bankDetails) {
              formatted = vendorData.bankDetails.map(
                (b: any, index: number) => ({
                  value: b.bankDetailId || index,
                  label: `${b.bankName} (${b.swiftCode || "No SWIFT"}) - ${b.accountNo}`,
                }),
              );
            }
          }
        }

        setCompanyBanks(formatted);

        setData((prev) => {
          const currentExists = formatted.some(
            (b: any) => Number(b.value) === Number(prev.bankDetailId),
          );

          return {
            ...prev,
            bankDetailId: currentExists
              ? prev.bankDetailId
              : formatted.length > 0
                ? Number(formatted[0].value)
                : 0,
          };
        });
      } catch (error) {
        console.error("Failed to load bank details", error);
        setCompanyBanks([]);
        setData((prev) => ({
          ...prev,
          bankDetailId: 0,
        }));
      }
    };

    fetchBankOptions();
  }, [data.companyId, data.vendorId, isINR]);

  useEffect(() => {
    if (editData || data.enquiryId) {
      return;
    }

    setData((prev) => ({
      ...prev,
      termsConditions: getTermsConditions(
        Number(prev.freightCharges || 0),
        options.states?.find(
          (s: any) => Number(s.value) === Number(prev.placeOfSupplyId),
        )?.label || "IND",
        isINR,
        // selectedCur?.label,
        prev.gstApplicable,
      ),
    }));
  }, [
    editData,
    data.enquiryId,
    data.placeOfSupplyId,
    data.freightCharges,
    data.gstApplicable,
    options.states,
    isINR,
    selectedCur?.label,
  ]);

  useEffect(() => {
    getFinalEnquiries()
      .then(setFinalEnquiries)
      .catch(() => toast.error("Failed to load Enquiries"));

    getFinalServices()
      .then(setFinalServices)
      .catch(() => toast.error("Failed to load Services"));
  }, []);

  useEffect(() => {
    if (data.customerId) {
      getCustomerContacts(data.customerId).then(setFilteredContacts);
    } else {
      setFilteredContacts([]);
    }
  }, [data.customerId]);

  useEffect(() => {
    const currentCurrency = options.currencies?.find(
      (c: any) => c.value === data.currencyId,
    );
    // We check if the currency is explicitly INR.
    const isCurrencyINR = currentCurrency?.label === "INR";

    if (!isCurrencyINR) {
      // Check if there are any items that currently have tax applied.
      const needsUpdate = data.items.some((item) => item.taxPercentage > 0);

      if (needsUpdate) {
        const updatedItems = data.items.map((item) =>
          calculateRow({
            ...item,
            taxPercentage: 0,
            isGst: false,
          }),
        );
        // Update the state with the newly calculated items and totals.
        setData((prev) => ({
          ...prev,
          ...recalcWithItems(updatedItems, Number(prev.freightCharges || 0)),
        }));
      }
    }
  }, [data.currencyId, options.currencies]);

  useEffect(() => {
    if (!data.items.length) return;

    const updatedItems = data.items.map((item) => calculateRow(item));
    setData((prev) => ({
      ...prev,
      ...recalcWithItems(updatedItems, Number(prev.freightCharges || 0)),
    }));
  }, [
    data.companyId,
    data.placeOfSupplyId,
    data.currencyId,
    data.gstApplicable,
  ]);

  const handleCustomerChange = (selectedOption: any) => {
    const customerId = selectedOption?.value || 0;

    const customerDetails = rawCustomers?.find(
      (c: any) => Number(c.id) === Number(customerId),
    );

    setData((prev) => {
      const newData = {
        ...prev,
        customerId: customerId,
        responsiblePersonId: 0,
      };

      let nextPlaceLabel = "MH";

      if (customerDetails) {
        if (customerDetails.companyGroupId) {
          newData.companyGroupId = customerDetails.companyGroupId;
        }

        if (customerDetails.addresses && customerDetails.addresses.length > 0) {
          const stateId = customerDetails.addresses[0].stateId;
          if (stateId) {
            newData.placeOfSupplyId = stateId;

            const matchedState = options.states?.find(
              (s: any) => Number(s.value) === Number(stateId),
            );
            nextPlaceLabel = matchedState?.label || "MH";
          }
        }
      }

      newData.termsConditions = getTermsConditions(
        Number(newData.freightCharges || 0),
        nextPlaceLabel,
        isINR,
        // selectedCur?.label,
        newData.gstApplicable,
      );

      return newData;
    });
  };

  const recalcWithItems = (
    items: OfferItem[],
    freight = Number(data.freightCharges || 0),
  ) => {
    const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
    const gstTotal = items.reduce((s, i) => s + (i.gstAmount || 0), 0);
    return { items, subtotal, grandTotal: subtotal + gstTotal + freight };
  };

  const selectedBillingCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.companyId),
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

  const calculateRow = (
    item: any,
    forceIsINR?: boolean,
    forceGstApplicable?: boolean,
  ) => {
    const activeIsINR = forceIsINR !== undefined ? forceIsINR : isINR;
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const dis = Number(item.discount) || 0;

    const activeGstApplicable =
      forceGstApplicable !== undefined
        ? forceGstApplicable
        : data.gstApplicable;

    const taxRate = activeIsINR && activeGstApplicable ? 18 : 0;

    const total = qty * rate * (1 - dis / 100);

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (activeIsINR && taxRate > 0) {
      if (hasValidGstState) {
        if (isIntraState) {
          cgstAmount =
            Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
            100;
          sgstAmount =
            Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
            100;
        } else {
          igstAmount =
            Math.round((total * (taxRate / 100) + Number.EPSILON) * 100) / 100;
        }
      } else {
        // fallback if company/place state not available
        cgstAmount =
          Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
          100;
        sgstAmount =
          Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
          100;
      }
    }

    const gstAmount = cgstAmount + sgstAmount + igstAmount;

    return {
      ...item,
      taxPercentage: taxRate,
      total,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      finalPrice: total + gstAmount,
    };
  };

  const handleEnquirySelection = async (enquiryId: number) => {
    // Prevent function from running if no enquiry is selected
    if (!enquiryId) return;

    // --- Step 1: Set initial loading state & give immediate UI feedback ---
    setIsSyncing(true);
    toast.loading("Fetching Enquiry Data...");

    try {
      // --- Step 2: Make the network request ---
      const res = await getEnquiryById(enquiryId);
      const resWithExtras = res as any;

      // --- Step 3: Update UI immediately after network success ---
      toast.dismiss();
      toast.loading("Processing Enquiry Items...");

      // --- Step 4: Defer the heavy data processing to the next event loop cycle ---
      setTimeout(() => {
        const detectedSource =
          resWithExtras.entryType === "VERBAL" ? "VERBAL" : "ENQUIRY";

        const mappedItems = (res.items || []).map((i: any) => {
          const enquiryCur = options.currencies?.find(
            (c: any) => c.value === res.currencyId,
          );
          const pulledIsINR = enquiryCur?.label === "INR";
          const resolvedTax = pulledIsINR ? i.taxPercentage || 18 : 0;

          const detectedType =
            i.itemType === "Accessory" || (i.accessoryId > 0 && !i.productId)
              ? "Accessory"
              : "Product";

          return calculateRow(
            {
              ...i,
              liveConversionRate: i.liveConversionRate,
              itemType: detectedType,
              productId: i.productId || 0,
              accessoryId: i.accessoryId || 0,
              taxPercentage: resolvedTax,
              accessoryIds: i.accessoryIds || [],
              hsnSacCode: i.hsnSacCode || "",
              isGst: pulledIsINR && resolvedTax !== 18,
            },
            pulledIsINR,
          );
        });

        const totals = recalcWithItems(
          mappedItems,
          Number(res.freightCharges || 0),
        );

        const mappedData: Offer = {
          ...createDefaultOffer(),
          ...res,
          customerNotes:
            res.customerNotes && res.customerNotes.trim() !== ""
              ? res.customerNotes
              : "This is a computer generated copy.",
          ...totals,
          offerId: 0,

          // --- CORRECT ID MAPPING FOR ENQUIRY ---
          source: detectedSource,
          enquiryId: res.enquiryId ?? enquiryId, // It's an Enquiry
          serviceId: null, // It's NOT a Service

          status: "DRAFT",
          companyGroupId: res.companyGroupId || 0,
          nextFollowUpDate: resWithExtras.nextFollowUpDate || null,
          enquiryNo: res.enquiryNo || "",
          offerNo: "AUTO-GENERATE",
          // offerDate: new Date().toISOString().split("T")[0],
          offerDate: res.offerDate
            ? res.offerDate.split("T")[0]
            : getLocalDate(),
          expiryDate: res.expiryDate ? res.expiryDate.split("T")[0] : "",
          assignedToEmployeeId: res.assignedToEmployeeId || 0,
          notes: res.notes || [],
          versionHistory: Array.isArray(resWithExtras.versionHistory)
            ? resWithExtras.versionHistory
            : [],

          termsConditions: res.termsConditions,
        };

        // --- Step 5: Update the component state with all the new data ---
        setCreationMode(detectedSource === "VERBAL" ? "verbal" : "enquiry");
        setData(mappedData);

        // --- Step 6: Finalize UI feedback ---
        setIsSyncing(false);
        toast.dismiss();
        toast.success("Enquiry Data Pulled Successfully!");
      }, 0);
    } catch (err) {
      // --- Error Handling: Ensure UI is reset on failure ---
      console.error("Failed to fetch enquiry details:", err);
      setIsSyncing(false);
      toast.dismiss();
      toast.error("Failed to fetch enquiry details");
    }
  };

  const handleServiceSelection = async (serviceRecordId: number) => {
    // Prevent function from running if no service is selected
    if (!serviceRecordId) return;

    // --- Step 1: Set initial loading state ---
    setIsSyncing(true);
    toast.loading("Fetching Service Data...");

    try {
      // --- Step 2: Make the network request (using the same API endpoint) ---
      const res = await getEnquiryById(serviceRecordId);
      const resWithExtras = res as any;

      // --- Step 3: Update UI ---
      toast.dismiss();
      toast.loading("Processing Service Items...");

      // --- Step 4: Defer heavy processing ---
      setTimeout(() => {
        const mappedItems = (res.items || []).map((i: any) => {
          const enquiryCur = options.currencies?.find(
            (c: any) => c.value === res.currencyId,
          );
          const pulledIsINR = enquiryCur?.label === "INR";
          const resolvedTax = pulledIsINR ? i.taxPercentage || 18 : 0;

          const detectedType =
            i.itemType === "Service"
              ? "Service"
              : i.itemType === "Accessory" ||
                  (i.accessoryId > 0 && !i.productId)
                ? "Accessory"
                : "Product";
          return calculateRow(
            {
              ...i,
              itemType: detectedType,
              // productId: i.productId || 0,
              // accessoryId: i.accessoryId || 0,
              productId: detectedType === "Product" ? i.productId || 0 : 0,
              accessoryId:
                detectedType === "Accessory" ? i.accessoryId || 0 : 0,
              serviceId:
                detectedType === "Service"
                  ? i.serviceId || res.serviceId
                  : null,
              servicePartNo:
                detectedType === "Service"
                  ? i.servicePartNo || i.description?.split(" - ")[0] || ""
                  : null,
              taxPercentage: resolvedTax,
              accessoryIds: i.accessoryIds || [],
              hsnSacCode: i.hsnSacCode || "",
              isGst: pulledIsINR && resolvedTax !== 18,
            },
            pulledIsINR,
          );
        });

        const totals = recalcWithItems(
          mappedItems,
          Number(res.freightCharges || 0),
        );

        const mappedData: Offer = {
          ...createDefaultOffer(),
          ...res,
          customerNotes:
            res.customerNotes && res.customerNotes.trim() !== ""
              ? res.customerNotes
              : "This is a computer generated copy.",
          ...totals,
          offerId: 0,

          // --- CORRECT ID MAPPING FOR SERVICE ---
          source: "SERVICE",
          enquiryId: res.enquiryId, // It's NOT an Enquiry
          serviceId: res.serviceId ?? serviceRecordId, // It's a Service

          status: "DRAFT",
          companyGroupId: res.companyGroupId || 0,
          nextFollowUpDate: resWithExtras.nextFollowUpDate || null,
          enquiryNo: res.enquiryNo || "", // Keep the service's underlying enquiry/service number
          offerNo: "AUTO-GENERATE",
          // offerDate: new Date().toISOString().split("T")[0],
          offerDate: res.offerDate
            ? res.offerDate.split("T")[0]
            : getLocalDate(),
          expiryDate: res.expiryDate ? res.expiryDate.split("T")[0] : "",
          assignedToEmployeeId: res.assignedToEmployeeId || 0,
          notes: res.notes || [],
          versionHistory: Array.isArray(resWithExtras.versionHistory)
            ? resWithExtras.versionHistory
            : [],
          termsConditions:
            res.termsConditions && res.termsConditions.trim() !== ""
              ? res.termsConditions
              : getTermsConditions(
                  Number(res.freightCharges || 0),
                  options.states?.find(
                    (s: any) => Number(s.value) === Number(res.placeOfSupplyId),
                  )?.label || "IND",
                  options.currencies?.find(
                    (c: any) => Number(c.value) === Number(res.currencyId),
                  )?.label === "INR",
                ),
        };

        // --- Step 5: Update state ---
        // Note: creationMode is already 'service', so we don't need to set it again.
        setData(mappedData);

        // --- Step 6: Finalize UI feedback ---
        setIsSyncing(false);
        toast.dismiss();
        toast.success("Service Data Pulled Successfully!");
      }, 0);
    } catch (err) {
      // --- Error Handling ---
      console.error("Failed to fetch service details:", err);
      setIsSyncing(false);
      toast.dismiss();
      toast.error("Failed to fetch service details");
    }
  };

  const updateItem = (index: number, updates: Partial<any>) => {
    const newItems = [...data.items];
    newItems[index] = calculateRow({ ...newItems[index], ...updates });
    setData((prev) => ({
      ...prev,
      ...recalcWithItems(newItems, Number(prev.freightCharges || 0)),
    }));
  };

  const addItem = (type: "Product" | "Accessory" = "Product") => {
    const newItem = emptyItem(type);
    newItem.taxPercentage = isINR ? 18 : 0;

    setData((prev) => ({
      ...prev,
      ...recalcWithItems(
        [...prev.items, newItem],
        Number(prev.freightCharges || 0),
      ),
    }));
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);

    // Recalculate totals for the remaining items
    const sub = newItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = newItems.reduce((s, i) => s + (i.gstAmount || 0), 0);

    setData((prev) => ({
      ...prev,
      items: newItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(prev.freightCharges || 0),
    }));
  };

  const handleModeChange = (mode: CreationMode) => {
    setCreationMode(mode);
    setShowPreview(false);
    setPendingConfirmationLog(null);
    if (mode === "verbal") {
      setData((prev) => ({
        ...createDefaultOffer(),
        offerId: prev.offerId,
        source: "VERBAL",
        enquiryId: null,
        status: "DRAFT",
        notes: prev.offerId > 0 ? prev.notes : [],
        versionHistory: prev.offerId > 0 ? prev.versionHistory : [],
      }));
    } else if (mode === "service") {
      setData((prev) => ({
        ...createDefaultOffer(),
        offerId: prev.offerId,
        source: "SERVICE",
      }));
    } else {
      setData((prev) => ({
        ...createDefaultOffer(),
        offerId: prev.offerId,
        source: "ENQUIRY",
        status: "DRAFT",
        notes: prev.offerId > 0 ? prev.notes : [],
        versionHistory: prev.offerId > 0 ? prev.versionHistory : [],
      }));
    }
  };

  const handleStatusChange = (status: "DRAFT" | "FINAL") =>
    setData((prev) => ({
      ...prev,
      status,
      nextFollowUpDate:
        status === "FINAL" ? getLocalDate() : prev.nextFollowUpDate,
    }));

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteEntry = {
      note: newNote,
      createdAt: new Date().toISOString(),
      createdByEmployeeId: Number(user?.employeeId) || 0,
      authorName:
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "System",
    };
    setData((prev) => ({ ...prev, notes: [noteEntry, ...(prev.notes || [])] }));
    setNewNote("");
    toast.success("Activity logged");
  };

  const validateBeforeProceed = () => {
    if (data.source === "ENQUIRY" && !data.enquiryId) {
      toast.error("Select enquiry number");
      return false;
    }

    if (!data.customerId) {
      toast.error("Select customer");
      return false;
    }

    // Updated row validation
    if (data.items.length > 0) {
      const hasInvalidRow = data.items.some((item) => {
        if (item.itemType === "Accessory") {
          return !item.accessoryId;
        }
        if (item.itemType === "Service") {
          return !item.serviceId;
        }
        return !item.productId;
      });

      if (hasInvalidRow) {
        toast.error("Please select a Product or Paid Accessory for all rows");
        return false;
      }
    } else {
      toast.error("Please add at least one item");
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateBeforeProceed()) return;
    setPendingConfirmationLog({
      note: `Offer confirmed via preview (${data.source === "VERBAL" ? "Verbal Communication" : "Finalized Enquiry"})`,
      createdAt: new Date().toISOString(),
      createdByEmployeeId: Number(user?.employeeId) || 0,
      authorName:
        `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "System",
    });
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!validateBeforeProceed()) return;

    setIsSaving(true);
    try {
      const confirmationLog = pendingConfirmationLog || {
        note: `Offer confirmed via preview (${data.source === "VERBAL" ? "Verbal Communication" : "Finalized Enquiry"})`,
        createdAt: new Date().toISOString(),
        createdByEmployeeId: Number(user?.employeeId) || 0,
        authorName:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "System",
      };

      // 2. Format items to ensure NO nulls for Int32 fields
      const formattedItems = data.items.map((item) => ({
        ...item,
        productId: item.itemType === "Product" ? item.productId || 0 : 0,
        accessoryId: item.itemType === "Accessory" ? item.accessoryId || 0 : 0,
        serviceId: item.itemType === "Service" ? item.serviceId || 0 : 0,
        servicePartNo: item.servicePartNo || "",
        accessoryIds: item.accessoryIds || [],
        taxPercentage: Number(item.taxPercentage) || 0,
        rate: Number(item.rate) || 0,
        liveConversionRate: item.liveConversionRate,
        quantity: Number(item.quantity) || 0,
        discount: Number(item.discount) || 0,
      }));

      const shouldAddConfirmationLog = data.source === "VERBAL";

      const payload = {
        ...data,
        enquiryId: data.source === "VERBAL" ? null : data.enquiryId,
        items: formattedItems,

        notes: shouldAddConfirmationLog
          ? [confirmationLog, ...(data.notes || [])]
          : data.notes || [],
      };

      const finalPayload = {
        ...payload,
        versionHistory: data.versionHistory || [],
      };

      // 6. Send to API
      await saveOffer(finalPayload);

      toast.success("Offer Saved Successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Save Error:", error);
      const serverError = error.response?.data?.errors;
      if (serverError) {
        toast.error("Validation Error: " + JSON.stringify(serverError));
      } else {
        toast.error("Save Failed. Check console for details.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resolveLabel = (list: any[] = [], value: number | null | undefined) =>
    list.find((x: any) => Number(x.value) === Number(value))?.label || "-";
  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString() : "-";
  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "-";
  const notesForPreview = useMemo(
    () =>
      pendingConfirmationLog
        ? [pendingConfirmationLog, ...(data.notes || [])]
        : [...(data.notes || [])],
    [pendingConfirmationLog, data.notes],
  );
  const sortedNotes = [...notesForPreview].sort(
    (a: any, b: any) =>
      new Date(b.createdAt || "").getTime() -
      new Date(a.createdAt || "").getTime(),
  );
  const latestLog = sortedNotes[0];
  const latestConfirmationLog = sortedNotes.find((n: any) =>
    (n.note || "").toLowerCase().includes("confirm"),
  );
  const sourceLabel =
    data.source === "SERVICE"
      ? "Service Order"
      : data.source === "VERBAL"
        ? "Verbal Communication"
        : "Finalized Enquiry";
  const showForm =
    data.offerId > 0 ||
    data.source === "VERBAL" ||
    !!data.enquiryId ||
    !!data.serviceId;
  const previewVersions = [...(data.versionHistory || [])].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );

  const customerOptionsWithBranch =
    options.rawCustomersList?.map((c: any) => ({
      value: c.id,
      label: `${c.customerName}${c.branch ? ` (${c.branch})` : ""}`,
      branch: c.branch,
    })) || [];

  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";
  const inputClass =
    "h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  const handleViewVersion = (v: any) => {
    try {
      const parsed = JSON.parse(v.snapshotDataJson || v.snapshotJson || "{}");
      setSelectedVersionData(parsed);
    } catch {
      toast.error("Unable to read version data");
    }
  };

  const addServiceItem = () => {
    const newItem = calculateRow({
      itemType: "Service",
      serviceId: null,
      servicePartNo: "",
      description: "",
      hsnSacCode: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      total: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      finalPrice: 0,
    });

    setData((prev) => ({
      ...prev,
      ...recalcWithItems(
        [...prev.items, newItem],
        Number(prev.freightCharges || 0),
      ),
    }));
  };

  return (
    <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-left shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FaBoxOpen />
          {data.offerId > 0 ? "Edit Official Offer" : "New Official Offer"}
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
        {data.offerId === 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <label className="mb-3 block text-[11px] font-semibold uppercase tracking-wide text-blue-900">
              Select Creation Mode
            </label>

            {/* THREE TABS HERE */}
            <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
              <button
                type="button"
                onClick={() => handleModeChange("enquiry")}
                className={`rounded-xl border px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide transition ${creationMode === "enquiry" ? "border-blue-600 bg-blue-100 text-blue-800" : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"}`}
              >
                Linked Enquiry
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("service")}
                className={`rounded-xl border px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide transition ${creationMode === "service" ? "border-orange-600 bg-orange-100 text-orange-800" : "border-orange-200 bg-white text-orange-700 hover:bg-orange-50"}`}
              >
                Service Order
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("verbal")}
                className={`rounded-xl border px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide transition ${creationMode === "verbal" ? "border-emerald-600 bg-emerald-100 text-emerald-800" : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"}`}
              >
                Verbal Entry
              </button>
            </div>

            {/* CONDITIONAL SELECTORS */}
            <label className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-blue-900">
              <FaCheckDouble />{" "}
              {creationMode === "enquiry"
                ? "Select Finalized Enquiry"
                : creationMode === "service"
                  ? "Select Finalized Service Order"
                  : "Manual Verbal Entry"}
            </label>

            {creationMode === "enquiry" && (
              <Select
                options={finalEnquiries}
                onChange={(opt: any) => handleEnquirySelection(opt?.value)}
                placeholder="Search Enquiries..."
                isDisabled={isSyncing}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            )}

            {creationMode === "service" && (
              <Select
                options={finalServices}
                // onChange={(opt: any) => handleEnquirySelection(opt?.value)}
                onChange={(opt: any) => handleServiceSelection(opt?.value)}
                placeholder="Search Service Orders..."
                isDisabled={isSyncing}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            )}

            {creationMode === "verbal" && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                Manual verbal flow enabled.
              </p>
            )}
          </div>
        )}

        {showForm && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-12">
              {/* ✅ SERVICE DESCRIPTION BOX - Shows during Edit or New Service Selection */}
              {data.serviceId &&
                data.serviceId > 0 &&
                data.serviceDescription && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm flex items-start gap-4 mb-4">
                    <div className="bg-orange-500 p-2 rounded-lg text-white">
                      <FaBoxOpen size={20} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">
                        Linked Service Details
                      </label>
                      <p className="text-sm font-semibold text-slate-800">
                        {data.serviceDescription}
                      </p>
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <label className={labelClass}>Source</label>
                  <input
                    className="h-10 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 text-sm"
                    value={sourceLabel}
                    disabled
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>

                  {/* REPLACE THE OLD <Select> WITH THIS ONE */}
                  <Select
                    options={statusOptions}
                    value={
                      statusOptions.find((o) => o.value === data.status) || null
                    }
                    onChange={(o: any) => handleStatusChange(o.value)}
                    isDisabled={statusOptions.length <= 1}
                  />
                </div>

                <div>
                  <label className={labelClass}>Offer No.</label>
                  <input
                    className="h-10 w-full rounded-xl border border-slate-300 bg-slate-100 px-3 text-sm font-semibold"
                    value={
                      data.offerNo ||
                      (data.source === "VERBAL" ? "AUTO (VERBAL)" : "")
                    }
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass}>Offer Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.offerDate ? data.offerDate.split("T")[0] : ""}
                    onChange={(e) => {
                      const selectedDate = e.target.value;

                      if (selectedDate) {
                        const nextDate = new Date(selectedDate);
                        nextDate.setMonth(nextDate.getMonth() + 1);

                        // Prevent UTC conversion from changing the date
                        nextDate.setMinutes(
                          nextDate.getMinutes() - nextDate.getTimezoneOffset(),
                        );

                        setData({
                          ...data,
                          offerDate: selectedDate,
                          expiryDate: nextDate.toISOString().split("T")[0],
                        });
                      } else {
                        setData({ ...data, offerDate: selectedDate });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>Next Follow-up</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={
                      data.nextFollowUpDate
                        ? data.nextFollowUpDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setData({
                        ...data,
                        nextFollowUpDate: e.target.value || null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.expiryDate ? data.expiryDate.split("T")[0] : ""}
                    onChange={(e) =>
                      setData({ ...data, expiryDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Customer</label>
                  <Select
                    // options={options.customers}
                    options={customerOptionsWithBranch}
                    value={customerOptionsWithBranch.find(
                      (x: any) => Number(x.value) === Number(data.customerId),
                    )}
                    onChange={handleCustomerChange} // Only this one
                    isDisabled={data.source === "ENQUIRY" && !!data.enquiryId}
                    placeholder="Select Customer..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Billing Company</label>
                  <Select
                    options={options.companies}
                    value={options.companies?.find(
                      (x: any) => Number(x.value) === Number(data.companyId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, companyId: o?.value || 0 })
                    }
                  />
                </div>

                {/* Company Group Dropdown */}
                <div>
                  <label className={labelClass}>Company Group</label>
                  <Select
                    options={options.companyGroups}
                    value={options.companyGroups?.find(
                      (x: any) =>
                        Number(x.value) === Number(data.companyGroupId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, companyGroupId: o?.value || 0 })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Vendor</label>
                  <Select
                    options={options.vendors}
                    value={options.vendors?.find(
                      (x: any) => Number(x.value) === Number(data.vendorId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, vendorId: o?.value || 0 })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Product Group</label>
                  <Select
                    options={options.groups}
                    value={options.groups?.find(
                      (x: any) =>
                        Number(x.value) === Number(data.productGroupId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, productGroupId: o?.value || 0 })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Place of Supply</label>
                  <Select
                    options={options.states}
                    value={options.states?.find(
                      (x: any) =>
                        Number(x.value) === Number(data.placeOfSupplyId),
                    )}
                    onChange={(o: any) =>
                      setData((prev) => ({
                        ...prev,
                        placeOfSupplyId: o?.value || 0,
                        termsConditions: getTermsConditions(
                          Number(prev.freightCharges || 0),
                          o?.label || "IND",
                          isINR,
                          // selectedCur?.label,
                          prev.gstApplicable,
                        ),
                      }))
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Currency</label>
                  <Select
                    options={options.currencies}
                    value={options.currencies?.find(
                      (x: any) => Number(x.value) === Number(data.currencyId),
                    )}
                    // LOCK: Disable if enquiryId exists
                    isDisabled={!!data.enquiryId}
                    onChange={(o: any) => {
                      const newCurrencyId = o?.value || 0;
                      const newIsINR = o?.label === "INR";

                      const updatedItems = data.items.map((item) =>
                        calculateRow(
                          {
                            ...item,
                            isGst: false,
                            taxPercentage:
                              newIsINR && data.gstApplicable ? 18 : 0,
                          },
                          newIsINR,
                        ),
                      );

                      const totals = recalcWithItems(
                        updatedItems,
                        Number(data.freightCharges || 0),
                      );

                      setData({
                        ...data,
                        currencyId: newCurrencyId,
                        termsConditions: getTermsConditions(
                          Number(data.freightCharges || 0),
                          placeOfSupplyLabel,
                          newIsINR,
                          // o?.label,
                          data.gstApplicable,
                        ),
                        ...totals,
                      });
                    }}
                  />
                  {!!data.enquiryId && (
                    <p className="text-[9px] text-blue-500 mt-1 font-bold">
                      LOCKED FROM ENQUIRY
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Contact Person</label>
                  <Select
                    options={filteredContacts}
                    value={filteredContacts?.find(
                      (x: any) =>
                        Number(x.value) === Number(data.responsiblePersonId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, responsiblePersonId: o?.value || 0 })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Assign To</label>
                  <Select
                    options={options.employees}
                    value={options.employees?.find(
                      (x: any) =>
                        Number(x.value) === Number(data.assignedToEmployeeId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, assignedToEmployeeId: o?.value || 0 })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {isINR ? "Billing Company Bank" : "Vendor Bank "}
                  </label>
                  <Select
                    options={companyBanks}
                    value={companyBanks?.find(
                      (x: any) => Number(x.value) === Number(data.bankDetailId),
                    )}
                    onChange={(o: any) =>
                      setData({ ...data, bankDetailId: o?.value || 0 })
                    }
                    placeholder={
                      isINR
                        ? "Select Company Bank..."
                        : data.vendorId
                          ? "Select Vendor Bank..."
                          : "Select Vendor first"
                    }
                  />
                  {!isINR && !data.vendorId && (
                    <p className="text-[10px] text-rose-500 mt-1 font-bold italic">
                      * Switch to a Vendor to load their bank details.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    checked={data.gstApplicable}
                    disabled={!isINR}
                    onChange={(e) => {
                      const checked = e.target.checked;

                      const updatedItems = data.items.map((item) =>
                        calculateRow(
                          {
                            ...item,
                            taxPercentage: checked ? 18 : 0,
                            isGst: false,
                          },
                          isINR,
                          checked,
                        ),
                      );

                      const totals = recalcWithItems(
                        updatedItems,
                        Number(data.freightCharges || 0),
                      );

                      setData((prev) => ({
                        ...prev,
                        gstApplicable: checked,
                        termsConditions: getTermsConditions(
                          Number(prev.freightCharges || 0),
                          placeOfSupplyLabel,
                          isINR,
                          // selectedCur?.label,
                          checked,
                        ),
                        ...totals,
                      }));
                    }}
                    className="h-4 w-4 accent-[#154068]"
                  />

                  <label className="text-sm font-bold text-slate-700">
                    GST Applicable
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                {data.items.map((item, i) => {
                  const isServiceItem = item.itemType === "Service";

                  const isAccessory =
                    item.itemType === "Accessory" ||
                    (Number(item.accessoryId) > 0 &&
                      !item.productId &&
                      !isServiceItem);

                  const isProductItem = !isAccessory && !isServiceItem;

                  const prod = isProductItem
                    ? options.products?.find(
                        (x: any) => Number(x.value) === Number(item.productId),
                      )
                    : null;

                  const acc = isAccessory
                    ? options.accessories?.find(
                        (x: any) =>
                          Number(x.value) === Number(item.accessoryId),
                      )
                    : null;

                  const selectedImage = isProductItem
                    ? prod?.image
                    : acc?.image;
                  const selectedImageAlt = isProductItem
                    ? prod?.label
                    : acc?.label;

                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-700">
                          Line Item #{i + 1}
                        </h4>
                        <button
                          onClick={() => removeItem(i)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
                            {isServiceItem
                              ? "Service"
                              : isProductItem
                                ? "Product"
                                : "Paid Accessory"}
                          </label>
                          {isServiceItem ? (
                            <Select
                              options={serviceOptions}
                              value={serviceOptions.find(
                                (x) => x.value === item.serviceId,
                              )}
                              filterOption={(option, inputValue) => {
                                const search = inputValue.toLowerCase();

                                return (
                                  option.data.servicePartNo
                                    ?.toLowerCase()
                                    .includes(search) ||
                                  option.data.serviceDescription
                                    ?.toLowerCase()
                                    .includes(search)
                                );
                              }}
                              onChange={(opt: any) => {
                                updateItem(i, {
                                  serviceId: opt?.value,
                                  servicePartNo: opt?.servicePartNo,
                                  description: opt?.serviceDescription,
                                  hsnSacCode: opt?.sacCode,
                                  rate: Number(opt?.servicePrice || 0),
                                });
                              }}
                              placeholder="Select Service"
                            />
                          ) : isProductItem ? (
                            <Select
                              options={options.products}
                              value={prod || null}
                              filterOption={(option, inputValue) => {
                                const label = option.label?.toLowerCase() || "";
                                const code =
                                  option.data.productCode?.toLowerCase() || "";
                                const partNo =
                                  option.data.partNo?.toLowerCase() || "";
                                const search = inputValue.toLowerCase();

                                return (
                                  label.includes(search) ||
                                  code.includes(search) ||
                                  partNo.includes(search)
                                );
                              }}
                              onChange={(o: any) => {
                                const accIds = o.mapAccessories
                                  ? o.mapAccessories.split(",").map(Number)
                                  : [];
                                let finalRate = 0;
                                let origPrice = null,
                                  origCurr = null;
                                  let liveConversionRate = null;
                                const priceMatch = o.currencyPrices?.find(
                                  (cp: any) =>
                                    Number(cp.currencyId) ===
                                    Number(data.currencyId),
                                );

                                if (priceMatch) finalRate = priceMatch.price;
                                else if (isINR && liveRates) {
                                  const foreign = o.currencyPrices?.find(
                                    (cp: any) =>
                                      ["GBP", "USD", "EUR", "CNY"].includes(
                                        cp.currencyName?.toUpperCase(),
                                      ),
                                  );

                                  if (foreign) {
                                    const foreignCode =
                                      foreign.currencyName?.toUpperCase();
                                    const rateToINR =
                                      foreignCode && foreignCode in liveRates
                                        ? liveRates[
                                            foreignCode as keyof typeof liveRates
                                          ]
                                        : 0;

                                    if (rateToINR) {
                                       liveConversionRate = rateToINR;

                                      finalRate = parseFloat(
                                        (
                                          foreign.price *
                                          rateToINR *
                                          1.25
                                        ).toFixed(2),
                                      );
                                      origPrice = foreign.price;
                                      origCurr = foreignCode;
                                    }
                                  }
                                }
                                updateItem(i, {
                                  productId: o.value,
                                  rate: finalRate,
                                  liveConversionRate: liveConversionRate,
                                  originalPrice: origPrice,
                                  originalCurrency: origCurr,
                                  hsnSacCode: o.hsnCode || "",
                                  // description: o.label,
                                  description: `${o.productCode} - ${o.productName || ""}`,
                                  accessoryIds: accIds,
                                });
                              }}
                            />
                          ) : (
                            <Select
                              options={options.accessories}
                              value={acc || null}
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
                              onChange={(o: any) => {
                                let finalRate = 0;
                                let origPrice = null,
                                  origCurr = null;
                                  let liveConversionRate = null;
                                const priceMatch = o.currencyPrices?.find(
                                  (cp: any) =>
                                    Number(cp.currencyId) ===
                                    Number(data.currencyId),
                                );

                                if (priceMatch) finalRate = priceMatch.price;
                                else if (isINR && liveRates) {
                                  const foreign = o.currencyPrices?.find(
                                    (cp: any) =>
                                      ["GBP", "USD", "EUR", "CNY"].includes(
                                        cp.currencyName?.toUpperCase(),
                                      ),
                                  );

                                  if (foreign) {
                                    const foreignCode =
                                      foreign.currencyName?.toUpperCase();
                                    const rateToINR =
                                      foreignCode && foreignCode in liveRates
                                        ? liveRates[
                                            foreignCode as keyof typeof liveRates
                                          ]
                                        : 0;

                                    if (rateToINR) {
                                          liveConversionRate = rateToINR;

                                      finalRate = parseFloat(
                                        (
                                          foreign.price *
                                          rateToINR *
                                          1.25
                                        ).toFixed(2),
                                      );
                                      origPrice = foreign.price;
                                      origCurr = foreignCode;
                                    }
                                  }
                                }
                                if (finalRate === 0)
                                  finalRate = o.salePrice || 0;
                                updateItem(i, {
                                  accessoryId: o.value,
                                  rate: finalRate,
                                  liveConversionRate: liveConversionRate,
                                  originalPrice: origPrice,
                                  originalCurrency: origCurr,
                                  hsnSacCode: o.hsnCode || "",
                                  // description: o.label,
                                  description: `${o.accessoriesCode} - ${o.accessoriesDescription}`,
                                });
                              }}
                            />
                          )}
                        </div>

                        {/** CHANGE: Free Accessories only for Product rows **/}
                        {isProductItem && (
                          <div>
                            <label className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">
                              Free Accessories (Linked)
                            </label>
                            <Select
                              isMulti
                              options={options.accessories}
                              value={options.accessories?.filter((x: any) =>
                                item.accessoryIds.includes(Number(x.value)),
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
                                    ? opts.map((x: any) => Number(x.value))
                                    : [],
                                })
                              }
                            />
                          </div>
                        )}

                        <div className="md:col-span-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Description
                          </label>
                          <textarea
                            className="h-16 w-full rounded-xl border border-slate-300 p-2 text-sm outline-none focus:border-slate-500"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(i, { description: e.target.value })
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {isServiceItem ? "SAC Code" : "HSN/SAC Code"}
                          </label>

                          <input
                            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
                            value={item.hsnSacCode || ""}
                            onChange={(e) =>
                              updateItem(i, {
                                hsnSacCode: e.target.value,
                              })
                            }
                            placeholder={
                              isServiceItem ? "SAC Code..." : "HSN/SAC Code..."
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Qty
                          </label>
                          <input
                            type="number"
                            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(i, {
                                quantity: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Rate{" "}
                            {item.originalPrice && (
                              <span className="text-blue-600 font-bold normal-case">
                                (
                                {item.originalPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {item.originalCurrency})
                              </span>
                            )}
                          </label>
                          {/* {item.originalPrice && (
                            <div className="text-[10px] text-blue-600 font-bold mb-1 animate-pulse">
                              {item.originalPrice.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}{" "}
                              {item.originalCurrency}
                            </div>
                          )}
                          {!item.originalPrice && <div></div>} */}

                          <input
                            type="number"
                            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm font-bold"
                            value={item.rate}
                            onChange={(e) =>
                              updateItem(i, {
                                rate: parseFloat(e.target.value) || 0,
                                // Clear original info if user manually overrides the rate
                                originalPrice: null,
                                originalCurrency: null,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Discount %
                          </label>
                          <input
                            type="number"
                            className="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm"
                            value={item.discount}
                            onChange={(e) =>
                              updateItem(i, {
                                discount: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold">
                          <span className="font-semibold text-slate-500">
                            Final Price:
                          </span>{" "}
                          {curSym}
                          {Number(item.total || 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                          {selectedImage ? (
                            <img
                              src={`${FILE_BASE_URL}${selectedImage}`}
                              className="h-full w-full object-contain"
                              alt={selectedImageAlt || "Item image"}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[9px] text-slate-300">
                              NO IMG
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {data.source !== "SERVICE" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => addItem("Product")}
                    className={buttonStyles.addmore}
                  >
                    + Add Product Row
                  </button>

                  <button
                    onClick={() => addItem("Accessory")}
                    className={buttonStyles.addmore}
                  >
                    + Add Paid Accessory
                  </button>
                </div>
              )}
              {data.source == "SERVICE" && (
                <button
                  onClick={addServiceItem}
                  className={buttonStyles.addmore}
                >
                  + Add Service Row
                </button>
              )}

              {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2"> */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Customer Notes
                  </label>
                  <textarea
                    className="mb-3 h-20 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs"
                    value={data.customerNotes}
                    onChange={(e) =>
                      setData({ ...data, customerNotes: e.target.value })
                    }
                  />
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="h-38 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs"
                    value={data.termsConditions}
                    onChange={(e) =>
                      setData({ ...data, termsConditions: e.target.value })
                    }
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                    <FaUserEdit /> New Activity Note
                  </label>
                  {/* <div className="flex flex-col gap-2 sm:flex-row"> */}
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="h-50 rounded-xl border border-slate-300 p-3 text-sm"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Log customer update..."
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className={
                        buttonStyles.add + " self-start whitespace-nowrap"
                      }
                    >
                      Log Note
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-[#f07837] p-2 text-white shadow-xl">
                  <div className="lg:col-span-4">
                    {/* <div className="sticky top-4 rounded-2xl border border-slate-800 bg-[#f07837] p-6 text-white shadow-xl">
                     */}
                    <div className="rounded-2xl border border-slate-800 bg-[#f07837] p-6 text-white shadow-xl">
                      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-white">
                        Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white">
                          <span>Subtotal</span>
                          <span className="font-mono text-2xl text-white">
                            {curSym}
                            {data.subtotal.toLocaleString()}
                          </span>
                        </div>
                        {/* {isINR && */}
                        {isINR &&
                          data.gstApplicable &&
                          (isIntraState ? (
                            <>
                              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-emerald-400 font-bold">
                                <span>CGST</span>
                                <span className="font-mono text-xl">
                                  {curSym}
                                  {data.items
                                    .reduce(
                                      (s, i) => s + (i.cgstAmount || 0),
                                      0,
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-emerald-400 font-bold">
                                <span>SGST</span>
                                <span className="font-mono text-xl">
                                  {curSym}
                                  {data.items
                                    .reduce(
                                      (s, i) => s + (i.sgstAmount || 0),
                                      0,
                                    )
                                    .toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-emerald-400 font-bold">
                              <span>IGST</span>
                              <span className="font-mono text-xl">
                                {curSym}
                                {data.items
                                  .reduce((s, i) => s + (i.igstAmount || 0), 0)
                                  .toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                              </span>
                            </div>
                          ))}

                        {data.source !== "SERVICE" && (
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wide text-white">
                              Freight / Logistics
                            </label>
                            <input
                              type="number"
                              className="h-10 w-full rounded-lg border border-slate-600 bg-slate-200 px-3 text-right font-mono text-black"
                              value={data.freightCharges}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setData((prev) => ({
                                  ...prev,
                                  freightCharges: val,
                                  termsConditions: getTermsConditions(
                                    val,
                                    placeOfSupplyLabel,
                                    isINR,
                                    // selectedCur?.label,
                                    prev.gstApplicable,
                                  ),
                                  ...recalcWithItems(prev.items, val),
                                }));
                              }}
                            />
                          </div>
                        )}
                        <div className="border-t border-dashed border-slate-600 pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wide">
                              Grand Total
                            </span>
                            <span className="font-mono text-3xl font-bold">
                              {curSym} {data.grandTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 space-y-2">
                        <button
                          disabled={isSaving}
                          onClick={handlePreview}
                          className={buttonStyles.save + " w-full"}
                        >
                          Preview Before Save
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
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <FaHistory /> Timeline History
                  </h4>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {sortedNotes.length ? (
                      sortedNotes.map((n: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm text-slate-700">{n.note}</p>
                          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-500">
                            <span>{n.authorName || "Unknown"}</span>
                            <span>{formatDateTime(n.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">
                        No activity logs.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Draft Log History
                  </h4>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {previewVersions.length ? (
                      previewVersions.map((v, i) => {
                        let summary = "Snapshot saved";
                        const rawVersion =
                          (v as any).versionNo ??
                          (v as any).versionNumber ??
                          i + 1;

                        const statusText = String(
                          (v as any).statusAtMoment || "",
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
                            v.statusAtMoment || parsed.status || "-";
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
                            onClick={() => handleViewVersion(v)}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-[#154068] hover:bg-blue-50"
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
                              <span>{formatDateTime(v.savedAt)}</span>
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
        )}

        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                  Offer Preview - Cross Check
                </h3>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPendingConfirmationLog(null);
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Back To Edit
                </button>
              </div>
              <div className="space-y-5 p-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-700">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Last Log (Latest Activity)
                  </h4>
                  {latestLog ? (
                    <div className="space-y-1">
                      <p>
                        <span className="font-semibold text-slate-500">
                          Author:
                        </span>{" "}
                        {latestLog.authorName || "-"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500">
                          Date & Time:
                        </span>{" "}
                        {formatDateTime(latestLog.createdAt)}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-500">
                          Log:
                        </span>{" "}
                        {latestLog.note || "-"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500">No logs available</p>
                  )}
                  <p className="mt-3 text-xs text-slate-600">
                    <span className="font-semibold">
                      Latest confirmation log:
                    </span>{" "}
                    {latestConfirmationLog
                      ? `${latestConfirmationLog.note} (${formatDateTime(latestConfirmationLog.createdAt)})`
                      : "Not found"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-3 lg:grid-cols-4">
                  <div>
                    <span className="font-semibold text-slate-500">
                      Order Source:
                    </span>{" "}
                    {sourceLabel}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Enquiry ID:
                    </span>{" "}
                    {data.enquiryId ?? "-"}
                  </div>
                  {data.source === "SERVICE" && (
                    <div className="md:col-span-2">
                      <span className="font-semibold text-slate-500">
                        Service Description:
                      </span>{" "}
                      <span className="italic text-slate-600">
                        {data.serviceDescription || "N/A"}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-slate-500">
                      Status:
                    </span>{" "}
                    {data.status}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Next Follow-up:
                    </span>{" "}
                    {formatDate(data.nextFollowUpDate)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Offer No:
                    </span>{" "}
                    {data.offerNo ||
                      (data.source === "VERBAL" ? "AUTO (VERBAL)" : "-")}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Offer Date:
                    </span>{" "}
                    {formatDate(data.offerDate)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Expiry Date:
                    </span>{" "}
                    {formatDate(data.expiryDate)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      CustomerAccount:
                    </span>{" "}
                    {resolveLabel(options.customers, data.customerId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Billing Company:
                    </span>{" "}
                    {resolveLabel(options.companies, data.companyId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Vendor:
                    </span>{" "}
                    {resolveLabel(options.vendors, data.vendorId || 0)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Currency:
                    </span>{" "}
                    {resolveLabel(options.currencies, data.currencyId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Place Of Supply:
                    </span>{" "}
                    {resolveLabel(options.states, data.placeOfSupplyId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Contact Person:
                    </span>{" "}
                    {resolveLabel(filteredContacts, data.responsiblePersonId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Assign To:
                    </span>{" "}
                    {resolveLabel(options.employees, data.assignedToEmployeeId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">Bank:</span>{" "}
                    {resolveLabel(companyBanks, data.bankDetailId)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Items Count:
                    </span>{" "}
                    {data.items.length}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-3 w-[50px]">#</th>
                        <th className="p-3 w-[100px]">Type</th>
                        <th className="p-3">Product / Paid Accessory</th>
                        <th className="p-3">Free Accessories</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Disc %</th>
                        <th className="p-3 text-right">Tax Amt</th>
                        <th className="p-3 text-right">Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item, i) => (
                        <tr
                          key={`pv-item-${i}`}
                          className="border-t border-slate-100"
                        >
                          <td className="p-3">{i + 1}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                                item.itemType === "Accessory"
                                  ? "bg-purple-100 text-purple-700"
                                  : item.itemType === "Service"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.itemType || "Product"}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            {item.itemType === "Service"
                              ? item.servicePartNo || "Service"
                              : item.itemType === "Accessory"
                                ? resolveLabel(
                                    options.accessories,
                                    item.accessoryId,
                                  )
                                : resolveLabel(
                                    options.products,
                                    item.productId,
                                  )}
                          </td>
                          <td className="p-3 text-slate-500 italic text-xs">
                            {item.itemType !== "Accessory" &&
                            item.accessoryIds?.length
                              ? options.accessories
                                  ?.filter((x: any) =>
                                    item.accessoryIds.includes(Number(x.value)),
                                  )
                                  .map((x: any) => x.label)
                                  .join(", ")
                              : "-"}
                          </td>
                          <td className="p-3 text-xs max-w-[200px] truncate">
                            {item.description || "-"}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {Number(item.rate || 0).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td className="p-3 text-right">{item.discount}%</td>
                          <td className="p-3 text-right text-emerald-600 text-xs">
                            {isINR ? (
                              isIntraState ? (
                                <div className="space-y-1">
                                  <div>
                                    CGST:{" "}
                                    {Number(
                                      item.cgstAmount || 0,
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </div>
                                  <div>
                                    SGST:{" "}
                                    {Number(
                                      item.sgstAmount || 0,
                                    ).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  IGST:{" "}
                                  {Number(item.igstAmount || 0).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                    },
                                  )}
                                </div>
                              )
                            ) : (
                              Number(item.gstAmount || 0).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                },
                              )
                            )}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {curSym}{" "}
                            {item.finalPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm md:grid md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-slate-500">
                      Subtotal:
                    </span>{" "}
                    {curSym}
                    {data.subtotal.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Freight:
                    </span>{" "}
                    {Number(data.freightCharges || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500">
                      Grand Total:
                    </span>{" "}
                    <span className="font-bold text-slate-900">
                      {curSym} {data.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer Notes
                    </h4>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {data.customerNotes || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Terms & Conditions
                    </h4>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">
                      {data.termsConditions || "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPendingConfirmationLog(null);
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100"
                >
                  Edit Again
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleSave}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-700 disabled:bg-slate-300"
                >
                  {isSaving ? "SAVING..." : "Confirm & Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedVersionData && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                  Version Data -{" "}
                  {selectedVersionData.offerNo ||
                    selectedVersionData.OfferNo ||
                    "-"}
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      printOfferVersionPDF(selectedVersionData, options)
                    }
                    className="rounded-lg cursor-pointer bg-[#f07837] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f314f]"
                  >
                    Download PDF
                  </button>

                  <button
                    onClick={() => setSelectedVersionData(null)}
                    className="rounded-lg cursor-pointer border px-3 py-1.5 text-xs font-semibold hover:bg-slate-100"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="space-y-4 p-6 text-sm text-slate-700">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <b>Status:</b>{" "}
                    {selectedVersionData.status ||
                      selectedVersionData.Status ||
                      "-"}
                  </div>
                  <div>
                    <b>Offer No:</b>{" "}
                    {selectedVersionData.offerNo ||
                      selectedVersionData.OfferNo ||
                      "-"}
                  </div>
                  <div>
                    <b>Grand Total:</b>{" "}
                    {Number(
                      selectedVersionData.grandTotal ??
                        selectedVersionData.GrandTotal ??
                        0,
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    <b>Customer:</b>{" "}
                    {selectedVersionData.customerName ||
                      selectedVersionData.CustomerName ||
                      "-"}
                  </div>
                  <div>
                    <b>Currency:</b>{" "}
                    {selectedVersionData.currencyName ||
                      selectedVersionData.CurrencyName ||
                      "-"}
                  </div>
                  <div>
                    <b>Source:</b>{" "}
                    {selectedVersionData.source ||
                      selectedVersionData.Source ||
                      "-"}
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
                        <th className="p-3 text-right">Discount</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        selectedVersionData.items ||
                        selectedVersionData.Items ||
                        []
                      ).map((item: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            {item.itemType || item.ItemType || "-"}
                          </td>
                          <td className="p-3">
                            {item.description || item.Description || "-"}
                          </td>
                          <td className="p-3 text-right">
                            {item.quantity || item.Quantity || 0}
                          </td>
                          <td className="p-3 text-right">
                            {item.rate || item.Rate || 0}
                          </td>
                          <td className="p-3 text-right">
                            {item.discount || item.Discount || 0}%
                          </td>
                          <td className="p-3 text-right">
                            {item.total || item.Total || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferWizard;
