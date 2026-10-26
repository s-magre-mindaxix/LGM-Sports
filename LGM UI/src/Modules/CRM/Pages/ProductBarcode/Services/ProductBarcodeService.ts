import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type { ProductBarcode, ProductBarcodeListItem } from "./types";

const endpoint = API_ENDPOINTS.ProductBarcode;

const getResponseData = (response: any) => response.data?.data ?? response.data;

const normalizeProductBarcode = (item: any): ProductBarcodeListItem => ({
  ...item,
  id: item?.id ?? item?.Id ?? 0,
  barcode: item?.barcode ?? item?.Barcode ?? "",
  barcodeType: item?.barcodeType ?? item?.BarcodeType ?? "",
  productId: item?.productId ?? item?.ProductId ?? null,
  variantId: item?.variantId ?? item?.VariantId ?? null,
  accessoryId: item?.accessoryId ?? item?.AccessoryId ?? null,
  isPrimary: item?.isPrimary ?? item?.IsPrimary ?? false,
  active: item?.active ?? item?.Active ?? true,
  isDeleted: item?.isDeleted ?? item?.IsDeleted ?? false,
});

export const getProductBarcodes = async (): Promise<ProductBarcodeListItem[]> => {
  const response = await apiClient.get(endpoint);
  const result = getResponseData(response);

  return Array.isArray(result) ? result.map(normalizeProductBarcode) : [];
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
  const startingBase = BigInt(`2${"0".repeat(baseLength - 1)}`);
  const base = (startingBase + BigInt(sequence - 1))
    .toString()
    .padStart(baseLength, "0")
    .slice(-baseLength);
  return `${base}${calculateCheckDigit(base)}`;
};

export const getGeneratedProductBarcode = async (
  barcodeType: string,
  excludeId = 0,
): Promise<string> => {
  const typeKey = barcodeType.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!typeKey) return "";

  const records = await getProductBarcodes();
  const existing = new Set(
    records
      .filter((record) => record.id !== excludeId)
      .map((record) => record.barcode.trim().toUpperCase()),
  );

  if (typeKey === "EAN13") {
    for (let sequence = 1; sequence <= 999999999; sequence += 1) {
      const candidate = makeNumericCandidate(sequence, 12);
      if (!existing.has(candidate)) return candidate;
    }
    throw new Error("No available EAN-13 internal codes remain.");
  }

  if (typeKey === "UPCA" || typeKey === "UPC") {
    for (let sequence = 1; sequence <= 999999999; sequence += 1) {
      const candidate = makeNumericCandidate(sequence, 11);
      if (!existing.has(candidate)) return candidate;
    }
    throw new Error("No available UPC-A internal codes remain.");
  }

  const prefix = typeKey === "QR" || typeKey === "QRCODE"
    ? "QR"
    : typeKey === "CODE128"
      ? "C128"
      : typeKey.slice(0, 12);

  for (let sequence = 1; sequence <= 999999999; sequence += 1) {
    const candidate = `${prefix}-${String(sequence).padStart(9, "0")}`;
    if (!existing.has(candidate.toUpperCase())) return candidate;
  }

  throw new Error(`No available ${barcodeType} codes remain.`);
};

export const getProductBarcodeById = async (id: number): Promise<ProductBarcode> => {
  const response = await apiClient.get(`${endpoint}/${id}`);
  const result = getResponseData(response);

  if (!result || typeof result !== "object") {
    throw new Error("Product barcode details were not returned by the API.");
  }

  return normalizeProductBarcode(result) as ProductBarcode;
};

export const saveProductBarcode = async (data: ProductBarcode): Promise<void> => {
  const barcode = data.id > 0
    ? data.barcode.trim()
    : data.barcode.trim() || await getGeneratedProductBarcode(data.barcodeType);

  const payload = {
    id: data.id || 0,
    barcode,
    barcodeType: data.barcodeType.trim(),
    productId: data.productId ? Number(data.productId) : null,
    variantId: data.variantId ? Number(data.variantId) : null,
    accessoryId: data.accessoryId ? Number(data.accessoryId) : null,
    isPrimary: data.isPrimary,
    active: data.active,
    isDeleted: data.isDeleted ?? false,
  };

  if (data.id > 0) {
    await apiClient.put(`${endpoint}/${data.id}`, payload);
  } else {
    await apiClient.post(endpoint, payload);
  }
};

export const deleteProductBarcode = async (id: number): Promise<void> => {
  await apiClient.delete(`${endpoint}/${id}`);
};
