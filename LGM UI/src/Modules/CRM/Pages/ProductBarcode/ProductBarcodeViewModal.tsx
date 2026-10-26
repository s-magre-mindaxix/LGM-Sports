// import React from "react";
// import { FaBarcode, FaBox, FaHashtag, FaTimes } from "react-icons/fa";
// import type { ProductBarcodeListItem } from "./Services/types";

// interface ProductBarcodeViewModalProps {
//   barcode: ProductBarcodeListItem;
//   onClose: () => void;
// }

// const ProductBarcodeViewModal: React.FC<ProductBarcodeViewModalProps> = ({ barcode, onClose }) => {
//   const DataItem = ({ label, value }: { label: string; value?: string | number | null }) => (
//     <div className="flex flex-col border-b border-gray-100 py-3">
//       <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
//       <span className="break-words text-sm font-semibold text-[#0b2c52]">{value !== null && value !== undefined && value !== "" ? value : "N/A"}</span>
//     </div>
//   );

//   return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
//     <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
//       <div className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
//         <div className="flex items-center gap-4">
//           <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white"><FaBarcode className="text-3xl text-[#0b2c52]" /></div>
//           <div><h2 className="text-xl font-bold uppercase tracking-tight">Barcode Details</h2><p className="mt-1 font-mono text-xs tracking-widest text-blue-100">{barcode.barcode || "N/A"}</p></div>
//         </div>
//         <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 transition-transform duration-300 hover:rotate-90" title="Close"><FaTimes className="text-2xl" /></button>
//       </div>
//       <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
//         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//           <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
//             <div className="mb-4 flex items-center gap-2"><FaHashtag className="text-lg text-[#0b2c52]" /><h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase text-[#0b2c52]">Barcode Information</h3></div>
//             <DataItem label="Barcode ID" value={barcode.id} />
//             <DataItem label="Barcode" value={barcode.barcode} />
//             <DataItem label="Barcode Type" value={barcode.barcodeType} />
//             <DataItem label="Primary" value={barcode.isPrimary ? "Yes" : "No"} />
//             <DataItem label="Status" value={barcode.active ? "Active" : "Inactive"} />
//           </section>
//           <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
//             <div className="mb-4 flex items-center gap-2"><FaBox className="text-lg text-[#0b2c52]" /><h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase text-[#0b2c52]">Linked Items</h3></div>
//             <DataItem label="Product" value={barcode.productName || (barcode.productId ? `Product ${barcode.productId}` : null)} />
//             <DataItem label="Product Code" value={barcode.productCode} />
//             <DataItem label="Variant" value={barcode.variantName || (barcode.variantId ? `Variant ${barcode.variantId}` : null)} />
//             <DataItem label="Variant Code" value={barcode.variantCode} />
//             <DataItem label="Accessory" value={barcode.accessoryName || (barcode.accessoryId ? `Accessory ${barcode.accessoryId}` : null)} />
//             <DataItem label="Accessory Code" value={barcode.accessoryCode} />
//           </section>
//         </div>
//       </div>
//       <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-5"><p className="text-[10px] font-bold uppercase text-gray-400">Product Barcode Details</p><button type="button" onClick={onClose} className="rounded-lg bg-[#f07837] px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-black">Close View</button></div>
//     </div>
//   </div>;
// };

// export default ProductBarcodeViewModal;


import React, { useEffect, useState } from "react";
import { FaBarcode, FaBox, FaHashtag, FaTimes } from "react-icons/fa";
import { getProducts } from "../Product/Services/ProductService";
import { getProductVariants } from "../ProductVariant/Services/ProductVariantService";
import { getAccessories } from "../Accessories/Services/AccessoriesService";
import type { ProductBarcodeListItem } from "./Services/types";

interface ProductBarcodeViewModalProps {
  barcode: ProductBarcodeListItem;
  onClose: () => void;
}

interface LinkedNames {
  productName: string;
  productCode: string;
  variantName: string;
  variantCode: string;
  accessoryName: string;
  accessoryCode: string;
}

const emptyNames: LinkedNames = {
  productName: "",
  productCode: "",
  variantName: "",
  variantCode: "",
  accessoryName: "",
  accessoryCode: "",
};

const getRows = (value: unknown, depth = 0): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth > 3) return [];
  const record = value as Record<string, unknown>;
  for (const key of ["data", "Data", "items", "Items", "results", "Results"]) {
    const rows = getRows(record[key], depth + 1);
    if (rows.length > 0) return rows;
  }
  return [];
};

const getValue = (record: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  }
  return undefined;
};

const ProductBarcodeViewModal: React.FC<ProductBarcodeViewModalProps> = ({ barcode, onClose }) => {
  const [linkedNames, setLinkedNames] = useState<LinkedNames>(emptyNames);

  useEffect(() => {
    let mounted = true;
    setLinkedNames({
      productName: barcode.productName ?? "",
      productCode: barcode.productCode ?? "",
      variantName: barcode.variantName ?? "",
      variantCode: barcode.variantCode ?? "",
      accessoryName: barcode.accessoryName ?? "",
      accessoryCode: barcode.accessoryCode ?? "",
    });

    void Promise.allSettled([getProducts(), getProductVariants(), getAccessories()])
      .then(([productsResult, variantsResult, accessoriesResult]) => {
        if (!mounted) return;
        const names = {
          productName: barcode.productName ?? "",
          productCode: barcode.productCode ?? "",
          variantName: barcode.variantName ?? "",
          variantCode: barcode.variantCode ?? "",
          accessoryName: barcode.accessoryName ?? "",
          accessoryCode: barcode.accessoryCode ?? "",
        };

        if (productsResult.status === "fulfilled" && barcode.productId !== null) {
          const product = getRows(productsResult.value).find((row) => {
            if (!row || typeof row !== "object") return false;
            return Number(getValue(row as Record<string, unknown>, "productId", "ProductId", "id", "Id")) === barcode.productId;
          });
          if (product && typeof product === "object") {
            const record = product as Record<string, unknown>;
            names.productName ||= String(getValue(record, "productName", "ProductName", "name", "Name") ?? "");
            names.productCode ||= String(getValue(record, "productCode", "ProductCode", "code", "Code") ?? "");
          }
        }

        if (variantsResult.status === "fulfilled" && barcode.variantId !== null) {
          const variant = getRows(variantsResult.value).find((row) => {
            if (!row || typeof row !== "object") return false;
            return Number(getValue(row as Record<string, unknown>, "variantId", "VariantId", "productVariantId", "ProductVariantId", "id", "Id")) === barcode.variantId;
          });
          if (variant && typeof variant === "object") {
            const record = variant as Record<string, unknown>;
            names.variantName ||= String(getValue(record, "variantName", "VariantName", "productVariantName", "ProductVariantName", "name", "Name") ?? "");
            names.variantCode ||= String(getValue(record, "variantCode", "VariantCode", "productVariantCode", "ProductVariantCode", "code", "Code") ?? "");
          }
        }

        if (accessoriesResult.status === "fulfilled" && barcode.accessoryId !== null) {
          const accessory = getRows(accessoriesResult.value).find((row) => {
            if (!row || typeof row !== "object") return false;
            return Number(getValue(row as Record<string, unknown>, "accessoryId", "AccessoryId", "accessoriesId", "AccessoriesId", "id", "Id")) === barcode.accessoryId;
          });
          if (accessory && typeof accessory === "object") {
            const record = accessory as Record<string, unknown>;
            names.accessoryName ||= String(getValue(record, "accessoryName", "AccessoryName", "accessoriesName", "AccessoriesName", "accessoriesDescription", "AccessoriesDescription", "description", "Description", "name", "Name") ?? "");
            names.accessoryCode ||= String(getValue(record, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode", "code", "Code") ?? "");
          }
        }

        setLinkedNames(names);
      });

    return () => { mounted = false; };
  }, [barcode.productId, barcode.variantId, barcode.accessoryId, barcode.productName, barcode.productCode, barcode.variantName, barcode.variantCode, barcode.accessoryName, barcode.accessoryCode]);

  const DataItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="flex flex-col border-b border-gray-100 py-3">
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className="break-words text-sm font-semibold text-[#0b2c52]">{value !== null && value !== undefined && value !== "" ? value : "N/A"}</span>
    </div>
  );

  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
    <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between bg-[#f07837] p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white"><FaBarcode className="text-3xl text-[#0b2c52]" /></div>
          <div><h2 className="text-xl font-bold uppercase tracking-tight">Barcode Details</h2><p className="mt-1 font-mono text-xs tracking-widest text-blue-100">{barcode.barcode || "N/A"}</p></div>
        </div>
        <button type="button" onClick={onClose} className="rounded-full bg-white/10 p-2 transition-transform duration-300 hover:rotate-90" title="Close"><FaTimes className="text-2xl" /></button>
      </div>
      <div className="overflow-y-auto bg-gray-50/50 p-5 sm:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><FaHashtag className="text-lg text-[#0b2c52]" /><h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase text-[#0b2c52]">Barcode Information</h3></div>
            <DataItem label="Barcode ID" value={barcode.id} />
            <DataItem label="Barcode" value={barcode.barcode} />
            <DataItem label="Barcode Type" value={barcode.barcodeType} />
            <DataItem label="Primary" value={barcode.isPrimary ? "Yes" : "No"} />
            <DataItem label="Status" value={barcode.active ? "Active" : "Inactive"} />
          </section>
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2"><FaBox className="text-lg text-[#0b2c52]" /><h3 className="grow border-b-2 border-blue-100 pb-1 text-sm font-extrabold uppercase text-[#0b2c52]">Linked Items</h3></div>
            <DataItem label="Product" value={linkedNames.productName || (barcode.productId ? `Product ${barcode.productId}` : null)} />
            <DataItem label="Product Code" value={linkedNames.productCode} />
            <DataItem label="Variant" value={linkedNames.variantName || (barcode.variantId ? `Variant ${barcode.variantId}` : null)} />
            <DataItem label="Variant Code" value={linkedNames.variantCode} />
            <DataItem label="Accessory" value={linkedNames.accessoryName || (barcode.accessoryId ? `Accessory ${barcode.accessoryId}` : null)} />
            <DataItem label="Accessory Code" value={linkedNames.accessoryCode} />
          </section>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-white p-5"><p className="text-[10px] font-bold uppercase text-gray-400">Product Barcode Details</p><button type="button" onClick={onClose} className="rounded-lg bg-[#f07837] px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-black">Close View</button></div>
    </div>
  </div>;
};

export default ProductBarcodeViewModal;
