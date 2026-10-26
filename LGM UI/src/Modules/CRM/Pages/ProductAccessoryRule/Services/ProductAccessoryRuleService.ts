import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ProductAccessoryRule, ProductAccessoryRuleListItem } from "./types";

const ENDPOINT = API_ENDPOINTS.ProductAccessoryRule || "/ProductAccessoryRules";
type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | null =>
  value !== null && typeof value === "object" ? (value as ApiRecord) : null;

const read = (item: ApiRecord, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
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

const normalizeRule = (value: unknown): ProductAccessoryRuleListItem => {
  const item = asRecord(value) ?? {};
  const product = asRecord(read(item, "product", "Product")) ?? {};
  const accessory = asRecord(read(item, "accessory", "Accessory")) ?? {};
  const effectiveFrom = read(item, "effectiveFrom", "EffectiveFrom");
  const effectiveTo = read(item, "effectiveTo", "EffectiveTo");

  return {
    id: Number(read(item, "id", "Id") ?? 0),
    productId: Number(read(item, "productId", "ProductId") ?? 0),
    accessoriesId: Number(read(item, "accessoriesId", "AccessoriesId") ?? 0),
    quantity: Number(read(item, "quantity", "Quantity") ?? 1),
    mandatoryOptional: String(read(item, "mandatoryOptional", "MandatoryOptional") ?? "Optional"),
    pricingType: String(read(item, "pricingType", "PricingType") ?? "Default"),
    defaultPrice: Number(read(item, "defaultPrice", "DefaultPrice") ?? 0),
    effectiveFrom: effectiveFrom ? String(effectiveFrom) : "",
    effectiveTo: effectiveTo ? String(effectiveTo) : null,
    active: Boolean(read(item, "active", "Active") ?? true),
    isDeleted: Boolean(read(item, "isDeleted", "IsDeleted") ?? false),
    productName: String(read(item, "productName", "ProductName") ?? read(product, "productName", "ProductName", "name", "Name") ?? "") || null,
    productCode: String(read(item, "productCode", "ProductCode") ?? read(product, "productCode", "ProductCode") ?? "") || null,
    accessoryName: String(read(item, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription") ?? read(accessory, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription", "name", "Name") ?? "") || null,
    accessoryCode: String(read(item, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode") ?? read(accessory, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode") ?? "") || null,
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
  return requestError?.message || "The Product Accessory Rule request failed.";
};

export const getProductAccessoryRules = async (): Promise<ProductAccessoryRuleListItem[]> => {
  const response = await apiClient.get(ENDPOINT);
  return getRows(response.data)
    .map(normalizeRule)
    .filter((item) => !item.isDeleted);
};

export const getProductAccessoryRuleById = async (id: number): Promise<ProductAccessoryRuleListItem> => {
  const response = await apiClient.get(`${ENDPOINT}/${id}`);
  const item = asRecord(unwrap(response.data));
  if (!item) throw new Error("Product accessory rule details were not returned by the API.");
  return normalizeRule(item);
};

const toDateTime = (value: string | null): string | null => {
  if (!value) return null;
  return value.length === 10 ? `${value}T00:00:00` : value;
};

export const saveProductAccessoryRule = async (data: ProductAccessoryRule): Promise<void> => {
  const payload: ProductAccessoryRule = {
    id: data.id || 0,
    productId: Number(data.productId),
    accessoriesId: Number(data.accessoriesId),
    quantity: Number(data.quantity),
    mandatoryOptional: data.mandatoryOptional.trim(),
    pricingType: data.pricingType.trim(),
    defaultPrice: Number(data.defaultPrice),
    effectiveFrom: toDateTime(data.effectiveFrom) ?? "",
    effectiveTo: toDateTime(data.effectiveTo),
    active: data.active,
    isDeleted: data.isDeleted ?? false,
  };

  try {
    if (data.id > 0) await apiClient.put(`${ENDPOINT}/${data.id}`, payload);
    else await apiClient.post(ENDPOINT, payload);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteProductAccessoryRule = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};
