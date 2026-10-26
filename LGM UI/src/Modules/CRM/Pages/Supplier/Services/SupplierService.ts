import apiClient from "../../../../../API/apiClient";
import { API_ENDPOINTS } from "../../../../../API/apiConfig";
import type {
  Supplier,
  SupplierListItem,
  BranchOption,
} from "./types";

const normalizeSupplier = (item: any): Supplier => ({
  supplierId: item?.supplierId ?? item?.SupplierId ?? 0,
  branchId: item?.branchId ?? item?.BranchId ?? 0,
  supplierCode: item?.supplierCode ?? item?.SupplierCode ?? "",
  supplierName: item?.supplierName ?? item?.SupplierName ?? "",
  supplierGSTIN: item?.supplierGSTIN ?? item?.SupplierGSTIN ?? "",
  supplierContact: item?.supplierContact ?? item?.SupplierContact ?? "",
  supplierAddress: item?.supplierAddress ?? item?.SupplierAddress ?? "",
  paymentTerms: item?.paymentTerms ?? item?.PaymentTerms ?? "",
  isActive: item?.isActive ?? item?.IsActive ?? true,
  createdAt: item?.createdAt ?? item?.CreatedAt ?? "",
});

const getResponseData = (response: any) =>
  response.data?.data ?? response.data;

export const getSuppliers = async (): Promise<SupplierListItem[]> => {
  const response = await apiClient.get(API_ENDPOINTS.Supplier);
  const result = getResponseData(response);

  return Array.isArray(result) ? result.map(normalizeSupplier) : [];
};

// Generate a code from the first word of the supplier name.
export const getGeneratedSupplierCode = async (
  supplierName: string,
  excludeSupplierId = 0,
): Promise<string> => {
  const firstWord = supplierName
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^a-zA-Z0-9]/g, "") ?? "";

  if (!firstWord) return "";

  const prefix = firstWord
    .slice(0, firstWord.length <= 4 ? 4 : 5)
    .toUpperCase();

  const suppliers = await getSuppliers();
  const codePattern = new RegExp(`^${prefix}(\\d+)$`, "i");

  const usedNumbers = suppliers
    .filter((supplier) => supplier.supplierId !== excludeSupplierId)
    .map((supplier) => supplier.supplierCode?.match(codePattern))
    .filter((match): match is RegExpMatchArray => match != null)
    .map((match) => Number(match[1]))
    .filter((number) => Number.isFinite(number));

  let nextNumber = 1;
  while (usedNumbers.includes(nextNumber)) {
    nextNumber += 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, "0")}`;
};

export const getSupplierById = async (id: number): Promise<Supplier> => {
  const response = await apiClient.get(`${API_ENDPOINTS.Supplier}/${id}`);
  const result = getResponseData(response);

  if (!result || typeof result !== "object") {
    throw new Error("Supplier details were not returned by the API.");
  }

  return normalizeSupplier(result);
};

export const getBranches = async (): Promise<BranchOption[]> => {
  const response = await apiClient.get(API_ENDPOINTS.Branch);
  const result = getResponseData(response);

  if (!Array.isArray(result)) return [];

  return result.map((item: any) => ({
    branchId: item?.branchId ?? item?.BranchId ?? 0,
    branchName: item?.branchName ?? item?.BranchName ?? "",
  }));
};

export const saveSupplier = async (data: Supplier): Promise<void> => {
  const supplierCode =
    data.supplierId > 0
      ? data.supplierCode.trim()
      : data.supplierCode.trim() ||
        await getGeneratedSupplierCode(data.supplierName);

  const payload = {
    supplierId: data.supplierId || 0,
    branchId: Number(data.branchId),
    supplierCode,
    supplierName: data.supplierName.trim(),
    supplierGSTIN: data.supplierGSTIN.trim() || null,
    supplierContact: data.supplierContact.trim() || null,
    supplierAddress: data.supplierAddress.trim() || null,
    paymentTerms: data.paymentTerms.trim() || null,
    isActive: data.isActive,
  };

  if (!payload.branchId) {
    throw new Error("Please select a branch.");
  }

  if (data.supplierId > 0) {
    await apiClient.put(
      `${API_ENDPOINTS.Supplier}/${data.supplierId}`,
      payload,
    );
  } else {
    await apiClient.post(API_ENDPOINTS.Supplier, payload);
  }
};

export const deleteSupplier = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.Supplier}/${id}`);
};