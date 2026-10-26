import React from "react";
import type { Accessories } from "./Services/types";
import { API_ENDPOINTS } from "../../../../API/apiConfig";
import {
  FaTimes,
  FaTools,
  FaTags,
  FaInfoCircle,
  FaRupeeSign,
  FaWarehouse,
  FaCogs,
  FaCalendarAlt,
  FaGlobe,
  FaShieldAlt,
  FaBarcode,
  FaExclamationCircle,
} from "react-icons/fa";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
  data: Accessories;
  onClose: () => void;
  options: any;
}

const AccessoriesViewModal: React.FC<ViewModalProps> = ({
  data,
  onClose,
  options,
}) => {
  const getLabel = (list: any[], id?: number | null) => {
    if (!list || id === null || id === undefined) return "N/A";
    const found = list.find((x) => x.value === id);
    return found ? found.label : "N/A";
  };

  const getTaxRateLabel = (id?: number) => {
    const taxRates = [
      { value: 0, label: "GST 0%" },
      { value: 5, label: "GST 5%" },
      { value: 12, label: "GST 12%" },
      { value: 18, label: "GST 18%" },
      { value: 28, label: "GST 28%" },
    ];
    return taxRates.find((x) => x.value === id)?.label || "N/A";
  };

  const DataItem = ({
    label,
    value,
    alert = false,
  }: {
    label: string;
    value?: any;
    alert?: boolean;
  }) => (
      <div className="flex flex-col border-b border-black/[.06] py-3">
      <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#8a8984]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span
          className={`break-words text-sm font-bold ${alert ? "text-red-600" : "text-[#343331]"}`}
        >
          {value || "N/A"}
        </span>
        {alert && (
          <FaExclamationCircle
            className="text-red-500 animate-pulse"
            size={14}
          />
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ icon: Icon, title }: any) => (
      <div className="mb-4 mt-6 flex items-center gap-2 first:mt-0">
      <Icon className="text-xl text-[#f07837]" />
      <h3 className="grow border-b-2 border-[#f07837]/20 pb-1 text-sm font-black uppercase tracking-tight text-[#252a2e]">
        {title}
      </h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm text-left">
      <div className="flex max-h-[95vh] w-full max-w-7xl animate-in flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl zoom-in duration-300">
        {/* --- HEADER SECTION --- */}
        <div className="flex items-center justify-between border-b-4 border-[#f07837] bg-[#252a2e] p-4 text-white shadow-lg sm:p-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-inner sm:h-24 sm:w-24">
              {data.accessoriesImagePath ? (
                <img
                  src={`${FILE_BASE_URL}${data.accessoriesImagePath}`}
                  alt="Accessory"
                  className="max-h-full object-contain w-full h-full"
                />
              ) : (
                <FaTools className="text-4xl text-[#d6d2ca] sm:text-5xl" />
              )}
            </div>
            <div>
              <h2 className="truncate text-xl font-black sm:text-3xl">{data.accessoriesName}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <p className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/80">
                  CODE: {data.accessoriesCode}
                </p>
                  <p className="rounded-lg bg-[#f07837] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                  SOURCE: {data.productSource}
                </p>
                {data.accessoriesShortName && (
                  <p className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/80">
                    ALIAS: {data.accessoriesShortName}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="shrink-0 rounded-full bg-white/10 p-2 text-white transition hover:rotate-90 hover:bg-white/20 sm:p-3"
          >
            <FaTimes size={30} />
          </button>
        </div>

        {/* --- BODY CONTENT (4-Column Horizontal Layout) --- */}
        <div className="overflow-y-auto bg-[#f7f6f2] p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {/* 1. Classification (FaTags) */}
            <section>
              <SectionHeader icon={FaTags} title="Classification" />
              <DataItem label="Vendor" value={`${data.vendorName} (${data.vendorCode})`} />
              <DataItem
                label="Product Group"
                value={getLabel(options?.groups, data.productGroupId)}
              />
              <DataItem
                label="Category"
                value={getLabel(options?.categories, data.categoryId)}
              />
              <DataItem
                label="Accessory Type"
                value={getLabel(options?.types, data.productTypeId)}
              />
              <DataItem
                label="Manufacturer"
                value={data.companyNameOfProduct}
              />
            </section>

            {/* 2. Technical Details (FaCogs) */}
            <section>
              <SectionHeader icon={FaCogs} title="Technicals" />
              <DataItem
                label="Variant"
                value={getLabel(options?.variants, data.variantId)}
              />
              <DataItem
                label="Version"
                value={getLabel(options?.versions, data.versionId)}
              />
              <DataItem
                label="Condition"
                value={getLabel(options?.conditions, data.partConditionId)}
              />
              <DataItem label="Warranty Period" value={data.warrantyPeriod} />
            </section>

            {/* 3. Codes & Mapping (FaBarcode) */}
            <section>
              <SectionHeader icon={FaBarcode} title="Codes & Sync" />
              <DataItem label="HSN/SAC Code" value={data.hsnCode} />
              <DataItem label="Part Unique No" value={data.partUnique} />
              <DataItem label="Unit (UOM)" value={data.uom} />
              <DataItem label="Available Qty" value={data.availableQuantity} />
            </section>

            {/* 4. Assurance (FaShieldAlt) */}
            <section>
              <SectionHeader icon={FaShieldAlt} title="Assurance" />
              <DataItem
                label="Calibration"
                value={data.isCalibration ? "REQUIRED" : "NOT REQUIRED"}
              />
              {data.isCalibration && (
                <DataItem label="Frequency" value={data.calibrationFrequency} />
              )}
              <DataItem label="Tax Preference" value={data.taxPreference} />
              <DataItem
                label="Low Stock Warn"
                value={data.outOfStockWarning}
                alert={data.availableQuantity <= data.outOfStockWarning}
              />
            </section>

            {/* 5. Pricing (FaRupeeSign) */}
            <section>
              <SectionHeader icon={FaRupeeSign} title="Pricing & Tax" />
              <DataItem
                label="Purchase Price"
                value={`₹ ${data.purchasePrice?.toLocaleString()}`}
              />
              <DataItem
                label="Sale Price (Base)"
                value={`₹ ${data.salePrice?.toLocaleString()}`}
              />
              <DataItem
                label="Tax Rate (GST)"
                value={getTaxRateLabel(data.taxRateId)}
              />
              {data.productSource === "Imported" && (
                <div className="mt-4 rounded-xl border border-[#f07837]/20 bg-[#fff0e7] p-3 text-[12px] font-bold leading-relaxed text-[#873c18]">
                  Import Duties: {data.bcd}% BCD | {data.sws}% SWS | {data.igst}
                  % IGST
                </div>
              )}
            </section>

            {/* 6. Timeline (FaCalendarAlt - USED HERE) */}
            <section>
              <SectionHeader icon={FaCalendarAlt} title="Product Timeline" />
              <DataItem
                label="Manufacturing Date"
                value={
                  data.manufacturingDate
                    ? new Date(data.manufacturingDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <DataItem
                label="Expiry Date"
                value={
                  data.expiryDate
                    ? new Date(data.expiryDate).toLocaleDateString()
                    : "N/A"
                }
              />
              <DataItem
                label="Last Audit Date"
                value={new Date().toLocaleDateString()}
              />
            </section>

            {/* 7. Warehouse (FaWarehouse) */}
            <section className="lg:col-span-1">
              <SectionHeader icon={FaWarehouse} title="Storage Info" />
              <DataItem
                label="Inventory Category"
                value={getLabel(options?.groups, data.productGroupId)}
              />
              <DataItem label="Stock Management" value="Manual Sync Enabled" />
            </section>

            {/* 8. International (FaGlobe) */}
            <section className="lg:col-span-1">
              <SectionHeader icon={FaGlobe} title="Global Prices" />
              <div className="space-y-2">
                {data.currencyPrices && data.currencyPrices.length > 0 ? (
                  data.currencyPrices.map((cp, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-black/[.07] bg-white p-3 shadow-sm"
                    >
                      <span className="text-xs font-extrabold uppercase tracking-wider text-[#77766f]">
                        {getLabel(options.currencies, cp.currencyId)}
                      </span>
                      <span className="text-sm font-black text-[#a64a1d]">
                        {cp.price?.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-gray-400 italic">
                    No global prices.
                  </p>
                )}
              </div>
            </section>

            {/* 9. Descriptions (FaInfoCircle) */}
            <section className="lg:col-span-4">
              <SectionHeader
                icon={FaInfoCircle}
                title="Detailed Descriptions"
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#8a8984]">
                    General Description
                  </span>
                  <p className="mt-2 rounded-xl bg-white p-4 text-sm font-medium leading-6 text-[#343331]">
                    {data.accessoriesDescription || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-[.15em] text-[#8a8984]">
                    Technical Specification
                  </span>
                  <p className="mt-2 rounded-xl bg-white p-4 text-sm font-medium leading-6 text-[#343331]">
                    {data.specification || "N/A"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* --- FOOTER SECTION --- */}
        <div className="flex items-center justify-end gap-4 border-t border-black/[.07] bg-white p-4 sm:gap-6 sm:p-6">
          <p className="mr-auto text-[9px] font-black uppercase tracking-[.16em] text-[#8a8984] sm:text-[10px]">
            LGM Sports · Accessories profile
          </p>
          <button onClick={onClose} className="rounded-xl bg-[#f07837] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#dd6328] focus:outline-none focus:ring-4 focus:ring-[#f07837]/20">
            Close details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessoriesViewModal;
