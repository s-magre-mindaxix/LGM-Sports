import React from "react";
import type { ProductBarcode } from "./Services/types";
import { FaTimes, FaBarcode, FaInfoCircle } from "react-icons/fa";
interface Props { item: ProductBarcode; onClose: () => void; }
const ProductBarcodeViewModal: React.FC<Props> = ({ item, onClose }) => {
  const rows = [["Barcode ID", item.id], ["Barcode", item.barcode], ["Barcode Type", item.barcodeType], ["Product ID", item.productId ?? "N/A"], ["Variant ID", item.variantId ?? "N/A"], ["Accessory ID", item.accessoryId ?? "N/A"], ["Primary", item.isPrimary ? "Yes" : "No"]] as const;
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-3 sm:p-5" onClick={onClose}>
    <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between bg-[#f07837] p-5 text-white"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-[#f07837]"><FaBarcode className="text-2xl" /></div><div><h2 className="text-lg font-bold uppercase sm:text-xl">Product Barcode Details</h2><p className="mt-1 text-xs text-white/80">{item.barcode || `Barcode #${item.id}`}</p></div></div><button type="button" onClick={onClose} aria-label="Close" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><FaTimes className="text-xl" /></button></header>
      <div className="overflow-y-auto bg-gray-50/70 p-4 sm:p-7"><section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><FaInfoCircle className="text-[#f07837]" /><h3 className="grow border-b border-orange-100 pb-2 text-sm font-extrabold uppercase text-[#0b2c52]">Barcode Information</h3></div><div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="flex flex-col border-b border-gray-100 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span><span className="break-words text-sm font-semibold text-[#0b2c52]">{value}</span></div>)}<div className="flex flex-col border-b border-gray-100 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span><span className={`mt-1 w-fit rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.active ? "ACTIVE" : "INACTIVE"}</span></div></div></section></div>
      <footer className="flex justify-end border-t border-gray-100 bg-white p-4 sm:p-5"><button type="button" onClick={onClose} className="rounded-lg bg-[#f07837] px-7 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#dd6328]">Close</button></footer>
    </div>
  </div>;
};
export default ProductBarcodeViewModal;
