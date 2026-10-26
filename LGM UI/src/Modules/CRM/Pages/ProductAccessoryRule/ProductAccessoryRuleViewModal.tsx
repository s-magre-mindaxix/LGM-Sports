import React, { useEffect, useState } from "react";
import type { ProductAccessoryRuleListItem } from "./Services/types";
import { FaTimes, FaLink, FaInfoCircle } from "react-icons/fa";
import { getProducts } from "../Product/Services/ProductService";
import { getAccessories } from "../Accessories/Services/AccessoriesService";

interface Props {
  item: ProductAccessoryRuleListItem;
  onClose: () => void;
}

const showDate = (value?: string | null) => value ? value.slice(0, 10) : "N/A";
const showValue = (value: string | null | undefined, fallback: string) => value || fallback;

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

const ProductAccessoryRuleViewModal: React.FC<Props> = ({ item, onClose }) => {
  const [productName, setProductName] = useState(item.productName ?? "");
  const [productCode, setProductCode] = useState(item.productCode ?? "");
  const [accessoryName, setAccessoryName] = useState(item.accessoryName ?? "");
  const [accessoryCode, setAccessoryCode] = useState(item.accessoryCode ?? "");

  useEffect(() => {
    let mounted = true;
    setProductName(item.productName ?? "");
    setProductCode(item.productCode ?? "");
    setAccessoryName(item.accessoryName ?? "");
    setAccessoryCode(item.accessoryCode ?? "");
    void Promise.allSettled([getProducts(), getAccessories()]).then(([productsResult, accessoriesResult]) => {
      if (!mounted) return;

      if (productsResult.status === "fulfilled") {
        const product = getRows(productsResult.value).find((row) => {
          if (!row || typeof row !== "object") return false;
          const record = row as Record<string, unknown>;
          return Number(getValue(record, "productId", "ProductId", "id", "Id")) === item.productId;
        }) as Record<string, unknown> | undefined;
        if (product) {
          setProductName(String(getValue(product, "productName", "ProductName", "name", "Name") ?? item.productName ?? ""));
          setProductCode(String(getValue(product, "productCode", "ProductCode", "code", "Code") ?? item.productCode ?? ""));
        }
      }

      if (accessoriesResult.status === "fulfilled") {
        const accessory = getRows(accessoriesResult.value).find((row) => {
          if (!row || typeof row !== "object") return false;
          const record = row as Record<string, unknown>;
          return Number(getValue(record, "accessoriesId", "AccessoriesId", "accessoryId", "AccessoryId", "id", "Id")) === item.accessoriesId;
        }) as Record<string, unknown> | undefined;
        if (accessory) {
          setAccessoryName(String(getValue(accessory, "accessoryName", "AccessoryName", "accessoriesName", "AccessoriesName", "accessoriesDescription", "AccessoriesDescription", "description", "Description", "name", "Name") ?? item.accessoryName ?? ""));
          setAccessoryCode(String(getValue(accessory, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode", "code", "Code") ?? item.accessoryCode ?? ""));
        }
      }
    });

    return () => { mounted = false; };
  }, [item.productId, item.accessoriesId, item.productName, item.productCode, item.accessoryName, item.accessoryCode]);

  const rows: Array<[string, string | number]> = [
    ["Rule ID", item.id],
    ["Product", showValue(productName, `Product #${item.productId}`)],
    ["Product Code", productCode || "N/A"],
    ["Accessory", showValue(accessoryName, `Accessory #${item.accessoriesId}`)],
    ["Accessory Code", accessoryCode || "N/A"],
    ["Quantity", item.quantity],
    ["Requirement", item.mandatoryOptional],
    ["Pricing Type", item.pricingType],
    ["Default Price", Number(item.defaultPrice).toFixed(2)],
    ["Effective From", showDate(item.effectiveFrom)],
    ["Effective To", showDate(item.effectiveTo)],
  ];

  return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-3 sm:p-5" onClick={onClose}>
    <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between bg-[#f07837] p-5 text-white">
        <div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-[#f07837]"><FaLink className="text-2xl" /></div><div><h2 className="text-lg font-bold uppercase sm:text-xl">Product Accessory Rule</h2><p className="mt-1 text-xs text-white/80">{productName || `Product #${item.productId}`} · {accessoryName || `Accessory #${item.accessoriesId}`}</p></div></div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-full bg-white/10 p-2 hover:bg-white/20"><FaTimes className="text-xl" /></button>
      </header>
      <div className="overflow-y-auto bg-gray-50/70 p-4 sm:p-7">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><FaInfoCircle className="text-[#f07837]" /><h3 className="grow border-b border-orange-100 pb-2 text-sm font-extrabold uppercase text-[#0b2c52]">Rule Information</h3></div>
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {rows.map(([label, value]) => <div key={label} className="flex flex-col border-b border-gray-100 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span><span className="break-words text-sm font-semibold text-[#0b2c52]">{value}</span></div>)}
            <div className="flex flex-col border-b border-gray-100 py-3"><span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</span><span className={`mt-1 w-fit rounded-full px-3 py-1 text-xs font-bold ${item.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.active ? "ACTIVE" : "INACTIVE"}</span></div>
          </div>
        </section>
      </div>
      <footer className="flex justify-end border-t border-gray-100 bg-white p-4 sm:p-5"><button type="button" onClick={onClose} className="rounded-lg bg-[#f07837] px-7 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#dd6328]">Close</button></footer>
    </div>
  </div>;
};

export default ProductAccessoryRuleViewModal;
