import apiClient from "../../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../../API/apiConfig";
import type { BundleItem, BundleItemListItem } from "./types";

const endpointEntries = Object.entries(API_ENDPOINTS as unknown as Record<string, string>);
const ENDPOINT = endpointEntries.find(([key]) => /^bundleitems?$/i.test(key))?.[1] || "/BundleItems";
type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | null =>
  value !== null && typeof value === "object" ? (value as ApiRecord) : null;

const read = (record: ApiRecord, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) return record[key];
  }
  return undefined;
};

const unwrap = (value: unknown, depth = 0): unknown => {
  if (depth > 4) return value;
  const record = asRecord(value);
  if (!record) return value;
  for (const key of ["data", "Data", "result", "Result"]) {
    if (record[key] !== undefined) return unwrap(record[key], depth + 1);
  }
  return value;
};

const getRows = (value: unknown): unknown[] => {
  const result = unwrap(value);
  if (Array.isArray(result)) return result;
  const record = asRecord(result);
  if (!record) return [];
  for (const key of ["items", "Items", "results", "Results"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
};

const relatedRecord = (record: ApiRecord, ...keys: string[]): ApiRecord =>
  asRecord(read(record, ...keys)) ?? {};

const normalizeBundleItem = (value: unknown): BundleItemListItem => {
  const record = asRecord(value) ?? {};
  const bundle = relatedRecord(record, "bundle", "Bundle");
  const product = relatedRecord(record, "product", "Product");
  const variant = relatedRecord(record, "variant", "Variant");
  const accessory = relatedRecord(record, "accessories", "Accessories", "accessory", "Accessory");

  return {
    bundleItemId: Number(read(record, "bundleItemId", "BundleItemId", "id", "Id") ?? 0),
    bundleId: Number(read(record, "bundleId", "BundleId") ?? 0),
    productId: read(record, "productId", "ProductId") == null ? null : Number(read(record, "productId", "ProductId")),
    variantId: read(record, "variantId", "VariantId") == null ? null : Number(read(record, "variantId", "VariantId")),
    accessoriesId: read(record, "accessoriesId", "AccessoriesId") == null ? null : Number(read(record, "accessoriesId", "AccessoriesId")),
    quantity: Number(read(record, "quantity", "Quantity") ?? 1),
    pricingType: String(read(record, "pricingType", "PricingType") ?? ""),
    allocatedPrice: Number(read(record, "allocatedPrice", "AllocatedPrice") ?? 0),
    isOptional: Boolean(read(record, "isOptional", "IsOptional") ?? false),
    isDeleted: Boolean(read(record, "isDeleted", "IsDeleted") ?? false),
    bundleName: String(read(record, "bundleName", "BundleName") ?? read(bundle, "bundleName", "BundleName", "name", "Name") ?? "") || null,
    bundleCode: String(read(record, "bundleCode", "BundleCode") ?? read(bundle, "bundleCode", "BundleCode", "code", "Code") ?? "") || null,
    productName: String(read(record, "productName", "ProductName") ?? read(product, "productName", "ProductName", "name", "Name") ?? "") || null,
    productCode: String(read(record, "productCode", "ProductCode") ?? read(product, "productCode", "ProductCode", "code", "Code") ?? "") || null,
    variantName: String(read(record, "variantName", "VariantName") ?? read(variant, "variantName", "VariantName", "name", "Name") ?? "") || null,
    variantCode: String(read(record, "variantCode", "VariantCode") ?? read(variant, "variantCode", "VariantCode", "code", "Code") ?? "") || null,
    accessoryName: String(read(record, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription") ?? read(accessory, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription", "name", "Name") ?? "") || null,
    accessoryCode: String(read(record, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode") ?? read(accessory, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode", "code", "Code") ?? "") || null,
  };
};

const getApiErrorMessage = (error: unknown): string => {
  const requestError = error as { message?: string; response?: { data?: unknown } };
  const body = requestError?.response?.data;
  if (typeof body === "string" && body.trim()) return body;
  const record = asRecord(body);
  if (record) {
    const errors = asRecord(record.errors);
    if (errors) {
      const messages = Object.entries(errors).flatMap(([field, value]) =>
        (Array.isArray(value) ? value : [value]).map((message) => `${field}: ${String(message)}`),
      );
      if (messages.length) return messages.join(" ");
    }
    for (const key of ["message", "detail", "title"]) {
      if (typeof record[key] === "string") return record[key] as string;
    }
  }
  return requestError?.message || "The Bundle Item request failed.";
};

export const getBundleItems = async (): Promise<BundleItemListItem[]> => {
  const response = await apiClient.get(ENDPOINT);
  return getRows(response.data).map(normalizeBundleItem).filter((item) => !item.isDeleted);
};

export const getBundleItemById = async (id: number): Promise<BundleItemListItem> => {
  const response = await apiClient.get(`${ENDPOINT}/${id}`);
  const record = asRecord(unwrap(response.data));
  if (!record) throw new Error("Bundle Item details were not returned by the API.");
  return normalizeBundleItem(record);
};

export const saveBundleItem = async (data: BundleItem): Promise<void> => {
  const linkedCount = [data.productId, data.variantId, data.accessoriesId]
    .filter((id) => id !== null && Number.isInteger(id) && id > 0).length;
  if (linkedCount !== 1) {
    throw new Error("Select exactly one Product, Variant, or Accessory for this bundle item.");
  }

  const payload: BundleItem = {
    bundleItemId: data.bundleItemId || 0,
    bundleId: Number(data.bundleId),
    productId: data.productId ? Number(data.productId) : null,
    variantId: data.variantId ? Number(data.variantId) : null,
    accessoriesId: data.accessoriesId ? Number(data.accessoriesId) : null,
    quantity: Number(data.quantity),
    pricingType: data.pricingType.trim(),
    allocatedPrice: Number(data.allocatedPrice),
    isOptional: data.isOptional,
    isDeleted: data.isDeleted ?? false,
  };

  try {
    if (data.bundleItemId > 0) await apiClient.put(`${ENDPOINT}/${data.bundleItemId}`, payload);
    else await apiClient.post(ENDPOINT, payload);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteBundleItem = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
