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
  FaUniversity,
  FaUserTie,
  FaMapMarkedAlt,
  FaUserFriends,
  FaBuilding,
  FaTruck,
  FaCodeBranch,
  FaIdCard,
  FaLayerGroup,
  FaUsers,
  FaCalendarAlt,
  FaHourglassHalf,
  FaMoneyBillWave,
  FaShippingFast,
  FaAddressCard,
  FaStickyNote,
  FaHashtag,
  FaFileInvoice,
  FaCalendarDay,
  FaCalendarCheck,
  FaInfoCircle,
  FaBell,
  FaFileContract,
  FaChevronLeft,
  FaChevronRight,
  FaHistory,
  FaUserEdit,
} from "react-icons/fa";
import {
  getFinalOffers,
  getNextOANumber,
  getFinalServiceOffers,
  saveOA,
} from "./Services/OrderAcceptanceService";
import { getOfferById } from "../Offer/Services/OfferService";
import { getCustomerAddressById } from "../Customer/Services/CustomerService";
import { useAuth } from "../../../../hooks/useAuth";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import { getVendorById } from "../Vendor/Services/VendorService";
import { getBanksByCompanyId } from "../Company/Services/CompanyService";
import OrderAcceptancePreviewModal from "./OrderAcceptancePreviewModal";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { getCustomerContacts } from "../Enquiry/Services/EnquiryService";
import apiClient from "../../../../API/apiClient";

const getInitialData = () => ({
  orderAcceptanceId: 0,
  offerIds: [],
  offers: [],
  gaxcePurchaseOrderNo: "",
  customerOrderNo: "",
  customerOrderDate: new Date().toISOString().split("T")[0],
  orderDate: new Date().toISOString().split("T")[0],
  status: "DRAFT",
  nextFollowUpDate: null,
  items: [],
  freightCharges: 0,
  customerNotes: "",
  termsConditions: "",
  gstApplicable: true,
});

const OrderAcceptanceWizard = ({
  editData,
  options,
  onCancel,
  onSuccess,
}: any) => {
  useAuth();
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const [data, setData] = useState<any>(() => {
    if (editData) {
      return {
        ...editData,
        customerOrderDate: formatDateForInput(editData.customerOrderDate),
        orderDate: formatDateForInput(editData.orderDate),
        nextFollowUpDate: formatDateForInput(editData.nextFollowUpDate),
      };
    }
    return getInitialData();
  });
  const [, setIsSaving] = useState(false);
  const [finalOffers, setFinalOffers] = useState<any[]>([]);
  const [isMultiOfferMode] = useState(false);
  const [liveRates, setLiveRates] = useState<{
    USD: number;
    GBP: number;
    EUR: number;
    CNY: number;
    INR: number;
  } | null>(null);
  const [sameAddressFlags, setSameAddressFlags] = useState<
    Record<number, boolean>
  >({});
  const [dynamicBanks, setDynamicBanks] = useState<any[]>([]);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [customerContacts, setCustomerContacts] = useState<any[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newActivityNote, setNewActivityNote] = useState("");
  const [serviceOffers, setServiceOffers] = useState<any[]>([]);

  const isServiceOrder = useMemo(
    () =>
      data.items?.some(
        (item: any) => String(item.itemType || "").toLowerCase() === "service",
      ),
    [data.items],
  );

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

  const loadCustomerContacts = async (customerId: number | string) => {
    if (!customerId) {
      setCustomerContacts([]);
      return;
    }

    try {
      const res = await getCustomerContacts(Number(customerId));

      const formatted = (res || []).map((c: any) => ({
        value: Number(
          c.id || c.contactId || c.responsiblePersonId || c.value || 0,
        ),
        label:
          c.contactPersonName ||
          c.responsiblePersonName ||
          c.name ||
          c.label ||
          "",
      }));

      setCustomerContacts(formatted);
    } catch (error) {
      console.error("Failed to load contacts", error);
      setCustomerContacts([]);
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

  const inrCurrencyId = useMemo(() => {
    const inr = options.currencies?.find(
      (c: any) => c.label === "INR" || c.currencyName === "INR",
    );
    return inr?.value || null;
  }, [options.currencies]);

  const primaryCurrencyId = useMemo(
    () => data.offers?.[0]?.currencyId || 0,
    [data.offers],
  );
  const curSym = useMemo(
    () =>
      options.currencies?.find((c: any) => c.value === primaryCurrencyId)
        ?.currencySymbol || "₹",
    [primaryCurrencyId, options.currencies],
  );

  const { subtotal, taxTotal } = useMemo(() => {
    const sub = data.items.reduce((s: number, i: any) => s + (i.total || 0), 0);
    const tax = data.items.reduce(
      (s: number, i: any) => s + (i.gstAmount || 0),
      0,
    );
    return { subtotal: sub, taxTotal: tax };
  }, [data.items]);

  const grandTotal = useMemo(() => {
    return subtotal + taxTotal + Number(data.freightCharges || 0);
  }, [subtotal, taxTotal, data.freightCharges]);

  useEffect(() => {
    getFinalOffers().then(setFinalOffers);
    getFinalServiceOffers().then(setServiceOffers);
    if (!editData) {
      getNextOANumber().then((no) =>
        setData((prev: any) => ({ ...prev, gaxcePurchaseOrderNo: no })),
      );
    }
  }, [editData]);

  const isINR = useMemo(() => {
    const currency = options.currencies?.find(
      (c: any) => c.value === primaryCurrencyId,
    );
    return currency?.label === "INR" || currency?.currencyName === "INR";
  }, [primaryCurrencyId, options.currencies]);

  const gstApplicable = useMemo(() => {
    const offerValue = data.offers?.[0]?.gstApplicable;

    if (offerValue !== undefined && offerValue !== null) {
      return Boolean(offerValue);
    }

    return data.items?.some(
      (i: any) =>
        Number(i.taxPercentage || 0) > 0 ||
        Number(i.gstAmount || 0) > 0 ||
        Number(i.cgstAmount || 0) > 0 ||
        Number(i.sgstAmount || 0) > 0 ||
        Number(i.igstAmount || 0) > 0,
    );
  }, [data.offers, data.items]);

  const statusOptions = useMemo(() => {
    const options = [{ value: "DRAFT", label: "DRAFT" }];
    if (data.orderAcceptanceId > 0 || data.status === "FINAL") {
      options.push({ value: "FINAL", label: "FINAL" });
    }
    return options;
  }, [data.orderAcceptanceId, data.status]);

  const selectedBillingCompany = options.companies?.find(
    (c: any) => Number(c.value) === Number(data.offers?.[0]?.companyId),
  );

  const selectedPlaceOfSupply = options.states?.find(
    (s: any) => Number(s.value) === Number(data.offers?.[0]?.placeOfSupplyId),
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

  useEffect(() => {
    if (!data.items || data.items.length === 0) return;

    setData((prev: any) => {
      const recalculatedItems = prev.items.map((item: any) => {
        const qty = Number(item.quantity) || 0;
        const rate = Number(item.rate) || 0;
        const discount = Number(item.discount) || 0;

        const total = qty * rate * (1 - discount / 100);
        const taxRate = isINR && data.gstApplicable ? 18 : 0;

        let cgstAmount = 0;
        let sgstAmount = 0;
        let igstAmount = 0;

        if (isINR && taxRate > 0) {
          if (hasValidGstState) {
            if (isIntraState) {
              cgstAmount = +(total * 0.09).toFixed(2);
              sgstAmount = +(total * 0.09).toFixed(2);
            } else {
              igstAmount = +(total * 0.18).toFixed(2);
            }
          } else {
            cgstAmount = +(total * 0.09).toFixed(2);
            sgstAmount = +(total * 0.09).toFixed(2);
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
      });

      return {
        ...prev,
        items: recalculatedItems,
      };
    });
  }, [data.items, isINR, gstApplicable, isIntraState, hasValidGstState]);

  const updateOfferData = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const updatedOffers = [...prev.offers];
      updatedOffers[index] = { ...updatedOffers[index], [field]: value };

      const newRootState = { ...prev, offers: updatedOffers };
      if (
        index === 0 &&
        (field === "responsiblePersonId" || field === "responsiblePersonName")
      ) {
        newRootState[field] = value;
      }

      return newRootState;
    });

    if (field === "placeOfSupplyId" && sameAddressFlags[index]) {
      const stateObj = options.states?.find((s: any) => s.value === value);
      if (stateObj) {
        const generatedAddress = `${stateObj.label}`;
        setData((prev: any) => {
          const updatedOffers = [...prev.offers];
          updatedOffers[index] = {
            ...updatedOffers[index],
            address: generatedAddress,
          };
          return { ...prev, offers: updatedOffers };
        });
      } else {
        setData((prev: any) => {
          const updatedOffers = [...prev.offers];
          updatedOffers[index] = {
            ...updatedOffers[index],
            address: "Please select a valid Place of Supply",
          };
          return { ...prev, offers: updatedOffers };
        });
      }
    }
  };

  const FREIGHT_LINE = "* FREIGHT & INSURANCE : EXCLUSIVE";

  const updateTermsWithFreight = (
    terms: string,
    freightCharges: number,
  ): string => {
    const lines = (terms || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => line !== FREIGHT_LINE);

    if (Number(freightCharges) > 0) {
      const pricesIndex = lines.findIndex((line) =>
        line.toUpperCase().startsWith("* PRICES"),
      );

      if (pricesIndex >= 0) {
        lines.splice(pricesIndex + 1, 0, FREIGHT_LINE);
      } else {
        lines.push(FREIGHT_LINE);
      }
    }

    return lines.join("\n");
  };

  const handleOfferSelection = async (selectedOptions: any) => {
    toast.loading("Syncing with Offer(s)...");
    try {
      if (
        !selectedOptions ||
        (Array.isArray(selectedOptions) && selectedOptions.length === 0)
      ) {
        setData((prev: any) => ({
          ...getInitialData(),
          gaxcePurchaseOrderNo: prev.gaxcePurchaseOrderNo,
        }));
        toast.dismiss();
        return;
      }

      const ids = Array.isArray(selectedOptions)
        ? selectedOptions.map((opt: any) => opt.value)
        : [selectedOptions.value];
      const fetchedOffersRaw = await Promise.all(
        ids.map((id: number) => getOfferById(id)),
      );
      const fetchedOffers = fetchedOffersRaw.map((o: any) => ({
        ...o,
        serviceId: o.serviceId || o.ServiceId || 0,
        offerCreateDate: o.offerCreateDate || o.offerDate,
        offerExpiryDate: o.offerExpiryDate || o.expiryDate,
      }));
      const allItems = fetchedOffers.flatMap((o: any) =>
        o.items.map((item: any) => {
          const rawType = item.itemType || item.ItemType || "";

          const isActuallyAccessory =
            rawType.toLowerCase() === "accessory" ||
            (Number(item.accessoryId) > 0 &&
              (!item.productId || Number(item.productId) === 0));

          return {
            ...item,
            offerNo: o.offerNo,
            itemType: isActuallyAccessory ? "Accessory" : "Product",
            productId: item.productId || 0,
            accessoryId: item.accessoryId || 0,
          };
        }),
      );
      const primary = fetchedOffers[0];
      await loadCustomerContacts(primary?.customerId);
      setData((prev: any) => ({
        ...prev,
        ...getInitialData(),
        gaxcePurchaseOrderNo: prev.gaxcePurchaseOrderNo,
        offerIds: ids,
        offers: fetchedOffers,
        items: allItems,
        gstApplicable: Boolean(primary?.gstApplicable),
        customerNotes: primary?.customerNotes || "",
        notes: primary?.notes || [],
        freightCharges: primary?.freightCharges || 0,
        termsConditions: updateTermsWithFreight(
          primary?.termsConditions || "",
          Number(primary?.freightCharges || 0),
        ),
      }));
      setSameAddressFlags({});
      toast.dismiss();
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to sync offer data.");
    }
  };

  const handleServiceOfferSelection = async (selectedOptions: any) => {
    toast.loading("Syncing with Service Offer(s)...");
    try {
      if (!selectedOptions) {
        toast.dismiss();
        return;
      }

      const ids = Array.isArray(selectedOptions)
        ? selectedOptions.map((opt: any) => opt.value)
        : [selectedOptions.value];

      const fetchedOffersRaw = await Promise.all(
        ids.map((id: number) => getOfferById(id)),
      );

      const fetchedOffers = fetchedOffersRaw.map((o: any) => ({
        ...o,
        source: o.source || o.Source || "SERVICE",
        serviceId: o.serviceId || o.ServiceId || 0,
        offerCreateDate: o.offerCreateDate || o.offerDate,
        offerExpiryDate: o.offerExpiryDate || o.expiryDate,
      }));

      const allItems = fetchedOffers.flatMap((o: any) =>
        (o.items || []).map((item: any) => {
          const rawType = String(
            item.itemType || item.ItemType || "",
          ).toLowerCase();

          const productId = Number(item.productId || item.ProductId || 0);
          const accessoryId = Number(item.accessoryId || item.AccessoryId || 0);

          const servicePartNo = item.servicePartNo || item.ServicePartNo || "";

          const itemServiceId = Number(item.serviceId || item.ServiceId || 0);

          const isService = rawType === "service" || itemServiceId > 0;

          const isAccessory =
            rawType === "accessory" ||
            (accessoryId > 0 && productId === 0 && !isService);

          return {
            ...item,
            offerNo: o.offerNo,
            itemType: isService
              ? "Service"
              : isAccessory
                ? "Accessory"
                : "Product",

            productId: isService || isAccessory ? 0 : productId,
            accessoryId: isAccessory ? accessoryId : 0,

            serviceId: isService
              ? itemServiceId || Number(o.serviceId || o.ServiceId || 0)
              : 0,

            servicePartNo: isService
              ? servicePartNo ||
                item.description?.split(" - ")[0] ||
                o.serviceDescription ||
                "Service"
              : "",

            hsnSacCode: item.hsnSacCode || item.HsnSacCode || "",
            accessoryIds: item.accessoryIds || item.AccessoryIds || [],
          };
        }),
      );

      const primary = fetchedOffers[0];
      await loadCustomerContacts(primary?.customerId);

      setData((prev: any) => ({
        ...prev,
        ...getInitialData(),
        gaxcePurchaseOrderNo: prev.gaxcePurchaseOrderNo,
        offerIds: ids,
        offers: fetchedOffers,
        items: allItems,
        gstApplicable: Boolean(primary?.gstApplicable),
        customerNotes: primary?.customerNotes || "",
        notes: primary?.notes || [],
        freightCharges: primary?.freightCharges || 0,
        termsConditions: updateTermsWithFreight(
          primary?.termsConditions || "",
          Number(primary?.freightCharges || 0),
        ),
      }));

      setSameAddressFlags({});
      toast.dismiss();
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to sync service offer.");
    }
  };

  const filteredOffers = useMemo(() => {
    if (!isMultiOfferMode) return finalOffers;
    return finalOffers.filter((o) => o.currencyId === inrCurrencyId);
  }, [finalOffers, isMultiOfferMode, inrCurrencyId]);

  const updateItem = (index: number, updates: Partial<any>) => {
    setData((prevData: any) => {
      const newItems = [...prevData.items];
      const item = { ...newItems[index], ...updates };

      const qty = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const discount = Number(item.discount) || 0;

      const total = qty * rate * (1 - discount / 100);

      const taxRate = isINR && data.gstApplicable ? 18 : 0;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isINR && taxRate > 0) {
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
              Math.round((total * (taxRate / 100) + Number.EPSILON) * 100) /
              100;
          }
        } else {
          cgstAmount =
            Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
            100;
          sgstAmount =
            Math.round((total * (taxRate / 2 / 100) + Number.EPSILON) * 100) /
            100;
        }
      }

      const gstAmount = cgstAmount + sgstAmount + igstAmount;

      newItems[index] = {
        ...item,
        taxPercentage: taxRate,
        total,
        gstAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        finalPrice: total + gstAmount,
      };

      return { ...prevData, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setData((prevData: any) => {
      const newItems = prevData.items.filter(
        (_: any, idx: number) => idx !== index,
      );

      return {
        ...prevData,
        items: newItems,
      };
    });
  };

  const handleSave = async () => {
    setValidationAttempted(true);
    if (!data.customerOrderNo || !data.customerOrderNo.trim()) {
      toast.error("Customer Purchase Order (PO) No. is required.");
      return;
    }

    if (!data.items || data.items.length === 0) {
      return toast.error("Please add products before saving.");
    }

    setIsSaving(true);
    try {
      const primaryOffer = data.offers?.[0] || {};
      const customer = options.customers?.find(
        (c: any) => c.value === primaryOffer.customerId,
      );
      const currency = options.currencies?.find(
        (c: any) => c.value === primaryOffer.currencyId,
      );

      const cleanedItems = data.items.map((it: any) => ({
        ...it,
        itemType: it.itemType || "Product",
        productId: it.itemType === "Product" ? it.productId || 0 : 0,
        accessoryId: it.itemType === "Accessory" ? it.accessoryId || 0 : 0,
        serviceId: it.itemType === "Service" ? it.serviceId || 0 : 0,
        servicePartNo: it.itemType === "Service" ? it.servicePartNo || "" : "",
        // hsnSacCode: it.itemType === "Service" ? "" : it.hsnSacCode || "",
        hsnSacCode: it.hsnSacCode || "",
        quantity: Number(it.quantity) || 0,
        rate: Number(it.rate) || 0,
        cgstAmount: Number(it.cgstAmount) || 0,
        sgstAmount: Number(it.sgstAmount) || 0,
        igstAmount: Number(it.igstAmount) || 0,
      }));

      const payload = {
        ...data,
        orderAcceptanceNotes:
          data.orderAcceptanceNotes?.length > 0
            ? data.orderAcceptanceNotes
            : data.notes || [],

        currencyId: primaryOffer.currencyId,
        customerId: primaryOffer.customerId,
        vendorId: primaryOffer.vendorId,
        companyId: primaryOffer.companyId,

        offers: data.offers.map((o: any) => ({
          ...o,
          serviceId: o.serviceId || 0,
        })),
        items: cleanedItems,
        grandTotal,
        subtotal,
        OfferNo: primaryOffer.offerNo,
        Address: primaryOffer.address,
        CompanyCode: primaryOffer.companyCode,
        VendorCode:
          primaryOffer.vendorCode &&
          String(primaryOffer.vendorCode).trim() !== ""
            ? String(primaryOffer.vendorCode)
            : null,
        CustomerName: customer?.label || "",
        CurrencyName: currency?.label || "",
        CurrencySymbol: currency?.currencySymbol || "",
      };
      await saveOA(payload);
      toast.success("Order Acceptance Saved Successfully");
      onSuccess();
    } catch  {
      toast.error("Save Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchAppropriateBanks = async () => {
      const firstOffer = data.offers?.[0];
      if (!firstOffer) return;

      try {
        if (isINR) {
          if (firstOffer.companyId) {
            const res = await getBanksByCompanyId(firstOffer.companyId);
            const formatted = res.map((b: any) => ({
              value: b.bankDetailId,
              label: `${b.bankName} - ${b.accountNo}`,
            }));
            setDynamicBanks(formatted);
          }
        } else {
          if (firstOffer.vendorId) {
            const vendorData = await getVendorById(firstOffer.vendorId);
            if (vendorData && vendorData.bankDetails) {
              const formatted = vendorData.bankDetails.map(
                (b: any, index: number) => ({
                  value: b.bankDetailId || index,
                  label: `${b.bankName} (${b.swiftCode || "No SWIFT"}) - ${b.accountNo}`,
                }),
              );
              setDynamicBanks(formatted);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load dynamic banks", error);
        setDynamicBanks([]);
      }
    };

    fetchAppropriateBanks();
  }, [isINR, data.offers?.[0]?.companyId, data.offers?.[0]?.vendorId]);

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

  const handleSameAddressToggle = async (
    offerIndex: number,
    checked: boolean,
  ) => {
    setSameAddressFlags((prev) => ({ ...prev, [offerIndex]: checked }));

    if (checked) {
      const offer = data.offers[offerIndex];
      const customerId = offer?.customerId;

      if (!customerId) {
        toast.error("A customer must be selected first to fetch the address.");
        setSameAddressFlags((prev) => ({ ...prev, [offerIndex]: false }));
        return;
      }

      toast.loading("Fetching customer address...");
      try {
        const customerAddress = await getCustomerAddressById(customerId);

        setData((prev: any) => {
          const updatedOffers = [...prev.offers];
          updatedOffers[offerIndex] = {
            ...updatedOffers[offerIndex],
            address: customerAddress,
          };
          return { ...prev, offers: updatedOffers };
        });

        toast.dismiss();
        toast.success("Address populated successfully.");
      } catch (error) {
        console.error("Failed to fetch customer address:", error);
        toast.dismiss();
        toast.error("Could not fetch the customer address.");
      }
    }
  };

  const selectPortalStyles = {
    menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
    menu: (base: any) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className="mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f8fafc] text-left shadow-2xl animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 bg-[#f07837] px-6 py-5 text-white">
        <h2 className="flex items-center gap-2 text-lg font-bold uppercase tracking-tight">
          <FaBoxOpen className="text-blue-400" /> Order Acceptance Workspace
        </h2>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-2 text-[11px] font-bold uppercase transition hover:bg-rose-600"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-2 md:p-4 space-y-3">
        {data.orderAcceptanceId === 0 && data.offers.length === 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-8 shadow-inner text-center">
            <label className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase text-blue-900 tracking-widest">
              <FaCheckDouble /> Step 1: Select Approved Offer
            </label>

            <div className="max-w-xl mx-auto mt-6 space-y-4">
              {/* ✅ PRODUCT OFFERS */}
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1">
                  Product Offers
                </p>
                <Select
                  isMulti={isMultiOfferMode}
                  options={filteredOffers}
                  value={filteredOffers.filter((o) =>
                    data.offerIds?.includes(o.value),
                  )}
                  onChange={handleOfferSelection}
                  placeholder="Search Product Offers..."
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>

              {/* ✅ SERVICE OFFERS */}
              <div>
                <p className="text-xs font-bold text-purple-600 mb-1">
                  Service Offers
                </p>
                <Select
                  options={serviceOffers}
                  value={serviceOffers.filter((o) =>
                    data.offerIds?.includes(o.value),
                  )}
                  onChange={handleServiceOfferSelection}
                  placeholder="Search Service Offers..."
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </div>
            </div>
          </div>
        )}

        {(data.offers.length > 0 || data.orderAcceptanceId > 0) && (
          <div className="space-y-3">
            <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
              <SectionHeader icon={FaFileAlt} title="Common Order Details" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>
                    <FaHashtag className="inline mr-1" /> Gaxce Order No
                  </label>
                  <input
                    className={`${inputClass} bg-slate-200`}
                    value={data.gaxcePurchaseOrderNo}
                    disabled
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FaFileInvoice className="inline mr-1" /> Customer PO No.{" "}
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    className={`${inputClass} ${
                      validationAttempted && !data.customerOrderNo?.trim()
                        ? "border-red-500 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-200"
                        : "border-slate-300"
                    }`}
                    placeholder="Enter PO Number..."
                    value={data.customerOrderNo}
                    onChange={(e) =>
                      setData({ ...data, customerOrderNo: e.target.value })
                    }
                  />
                  {/* Optional: Add a small error message below the input */}
                  {validationAttempted && !data.customerOrderNo?.trim() && (
                    <p className="text-[10px] text-red-500 mt-1 font-bold">
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    <FaCalendarDay className="inline mr-1" /> Customer PO Date
                  </label>

                  <input
                    type="date"
                    className={inputClass}
                    value={formatDateForInput(data.customerOrderDate)}
                    onChange={(e) =>
                      setData({ ...data, customerOrderDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <FaCalendarCheck className="inline mr-1" /> Order Date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.orderDate}
                    onChange={(e) =>
                      setData({ ...data, orderDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <FaInfoCircle className="inline mr-1" /> Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={statusOptions.find((o) => o.value === data.status)}
                    onChange={(o: any) => setData({ ...data, status: o.value })}
                    isDisabled={statusOptions.length <= 1}
                  />
                  {/* <Select
                    options={[
                      { value: "DRAFT", label: "Draft" },
                      { value: "FINAL", label: "Final" },
                    ]}
                    value={{ value: data.status, label: data.status }}
                    onChange={(o: any) => setData({ ...data, status: o.value })}
                  /> */}
                </div>
                <div>
                  <label className={labelClass}>
                    <FaBell className="inline mr-1" /> Next Follow-up
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={data.nextFollowUpDate || ""}
                    onChange={(e) =>
                      setData({ ...data, nextFollowUpDate: e.target.value })
                    }
                  />
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <div>
                    <label className={labelClass}>
                      <FaCommentAlt className="inline mr-1" /> Internal Office
                      Remarks (Customer Notes)
                    </label>
                    <textarea
                      className={`${inputClass} h-24 pt-3`}
                      value={data.customerNotes}
                      onChange={(e) =>
                        setData({ ...data, customerNotes: e.target.value })
                      }
                    />
                  </div> */}
                  <div>
                    <label className={labelClass}>
                      <FaFileContract className="inline mr-1" /> Terms &
                      Conditions
                    </label>
                    <textarea
                      className={`${inputClass} h-24 pt-3`}
                      value={data.termsConditions}
                      onChange={(e) =>
                        setData({ ...data, termsConditions: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {data.offers.map((offer: any, index: number) => (
              <div
                key={offer.offerId}
                className="rounded-4xl border-2 border-blue-100 bg-white p-8 shadow-lg"
              >
                <h3 className="text-lg font-bold text-blue-800 mb-6 pb-4 border-b-2 border-blue-100">
                  Source Offer Details:{" "}
                  <span className="text-slate-900">{offer.offerNo}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* --- Row 1 --- */}
                  <div>
                    <label className={labelClass}>
                      <FaUserFriends className="inline mr-1" /> Customer
                    </label>
                    <Select
                      // options={options.customers}
                      options={customerOptionsWithBranch}
                      value={
                        customerOptionsWithBranch.find(
                          (x: any) => x.value === offer.customerId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "customerId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaBuilding className="inline mr-1" /> Company
                    </label>
                    <Select
                      options={options.companies}
                      value={
                        options.companies?.find(
                          (x: any) => x.value === offer.companyId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "companyId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaTruck className="inline mr-1" /> Vendor
                    </label>
                    <Select
                      options={options.vendors}
                      value={
                        options.vendors?.find(
                          (x: any) => x.value === offer.vendorId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "vendorId", o?.value)
                      }
                    />
                  </div>
                  {/* --- Row 2 --- */}
                  <div>
                    <label className={labelClass}>
                      <FaCodeBranch className="inline mr-1" /> Company Code
                    </label>
                    <input
                      className={inputClass}
                      value={offer.companyCode}
                      onChange={(e) =>
                        updateOfferData(index, "companyCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaIdCard className="inline mr-1" /> Vendor Code
                    </label>
                    <input
                      className={inputClass}
                      value={offer.vendorCode}
                      onChange={(e) =>
                        updateOfferData(index, "vendorCode", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaLayerGroup className="inline mr-1" /> Group
                    </label>
                    <Select
                      options={options.groups}
                      value={
                        options.groups?.find(
                          (x: any) => x.value === offer.productGroupId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "productGroupId", o?.value)
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaUsers className="inline mr-1" /> Company Group
                    </label>
                    <Select
                      options={options.companyGroups}
                      value={
                        options.companyGroups?.find(
                          (x: any) => x.value === offer.companyGroupId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "companyGroupId", o?.value)
                      }
                    />
                  </div>

                  {/* --- Row 3 --- */}
                  <div>
                    <label className={labelClass}>
                      <FaUserTie className="inline mr-1" /> Responsible Person
                    </label>
                    <Select
                      options={customerContacts}
                      value={
                        customerContacts?.find(
                          (x: any) =>
                            Number(x.value) ===
                            Number(offer.responsiblePersonId),
                        ) ||
                        (offer.responsiblePersonId
                          ? {
                              value: Number(offer.responsiblePersonId),
                              label:
                                offer.responsiblePersonName ||
                                "Selected Contact",
                            }
                          : null)
                      }
                      onChange={(o: any) => {
                        updateOfferData(
                          index,
                          "responsiblePersonId",
                          Number(o?.value) || 0,
                        );
                        updateOfferData(
                          index,
                          "responsiblePersonName",
                          o?.label || "",
                        );
                      }}
                      placeholder="Select Responsible Person..."
                      noOptionsMessage={() =>
                        "No contacts found for selected customer"
                      }
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FaCalendarAlt className="inline mr-1" /> Offer Date
                    </label>
                    <input
                      type="date"
                      className={inputClass}
                      value={offer.offerCreateDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        updateOfferData(
                          index,
                          "offerCreateDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaHourglassHalf className="inline mr-1" /> Expiry Date
                    </label>
                    <input
                      type="date"
                      className={inputClass}
                      value={offer.offerExpiryDate?.split("T")[0] || ""}
                      onChange={(e) =>
                        updateOfferData(
                          index,
                          "offerExpiryDate",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaMoneyBillWave className="inline mr-1" /> Currency
                    </label>
                    <Select
                      options={options.currencies}
                      value={
                        options.currencies?.find(
                          (x: any) => x.value === offer.currencyId,
                        ) || null
                      }
                      isDisabled={true}
                      onChange={(o: any) =>
                        updateOfferData(index, "currencyId", o?.value)
                      }
                    />
                  </div>
                  {/* --- Row 4 --- */}
                  <div>
                    <label className={labelClass}>
                      <FaMapMarkedAlt className="inline mr-1" /> Place of Supply
                    </label>
                    <Select
                      options={options.states}
                      value={
                        options.states?.find(
                          (x: any) => x.value === offer.placeOfSupplyId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "placeOfSupplyId", o?.value)
                      }
                    />
                  </div>
                  {/* <div>
                    <label className={labelClass}>
                      <FaUniversity className="inline mr-1" /> Bank Detail
                    </label>
                    <Select
                      options={options.banks}
                      value={
                        options.banks?.find(
                          (x: any) => x.value === offer.bankDetailId,
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "bankDetailId", o?.value)
                      }
                    />
                  </div> */}

                  <div>
                    <label className={labelClass}>
                      <FaUniversity className="inline mr-1" />
                      {isINR ? "Company Bank (INR)" : "Vendor Bank (Foreign)"}
                    </label>
                    <Select
                      options={dynamicBanks}
                      value={
                        dynamicBanks?.find(
                          (x: any) =>
                            Number(x.value) === Number(offer.bankDetailId),
                        ) || null
                      }
                      onChange={(o: any) =>
                        updateOfferData(index, "bankDetailId", o?.value)
                      }
                      placeholder={
                        isINR
                          ? "Select Company Bank..."
                          : offer.vendorId
                            ? "Select Vendor Bank..."
                            : "Select Vendor first"
                      }
                      noOptionsMessage={() => "No bank accounts found"}
                    />
                    {!isINR && !offer.vendorId && (
                      <p className="text-[9px] text-rose-500 mt-1 font-bold italic">
                        * Vendor must be selected to load foreign bank details.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FaShippingFast className="inline mr-1" /> Freight Charges
                    </label>
                    <input
                      type="number"
                      className={inputClass}
                      value={offer.freightCharges || 0}
                      onChange={(e) =>
                        updateOfferData(
                          index,
                          "freightCharges",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                  </div>
                  <div />
                  {/* --- Row 5 --- */}
                  {/* <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}><FaAddressCard className="inline mr-1" /> Delivery Address</label>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAddressFlags[index] || false}
                          onChange={(e) => handleSameAddressToggle(index, e.target.checked)}
                          className="cursor-pointer"
                        />
                        Same as Place of Supply
                      </label>
                    </div>
                    <textarea
                      className={`${inputClass} h-20 pt-3`}
                      value={offer.address}
                      onChange={(e) =>
                        updateOfferData(index, "address", e.target.value)
                      }
                    />
                  </div> */}

                  {/* --- Row 5 --- */}
                  <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className={labelClass}>
                        <FaAddressCard className="inline mr-1" /> Delivery
                        Address
                      </label>
                      <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sameAddressFlags[index] || false}
                          onChange={(e) =>
                            handleSameAddressToggle(index, e.target.checked)
                          }
                          className="cursor-pointer"
                        />
                        {/* V V V CHANGE THIS TEXT V V V */}
                        Same as Customer Address
                      </label>
                    </div>
                    <textarea
                      className={`${inputClass} h-20 pt-3`}
                      value={offer.address}
                      onChange={(e) =>
                        updateOfferData(index, "address", e.target.value)
                      }
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <label className={labelClass}>
                      <FaStickyNote className="inline mr-1" /> Customer Notes
                    </label>
                    <textarea
                      className={`${inputClass} h-20`}
                      value={offer.customerNotes || ""}
                      onChange={(e) =>
                        updateOfferData(index, "customerNotes", e.target.value)
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
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[#f07837] hover:bg-[#0d3357] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300 transition-all"
                  aria-label="Scroll left"
                >
                  <FaChevronLeft size={18} />
                </button>
              )}

              <div className="rounded-[2.5rem] border border-slate-200 bg-white overflow-auto shadow-xl">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleTableScroll}
                  className="overflow-auto"
                >
                  <table className="w-full text-left min-w-[1100px] table-fixed">
                    <thead className="bg-[#f07837] text-white text-[10px] font-black uppercase tracking-widest sticky top-0 z-20">
                      <tr>
                        <th className="p-5 w-12 text-center">#</th>
                        <th className="p-5 w-[40%]">Product / Description</th>
                        <th className="p-5 w-28 text-center">HSN/SAC</th>
                        <th className="p-5 w-24 text-center">Qty</th>
                        <th className="p-5 w-32 text-right">Rate</th>
                        <th className="p-5 w-36 text-right">Final Amt</th>
                        <th className="p-5 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item: any, i: number) => {
                        const itemType = String(
                          item.itemType || "Product",
                        ).toLowerCase();
                        const isServiceItem = itemType === "service";
                        const isAccessoryItem = itemType === "accessory";
                        const isProductItem = itemType === "product";

                        const selectedProduct = options.products?.find(
                          (x: any) => x.value === item.productId,
                        );
                        const selectedAccessory = options.accessories?.find(
                          (x: any) => x.value === item.accessoryId,
                        );

                        return (
                          <tr
                            key={i}
                            className="border-b hover:bg-slate-50 align-top"
                          >
                            <td className="p-4 text-center font-bold text-slate-400 border-r">
                              {i + 1}
                            </td>
                            <td className="p-4 space-y-3 border-r">
                              <div className="flex gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    isServiceItem
                                      ? "bg-orange-100 text-orange-700"
                                      : isAccessoryItem
                                        ? "bg-purple-100 text-purple-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {isServiceItem
                                    ? "Service"
                                    : isAccessoryItem
                                      ? "Paid Accessory"
                                      : "Product"}
                                </span>
                                {item.offerNo && (
                                  <span className="text-[9px] font-bold text-slate-400">
                                    Offer: {item.offerNo}
                                  </span>
                                )}
                              </div>

                              {isServiceItem ? (
                                <input
                                  className={`${inputClass} bg-slate-100 font-bold text-[#154068]`}
                                  value={
                                    item.servicePartNo ||
                                    item.description ||
                                    "Service"
                                  }
                                  readOnly
                                />
                              ) : isProductItem ? (
                                <>
                                  <Select
                                    options={options.products}
                                    value={selectedProduct || null}
                                    menuPosition="fixed"
                                    styles={selectPortalStyles}
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
                                    onChange={(o: any) => {
                                      let finalRate = 0;
                                      let origPrice = null,
                                        origCurr = null;
                                      const match = o.currencyPrices?.find(
                                        (cp: any) =>
                                          Number(cp.currencyId) ===
                                          Number(primaryCurrencyId),
                                      );
                                      if (match) finalRate = match.price;
                                      else if (isINR && liveRates) {
                                        const foreign = o.currencyPrices?.find(
                                          (cp: any) =>
                                            [
                                              "GBP",
                                              "USD",
                                              "EUR",
                                              "CNY",
                                            ].includes(
                                              cp.currencyName?.toUpperCase(),
                                            ),
                                        );

                                        if (foreign) {
                                          const foreignCode =
                                            foreign.currencyName?.toUpperCase();
                                          const rateToINR =
                                            foreignCode &&
                                            foreignCode in liveRates
                                              ? liveRates[
                                                  foreignCode as keyof typeof liveRates
                                                ]
                                              : 0;

                                          if (rateToINR) {
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
                                        itemType: "Product",
                                        productId: o.value,
                                        accessoryId: 0,
                                        rate: finalRate,
                                        originalPrice: origPrice,
                                        originalCurrency: origCurr,
                                        hsnSacCode: o.hsnCode,
                                        description: `${o.productCode} - ${o.productName || ""}`,
                                      });
                                    }}
                                  />
                                  <Select
                                    isMulti
                                    placeholder="Free Accessories..."
                                    options={options.accessories}
                                    menuPosition="fixed"
                                    styles={selectPortalStyles}
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
                                    value={options.accessories?.filter(
                                      (x: any) =>
                                        item.accessoryIds?.includes(
                                          Number(x.value),
                                        ),
                                    )}
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
                                  value={selectedAccessory || null}
                                  menuPosition="fixed"
                                  styles={selectPortalStyles}
                                  onChange={(o: any) => {
                                    let finalRate = 0;
                                    let origPrice = null,
                                      origCurr = null;
                                    const match = o.currencyPrices?.find(
                                      (cp: any) =>
                                        Number(cp.currencyId) ===
                                        Number(primaryCurrencyId),
                                    );
                                    if (match) finalRate = match.price;
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
                                          foreignCode &&
                                          foreignCode in liveRates
                                            ? liveRates[
                                                foreignCode as keyof typeof liveRates
                                              ]
                                            : 0;

                                        if (rateToINR) {
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
                                      itemType: "Accessory",
                                      accessoryId: o.value,
                                      productId: 0,
                                      rate: finalRate,
                                      originalPrice: origPrice,
                                      originalCurrency: origCurr,
                                      hsnSacCode: o.hsnCode,
                                      description: `${o.accessoriesCode} - ${o.accessoriesDescription}`,
                                    });
                                  }}
                                />
                              )}
                              <textarea
                                className="w-full rounded-xl border p-2 text-xs h-16"
                                value={item.description}
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
                                  updateItem(i, {
                                    hsnSacCode: e.target.value,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4 border-r">
                              <input
                                type="number"
                                className={`${inputClass} text-center font-bold`}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(i, {
                                    quantity: parseInt(e.target.value) || 0,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4 border-r">
                              {item.originalPrice && (
                                <div className="text-[10px] text-blue-600 font-bold mb-1 animate-pulse text-right">
                                  {item.originalPrice} {item.originalCurrency}
                                </div>
                              )}
                              <input
                                type="number"
                                className={`${inputClass} text-right font-bold`}
                                value={item.rate}
                                onChange={(e) =>
                                  updateItem(i, {
                                    rate: parseFloat(e.target.value) || 0,
                                    originalPrice: null,
                                    originalCurrency: null,
                                  })
                                }
                              />
                            </td>
                            <td className="p-4 text-right font-mono text-lg font-black text-[#154068] border-r">
                              {/* {curSym}
                              {(item.finalPrice || 0).toLocaleString()} */}
                              {curSym}
                              {(item.total || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => removeItem(i)}
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
                <div className="p-6 bg-slate-50 border-t flex gap-4">
                  {!isServiceOrder && (
                    <>
                      <button
                        onClick={() =>
                          setData({
                            ...data,
                            items: [
                              ...data.items,
                              {
                                itemType: "Product",
                                productId: 0,
                                accessoryId: 0,
                                quantity: 1,
                                rate: 0,
                                discount: 0,
                                taxPercentage: isINR ? 18 : 0,
                                total: 0,
                                gstAmount: 0,
                                cgstAmount: 0,
                                sgstAmount: 0,
                                igstAmount: 0,
                                finalPrice: 0,
                                accessoryIds: [],
                              },
                            ],
                          })
                        }
                        className={buttonStyles.addmore}
                      >
                        + Add Item
                      </button>
                      <button
                        onClick={() =>
                          setData({
                            ...data,
                            items: [
                              ...data.items,
                              {
                                itemType: "Accessory",
                                productId: 0,
                                accessoryId: 0,
                                quantity: 1,
                                rate: 0,
                                discount: 0,
                                taxPercentage: isINR ? 18 : 0,
                                total: 0,
                                gstAmount: 0,
                                cgstAmount: 0,
                                sgstAmount: 0,
                                igstAmount: 0,
                                finalPrice: 0,
                              },
                            ],
                          })
                        }
                        className={buttonStyles.addmore}
                      >
                        + Add Paid Accessory
                      </button>
                    </>
                  )}
                </div>
              </div>
              {showRightArrow && (
                <button
                  onClick={() => scrollTable("right")}
                  className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-30 bg-[#f07837] hover:bg-[#0d3357] text-white backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-300  transition-all"
                  aria-label="Scroll right"
                >
                  <FaChevronRight size={18} />
                </button>
              )}
            </div>

            {/* --- Activity Notes + Summary Layout --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
              {/* LEFT SIDE */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                {/* ACTIVITY NOTE */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FaUserEdit className="text-[#154068]" />

                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#154068]">
                      New Activity Note
                    </h3>
                  </div>

                  <textarea
                    value={newActivityNote}
                    onChange={(e) => setNewActivityNote(e.target.value)}
                    placeholder="Log customer update..."
                    className="w-full min-h-[110px] rounded-2xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-[#154068]"
                  />

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (!newActivityNote.trim()) return;

                        setData((prev: any) => ({
                          ...prev,
                          orderAcceptanceNotes: [
                            ...(prev.orderAcceptanceNotes || prev.notes || []),
                            {
                              note: newActivityNote,
                              createdAt: new Date().toISOString(),
                              authorName: "System Admin",
                              createdByEmployeeId: 1,
                            },
                          ],
                        }));

                        setNewActivityNote("");
                      }}
                      className="bg-[#f07837] hover:bg-[#0f3150] text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                      Log Note
                    </button>
                  </div>
                </div>

                {/* TIMELINE HISTORY */}
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <FaHistory className="text-slate-500" />

                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
                      Timeline History
                    </h3>
                  </div>

                  {(data.orderAcceptanceNotes?.length
                    ? data.orderAcceptanceNotes
                    : data.notes || []
                  )?.length > 0 ? (
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                      {(data.orderAcceptanceNotes?.length
                        ? data.orderAcceptanceNotes
                        : data.notes || []
                      ).map((note: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {note.note}
                          </p>

                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-[11px] text-slate-400 font-semibold">
                              {note.createdAt
                                ? new Date(note.createdAt).toLocaleString()
                                : ""}
                            </p>

                            <p className="text-[11px] font-bold text-[#154068]">
                              {note.authorName || "System Admin"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No activity logs.</p>
                  )}
                </div>
              </div>

              {/* RIGHT SIDE SUMMARY */}
              <div className="xl:col-span-1">
                <div className="rounded-[3rem] bg-[#f07837] p-10 text-white shadow-2xl sticky top-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] border-b border-white/10 pb-4 text-blue-300 flex justify-between">
                    OA Summary <FaFileInvoiceDollar size={18} />
                  </h3>

                  <div className="grid grid-cols-1 gap-6 mt-6">
                    {/* SUBTOTAL */}
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-400">Subtotal</span>

                      <span className="font-mono text-2xl font-bold">
                        {curSym} {subtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* GST */}
                    {isINR && gstApplicable ? (
                      isIntraState ? (
                        <>
                          <div className="flex flex-col text-sm">
                            <span className="text-emerald-400 font-bold uppercase text-[10px]">
                              CGST (9%)
                            </span>

                            <span className="font-mono text-xl text-emerald-400">
                              {curSym}{" "}
                              {data.items
                                .reduce(
                                  (s: number, i: any) =>
                                    s + (i.cgstAmount || 0),
                                  0,
                                )
                                .toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                            </span>
                          </div>

                          <div className="flex flex-col text-sm">
                            <span className="text-emerald-400 font-bold uppercase text-[10px]">
                              SGST (9%)
                            </span>

                            <span className="font-mono text-xl text-emerald-400">
                              {curSym}{" "}
                              {data.items
                                .reduce(
                                  (s: number, i: any) =>
                                    s + (i.sgstAmount || 0),
                                  0,
                                )
                                .toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col text-sm">
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">
                            IGST (18%)
                          </span>

                          <span className="font-mono text-xl text-emerald-400">
                            {curSym}{" "}
                            {data.items
                              .reduce(
                                (s: number, i: any) => s + (i.igstAmount || 0),
                                0,
                              )
                              .toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                          </span>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col text-sm opacity-50">
                        <span className="text-slate-400">Tax</span>

                        <span className="font-mono text-lg">0.00</span>
                      </div>
                    )}

                    {/* FREIGHT */}
                    {!isServiceOrder && (
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Freight / Logistics
                        </label>

                        <input
                          type="number"
                          className="h-12 w-full rounded-xl border-none bg-white/10 px-4 text-right font-mono text-lg outline-none"
                          value={data.freightCharges}
                          onChange={(e) => {
                            const freight = parseFloat(e.target.value) || 0;

                            setData((prev: any) => ({
                              ...prev,
                              freightCharges: freight,
                              termsConditions: updateTermsWithFreight(
                                prev.termsConditions,
                                freight,
                              ),
                            }));
                          }}
                        />
                      </div>
                    )}

                    {/* GRAND TOTAL */}
                    <div className="border-t border-dashed border-white/20 pt-6">
                      <p className="text-xs font-bold uppercase text-blue-400 mb-2">
                        Grand Total
                      </p>

                      <p className="font-mono text-4xl font-black tracking-tighter">
                        {curSym} {grandTotal.toLocaleString()}
                      </p>
                    </div>

                    {/* BUTTONS */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={onCancel}
                        className={buttonStyles.cancel}
                      >
                        Discard
                      </button>

                      <button
                        onClick={() => setShowPreview(true)}
                        className={buttonStyles.save}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {showPreview && (
                <OrderAcceptancePreviewModal
                  data={data}
                  options={options}
                  onClose={() => setShowPreview(false)}
                  onConfirm={() => {
                    setShowPreview(false);
                    handleSave();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAcceptanceWizard;
