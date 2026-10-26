import React from "react";
import { FaBox, FaLink, FaTimes } from "react-icons/fa";
import type { BundleItemListItem } from "./Services/types";

interface Props {
  item: BundleItemListItem;
  onClose: () => void;
}

const displayItem = (name?: string | null, code?: string | null, fallback?: string) => {
  if (name && code) return `${name} (${code})`;
  return name || code || fallback || "N/A";
};

const BundleItemViewModal: React.FC<Props> = ({ item, onClose }) => {
  const linkedItem = item.variantId !== null
    ? displayItem(item.variantName, item.variantCode, `Variant #${item.variantId}`)
    : item.accessoriesId !== null
      ? displayItem(item.accessoryName, item.accessoryCode, `Accessory #${item.accessoriesId}`)
      : displayItem(item.productName, item.productCode, item.productId ? `Product #${item.productId}` : "N/A");

  const rows: Array<[string, string | number]> = [
    ["Bundle Item ID", item.bundleItemId],
    ["Bundle", displayItem(item.bundleName, item.bundleCode, `Bundle #${item.bundleId}`)],
    ["Item", linkedItem],
    ["Item Type", item.variantId !== null ? "Variant" : item.accessoriesId !== null ? "Accessory" : "Product"],
    ["Quantity", item.quantity],
    ["Pricing Type", item.pricingType],
    ["Allocated Price", Number(item.allocatedPrice).toFixed(2)],
    ["Optional", item.isOptional ? "Yes" : "No"],
    ["Deleted", item.isDeleted ? "Yes" : "No"],
  ];

  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
        <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white"><FaBox className="text-3xl text-[#0b2c52]" /></div><div><h2 className="text-xl font-bold uppercase tracking-tight">Bundle Item Details</h2><p className="mt-1 flex items-center gap-2 text-xs text-blue-100"><FaLink />{displayItem(item.bundleName, item.bundleCode, `Bundle #${item.bundleId}`)}</p></div></div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full bg-white/10 p-2 transition-transform hover:rotate-90"><FaTimes className="text-2xl" /></button>
      </header>
      <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><FaLink className="text-lg text-[#0b2c52]" /><h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase text-[#0b2c52]">Bundle Item Information</h3></div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {rows.map(([label, value]) => <div key={label} className="flex flex-col border-b border-gray-100 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span><span className="break-words text-sm font-semibold text-[#0b2c52]">{value}</span></div>)}
          </div>
        </section>
      </div>
      <footer className="flex justify-end border-t border-gray-100 bg-white p-5"><button type="button" onClick={onClose} className="rounded-lg bg-[#f07837] px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg hover:bg-black">Close View</button></footer>
    </div>
  </div>;
};

export default BundleItemViewModal;
