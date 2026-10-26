import React from "react";
import type { Product } from "./Services/types";
import {
    FaTimes, FaBox, FaTags,
    FaInfoCircle, FaRupeeSign, FaWarehouse, FaCogs, FaCalendarAlt, FaGlobe,
} from 'react-icons/fa';
import { API_ENDPOINTS } from "../../../../API/apiConfig";

const FILE_BASE_URL = API_ENDPOINTS.BaseUrl.replace("/api", "");

interface ViewModalProps {
    product: Product;
    onClose: () => void;
    options: any;
}

const ProductViewModal: React.FC<ViewModalProps> = ({ product, onClose, options }) => {

    const getLabel = (list: any[], id?: number | null) => {
        if (!list || id === null || id === undefined) return "N/A";
        const found = list.find(x => x.value === id);
        return found ? found.label : "N/A";
    };

    const getMultiLabels = (list: any[], idsString?: string) => {
        if (!list || !idsString) return "None";
        const ids = idsString.split(',').map(Number);
        return list.filter(opt => ids.includes(opt.value)).map(opt => opt.label).join(', ');
    };

    const getTaxRateLabel = (id?: number) => {
        const taxRates = [
            { value: 0, label: 'GST 0%' }, { value: 5, label: 'GST 5%' },
            { value: 12, label: 'GST 12%' }, { value: 18, label: 'GST 18%' }, { value: 28, label: 'GST 28%' }
        ];
        return taxRates.find(x => x.value === id)?.label || "N/A";
    };

    const DataItem = ({ label, value, isTag = false }: { label: string; value?: string | number | null, isTag?: boolean }) => (
        <div className="flex flex-col border-b border-gray-100 py-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            {isTag ? (
                <div className="flex flex-wrap gap-1 mt-1">
                    {value?.toString().split(', ').map((v, i) => (
                        <span key={i} className="bg-blue-50 text-[#0b2c52] text-[10px] px-2 py-0.5 rounded border border-blue-100 font-bold uppercase">{v}</span>
                    )) || "N/A"}
                </div>
            ) : (
                <span className="text-sm font-semibold text-[#0b2c52] break-words">{value || "N/A"}</span>
            )}
        </div>
    );

    const SectionHeader = ({ icon: Icon, title }: any) => (
        <div className="flex items-center gap-2 mb-4 mt-6 first:mt-0">
            <Icon className="text-[#0b2c52] text-lg" />
            <h3 className="text-sm font-extrabold text-[#0b2c52] uppercase tracking-tight border-b-2 border-blue-100 grow pb-1">{title}</h3>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 p-4">
            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-[#f07837] text-white p-5 flex justify-between items-center shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1 rounded-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                            {product?.productImagePath ? (
                                <img src={`${FILE_BASE_URL}${product.productImagePath}`} alt="Product" className="max-h-full object-contain" />
                            ) : <FaBox className="text-gray-300 text-3xl" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold uppercase">{product?.productName}</h2>
                            <div className="flex gap-4">
                                <p className="text-xs text-blue-200 font-mono tracking-widest uppercase">CODE: {product?.productCode}</p>
                                <p className="text-xs text-blue-200 font-mono tracking-widest uppercase text-white font-bold ml-2">SOURCE: {product?.productSource}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300 p-2 bg-white/10 rounded-full"><FaTimes size={24} /></button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">

                        <section>
                            <SectionHeader icon={FaTags} title="Classification" />
                            <DataItem
                                label="Vendor"
                                value={`${product?.vendorName || "N/A"} ${product?.vendorCode ? `(${product.vendorCode})` : ""}`}
                            />
                            <DataItem label="Product Group" value={getLabel(options?.groups, product?.productGroupId)} />
                            <DataItem label="Category" value={getLabel(options?.categories, product?.categoryId)} />
                            <DataItem label="Brand" value={getLabel(options?.brands, product?.brandId)} />
                            <DataItem label="Product Type" value={getLabel(options?.types, product?.productTypeId)} />
                            <DataItem label="SKU" value={product?.productSKU} />
                            <DataItem label="Manufacturer" value={product?.companyNameOfProduct} />
                            <DataItem label="Calibration" value={product?.isCalibration ? `YES (${product.calibrationFrequency})` : "NO"} />
                        </section>

                        <section>
                            <SectionHeader icon={FaCogs} title="Technical Info" />
                            <DataItem label="Variant" value={getLabel(options?.variants, product?.variantId)} />
                            <DataItem label="Version" value={getLabel(options?.versions, product?.versionId)} />
                            {/* <DataItem label="Part Unique No" value={product?.partUnique} /> */}
                            <DataItem label="Condition" value={getLabel(options?.conditions, product?.partConditionId)} />
                            <DataItem label="Part Number" value={product?.partNo} />
                            <DataItem label="Unit" value={getLabel(options?.units, product?.unitId)} />
                            <DataItem label="Warranty" value={product?.warrantyPeriod} />
                        </section>

                        <section>
                            <SectionHeader icon={FaRupeeSign} title="Pricing & Source" />
                            <DataItem label="Purchase Price" value={`₹ ${product?.purchasePrice?.toLocaleString()}`} />
                            <DataItem label="Sale Price (Base)" value={`₹ ${product?.salePrice?.toLocaleString()}`} />
                            <DataItem label="Tax Preference" value={product?.taxPreference} />
                            <DataItem label="Tax" value={getLabel(options?.taxes, product?.taxId)} />
                            <DataItem label="Tax Rate (GST)" value={getTaxRateLabel(product?.taxRateId)} />
                            <DataItem label="MRP" value={`₹ ${product?.mrp?.toLocaleString()}`} />

                            {product?.productSource === 'Imported' && (
                                <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100 grid grid-cols-3 gap-2">
                                    <DataItem label="BCD" value={`${product.bcd}%`} />
                                    <DataItem label="SWS" value={`${product.sws}%`} />
                                    <DataItem label="IGST" value={`${product.igst}%`} />
                                </div>
                            )}
                        </section>

                        <section>
                            <SectionHeader icon={FaWarehouse} title="Inventory Status" />
                            <DataItem label="Available Qty" value={product?.availableQuantity} />
                            <DataItem label="Low Stock Warning" value={product?.outOfStockWarning} />
                            <DataItem label="Minimum Stock" value={product?.minStock} />
                            <DataItem label="Reorder Level" value={product?.reorderLevel} />
                            <DataItem label="Stock Tracking" value={product?.trackStock ? "Yes" : "No"} />
                            <DataItem label="Serial Tracking" value={product?.trackSerial ? "Yes" : "No"} />
                            <DataItem label="Batch Tracking" value={product?.trackBatch ? "Yes" : "No"} />
                            <DataItem label="Active" value={product?.isActive ? "Yes" : "No"} />
                            <DataItem label="UOM" value={product?.uom} />
                            <DataItem label="HSN/SAC Code" value={product?.hsnCode} />
                        </section>

                        <section>
                            <SectionHeader icon={FaCalendarAlt} title="Dates & Accessories" />
                            <DataItem label="Manufacturing Date" value={product?.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : "N/A"} />
                            <DataItem label="Expiry Date" value={product?.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A"} />
                            <DataItem label="Mapped Accessories" value={getMultiLabels(options?.accessories, product?.mapAccessories)} isTag />
                        </section>

                        <section>
                            <SectionHeader icon={FaGlobe} title="International Prices" />
                            {product?.currencyPrices && product.currencyPrices.length > 0 ? (
                                <div className="space-y-2">
                                    {product.currencyPrices.map((cp, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{getLabel(options.currencies, cp.currencyId)}</span>
                                            <span className="text-sm font-black text-blue-700">{(cp as any).price?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-gray-400 italic mt-2">No international prices added.</p>}
                        </section>

                        <section className="lg:col-span-3">
                            <SectionHeader icon={FaInfoCircle} title="Descriptions" />
                            <div className="grid grid-cols-2 gap-8">
                                <DataItem label="Product Description" value={product?.productDescription} />
                                <DataItem label="Specifications" value={product?.specification} />
                            </div>
                        </section>
                    </div>
                </div>

                <div className="p-5 bg-white border-t flex justify-end">
                    <button onClick={onClose} className="px-12 py-2.5 bg-[#f07837] text-white text-xs font-bold uppercase rounded-lg shadow-lg hover:bg-black transition-all">Close View</button>
                </div>
            </div>
        </div>
    );
};

export default ProductViewModal;
