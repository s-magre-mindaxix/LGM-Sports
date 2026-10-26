import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ProductBarcode, ProductBarcodeListItem } from "./types";

const ENDPOINT = API_ENDPOINTS.ProductBarcode || "/ProductBarcodes";
type ApiRecord = Record<string, unknown>;

const asRecord = (value: unknown): ApiRecord | null =>
  value !== null && typeof value === "object" ? (value as ApiRecord) : null;

const read = (item: ApiRecord, ...names: string[]): unknown => {
  for (const name of names) {
    if (item[name] !== undefined && item[name] !== null) return item[name];
  }
  return undefined;
};

const nullableId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizeBarcode = (value: unknown): ProductBarcodeListItem => {
  const item = asRecord(value) ?? {};
  const product = asRecord(read(item, "product", "Product"));
  const variant = asRecord(read(item, "variant", "Variant"));
  const accessory = asRecord(read(item, "accessory", "Accessory"));

  return {
    id: Number(read(item, "id", "Id") ?? 0),
    barcode: String(read(item, "barcode", "Barcode") ?? ""),
    barcodeType: String(read(item, "barcodeType", "BarcodeType") ?? ""),
    productId: nullableId(read(item, "productId", "ProductId")),
    variantId: nullableId(read(item, "variantId", "VariantId")),
    accessoryId: nullableId(read(item, "accessoryId", "AccessoryId")),
    isPrimary: Boolean(read(item, "isPrimary", "IsPrimary") ?? false),
    active: Boolean(read(item, "active", "Active") ?? true),
    isDeleted: Boolean(read(item, "isDeleted", "IsDeleted") ?? false),
    productName: String(read(item, "productName", "ProductName") ?? read(product ?? {}, "productName", "ProductName", "name", "Name") ?? "") || null,
    productCode: String(read(item, "productCode", "ProductCode") ?? read(product ?? {}, "productCode", "ProductCode") ?? "") || null,
    variantName: String(read(item, "variantName", "VariantName") ?? read(variant ?? {}, "variantName", "VariantName") ?? "") || null,
    variantCode: String(read(item, "variantCode", "VariantCode") ?? read(variant ?? {}, "variantCode", "VariantCode") ?? "") || null,
    accessoryName: String(read(item, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription") ?? read(accessory ?? {}, "accessoryName", "AccessoryName", "accessoriesDescription", "AccessoriesDescription", "name", "Name") ?? "") || null,
    accessoryCode: String(read(item, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode") ?? read(accessory ?? {}, "accessoryCode", "AccessoryCode", "accessoriesCode", "AccessoriesCode") ?? "") || null,
  };
};

const unwrap = (value: unknown, depth = 0): unknown => {
  if (depth > 3) return value;
  const record = asRecord(value);
  if (!record) return value;
  for (const key of ["data", "Data", "result", "Result"]) {
    if (record[key] !== undefined) return unwrap(record[key], depth + 1);
  }
  return value;
};

const getRows = (value: unknown): unknown[] => {
  const unwrapped = unwrap(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  const record = asRecord(unwrapped);
  if (!record) return [];
  for (const key of ["items", "Items", "results", "Results"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }
  return [];
};

export const getProductBarcodes = async (): Promise<ProductBarcodeListItem[]> => {
  const response = await apiClient.get(ENDPOINT);
  return getRows(response.data)
    .map(normalizeBarcode)
    .filter((item) => !item.isDeleted);
};

const calculateCheckDigit = (digits: string): string => {
  let sum = 0;
  let weight = 3;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    sum += Number(digits[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }
  return String((10 - (sum % 10)) % 10);
};

const makeNumericCandidate = (sequence: number, baseLength: number): string => {
  const firstBase = BigInt(`2${"0".repeat(baseLength - 1)}`);
  const base = (firstBase + BigInt(sequence - 1))
    .toString()
    .padStart(baseLength, "0")
    .slice(-baseLength);
  return `${base}${calculateCheckDigit(base)}`;
};

export const getGeneratedProductBarcode = async (
  barcodeType: string,
  excludeId = 0,
): Promise<string> => {
  const typeKey = barcodeType.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!typeKey) return "";

  const existing = new Set(
    (await getProductBarcodes())
      .filter((item) => item.id !== excludeId)
      .map((item) => item.barcode.trim().toUpperCase()),
  );

  if (typeKey === "EAN13" || typeKey === "UPCA" || typeKey === "UPC") {
    const length = typeKey === "EAN13" ? 12 : 11;
    for (let sequence = 1; sequence <= 999_999_999; sequence += 1) {
      const candidate = makeNumericCandidate(sequence, length);
      if (!existing.has(candidate)) return candidate;
    }
    throw new Error(`No available ${typeKey} codes remain.`);
  }

  const prefix = typeKey === "QR" || typeKey === "QRCODE"
    ? "QR"
    : typeKey === "CODE128"
      ? "C128"
      : typeKey.slice(0, 12);
  for (let sequence = 1; sequence <= 999_999_999; sequence += 1) {
    const candidate = `${prefix}-${String(sequence).padStart(9, "0")}`;
    if (!existing.has(candidate.toUpperCase())) return candidate;
  }
  throw new Error(`No available ${barcodeType} codes remain.`);
};

export const getProductBarcodeById = async (id: number): Promise<ProductBarcodeListItem> => {
  const response = await apiClient.get(`${ENDPOINT}/${id}`);
  const result = unwrap(response.data);
  const item = asRecord(result);
  if (!item) throw new Error("Product barcode details were not returned by the API.");
  return normalizeBarcode(item);
};

export const saveProductBarcode = async (data: ProductBarcode): Promise<void> => {
  const linkedCount = [data.productId, data.variantId, data.accessoryId]
    .filter((id) => id !== null && Number.isInteger(id) && id > 0).length;
  if (linkedCount !== 1) {
    throw new Error("Provide exactly one of ProductId, VariantId, or AccessoryId.");
  }

  const barcode = data.barcode.trim() || await getGeneratedProductBarcode(data.barcodeType, data.id);
  const payload: ProductBarcode = {
    id: data.id || 0,
    barcode,
    barcodeType: data.barcodeType.trim(),
    productId: nullableId(data.productId),
    variantId: nullableId(data.variantId),
    accessoryId: nullableId(data.accessoryId),
    isPrimary: data.isPrimary,
    active: data.active,
    isDeleted: data.isDeleted ?? false,
  };

  if (data.id > 0) await apiClient.put(`${ENDPOINT}/${data.id}`, payload);
  else await apiClient.post(ENDPOINT, payload);
};

export const deleteProductBarcode = async (id: number): Promise<void> => {
  await apiClient.delete(`${ENDPOINT}/${id}`);
};
