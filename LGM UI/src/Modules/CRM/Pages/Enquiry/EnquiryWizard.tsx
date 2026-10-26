import { useState, useEffect, useRef, useMemo } from "react";
import Select from "react-select";
import { toast } from "sonner";
import {
  FaTrash,
  FaBoxOpen,
  FaTimes,
  FaUserEdit,
  FaHistory,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";
import type { Enquiry, EnquiryNote } from "./Services/types";
import { saveEnquiry, getCustomerContacts } from "./Services/EnquiryService";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import { useAuth } from "../../../../hooks/useAuth";
import type { SelectOption } from "./Hooks/useEnquiryOptions";
import { getServices } from "../ServiceMaster/Services/ServiceMasterService";
import { buttonStyles } from "../../../../Components/Common/buttonStyles";
import EnquiryPreviewModal from "./EnquiryPreviewModal";
import apiClient from "../../../../API/apiClient";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

const FREIGHT_LINE = "* FREIGHT & INSURANCE : EXCLUSIVE";

const getTermsConditions = (
  freightCharges: number,
  placeOfSupplyLabel?: string,
  isINR?: boolean,
  currencyName?: string,
  gstApplicable: boolean = true,
) => {
  const placeText = placeOfSupplyLabel || "IND";
  const hasFreight = Number(freightCharges) > 0;

  const curr = String(currencyName || "").toUpperCase();
  const isGBP = curr === "GBP" || curr === "£";

  let priceLine = "";

  if (isINR) {
    priceLine = "* PRICES : DOOR DELIVERY";
  } else if (isGBP) {
    priceLine = hasFreight
      ? `* PRICES : CIF, ${placeText}`
      : "* PRICES : EX WORKS UK";
  } else {
    priceLine = `* PRICES : CIF, ${placeText}`;
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

const EnquiryWizard = ({ editData, options, onCancel, onSuccess }: any) => {
  const { user } = useAuth();

  const [data, setData] = useState<Enquiry>(
    editData || {
      enquiryId: 0,
      serviceId: null,
      serviceDescription: "",
      servicePrice: 0,
      enquiryNo: "",
      offerDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split("T")[0],
      nextFollowUpDate: new Date(new Date().setDate(new Date().getDate() + 30))
        .toISOString()
        .split("T")[0],
      gstApplicable: true,
      productGroupId: 0,
      companyId: 0,
      vendorId: 0,
      companyGroupId: 0,
      customerId: 0,
      responsiblePersonId: 0,
      assignedToEmployeeId: null,
      status: "DRAFT",
      entryType: "ENQUIRY",
      currencyId: 0,
      placeOfSupplyId: 0,
      bankDetailId: null,
      subtotal: 0,
      freightCharges: 0,
      grandTotal: 0,
      // termsConditions: getTermsConditions(0, "IND", false),
      termsConditions: getTermsConditions(0, "IND", false, undefined, true),
      notes: [],
      items: [],
    },
  );

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

  const placeOfSupplyLabel = selectedPlaceOfSupply?.label || "IND";

  const selectedCurrencyObj = options.currencies?.find(
    (c: any) => c.value === data.currencyId,
  );
  const isINR =
    selectedCurrencyObj?.label === "INR" ||
    selectedCurrencyObj?.currencySymbol === "₹";
  const curSym = selectedCurrencyObj?.currencySymbol;
  const statusOptions = useMemo(() => {
    const options = [{ value: "DRAFT", label: "DRAFT" }];
    if (data.enquiryId > 0 || data.status === "FINAL") {
      options.push({ value: "FINAL", label: "FINAL" });
    }
    return options;
  }, [data.enquiryId, data.status]);

  const [, setIsSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [filteredContacts, setFilteredContacts] = useState<SelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
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
  const [showPreview, setShowPreview] = useState(false);

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
    if (editData) {
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
        selectedCurrencyObj?.label,
        prev.gstApplicable,
      ),
    }));
  }, [
    editData,
    data.placeOfSupplyId,
    data.freightCharges,
    data.gstApplicable,
    options.states,
    isINR,
    selectedCurrencyObj?.label,
  ]);

  useEffect(() => {
    if (data.customerId) {
      getCustomerContacts(data.customerId).then((res) => {
        setFilteredContacts(res);
      });
    } else {
      setFilteredContacts([]);
      setData((prev) => ({
        ...prev,
        responsiblePersonId: 0,
      }));
    }
  }, [data.customerId]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await getServices();

        // const formatted: SelectOption[] = res.map((s: any) => ({
        //   value: s.serviceId,
        //   label: `${s.servicePartNo}`,
        //   data: {
        //     ...s,
        //     servicePrice: Number(s.servicePrice || 0),
        //   },
        // }));
        const formatted: SelectOption[] = res.map((s: any) => ({
          value: s.serviceId,
          label: `${s.servicePartNo} (${s.serviceDescription || ""})`,
          data: {
            ...s,
            servicePrice: Number(s.servicePrice || 0),
          },
        }));

        setServiceOptions(formatted);
      } catch (error) {
        console.error("Error fetching services", error);
      }
    };

    if (data.entryType === "SERVICE") {
      loadServices();
    }
  }, [data.entryType]);

  const calculateRow = (item: any, currencyIsINR = isINR) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const dis = Number(item.discount) || 0;

    const taxableAmount = qty * rate * (1 - dis / 100);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    // if (currencyIsINR && hasValidGstState) {
    if (currencyIsINR && data.gstApplicable && hasValidGstState) {
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
      // taxPercentage: currencyIsINR && hasValidGstState ? 18 : 0,
      taxPercentage:
        currencyIsINR && data.gstApplicable && hasValidGstState ? 18 : 0,
      gstAmount: totalGst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      finalPrice: taxableAmount + totalGst,
    };
  };

  useEffect(() => {
    if (data.items.length === 0) return;

    const updatedItems = data.items.map((item) => calculateRow(item));
    const sub = updatedItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = updatedItems.reduce((s, i) => s + (i.gstAmount || 0), 0);

    setData((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(prev.freightCharges),
    }));
  }, [data.companyId, data.placeOfSupplyId, data.currencyId]);

  const handleCurrencyChange = (opt: any) => {
    const newCurrencyId = opt?.value || 0;
    const newIsINR = opt?.label === "INR" || opt?.currencySymbol === "₹";

    const updatedItems = data.items.map((item) => {
      const recalculated = calculateRow(item, newIsINR);
      return {
        ...recalculated,
        originalPrice: null,
        originalCurrency: null,
      };
    });

    const sub = updatedItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = updatedItems.reduce((s, i) => s + (i.gstAmount || 0), 0);

    setData((prev) => ({
      ...prev,
      currencyId: newCurrencyId,
      items: updatedItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(prev.freightCharges),
      termsConditions: getTermsConditions(
        Number(prev.freightCharges || 0),
        placeOfSupplyLabel,
        newIsINR,
        opt?.label,
        prev.gstApplicable,
      ),
    }));
  };

  const updateMultipleItemFields = (index: number, updates: Partial<any>) => {
    const newItems = [...data.items];
    newItems[index] = calculateRow({ ...newItems[index], ...updates });
    const sub = newItems.reduce((s, i) => s + (i.total || 0), 0);
    const taxTotal = newItems.reduce((s, i) => s + (i.gstAmount || 0), 0);
    setData({
      ...data,
      items: newItems,
      subtotal: sub,
      grandTotal: sub + taxTotal + Number(data.freightCharges),
    });
  };

  const addItem = () => {
    const newItem: any = calculateRow({
      itemType: "Product",
      productId: 0,
      accessoryId: null,
      description: "",
      hsnSacCode: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      taxPercentage: 0,
      total: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      finalPrice: 0,
      accessoryIds: [],
    });

    setData({ ...data, items: [...data.items, newItem] });
  };

  const addAccessoryItem = () => {
    const newItem: any = calculateRow({
      itemType: "Accessory",
      productId: null,
      accessoryId: 0,
      description: "",
      hsnSacCode: "",
      quantity: 1,
      rate: 0,
      discount: 0,
      taxPercentage: 0,
      total: 0,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      finalPrice: 0,
      accessoryIds: [],
    });

    setData({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (index: number) => {
    const newItems = data.items.filter((_, i) => i !== index);

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
      grandTotal: newSubtotal + newTaxTotal + Number(data.freightCharges),
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const noteEntry: EnquiryNote = {
      note: newNote,
      createdAt: new Date().toISOString(),
      createdByEmployeeId: Number(user?.employeeId) || 0,
      authorName: `${user?.firstName} ${user?.lastName}`,
    };
    setData({ ...data, notes: [noteEntry, ...(data.notes || [])] });
    setNewNote("");
    toast.success("Activity logged");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveEnquiry(data);
      toast.success(
        data.status === "FINAL" ? "Enquiry Processed!" : "Draft Saved",
      );
      onSuccess();
    } catch {
      toast.error("Save Failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomerChange = (opt: any) => {
    const customerId = opt?.value || 0;

    const customerDetails = options.rawCustomersList?.find(
      (c: any) => Number(c.id) === Number(customerId),
    );

    setData((prev) => {
      const updated = {
        ...prev,
        customerId: customerId,
        responsiblePersonId: 0,
      };

      let nextPlaceLabel = "IND";

      if (customerDetails) {
        if (customerDetails.companyGroupId) {
          updated.companyGroupId = customerDetails.companyGroupId;
        }

        if (customerDetails.addresses && customerDetails.addresses.length > 0) {
          const stateId = customerDetails.addresses[0].stateId;
          if (stateId) {
            updated.placeOfSupplyId = stateId;

            const matchedState = options.states?.find(
              (s: any) => Number(s.value) === Number(stateId),
            );
            nextPlaceLabel = matchedState?.label || "Place of Supply";
          }
        }
      }

      updated.termsConditions = getTermsConditions(
        Number(updated.freightCharges || 0),
        nextPlaceLabel,
        isINR,
        selectedCurrencyObj?.label,
        updated.gstApplicable,
      );

      return updated;
    });
  };

  const customerOptionsWithBranch =
    options.rawCustomersList?.map((c: any) => ({
      value: c.id,
      label: `${c.customerName}${c.branch ? ` (${c.branch})` : ""}`,
      branch: c.branch,
    })) || [];

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
      finalPrice: 0,
    });

    setData({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const labelClass =
    "text-[11px] font-bold text-gray-500 uppercase mb-1 block ml-1";
  const inputClass =
    "w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-blue-500 h-[38px] bg-white";

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-500 text-left">
      <div className="bg-[#f07837] text-white p-4 flex justify-between items-center shadow-md">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FaBoxOpen />{" "}
          {data.enquiryId > 0 ? "Modify Enquiry" : "New Enquiry Entry"}
        </h2>
        <button
          onClick={onCancel}
          className="bg-white/10 hover:bg-red-500 p-2 px-4 rounded-lg flex items-center gap-2 text-xs uppercase font-bold transition"
        >
          <FaTimes /> Close
        </button>
      </div>

      <div className="p-8">
        {/* --- HEADER GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-5 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div>
            <label className={labelClass}>Source</label>
            <select
              className={`${inputClass} font-bold text-[#154068] cursor-pointer`}
              value={data.entryType || "ENQUIRY"}
              onChange={(e) =>
                setData({
                  ...data,
                  entryType: e.target.value,
                  serviceId: null,
                  serviceDescription: "",
                })
              }
              disabled={data.enquiryId > 0}
            >
              <option value="ENQUIRY">ENQUIRY</option>
              <option value="SERVICE">SERVICE</option>
            </select>
          </div>

          {/* {data.entryType === "SERVICE" && (
            <>
              <div className="animate-in fade-in zoom-in duration-300">
                <label className={`${labelClass} text-purple-700`}>
                  Service Part No.
                </label>
                <Select
                  options={serviceOptions}
                  value={serviceOptions.find((x) => x.value === data.serviceId)}
                  filterOption={(option: any, inputValue: string) => {
                    const search = inputValue.toLowerCase();

                    const partNo =
                      option.data?.data?.servicePartNo?.toLowerCase() || "";

                    const description =
                      option.data?.data?.serviceDescription?.toLowerCase() ||
                      "";

                    return (
                      partNo.includes(search) || description.includes(search)
                    );
                  }}
                  getOptionLabel={(option: any) =>
                    `${option.data?.servicePartNo || ""} ${
                      option.data?.serviceDescription
                        ? `(${option.data?.serviceDescription})`
                        : ""
                    }`
                  }
                  onChange={(opt: any) => {
                    const servicePrice = Number(opt?.data?.servicePrice || 0);

                    const serviceRow: any = calculateRow({
                      itemType: "Service",
                      serviceId: opt?.value || null,
                      servicePartNo: opt?.data?.servicePartNo || "",
                      productId: null,
                      accessoryId: null,
                      description: `${opt?.data?.servicePartNo || ""} - ${
                        opt?.data?.serviceDescription || ""
                      }`,
                      hsnSacCode: opt?.data?.sacCode || "",
                      quantity: 1,
                      rate: servicePrice,
                      discount: 0,
                      taxPercentage: 0,
                      total: 0,
                      gstAmount: 0,
                      cgstAmount: 0,
                      sgstAmount: 0,
                      igstAmount: 0,
                      finalPrice: 0,
                      accessoryIds: [],
                    });

                    const otherItems = data.items.filter(
                      (x: any) => x.itemType !== "Service",
                    );
                    const newItems = [serviceRow, ...otherItems];

                    const sub = newItems.reduce(
                      (s, i) => s + (i.total || 0),
                      0,
                    );
                    const taxTotal = newItems.reduce(
                      (s, i) => s + (i.gstAmount || 0),
                      0,
                    );

                    setData({
                      ...data,
                      serviceId: opt?.value || null,
                      serviceDescription: opt?.data?.serviceDescription || "",
                      servicePrice,
                      items: newItems,
                      subtotal: sub,
                      grandTotal:
                        sub + taxTotal + Number(data.freightCharges || 0),
                    });
                  }}
                  placeholder="Select Service Part No..."
                />
              </div>

              <div className="animate-in fade-in zoom-in duration-300">
                <label className={`${labelClass} text-purple-700`}>
                  Service Description
                </label>
                <textarea
                  className={`${inputClass} bg-gray-100 h-20 resize-none`}
                  value={
                    data.serviceDescription ||
                    "Select a service part number to see the description."
                  }
                  readOnly
                  disabled
                />
              </div>
            </>
          )} */}

          <div>
            <label className={labelClass}>Status</label>
            <Select
              options={statusOptions}
              value={statusOptions.find((o) => o.value === data.status)}
              onChange={(opt: any) => setData({ ...data, status: opt.value })}
              isDisabled={statusOptions.length <= 1}
            />
          </div>

          <div>
            <label className={labelClass}>Enquiry No.</label>
            <input
              className={`${inputClass} bg-gray-200 font-bold text-blue-800`}
              value={data.enquiryNo || "AUTO-GENERATED"}
              disabled
            />
          </div>
          <div>
            <label className={labelClass}>Enquiry Date</label>
            <input
              type="date"
              className={inputClass}
              value={data.offerDate.split("T")[0]}
              onChange={(e) => setData({ ...data, offerDate: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Next Follow-up</label>
            <input
              type="date"
              className={inputClass}
              value={data.nextFollowUpDate}
              onChange={(e) =>
                setData({ ...data, nextFollowUpDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Expiry Date</label>
            <input
              type="date"
              className={inputClass}
              value={data.expiryDate.split("T")[0]}
              onChange={(e) => setData({ ...data, expiryDate: e.target.value })}
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
              onChange={handleCustomerChange}
              placeholder="Select Customer..."
            />
          </div>
          <div>
            <label className={labelClass}>Billing Company</label>
            <Select
              options={options.companies}
              value={options.companies?.find(
                (x: any) => x.value === data.companyId,
              )}
              onChange={(opt: any) =>
                setData({ ...data, companyId: opt.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Company Group</label>
            <Select
              options={options.companyGroups}
              value={options.companyGroups?.find(
                (x: any) => x.value === data.companyGroupId,
              )}
              onChange={(opt: any) =>
                setData({ ...data, companyGroupId: opt.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Select Vendor</label>
            <Select
              options={options.vendors}
              value={options.vendors?.find(
                (x: any) => x.value === data.vendorId,
              )}
              onChange={(opt: any) => setData({ ...data, vendorId: opt.value })}
            />
          </div>

          <div>
            <label className={labelClass}>Select Group</label>
            <Select
              options={options.groups}
              value={options.groups?.find(
                (x: any) => x.value === data.productGroupId,
              )}
              onChange={(opt: any) =>
                setData({ ...data, productGroupId: opt.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Currency</label>
            <Select
              options={options.currencies}
              value={options.currencies?.find(
                (x: any) => x.value === data.currencyId,
              )}
              onChange={handleCurrencyChange}
            />
          </div>
          <div>
            <label className={labelClass}>Place of Supply</label>
            <Select
              options={options.states}
              value={options.states?.find(
                (x: any) => x.value === data.placeOfSupplyId,
              )}
              onChange={(opt: any) =>
                setData((prev) => ({
                  ...prev,
                  placeOfSupplyId: opt.value,
                  termsConditions: getTermsConditions(
                    Number(prev.freightCharges || 0),
                    opt?.label || "IND",
                    isINR,
                  ),
                }))
              }
            />
          </div>

          <div>
            <label className={labelClass}>Responsible Person</label>

            <Select
              options={filteredContacts}
              value={filteredContacts?.find(
                (x: any) => x.value === data.responsiblePersonId,
              )}
              onChange={(opt: any) =>
                setData({
                  ...data,
                  responsiblePersonId: opt?.value || 0,
                })
              }
              placeholder="Select Responsible Person..."
              isClearable
            />
          </div>
          <div>
            <label className={labelClass}>Assign To Employee</label>
            <Select
              options={options.employees}
              value={options.employees?.find(
                (x: any) => x.value === data.assignedToEmployeeId,
              )}
              onChange={(opt: any) =>
                setData({ ...data, assignedToEmployeeId: opt?.value || null })
              }
              isSearchable
              isClearable
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              checked={data.gstApplicable}
              disabled={!isINR}
              onChange={(e) => {
                const checked = e.target.checked;

                const updatedItems = data.items.map((item) =>
                  calculateRow({
                    ...item,
                  }),
                );

                const recalculatedItems = updatedItems.map((item) => {
                  const qty = Number(item.quantity) || 0;
                  const rate = Number(item.rate) || 0;
                  const dis = Number(item.discount) || 0;
                  const taxableAmount = qty * rate * (1 - dis / 100);

                  let cgst = 0;
                  let sgst = 0;
                  let igst = 0;

                  if (isINR && checked && hasValidGstState) {
                    if (isIntraState) {
                      cgst =
                        Math.round(
                          (taxableAmount * 0.09 + Number.EPSILON) * 100,
                        ) / 100;
                      sgst =
                        Math.round(
                          (taxableAmount * 0.09 + Number.EPSILON) * 100,
                        ) / 100;
                    } else {
                      igst =
                        Math.round(
                          (taxableAmount * 0.18 + Number.EPSILON) * 100,
                        ) / 100;
                    }
                  }

                  const gstAmount = cgst + sgst + igst;

                  return {
                    ...item,
                    total: taxableAmount,
                    taxPercentage:
                      isINR && checked && hasValidGstState ? 18 : 0,
                    cgstAmount: cgst,
                    sgstAmount: sgst,
                    igstAmount: igst,
                    gstAmount,
                    finalPrice: taxableAmount + gstAmount,
                  };
                });

                const sub = recalculatedItems.reduce(
                  (s, i) => s + (i.total || 0),
                  0,
                );
                const taxTotal = recalculatedItems.reduce(
                  (s, i) => s + (i.gstAmount || 0),
                  0,
                );

                setData((prev) => ({
                  ...prev,
                  gstApplicable: checked,
                  items: recalculatedItems,
                  subtotal: sub,
                  grandTotal: sub + taxTotal + Number(prev.freightCharges || 0),
                  termsConditions: getTermsConditions(
                    Number(prev.freightCharges || 0),
                    placeOfSupplyLabel,
                    isINR,
                    selectedCurrencyObj?.label,
                    checked,
                  ),
                }));
              }}
              className="w-4 h-4 accent-[#154068]"
            />

            <label className="text-sm font-bold text-gray-700">
              GST Applicable
            </label>
          </div>
        </div>

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
            className="border rounded-xl overflow-auto mb-6 shadow-sm border-gray-300"
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
                  <th className="p-3 border-r border-blue-900 w-[8%] text-center">
                    Dis%
                  </th>
                  <th className="p-3 border-r border-blue-900 w-[12%] text-center">
                    Final
                  </th>
                  <th className="p-3 w-[8%] text-center">Image</th>
                  <th className="p-3 w-[3%] text-center"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.items.map((item: any, i: number) => {
                  const isProductItem =
                    item.itemType === "Product" || !item.itemType;
                  const isServiceItem = item.itemType === "Service";
                  const typeStyles = isServiceItem
                    ? {
                        bg: "bg-emerald-50",
                        text: "text-emerald-700",
                        badge: "bg-emerald-100 text-emerald-800",
                        border: "border-emerald-200",
                      }
                    : isProductItem
                      ? {
                          bg: "bg-blue-50",
                          text: "text-blue-700",
                          badge: "bg-blue-100 text-blue-800",
                          border: "border-blue-200",
                        }
                      : {
                          bg: "bg-purple-50",
                          text: "text-purple-700",
                          badge: "bg-purple-100 text-purple-800",
                          border: "border-purple-200",
                        };
                  const selectedProduct = isProductItem
                    ? options.products?.find(
                        (x: any) => x.value === item.productId,
                      )
                    : null;

                  const selectedAccessory = !isProductItem
                    ? options.accessories?.find(
                        (x: any) => x.value === item.accessoryId,
                      )
                    : null;

                  const selectedImage = isProductItem
                    ? selectedProduct?.image
                    : selectedAccessory?.image;

                  return (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      {/* 1. Differentiated Index Column */}
                      <td
                        className={`p-3 font-bold text-center border-r transition-colors ${typeStyles.bg} ${typeStyles.text}`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{i + 1}</span>

                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1 ${isProductItem ? "bg-blue-500" : "bg-purple-500"}`}
                          ></div>
                        </div>
                      </td>

                      <td className="p-3 border-r space-y-2 whitespace-normal wrap-break-word">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${typeStyles.badge} ${typeStyles.border}`}
                          >
                            {/* {isProductItem ? "Product Row" : "Paid Accessory"} */}
                            {isServiceItem
                              ? "Service Row"
                              : isProductItem
                                ? "Product Row"
                                : "Paid Accessory"}
                          </span>
                        </div>
                        {isServiceItem ? (
                          <>
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-9">
                                <Select
                                  options={serviceOptions}
                                  value={serviceOptions.find(
                                    (x) => x.value === item.serviceId,
                                  )}
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
                                  filterOption={(
                                    option: any,
                                    inputValue: string,
                                  ) => {
                                    const search = inputValue.toLowerCase();

                                    const partNo =
                                      option.data?.data?.servicePartNo?.toLowerCase() ||
                                      "";

                                    const description =
                                      option.data?.data?.serviceDescription?.toLowerCase() ||
                                      "";

                                    return (
                                      partNo.includes(search) ||
                                      description.includes(search)
                                    );
                                  }}
                                  formatOptionLabel={(option: any) => (
                                    <div>
                                      <span className="text-gray-800">
                                        {option.data?.servicePartNo}
                                      </span>
                                      {option.data?.serviceDescription && (
                                        <span className="text-gray-800">
                                          {" "}
                                          ({option.data.serviceDescription})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  onChange={(opt: any) => {
                                    const servicePrice = Number(
                                      opt?.data?.servicePrice || 0,
                                    );

                                    updateMultipleItemFields(i, {
                                      serviceId: opt?.value,
                                      servicePartNo: opt?.data?.servicePartNo,
                                      description:
                                        opt?.data?.serviceDescription,
                                      hsnSacCode: opt?.data?.sacCode,
                                      rate: servicePrice,
                                    });
                                  }}
                                  placeholder="Select Service"
                                />
                              </div>

                              <div className="col-span-3">
                                <input
                                  className="w-full border rounded p-2 text-[10px] uppercase font-bold"
                                  placeholder="SAC Code"
                                  value={item.hsnSacCode || ""}
                                  onChange={(e) =>
                                    updateMultipleItemFields(i, {
                                      hsnSacCode: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="col-span-12">
                                <textarea
                                  className="w-full border rounded p-2 h-16 text-[11px]"
                                  value={item.description}
                                  onChange={(e) =>
                                    updateMultipleItemFields(i, {
                                      description: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </>
                        ) : isProductItem ? (
                          <>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Select
                                  isDisabled={!data.currencyId}
                                  placeholder={
                                    !data.currencyId
                                      ? "Select Currency First..."
                                      : "Select Product..."
                                  }
                                  options={options.products}
                                  value={selectedProduct}
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
                                  menuPortalTarget={document.body}
                                  menuPosition="fixed"
                                  styles={{
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                    menu: (base) => ({ ...base, zIndex: 9999 }),
                                  }}
                                  onChange={(opt: any) => {
                                    const accIds = opt.mapAccessories
                                      ? opt.mapAccessories
                                          .split(",")
                                          .map(Number)
                                      : [];

                                    const currencyPrice =
                                      opt.currencyPrices?.find(
                                        (cp: any) =>
                                          cp.currencyId === data.currencyId,
                                      );

                                    let finalCalculatedRate = currencyPrice
                                      ? currencyPrice.price
                                      : 0;
                                    let origPrice = null;
                                    let origCurr = null;
                                    let rateToINR = null;

                                    // 2. If INR selected and no INR price found, perform conversion
                                    if (!currencyPrice && isINR && liveRates) {
                                      const foreignPriceObj =
                                        opt.currencyPrices?.find((cp: any) =>
                                          ["GBP", "USD", "EUR", "CNY"].includes(
                                            cp.currencyName?.toUpperCase(),
                                          ),
                                        );

                                      if (foreignPriceObj) {
                                        const foreignCode =
                                          foreignPriceObj.currencyName?.toUpperCase() as
                                            | "USD"
                                            | "GBP"
                                            | "EUR"
                                            | "CNY";

                                         rateToINR =
                                          liveRates[foreignCode];

                                        finalCalculatedRate = parseFloat(
                                          (
                                            foreignPriceObj.price *
                                            rateToINR *
                                            1.25
                                          ).toFixed(2),
                                        );
                                        origPrice = foreignPriceObj.price;
                                        origCurr = foreignCode;

                                        toast.info(
                                          `Converted from ${foreignCode} (${foreignPriceObj.price}) at rate ${rateToINR.toFixed(2)}`,
                                        );
                                      }
                                    }

                                    // 3. Update the item with new fields: originalPrice and originalCurrency
                                    updateMultipleItemFields(i, {
                                      productId: opt.value,
                                      rate: finalCalculatedRate,
                                      liveConversionRate: rateToINR || null,
                                      originalPrice: origPrice,
                                      originalCurrency: origCurr,
                                      accessoryIds: accIds,
                                      // description: opt.label,
                                      description: `${opt.productCode} - ${opt.productName || ""}`,
                                      hsnSacCode: opt.hsnCode || "",
                                    });
                                  }}
                                />
                              </div>
                              <div className="w-24">
                                <input
                                  className="w-full border rounded p-2 text-[10px] uppercase font-bold"
                                  placeholder="HSN/SAC"
                                  value={item.hsnSacCode}
                                  onChange={(e) =>
                                    updateMultipleItemFields(i, {
                                      hsnSacCode: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            {item.productId > 0 && (
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
                                  updateMultipleItemFields(i, {
                                    accessoryIds: opts
                                      ? opts.map((x: any) => x.value)
                                      : [],
                                  })
                                }
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (base) => ({ ...base, zIndex: 9999 }),
                                }}
                                placeholder="Add free accessories..."
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <Select
                              isDisabled={!data.currencyId}
                              placeholder={
                                !data.currencyId
                                  ? "Select Currency First..."
                                  : "Select Paid Accessory..."
                              }
                              options={options.accessories}
                              value={options.accessories?.find(
                                (x: any) => x.value === item.accessoryId,
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
                              onChange={(opt: any) => {
                                let finalCalculatedRate = 0;
                                let origPrice = null;
                                let origCurr = null;
                                let rateToINR = null;

                                // 1. Try to find a direct price for the selected currency (e.g., INR)
                                const currencyPrice = opt.currencyPrices?.find(
                                  (cp: { currencyId: number; price: number }) =>
                                    cp.currencyId === data.currencyId,
                                );

                                if (currencyPrice) {
                                  finalCalculatedRate = currencyPrice.price;
                                }
                                // 2. If no direct match and the main currency is INR, try to convert a foreign price
                                else if (
                                  isINR &&
                                  liveRates &&
                                  opt.currencyPrices
                                ) {
                                  const foreignPriceObj =
                                    opt.currencyPrices.find((cp: any) =>
                                      ["GBP", "USD", "EUR", "CNY"].includes(
                                        cp.currencyName?.toUpperCase(),
                                      ),
                                    );

                                  if (foreignPriceObj) {
                                    const foreignCode =
                                      foreignPriceObj.currencyName?.toUpperCase() as
                                        | "USD"
                                        | "GBP"
                                        | "EUR"
                                        | "CNY";

                                     rateToINR = liveRates[foreignCode];

                                    if (rateToINR) {
                                      finalCalculatedRate = parseFloat(
                                        (
                                          foreignPriceObj.price *
                                          rateToINR *
                                          1.25
                                        ).toFixed(2),
                                      );
                                      // Store the original price and currency to display them
                                      origPrice = foreignPriceObj.price;
                                      origCurr = foreignCode;
                                      toast.info(
                                        `Converted from ${foreignCode} (${origPrice}) at rate ${rateToINR.toFixed(2)}`,
                                      );
                                    }
                                  }
                                }

                                // 3. Fallback to the default salePrice if no other price can be determined
                                if (finalCalculatedRate === 0) {
                                  finalCalculatedRate = opt.salePrice || 0;
                                }

                                // 4. Update the row with all the new data
                                updateMultipleItemFields(i, {
                                  accessoryId: opt.value,
                                  rate: finalCalculatedRate,
                                  liveConversionRate: rateToINR || null,
                                  originalPrice: origPrice,
                                  originalCurrency: origCurr,
                                  // description: opt.label,
                                  description: `${opt.accessoriesCode} - ${opt.accessoriesDescription}`,
                                  hsnSacCode: opt.hsnCode || "",
                                });
                              }}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                              }}
                            />
                          </>
                        )}
                        {!isServiceItem && (
                          <textarea
                            className="w-full border rounded p-2 h-16 text-[11px]"
                            value={item.description}
                            onChange={(e) =>
                              updateMultipleItemFields(i, {
                                description: e.target.value,
                              })
                            }
                          />
                        )}
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
                        {/* --- NEW: Display Original Price Label --- */}
                        {item.originalPrice && (
                          <div className="text-[10px] text-blue-600 font-bold mb-1 animate-pulse">
                            {item.originalPrice.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}{" "}
                            {item.originalCurrency}
                          </div>
                        )}
                        {/* If no original price, add a spacer to keep alignment */}
                        {!item.originalPrice && (
                          <div className="h-[15px] mb-1"></div>
                        )}

                        <input
                          type="number"
                          className="w-full border text-center p-2 rounded font-bold bg-white focus:ring-2 focus:ring-blue-400 outline-none"
                          value={item.rate}
                          onChange={(e) =>
                            updateMultipleItemFields(i, {
                              rate: parseFloat(e.target.value) || 0,
                              // Optional: Clear original price if user manually edits the converted rate
                              originalPrice: null,
                              originalCurrency: null,
                            })
                          }
                        />
                      </td>

                      <td className="p-3 border-r text-center">
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
                      </td>

                      <td className="p-3 border-r font-black text-center text-lg text-blue-700">
                        {curSym}
                        {(item.total || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 border-r text-center">
                        <div className="w-14 h-14 border rounded bg-white flex items-center justify-center overflow-hidden mx-auto">
                          {isServiceItem ? (
                            <span className="text-[8px] text-gray-300">
                              SERVICE
                            </span>
                          ) : selectedImage ? (
                            <img
                              src={`${FILE_BASE_URL}${selectedImage}`}
                              className="w-full h-full object-contain"
                              alt={
                                isProductItem
                                  ? selectedProduct?.label
                                  : selectedAccessory?.label
                              }
                            />
                          ) : (
                            <span className="text-[8px] text-gray-300">
                              NO IMG
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(i)}
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

        {data.entryType !== "SERVICE" && (
          <>
            <button onClick={addItem} className={buttonStyles.addmore}>
              + Add Product Row
            </button>

            <button
              onClick={addAccessoryItem}
              className={`${buttonStyles.addmore} ml-4`}
            >
              + Add Paid Accessory
            </button>
          </>
        )}
        {data.entryType === "SERVICE" && (
          <button onClick={addServiceItem} className={buttonStyles.addmore}>
            + Add Service Row
          </button>
        )}

        <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-10">
          <div className="space-y-8 text-left">
            <div className="bg-white border rounded-xl p-5 shadow-sm border-gray-100">
              <label className="text-[11px] font-black text-[#0b2c52] uppercase mb-2 block items-center gap-2">
                <FaUserEdit /> New Activity Note
              </label>

              <div className="flex flex-col gap-2">
                <textarea
                  className="border p-3 text-sm rounded-xl h-24 outline-none focus:border-blue-500 shadow-inner"
                  placeholder="Type customer update..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />

                <button
                  type="button"
                  onClick={handleAddNote}
                  className="w-fit px-3 py-2 bg-[#f07837] text-white rounded-lg font-black shadow-2xl hover:bg-[#0d3357] transition disabled:bg-gray-300"
                >
                  Log Note
                </button>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-5 shadow-sm border-gray-100">
              <label className="text-[11px] font-black text-[#154068] uppercase mb-2 block">
                Terms & Conditions
              </label>
              <textarea
                className="w-full border p-3 text-sm rounded-xl h-36 outline-none focus:border-blue-500 shadow-inner"
                value={data.termsConditions}
                onChange={(e) =>
                  setData({ ...data, termsConditions: e.target.value })
                }
                placeholder="Terms & Conditions..."
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FaHistory /> Timeline History
              </h4>
              {data.notes?.map((n: any, i: number) => (
                <div
                  key={i}
                  className="bg-gray-50 p-4 rounded-2xl border-l-4 border-blue-500"
                >
                  <p className="text-sm text-gray-700 font-medium italic">
                    "{n.note}"
                  </p>
                  <div className="flex justify-between mt-2 text-[9px] font-black text-gray-400 uppercase">
                    <span>BY: {n.authorName}</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
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
            {/* {isINR && hasValidGstState && ( */}
            {isINR && data.gstApplicable && hasValidGstState && (
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
            {data.entryType !== "SERVICE" && (
              <div className="flex justify-between items-center font-bold text-gray-500 uppercase text-[12px]">
                <span>Freight / Carrier</span>
                <input
                  type="number"
                  className="border-2 border-gray-300 p-2 w-40 text-right text-lg rounded-lg font-mono font-bold"
                  value={data.freightCharges}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const taxT = data.items.reduce(
                      (s: any, i: any) => s + (i.gstAmount || 0),
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
                        selectedCurrencyObj?.label,
                        prev.gstApplicable,
                      ),
                    }));
                  }}
                />
              </div>
            )}
            <div className="flex justify-between items-center text-3xl font-black text-[#0b2c52] border-t-2 border-dashed border-gray-400 pt-6">
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
          </div>
        </div>

        {/* --- BUTTON SECTION --- */}
        <div className="flex justify-end gap-4 mt-16 pt-8 border-t">
          <button onClick={onCancel} className={buttonStyles.cancel}>
            Discard
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={buttonStyles.save}
          >
            Preview Enquiry
          </button>
        </div>
      </div>
      {showPreview && (
        <EnquiryPreviewModal
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
  );
};

export default EnquiryWizard;
